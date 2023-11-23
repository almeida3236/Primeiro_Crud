require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASS,
  database: process.env.DB_BASE,
  maxIdle: 10,
});

/*pool.connect((err) => {
  console.log("Conexão com banco de dados realizada com sucesso!");
});*/

module.exports = pool;
