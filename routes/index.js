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
		var query='';
		var qParams=[];

		if (req.params.tables) {
			query='select * from tables where restaurant_id=?';
			qParams[0]=req.params.restaurantId;
			if (req.params.tableId) {
				query='select * from tables where id=?;';
				qParams[1]=req.params.tableId;
			}
		}
		else if (req.params.restaurants) {
			query='select * from restaurants;';
			if (req.params.restaurantId) {
				query='select * from restaurants where id=?;';
				qParams[0]=req.params.restaurantId;
			}
		}
		if (query != '') {
			connection.query(query,qParams,(error, results, fields) => {
				console.log('Results: ',query,qParams,results);
				res.send(results);
			});
		}
		else {
			res.send([]);
		}
});

//submit request for reservation
router.post('/reserve/:restaurant_id/:table_id',(req,res,next) => {
	query='';
	qParams=[];
	query='update tables set seats_available=12 where restaurant_id=? and id=?;';
	qParams[0]=req.params.restaurant_id;
	qParams[1]=req.params.table_id;
        connection.query(query,qParams,(error, results, fields) => {
                                console.log('Results: ',query,qParams,results);
                                res.send(results);
                        });
});

router.get('/',(req,res,next) => {
	console.log(req.query);
	res.send('TS Coming Soon!' + req.query);
});

module.exports = router;
