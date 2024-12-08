import { promises as fs } from "fs";
import {
  CamelCasePlugin,
  FileMigrationProvider,
  Kysely,
  Migrator,
  PostgresDialect,
} from "kysely";
import path from "path";
import * as pg from "pg";
import { Config } from "../lib/config";
import { DB as DbTypes } from "./db-generated-types";

// needed for dumb nextjs db memory leak fix
declare const global: { db: any };

// setup pg data type transformers
const numericTypeId = 1700; // PostgreSQL NUMERIC type
pg.types.setTypeParser(numericTypeId, (val) => {
  // convert string -> number
  return parseFloat(val);
});

export class DB {
  private static pool: pg.Pool;
  private static db: Kysely<DbTypes>;
  private static dialect: PostgresDialect;

  public static get() {
    if (this.db) return this.db;

    // db hasn't been inited yet
    this.start();
    return this.db;
  }

  public static getPool() {
    if (this.pool) return this.pool;

    // db hasn't been inited yet
    this.start();
    return this.pool;
  }

  public static start() {
    this.pool = new pg.Pool({
      connectionString: Config.DATABASE_URL,
      max: 1,
    });

    this.dialect = new PostgresDialect({
      pool: this.pool,
    });

    console.log(`Connecting to database: ${Config.DATABASE_URL}`);

    if (Config.NODE_ENV === "production") {
      this.db = new Kysely<DbTypes>({
        dialect: this.dialect,
        plugins: [new CamelCasePlugin({ underscoreBeforeDigits: true })],
      });
      return;
    }

    // ! this is required to prevent db restarts and memory leaks in dev
    // ! https://github.com/vercel/next.js/issues/7811#issuecomment-618425485
    if (global.db) {
      console.log(`Reusing existing database connection`);
      this.db = global.db;
      return;
    }

    const db = new Kysely<DbTypes>({
      dialect: this.dialect,
      plugins: [new CamelCasePlugin({ underscoreBeforeDigits: true })],
      // log(event): void {
      //   if (event.level === "query") {
      //     console.log(event.query.sql);
      //     console.log(event.query.parameters);
      //   }
      // },
    });

    global.db = db;
    this.db = db;
  }

  public static stop() {
    return this.db
      .destroy()
      .then(
        () =>
          Config.NODE_ENV !== "test" &&
          console.log(`Disconnected from database`)
      );
  }

  public static getMigrator(migrationsDirPath: string) {
    return new Migrator({
      db: this.db,
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: migrationsDirPath,
      }),
    });
  }
}
