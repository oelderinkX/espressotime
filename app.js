var express = require('express');
var app = express();
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser')
var pg = require('pg');
var common = require('./script/common.js');
var port = process.env.PORT || 80;

var pool = new pg.Pool(common.postgresConfig());

console.log('espress time port number is: ' + port);

app.use(favicon(__dirname + '/favicon.ico'));

app.disable('etag');

app.use(cookieParser())
app.use('/images', express.static('images'));
app.use('/script', express.static('script'));
app.use('/webpage', express.static('webpage'));
app.use('/javascript', express.static('javascript'));

app.listen(port, function () {
	console.log('Ready to time da staff people!');
});

require('./main.js')(app);
require('./admin.js')(app);

