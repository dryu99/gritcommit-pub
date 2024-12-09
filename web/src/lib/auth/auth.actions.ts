"use server";

import { DB } from "@/database/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// TODO this is not correct but itll do for now
export async function login(email: string, password: string) {
  const user = await DB.get()
    .selectFrom("user")
    .where("email", "=", email)
    .where("password", "=", password)
    .executeTakeFirst();

  if (!user) {
    throw new Error("Invalid credentials");
  }

  (await cookies()).set("userEmail", email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // Set expiry to 30 days
    maxAge: 30 * 24 * 60 * 60,
  });

  redirect("/dashboard");
}

export async function logout() {
  (await cookies()).delete("userEmail");
  redirect("/");
}
