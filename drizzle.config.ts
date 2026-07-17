import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: "mysql://root:Sibiraj2006@localhost:3306/loan",
  },
});