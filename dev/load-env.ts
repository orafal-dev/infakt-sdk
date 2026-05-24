import type { DevEnv } from "./env.types.js";

const readEnv = (...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = Bun.env[key]?.trim();
    if (value) {
      return value;
    }
  }
  return undefined;
};

export const loadDevEnv = (): DevEnv => {
  const apiKey = readEnv("INFAKT_API_KEY", "API_KEY");
  const baseUrl = readEnv("INFAKT_BASE_URL", "BASE_URL");

  if (!apiKey) {
    throw new Error(
      "Missing required environment variable: INFAKT_API_KEY\n" +
        "Copy .env.example to .env and fill in your inFakt API key.",
    );
  }

  return {
    apiKey,
    baseUrl,
  };
};
