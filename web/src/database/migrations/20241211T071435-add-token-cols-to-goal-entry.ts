import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("goal_entry")
    .addColumn("user_verification_token", "text", (col) => col.unique())
    .addColumn("user_verification_token_expires_at", "timestamptz")
    .addColumn("partner_verification_token", "text", (col) => col.unique())
    .addColumn("partner_verification_token_expires_at", "timestamptz")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("goal_entry")
    .dropColumn("user_verification_token")
    .dropColumn("user_verification_token_expires_at")
    .dropColumn("partner_verification_token")
    .dropColumn("partner_verification_token_expires_at")
    .execute();
}
