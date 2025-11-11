import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { MemorySaver } from "@langchain/langgraph";
import * as z from "zod";
import { createAgent, tool } from "langchain";
import crypto from 'crypto';

import { geminiFlash } from "./models/google/geminiModels.js";
import { jobSearch } from "./queryTest.js";

// 1. Initialize Fastify
const fastify = Fastify({ logger: true });

// 2. Define a LangChain tool
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

// 3. Create the Checkpointer (Memory)
const checkpointer = new MemorySaver();

// 4. Create the agent
const agent = createAgent({
  model: geminiFlash,
  systemPrompt:
    "You are a joker; you always make fun of the user's question and twist it humorously.",
  checkpointer: checkpointer,
  tools: [search],
});

// 5. Register CORS (Allowing GET and POST)
await fastify.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
});

// Helper to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Helper to format messages for UI
function formatMessagesForUI(messages: any[]) {
  return messages.map((msg, index) => {
    // Determine the role
    let role = 'assistant';
    if (msg.role) {
      role = msg.role === 'human' ? 'user' : msg.role;
    } else if (msg.type) {
      role = msg.type === 'human' ? 'user' : 'assistant';
    }

    // Format content properly
    let content;
    if (typeof msg.content === 'string') {
      content = [{ type: 'text', text: msg.content }];
    } else if (Array.isArray(msg.content)) {
      // Ensure each content item has the proper structure
      content = msg.content.map((item: any) => {
        if (typeof item === 'string') {
          return { type: 'text', text: item };
        }
        return {
          type: item.type || 'text',
          text: item.text || item.content || ''
        };
      });
    } else if (msg.content && typeof msg.content === 'object') {
      // Handle object content
      content = [{
        type: 'text',
        text: msg.content.text || msg.content.content || JSON.stringify(msg.content)
      }];
    } else {
      // Fallback for any other case
      content = [{ type: 'text', text: '' }];
    }

    // CRITICAL: Use the LangChain message ID to ensure consistency
    // between stream and history responses
    const messageId = msg.id || msg.kwargs?.id || crypto.randomUUID();

    return {
      id: messageId,
      role,
      content,
      createdAt: new Date().toISOString(),
    };
  });
}

// 6. GET /info: For the UI's initial status check.
fastify.get("/info", async (req, reply) => {
  return {
    status: "ok",
    version: "1.0",
    available_graphs: ["chat"],
  };
});

// 7. POST /threads: Creates a new conversation thread.
fastify.post("/threads", async (req, reply) => {
  try {
    const bodySchema = z.object({
      message: z.string().min(1, "Message cannot be empty.").optional(),
    });
    const { message } = bodySchema.parse(req.body);
    const newThreadId = crypto.randomUUID();

    if (!message) {
      return { thread_id: newThreadId, messages: [] };
    }

    const newConfig = {
      configurable: { thread_id: newThreadId },
      context: { user_id: "1" },
    };
    const aiOutput = await agent.invoke(
      { messages: [{ role: "user", content: message }] },
      newConfig
    );

    return {
      thread_id: newThreadId,
      messages: formatMessagesForUI(aiOutput.messages || []),
    };
  } catch (err: unknown) {
    fastify.log.error(err);
    reply.status(400).send({ error: getErrorMessage(err) });
  }
});

// 8. POST /threads/:thread_id/runs/stream: SSE endpoint compatible with UI
fastify.post("/threads/:thread_id/runs/stream", async (req, reply) => {
  // Set headers for Server-Sent Events (SSE)
  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Connection", "keep-alive");
  reply.raw.setHeader("Cache-Control", "no-cache");
  reply.raw.setHeader("Access-Control-Allow-Origin", "*");

  try {
    // Define the schema for what the UI sends
    const contentSchema = z.object({
      type: z.string(),
      text: z.string(),
    });

    const messageSchema = z.object({
      type: z.string(),
      content: z.array(contentSchema).min(1),
    });

    const bodySchema = z.object({
      input: z.object({
        messages: z.array(messageSchema).min(1),
      }),
    });

    const { input } = bodySchema.parse(req.body);
    const { thread_id } = req.params as { thread_id: string };

    const existingConfig = {
      configurable: { thread_id: thread_id },
      context: { user_id: "1" },
    };

    // Transform the UI's message into the format createAgent expects
    const lastMessage = input.messages[input.messages.length - 1];
    if (!lastMessage || !lastMessage.content[0]) {
      throw new Error("Invalid message structure after parsing.");
    }

    const agentInput = {
      messages: [
        {
          role: lastMessage.type,
          content: lastMessage.content[0].text,
        },
      ],
    };

    // Send metadata event (expected by UI)
    const metadata = {
      run_id: crypto.randomUUID(),
      thread_id: thread_id,
    };
    fastify.log.info({ metadata }, "Sending metadata event");
    reply.raw.write(`event: metadata\ndata: ${JSON.stringify(metadata)}\n\n`);

    // Invoke the agent
    const finalState = await agent.invoke(agentInput, existingConfig);

    // Log the raw state for debugging
    fastify.log.info({
      messageCount: finalState.messages?.length,
      messageTypes: finalState.messages?.map((m: any) => ({
        type: m.type,
        _type: m._getType?.(),
        id: m.id,
        content: typeof m.content === 'string' ? m.content.substring(0, 50) : 'not string'
      }))
    }, "Agent response");

    // Filter to get only the NEW assistant messages (not user message, not tool messages)
    const allMessages = finalState.messages || [];

    // IMPORTANT: Only send the NEW AI response, not the user's message
    // The user's message is already in the UI from optimistic updates
    // We need to find messages that were generated in THIS invocation
    const aiMessages = allMessages.filter((msg: any) => {
      if (!msg) return false;
      const msgType = msg.type || msg._getType?.() || '';
      return msgType === 'ai' || msgType === 'assistant';
    });

    // Get only the LAST AI message (the new response from this invocation)
    const lastAiMessage = aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : null;
    const messagesToSend = lastAiMessage ? [lastAiMessage] : [];

    fastify.log.info({
      totalMessages: allMessages.length,
      aiMessages: aiMessages.length,
      sendingMessages: messagesToSend.length,
    }, "Messages to send in stream");

    // Format messages for UI
    const formattedMessages = formatMessagesForUI(messagesToSend);

    // Log formatted messages
    fastify.log.info({
      formattedCount: formattedMessages.length,
      formattedMessages
    }, "Formatted messages to stream");

    // If we have messages to send, send them
    if (formattedMessages.length > 0) {
      for (const message of formattedMessages) {
        const messagePayload = {
          type: message.role,
          id: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt,
        };

        fastify.log.info({ messagePayload }, "Sending message event");
        reply.raw.write(`event: messages\ndata: ${JSON.stringify([messagePayload])}\n\n`);
      }
    } else {
      // If no messages, log warning
      fastify.log.warn("No messages to send in stream");
    }

    // Send the end event
    fastify.log.info("Sending end event");
    reply.raw.write(`event: end\ndata: ""\n\n`);

  } catch (err: unknown) {
    fastify.log.error(err, "Error in stream route");
    const errorPayload = { message: getErrorMessage(err) };
    reply.raw.write(`event: error\ndata: ${JSON.stringify(errorPayload)}\n\n`);
  }

  // End the raw response stream
  reply.raw.end();

  // Signal to Fastify that the handler is complete
  return reply;
});

// 9. POST /threads/:thread_id/history
fastify.post("/threads/:thread_id/history", async (req, reply) => {
  try {
    const { thread_id } = req.params as { thread_id: string };

    const threadConfig = {
      configurable: { thread_id: thread_id },
    };

    const threadState = await checkpointer.get(threadConfig);

    if (!threadState) {
      fastify.log.info({ thread_id }, "No thread state found");
      return [];
    }

    const messages = threadState.channel_values.messages || [];
    // Ensure messages is an array
    const messagesArray = Array.isArray(messages) ? messages : [];

    fastify.log.info({
      thread_id,
      messageCount: messagesArray.length,
      rawMessages: messagesArray
    }, "Raw messages from history");

    const formattedHistory = formatMessagesForUI(messagesArray);

    fastify.log.info({
      thread_id,
      formattedCount: formattedHistory.length,
      formattedMessages: formattedHistory
    }, "Formatted history being returned");

    return formattedHistory;

  } catch (err: unknown) {
    fastify.log.error(err);
    reply.status(500).send({ error: getErrorMessage(err) });
  }
});

// 10. Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3333, host: "0.0.0.0" });
    console.log("🚀 Server running on http://localhost:3333");
  } catch (err: unknown) {
    fastify.log.error(err);
    process.exit(1);
  }
};

await start();