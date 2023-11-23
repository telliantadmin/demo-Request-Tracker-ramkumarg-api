var mysql = require('mysql');
require('dotenv').config()

var connection = mysql.createConnection({
    host: process.env.DATABASE_URL,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;