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
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true	  
  };
  
  return config;
}
module.exports.postgresConfig = postgresConfig;

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

function getShopName(identifier) {
  if (identifier) {
    var decode = atob(identifier);
    return decode.split(';12121976;')[0];
  }
  return '';
}
module.exports.getShopName = getShopName;

function getShopId(identifier) {
  if (identifier) {
    var decode = atob(identifier);
    return decode.split(';12121976;')[1];
  }
  return -1;
}
module.exports.getShopId = getShopId;

