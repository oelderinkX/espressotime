var url = require('url');
var params = url.parse(process.env.DATABASE_URL);
var auth = params.auth.split(':');

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

function postgresConfig() {
	var config = {
		connectionString: process.env.DATABASE_URL,
		ssl: {
			rejectUnauthorized: false
		}
	};

	return config;
}
module.exports.postgresConfig = postgresConfig;

function postgresConfig2() {
  var config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true	  
  };
  
  return config;
}
module.exports.postgresConfig2 = postgresConfig2;

function replaceAll(str, searchValue, replaceWith) {
	if (searchValue == replaceWith) {
		return str;
	}
	
	while(str.indexOf(searchValue) >= 0) {
		str = str.replace(searchValue, replaceWith);
	}
	
	return str;
}
module.exports.replaceAll = replaceAll;

function getShopId(identifier) {
  if (identifier) {
    var decode =  Buffer.from(identifier, 'base64').toString('utf-8');
    return decode.split(';12121976;')[1];
  }
  return -1;
}
module.exports.getShopId = getShopId;


function getEmployeeId(identifier) {
  if (identifier) {
    var decode =  Buffer.from(identifier, 'base64').toString('utf-8');
    return decode.split(';17122011;')[1];
  }
  return -1;
}
module.exports.getEmployeeId = getEmployeeId;

function getEmployeeDetails(identifier) {
  if (identifier) {
    var decode =  Buffer.from(identifier, 'base64').toString('utf-8');
    var jsonStr = decode.split(';17122011;')[3];
    return JSON.parse(jsonStr);
  }
  return {};
}
module.exports.getEmployeeDetails = getEmployeeDetails;

function getLoginUrl(path) {
  if (path) {
    return 'https://login.managemycafe.com/?redirect=' + path;
  } else {
    return 'https://login.managemycafe.com';
  }
}
module.exports.getLoginUrl = getLoginUrl;
