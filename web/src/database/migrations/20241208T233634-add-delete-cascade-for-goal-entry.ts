import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("goal_entry")
    .dropConstraint("goal_entry_goal_id_fkey")
    .execute();

  await db.schema
    .alterTable("goal_entry")
    .addForeignKeyConstraint("goal_entry_goal_id_fkey", ["goal_id"], "goal", [
      "id",
    ])
    .onDelete("cascade")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("goal_entry")
    .dropConstraint("goal_entry_goal_id_fkey")
    .execute();

  await db.schema
    .alterTable("goal_entry")
    .addForeignKeyConstraint("goal_entry_goal_id_fkey", ["goal_id"], "goal", [
      "id",
    ])
    .execute();
}
