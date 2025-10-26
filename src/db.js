import mysql from "mysql2";

// Usamos createPool en lugar de createConnection para manejar múltiples conexiones
const pool = mysql.createPool({
  connectionLimit: 10, // Número máximo de conexiones en el pool
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cookshare",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  queueLimit: 0
});

export default pool.promise(); // Exportamos la versión con promesas para un código más limpio
