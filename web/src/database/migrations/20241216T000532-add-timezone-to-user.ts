import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("user")
    .addColumn("timezone", "varchar(255)")
    .execute();

  await db
    .updateTable("user")
    .set({
      timezone: "America/Los_Angeles",
    })
    .execute();

  await db.schema
    .alterTable("user")
    .alterColumn("timezone", (col) => col.setNotNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("user").dropColumn("timezone").execute();
}
