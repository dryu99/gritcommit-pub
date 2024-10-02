import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const Config = Object.freeze({
  NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test",
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_NAME: process.env.DATABASE_NAME,
});

export const resolveByEnv = <T>({ dev, prod }: { dev: T; prod: T }) => {
  return process.env.NODE_ENV === "production" ? prod : dev;
};
