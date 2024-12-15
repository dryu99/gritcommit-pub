import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.local",
});

export const Config = Object.freeze({
  NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test",
  DATABASE_URL: process.env.DATABASE_URL as string,
  POSTMARK_API_KEY: process.env.POSTMARK_API_KEY as string,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID as string,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN as string,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  AWS_REGION: process.env.AWS_REGION as string,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME as string,
});

export const resolveByEnv = <T>({ dev, prod }: { dev: T; prod: T }) => {
  return process.env.NODE_ENV === "production" ? prod : dev;
};
