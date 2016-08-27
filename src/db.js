import config from './config.json';

export default callback => {
	const mysql      = require('mysql');
	const connection = mysql.createConnection({
	  host     : config.db.host,
	  user     : config.db.user,
	  password : config.db.password,
	  database : config.db.database
	});

	callback(connection);
}
