import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'subject_ai',
  user: process.env.DB_USER || 'subject_user',
  password: process.env.DB_PASSWORD || 'subject_pass',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
