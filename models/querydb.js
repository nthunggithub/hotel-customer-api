const util = require('util');
const config = require("../config/db.config.js");
require('dotenv').config();
const mysql = require("mysql");
const db = mysql.createConnection({
    host: "freedb.tech",
    user: "freedbtech_khiemkhiem8499",
    password: "khiemkhiem8499",
    database: "freedbtech_hotelmanagement",
});
db.connect((err) => {

    if (err) {
        throw err;
    }
    console.log('Mysql Connected')
})
let query = util.promisify(db.query).bind(db);

module.exports.query = query;