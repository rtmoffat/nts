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

const cors = require('cors');
router.use(cors({
    origin: '*'
}));

router.all('/:restaurants(restaurants)/:restaurantId?/:tables(tables)?/:tableId?', (req,res,next) => {

		query='select * from restaurants;';
		//query='select * from restaurants where id=?;';
		//query='insert into restaurants (Name) values(?);';
		connection.query(query,(error, results, fields) => {
			console.log('Results: ',results);
			res.send(results);
		});
});

router.get('/',(req,res,next) => {
	console.log(req.query);
	res.send('TS Coming Soon!' + req.query);
});

module.exports = router;
