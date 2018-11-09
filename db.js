const mysql = require('mysql')
var connectionPool = mysql.createPool({
  connectionLimit: process.env.DB_CONNECTION_LIMIT, 
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database : process.env.DB_NAME
})

// connectionPool.connect() 
// connection testing: 
// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });

module.exports = connectionPool;
