import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: any;

export function getDb() {
  if (!instance) {
    const connection = mysql.createPool({
      uri: "mysql://root:Sibiraj2006@localhost:3306/loan",
    });
    
    instance = drizzle(connection, { schema: fullSchema, mode: "default" });
  }
  return instance;
}
