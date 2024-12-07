import { Insertable } from "kysely";
import { DB } from "../database/db";
import { User } from "../database/db-generated-types";

const main = async () => {
  const newUser: Insertable<User> = {
    id: crypto.randomUUID(),
    email: "test@test.com",
  };

  const user = await DB.get().insertInto("user").values(newUser).execute();
  console.log("User created", user);
};

main();
