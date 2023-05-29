const express = require('express');
const router = express.Router();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

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

//Accept reservation
router.put('/reserve/:reservation_id/:user_id',(req,res,next) => {
	query='update reservations set reservation_status=\'APPROVED\' where id=? and user_id=?';
	qParams=[req.params.reservation_id,req.params.user_id];
	queryDb(query,qParams,connection,res);
});
//submit request for reservation
router.post('/reserve/:restaurant_id/:table_id/:user_id',(req,res,next) => {
	query='';
	qParams=[];
	query='insert into reservations (user_id,restaurant_id,table_id,reservation_status) values (?,?,?,?);';
	qParams=[req.params.user_id,req.params.restaurant_id,req.params.table_id,'REQUESTED'];
	queryDb(query,qParams,connection,res);
});

//Offers a new table
router.post('/offer/:restaurant_id/:seats_available/:owner_id',(req,res,next) => {
	query='insert into tables (restaurant_id,seats_available,owner_id) values(?,?,?)';
	qParams=[req.params.restaurant_id,req.params.seats_available,req.params.owner_id];
	queryDb(query,qParams,connection,res);
});

//List all reservations requested by user_id
router.get('/reserve/:user_id',(req,res,next) => {
	query='select * from reservations where user_id=?;';
	qParams=[req.params.user_id];
	queryDb(query,qParams,connection,res);
});
//Default
router.get('/',(req,res,next) => {
	console.log(req.query);
	res.send('TS Coming Soon!' + req.query);
});

function queryDb(query,qParams,connection,res) {
	connection.query(query,qParams,(error, results, fields) => {
                                console.log('Results: ',query,qParams,results);
				console.log("Fields: ",fields);
				res.send(results);
                        });
}

router.get('/auth',(req,res,next) => {
	getTokens(req.query.code,res);
});

function getTokens(auth_code,res) {
	var request = require('request');
	var options = {
	  'method': 'POST',
	  'url': 'https://nts.auth.us-east-1.amazoncognito.com/oauth2/token',
	  'headers': {
	    'Content-Type': 'application/x-www-form-urlencoded',
	    'Cookie': 'XSRF-TOKEN=4f471157-5c5e-4797-8475-73b0d69c648f'
	  },
	  form: {
	    'grant_type': 'authorization_code',
	    'client_id': '2ulah4hudjljpqtp08orobipip',
	    'code': auth_code,
	    'redirect_uri': 'https://tableshare.schplorph.com'
  		}
	};

	request(options, function (error, response) {
  		if (error) throw new Error(error);
  		console.log(response.body);
		res.cookie("access_token_nts",response.body,{httpOnly: true});
		res.send(response.body);
	});
}

module.exports = router;
