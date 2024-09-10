import { DB } from "@/database/db";
import { User } from "@/database/db-generated-types";
import { Insertable } from "kysely";

const main = async () => {
  const newUser: Insertable<User> = {
    id: crypto.randomUUID(),
    email: "test@test.com",
  };

  const user = await DB.getDb().insertInto("user").values(newUser).execute();
  console.log("User created", user);
};

main();
