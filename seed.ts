import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { users } from './db/schema'; 

async function main() {
  const connection = await mysql.createConnection({
    url: "mysql://root:Sibiraj2006@localhost:3306/loan",
  });
  
  const db = drizzle(connection);
  
  console.log('Seeding started...');
  
  await db.insert(users).values({
    staffId: 'STF001',
    staffName: 'Admin Sibi',
    username: 'admin@gmail.com',
    email: 'admin@gmail.com',
    mobileNumber: '9876543210',
    passwordHash: 'password', 
    role: 'admin',
    isActive: true,
  });
  
  console.log('Seeding finished successfully!');
  await connection.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});