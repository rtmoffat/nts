const express = require('express');
const router = express.Router();

require('dotenv').config();

console.log(process.env.DB_NAME);

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : process.env.DB_SERVER,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});

connection.on('error', function(err) {
  console.log(err.code); // 'ER_BAD_DB_ERROR'
});

router.all('/:restaurants(restaurants)/:restaurantId?/:tables(tables)?/:tableId?', (req,res,next) => {

		query='select * from restaurants;';
		query='select * from restaurants where id=?;';
		query='insert into restaurants (Name) values(?);';
		connection.query(query, ['Fox'],(error, results, fields) => {
			console.log('Results: ',results);
			res.send(results);
		});
});

router.get('/',(req,res,next) => {
	res.send('TS Coming soon!');
});

module.exports = router;
