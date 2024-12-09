import { Insertable } from "kysely";
import { DB } from "../database/db";
import { User } from "../database/db-generated-types";

const TEST_USERS = [
  { email: "alice@example.com", password: "changeme" },
  { email: "bob@example.com", password: "changeme" },
  { email: "carol@example.com", password: "changeme" },
  { email: "dave@example.com", password: "changeme" },
];

const main = async () => {
  for (const testUser of TEST_USERS) {
    const newUser: Insertable<User> = {
      id: crypto.randomUUID(),
      email: testUser.email,
    };

    const user = await DB.get().insertInto("user").values(newUser).execute();
    console.log("User created", user);
  }
};

main();
