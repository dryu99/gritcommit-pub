import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("user").addColumn("first_name", "text").execute();
  await db.schema.alterTable("user").addColumn("last_name", "text").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("user").dropColumn("first_name").execute();
  await db.schema.alterTable("user").dropColumn("last_name").execute();
}
