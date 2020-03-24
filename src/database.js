const mysql = require('mysql');
const { promisify } = require('util'); // callbacks a promesas
const { database } = require('./keys');

const pool = mysql.createPool(database); //Crea threads secuenciales.

pool.getConnection((err, connection) => {
   if(err) {
       if(err.code === "PROTOCOL_CONNECTION_LOST") {
           console.error('database connection was closed');
       }

       if(err.code === "ERR_CONN_COUNT_ERROR") {
           console.error('database has too many connections');
       }

       if(err.code === "ECONN_REFUED") {
           console.error('database connection was refused');
       }
   }

   if(connection) connection.release();
   console.log('## DB is connected');
   return;
});

// Promisify pool queries
pool.query = promisify(pool.query);

module.exports = pool;