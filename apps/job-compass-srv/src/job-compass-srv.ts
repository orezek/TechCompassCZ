import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { MemorySaver } from "@langchain/langgraph";
import * as z from "zod";
import { createAgent, tool } from "langchain";
import crypto from 'crypto';
import { geminiFlash } from "./models/google/geminiModels.js";
import { jobSearch } from "./queryTest.js";

// Initialize Fastify
const fastify = Fastify({ logger: true });

// Define LangChain tool
const search = tool(
  async ({ query }) => jobSearch(query),
  {
    name: "jobSearch",
    description: "Search for job information.",
    schema: z.object({
      query: z
        .string()
        .describe("The search query. Be very specific as the fields accepts semantic meaning."),
    }),
  }
);

// Create Checkpointer (Memory)
const checkpointer = new MemorySaver();

// Create the agent
const agent = createAgent({
  model: geminiFlash,
  systemPrompt:
    "You are a joker; you always make fun of the user's question and twist it humorously.",
  checkpointer: checkpointer,
  tools: [search],
});

// Register CORS
await fastify.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
});

// Helper functions
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Helper to format messages - ensure consistent format
function formatMessage(msg: any, forceRole?: string) {
  const messageId = msg.id || msg.kwargs?.id || crypto.randomUUID();

  let role = forceRole || 'assistant';
  if (!forceRole) {
    if (msg.role) {
      role = msg.role === 'human' ? 'user' : msg.role;
    } else if (msg.type) {
      role = msg.type === 'human' ? 'user' : 'assistant';
    }
  }

  let content;
  if (typeof msg.content === 'string') {
    content = msg.content;
  } else if (Array.isArray(msg.content)) {
    content = msg.content.map((item: any) => {
      if (typeof item === 'string') return item;
      return item.text || item.content || JSON.stringify(item);
    }).join('');
  } else {
    content = JSON.stringify(msg.content || '');
  }

  return {
    type: role,
    role: role, // Include both type and role for compatibility
    id: messageId,
    content,
  };
}

// GET /info - Server info endpoint
fastify.get("/info", async (req, reply) => {
  return {
    status: "ok",
    version: "1.0",
    available_graphs: ["agent"],
  };
});

// POST /threads - Create a new thread (handle both empty and non-empty bodies)
fastify.post("/threads", {
  schema: {
    body: {
      type: 'object',
      properties: {},
      additionalProperties: true,
      nullable: true
    }
  }
}, async (req, reply) => {
  try {
    const newThreadId = crypto.randomUUID();

    // Get metadata from body if provided, otherwise use empty object
    const metadata = (req.body as any)?.metadata || {};

    fastify.log.info({ threadId: newThreadId }, "Created new thread");

    return {
      thread_id: newThreadId,
      created_at: new Date().toISOString(),
      metadata: metadata,
      values: {},
    };
  } catch (err: unknown) {
    fastify.log.error(err);
    reply.status(400).send({ error: getErrorMessage(err) });
  }
});

// GET /threads/:thread_id - Get thread info
fastify.get("/threads/:thread_id", async (req, reply) => {
  try {
    const { thread_id } = req.params as { thread_id: string };

    const threadConfig = {
      configurable: { thread_id: thread_id },
    };

    const threadState = await checkpointer.get(threadConfig);

    if (!threadState) {
      // Return a valid thread response even if state doesn't exist yet
      return {
        thread_id: thread_id,
        created_at: new Date().toISOString(),
        metadata: {},
        values: {},
      };
    }

    return {
      thread_id: thread_id,
      created_at: new Date().toISOString(),
      metadata: {},
      values: threadState.channel_values || {},
    };

  } catch (err: unknown) {
    fastify.log.error(err);
    reply.status(500).send({ error: getErrorMessage(err) });
  }
});

// POST /runs/stream - Main streaming endpoint
fastify.post("/runs/stream", async (req, reply) => {
  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.raw.setHeader("Cache-Control", "no-cache");
  reply.raw.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const bodySchema = z.object({
      assistant_id: z.string().optional(),
      thread_id: z.string().nullable().optional(),
      input: z.object({
        messages: z.array(z.any()),
      }).optional(),
      stream_mode: z.array(z.string()).optional(),
      config: z.any().optional(),
    });

    const body = bodySchema.parse(req.body);
    const threadId = body.thread_id || crypto.randomUUID();

    fastify.log.info({ body, threadId }, "Stream request received");

    // Send initial metadata event
    reply.raw.write(`event: metadata\ndata: ${JSON.stringify({
      run_id: crypto.randomUUID(),
      thread_id: threadId,
    })}\n\n`);

    if (!body.input || !body.input.messages || body.input.messages.length === 0) {
      reply.raw.write(`event: end\ndata: ""\n\n`);
      reply.raw.end();
      return reply;
    }

    // Extract the last user message
    const lastMessage = body.input.messages[body.input.messages.length - 1];
    let messageContent = '';

    if (typeof lastMessage.content === 'string') {
      messageContent = lastMessage.content;
    } else if (Array.isArray(lastMessage.content)) {
      messageContent = lastMessage.content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('');
    }

    if (!messageContent) {
      fastify.log.warn("No message content found");
      reply.raw.write(`event: end\ndata: ""\n\n`);
      reply.raw.end();
      return reply;
    }

    const agentConfig = {
      configurable: { thread_id: threadId },
      context: { user_id: "1" },
    };

    // Invoke agent
    fastify.log.info({ messageContent, threadId }, "Invoking agent");

    // Stream the user message first
    const userMessageFormatted = formatMessage(
      { content: messageContent },
      'user'
    );

    reply.raw.write(`event: values\ndata: ${JSON.stringify({
      messages: [userMessageFormatted]
    })}\n\n`);

    const finalState = await agent.invoke(
      { messages: [{ role: "user", content: messageContent }] },
      agentConfig
    );

    fastify.log.info({
      messageCount: finalState.messages?.length
    }, "Agent response received");

    // Get only AI messages from the response
    const allMessages = finalState.messages || [];
    const aiMessages = allMessages.filter((msg: any) => {
      const msgType = msg.type || msg._getType?.() || '';
      return msgType === 'ai' || msgType === 'assistant';
    });

    // Send only the last AI message
    if (aiMessages.length > 0) {
      const lastAiMessage = aiMessages[aiMessages.length - 1];
      const formattedMessage = formatMessage(lastAiMessage, 'assistant');

      fastify.log.info({ formattedMessage }, "Sending AI message");

      reply.raw.write(`event: values\ndata: ${JSON.stringify({
        messages: [formattedMessage]
      })}\n\n`);
    }

    // Send end event
    reply.raw.write(`event: end\ndata: ""\n\n`);

  } catch (err: unknown) {
    fastify.log.error(err, "Error in stream route");
    const errorPayload = { error: getErrorMessage(err) };
    reply.raw.write(`event: error\ndata: ${JSON.stringify(errorPayload)}\n\n`);
  }

  reply.raw.end();
  return reply;
});

// POST /threads/:thread_id/runs/stream - Thread-specific endpoint
fastify.post("/threads/:thread_id/runs/stream", async (req, reply) => {
  const { thread_id } = req.params as { thread_id: string };

  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.raw.setHeader("Cache-Control", "no-cache");
  reply.raw.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const body = req.body as any;

    fastify.log.info({ thread_id, hasInput: !!body.input }, "Thread-specific stream request");

    // Send initial metadata event
    reply.raw.write(`event: metadata\ndata: ${JSON.stringify({
      run_id: crypto.randomUUID(),
      thread_id: thread_id,
    })}\n\n`);

    if (!body.input || !body.input.messages || body.input.messages.length === 0) {
      reply.raw.write(`event: end\ndata: ""\n\n`);
      reply.raw.end();
      return reply;
    }

    // Extract the last user message
    const lastMessage = body.input.messages[body.input.messages.length - 1];
    let messageContent = '';

    if (typeof lastMessage.content === 'string') {
      messageContent = lastMessage.content;
    } else if (Array.isArray(lastMessage.content)) {
      messageContent = lastMessage.content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('');
    }

    if (!messageContent) {
      fastify.log.warn("No message content found");
      reply.raw.write(`event: end\ndata: ""\n\n`);
      reply.raw.end();
      return reply;
    }

    const agentConfig = {
      configurable: { thread_id: thread_id },
      context: { user_id: "1" },
    };

    // Stream the user message first
    const userMessageFormatted = formatMessage(
      { content: messageContent },
      'user'
    );

    reply.raw.write(`event: values\ndata: ${JSON.stringify({
      messages: [userMessageFormatted]
    })}\n\n`);

    // Invoke agent
    fastify.log.info({ messageContent, thread_id }, "Invoking agent");
    const finalState = await agent.invoke(
      { messages: [{ role: "user", content: messageContent }] },
      agentConfig
    );

    fastify.log.info({
      messageCount: finalState.messages?.length
    }, "Agent response received");

    // Get only AI messages from the response
    const allMessages = finalState.messages || [];
    const aiMessages = allMessages.filter((msg: any) => {
      const msgType = msg.type || msg._getType?.() || '';
      return msgType === 'ai' || msgType === 'assistant';
    });

    // Send only the last AI message
    if (aiMessages.length > 0) {
      const lastAiMessage = aiMessages[aiMessages.length - 1];
      const formattedMessage = formatMessage(lastAiMessage, 'assistant');

      fastify.log.info({ formattedMessage }, "Sending AI message");

      reply.raw.write(`event: values\ndata: ${JSON.stringify({
        messages: [formattedMessage]
      })}\n\n`);
    }

    // Send end event
    reply.raw.write(`event: end\ndata: ""\n\n`);

  } catch (err: unknown) {
    fastify.log.error(err, "Error in thread stream route");
    const errorPayload = { error: getErrorMessage(err) };
    reply.raw.write(`event: error\ndata: ${JSON.stringify(errorPayload)}\n\n`);
  }

  reply.raw.end();
  return reply;
});

// POST /threads/:thread_id/history - Get thread history
fastify.post("/threads/:thread_id/history", async (req, reply) => {
  try {
    const { thread_id } = req.params as { thread_id: string };

    const threadConfig = {
      configurable: { thread_id: thread_id },
    };

    const threadState = await checkpointer.get(threadConfig);

    if (!threadState) {
      fastify.log.info({ thread_id }, "No thread state found");
      return []; // Return empty array
    }

    const messages = threadState.channel_values.messages || [];
    const messagesArray = Array.isArray(messages) ? messages : [];

    // Format all messages properly
    const formattedMessages = messagesArray.map((msg: any, index: number) => {
      // Determine if this is a user or assistant message based on order
      // Typically messages alternate: user, assistant, user, assistant...
      const isUserMessage = index % 2 === 0;
      return formatMessage(msg, isUserMessage ? 'user' : 'assistant');
    });

    return formattedMessages;

  } catch (err: unknown) {
    fastify.log.error(err);
    reply.status(500).send({ error: getErrorMessage(err) });
  }
});

// GET /threads/:thread_id/state - Get thread state
fastify.get("/threads/:thread_id/state", async (req, reply) => {
  try {
    const { thread_id } = req.params as { thread_id: string };

    const threadConfig = {
      configurable: { thread_id: thread_id },
    };

    const threadState = await checkpointer.get(threadConfig);

    if (!threadState) {
      // Return valid state even if no messages yet
      return {
        values: {
          messages: [],
        },
        next: [],
        checkpoint: {
          thread_id: thread_id,
          checkpoint_ns: "",
          checkpoint_id: crypto.randomUUID(),
        },
        metadata: {},
        created_at: new Date().toISOString(),
        parent_checkpoint: null,
      };
    }

    const messages = threadState.channel_values.messages || [];
    const messagesArray = Array.isArray(messages) ? messages : [];

    // Format messages with proper role alternation
    const formattedMessages = messagesArray.map((msg: any, index: number) => {
      const isUserMessage = index % 2 === 0;
      return formatMessage(msg, isUserMessage ? 'user' : 'assistant');
    });

    return {
      values: {
        messages: formattedMessages,
      },
      next: [],
      checkpoint: {
        thread_id: thread_id,
        checkpoint_ns: "",
        checkpoint_id: threadState.id || crypto.randomUUID(),
      },
      metadata: {},
      created_at: new Date().toISOString(),
      parent_checkpoint: null,
    };

  } catch (err: unknown) {
    fastify.log.error(err);
    reply.status(500).send({ error: getErrorMessage(err) });
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3336, host: "0.0.0.0" });
    console.log("🚀 LangGraph-compliant server running on http://localhost:3333");
  } catch (err: unknown) {
    fastify.log.error(err);
    process.exit(1);
  }
};

await start();