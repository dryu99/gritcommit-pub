import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const Config = Object.freeze({
  NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test",
  DATABASE_URL: process.env.DATABASE_URL,
});

export const resolveByEnv = <T>({ dev, prod }: { dev: T; prod: T }) => {
  return process.env.NODE_ENV === "production" ? prod : dev;
};
