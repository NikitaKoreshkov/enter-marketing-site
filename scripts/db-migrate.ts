import { config } from "dotenv";
import { resolve } from "path";
import { runMigrations } from "../lib/db/migrate";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

runMigrations()
  .then(() => {
    console.log("PostgreSQL migrations applied.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
