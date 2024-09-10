import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("user")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("email", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createTable("goal")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("created_by_user_id", "uuid", (col) =>
      col.references("user.id").notNull()
    )
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("stake_amount", sql`numeric(10,2)`, (col) => col.notNull())
    .addColumn("due_date", "timestamptz", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Functions + Triggers
  await sql`
  CREATE FUNCTION "update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
  BEGIN
    NEW."updated_at" = NOW();
    RETURN NEW;
  END;
  $$;`.execute(db);

  await sql`
  CREATE TRIGGER "update_goal_updated_at" BEFORE UPDATE ON "goal" FOR EACH ROW EXECUTE FUNCTION "update_updated_at_column"();
  CREATE TRIGGER "update_user_updated_at" BEFORE UPDATE ON "user" FOR EACH ROW EXECUTE FUNCTION "update_updated_at_column"();

`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    DROP TRIGGER "update_goal_updated_at" ON "goal";
    DROP TRIGGER "update_user_updated_at" ON "user";
    DROP FUNCTION "update_updated_at_column";
`.execute(db);

  await db.schema.dropTable("goal").execute();
  await db.schema.dropTable("user").execute();
}
