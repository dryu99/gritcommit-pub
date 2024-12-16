import { Insertable } from "kysely";
import { DB } from "../database/db";
import { User } from "../database/db-generated-types";

const TEST_USERS = [
  {
    email: "alice@example.com",
    password: "changeme",
    firstName: "Alice",
    lastName: "Anderson",
  },
  {
    email: "bob@example.com",
    password: "changeme",
    firstName: "Bob",
    lastName: "Builder",
  },
  {
    email: "carol@example.com",
    password: "changeme",
    firstName: "Carol",
    lastName: "Carlson",
  },
  {
    email: "dave@example.com",
    password: "changeme",
    firstName: "Dave",
    lastName: "Davis",
  },
];

const main = async () => {
  for (const testUser of TEST_USERS) {
    const newUser: Insertable<User> = {
      id: crypto.randomUUID(),
      email: testUser.email,
      password: testUser.password,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      timezone: "America/Los_Angeles",
    };

    await DB.get()
      .insertInto("user")
      .values(newUser)
      .onConflict((oc) =>
        oc.column("email").doUpdateSet({
          password: newUser.password,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        }),
      )
      .execute();

    console.log("User upserted", newUser);
  }

  await DB.stop();
  process.exit(0);
};

main();
