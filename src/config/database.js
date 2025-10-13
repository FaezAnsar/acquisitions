import 'dotenv/config';
import { defineConfig } from 'drizzle-orm/neon-http';
import {neon, } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/singlestore';


const sql = neon (process.env.DATABASE_URL);
const db = drizzle  (sql);

export { db ,sql};