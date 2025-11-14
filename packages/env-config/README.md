# Environment Variable Management for Monorepos

### A Robust, Type-Safe, Secure Pattern Using Zod & Shared Utilities

Managing environment variables in a monorepo can get messy fast.
Different apps need different variables, secrets must stay isolated, and
TypeScript safety tends to vanish once values come from `.env`.

This guide presents a clean, reusable approach that ensures your
monorepo remains:

-   **DRY:** No duplicated env-loading logic.
-   **Isolated:** Each app gets only its own variables.
-   **Type-Safe:** Full TypeScript intellisense.
-   **Validated:** Fail-fast if variables are missing.
-   **Secure:** Clear rules for secrets and version control.

The solution relies on:

-   A shared utility package: `@my-scope/env-config`
-   A per-app Zod schema
-   Layered `.env` files
-   Strong validation and typing

------------------------------------------------------------------------

# `@my-scope/env-config`: Shared Utility

All monorepo apps load their environment variables through a single
function:

``` ts
loadEnv(schema, import.meta.url)
```

This function handles:

-   Resolving the correct `.env` files for the calling app
-   Loading them in a layered order
-   Validating using the app's Zod schema
-   Returning fully typed, safe values

## Source Code (`packages/env-config/src/index.ts`)

``` ts
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { URL } from 'url';
import { type z } from 'zod';

/**
 * Loads and validates environment variables from .env files.
 */
export function loadEnv<T extends z.ZodTypeAny>(
  schema: T,
  importMetaUrl: string
): z.infer<T> {
  const appSrcDir = path.dirname(new URL(importMetaUrl).pathname);

  const NODE_ENV = process.env.NODE_ENV || 'development';
  const appRootDir = path.resolve(appSrcDir, '..');

  const envFiles = [
    path.resolve(appRootDir, '.env'),
    path.resolve(appRootDir, `.env.${NODE_ENV}`),
    path.resolve(appRootDir, '.env.local'),
  ];

  envFiles.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath, override: true });
    }
  });

  const parsedEnv = schema.safeParse(process.env);

  if (!parsedEnv.success) {
    const errors = parsedEnv.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Environment variable validation failed:\n${errors}`);
  }

  return parsedEnv.data;
}
```

------------------------------------------------------------------------

# How the Pattern Works

## 1. Resolving the App's Root via `import.meta.url`

Each app passes `import.meta.url`, letting the utility determine:

-   the `src/` folder of the calling app
-   the app root directory
-   the associated `.env` files

------------------------------------------------------------------------

## 2. Layered `.env` Files

Files load in this priority order (later overrides earlier):

1.  `.env` --- base defaults (committed)
2.  `.env.${NODE_ENV}` --- environment-specific values (committed)
3.  `.env.local` --- local secrets (ignored by Git)

------------------------------------------------------------------------

## 3. Validation with Zod

Each app defines its **own** Zod schema describing exactly what
variables it needs. Startup fails immediately if something is missing or
invalid.

------------------------------------------------------------------------

# How to Use in an App

## Step 1 --- Create a Config File

`apps/my-api/src/config.ts`

``` ts
import { z } from 'zod';
import { loadEnv } from '@my-scope/env-config';

const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  PORT: z.coerce.number().default(3001),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
});

const env = loadEnv(apiEnvSchema, import.meta.url);

export default env;
```

## Step 2 --- Import Config First

`apps/my-api/src/index.ts`

``` ts
import env from './config.js';

console.log(`Starting server in ${env.NODE_ENV} mode...`);
console.log(`Server running on port ${env.PORT}`);
```

------------------------------------------------------------------------

# Best Practices

## `.gitignore` Must Protect Secrets

    **/.env.local
    **/.env.production
    **/.env.development
    **/.env.test

------------------------------------------------------------------------

## `.env.example` Files

Example: `apps/my-api/.env.example`

    NODE_ENV=development
    DATABASE_URL=
    PORT=3001
    JWT_SECRET=

------------------------------------------------------------------------

# Conclusion

This pattern provides:

-   Unified config loading
-   Validation & strong typing
-   Clear boundaries between apps
-   Secure secret handling conventions