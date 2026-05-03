import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "./src/shared/config/postgres.js";
import config from "./src/shared/config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initFilePath = path.join(__dirname, "scripts", "init-postgres.sql");
const seedFilePath = path.join(__dirname, "scripts", "seed-data.sql");

async function runInitPostgres() {
    let client;

    try {
        const [initSQL, seedSQL] = await Promise.all([
            fs.readFile(initFilePath, "utf8"),
            fs.readFile(seedFilePath, "utf8"),
        ]);

        client = await postgres.connect();

        console.log(`Running DB init scripts...`);
        console.log(`Target: ${config.postgres.host}/${config.postgres.database}`);

        await client.query("BEGIN");

        console.log("→ Running schema (init-postgres.sql)");
        await client.query(initSQL);

        console.log("→ Running seed data (seed-data.sql)");
        await client.query(seedSQL);

        await client.query("COMMIT");

        console.log("Postgres initialization + seeding completed successfully.");
    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }

        console.error("Postgres initialization failed:", {
            message: error.message,
            code: error.code,
        });

        process.exitCode = 1;
    } finally {
        if (client) {
            client.release();
        }

        await postgres.close();
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runInitPostgres();
}