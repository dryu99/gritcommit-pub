import { DB } from "@/database/db";
import { cookies } from "next/headers";

// TODO very hacky auth but itll do for now
export const getSessionUser = async () => {
  const userEmail = (await cookies()).get("userEmail")?.value;
  if (!userEmail) return undefined;

  const user = await DB.get()
    .selectFrom("user")
    .selectAll()
    .where("email", "=", userEmail)
    .executeTakeFirst();

  return user;
};
