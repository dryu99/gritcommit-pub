import { run } from "kysely-migration-cli";
import path from "path";
import { DB } from "./db";

const db = DB.getDb();

const migrator = DB.getMigrator(path.join(__dirname, "../database/migrations"));

run(db, migrator, path.join(__dirname, "../database/migrations"));
console.log(
  "> REMINDER: Remember to regenerate db types if you ran any migrations!!!"
);
