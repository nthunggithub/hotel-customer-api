const util = require('util');
const config = require("../config/db.config.js");
require('dotenv').config();
const mysql = require("mysql");
const db = mysql.createConnection({
    host: "sql12.freesqldatabase.com",
    user: "sql12386834",
    password: "Wd3CKsRfy3",
    database: "sql12386834",
});
db.connect((err) => {

    if (err) {
        throw err;
    }
    console.log('Mysql Connected')
})
let query = util.promisify(db.query).bind(db);

module.exports.query = query;