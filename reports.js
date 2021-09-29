var pg = require('pg');
var common = require('./script/common.js');

var pool = new pg.Pool(common.postgresConfig());

function AssetReport(res, shopId, start, end) {
	var response = '<html><body>';
	response += 'shop id: ' + shopId + '<br/>';
	response += 'start: ' + start + '<br/>';
	response += 'end: ' + end + '<br/>';
	response += '</body></html>';

	res.send(response);
}