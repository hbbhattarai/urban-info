require("dotenv").config();

const { Pool } = require("pg");

const connectionString = `${process.env.DB_URL}`;

const pool = new Pool({
    connectionString: connectionString
});


module.exports = { pool };