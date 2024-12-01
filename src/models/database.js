const mysql = require('mysql2/promise')
require('dotenv').config()

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
connection.getConnection()
    .then(conn => {
        console.log("kết nối database thành công");
        conn.release();
    })
    .catch(err => {
        console.log("kết nối thất bại", err.message);
    })
module.exports = connection