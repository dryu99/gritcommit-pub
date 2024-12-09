import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.local",
});

export const Config = Object.freeze({
  NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test",
  DATABASE_URL: process.env.DATABASE_URL as string,
  POSTMARK_API_KEY: process.env.POSTMARK_API_KEY as string,
});

export const resolveByEnv = <T>({ dev, prod }: { dev: T; prod: T }) => {
  return process.env.NODE_ENV === "production" ? prod : dev;
};
