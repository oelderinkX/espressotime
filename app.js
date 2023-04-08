var express = require('express');
var app = express();
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser')
var port = process.env.PORT || 80;

console.log('espress time port number is: ' + port);

app.use(favicon(__dirname + '/common/images/favicon.ico'));

app.disable('etag');

app.use(cookieParser())
app.use('/images', express.static(__dirname + '/common/images'));
app.use('/scripts', express.static(__dirname + '/common/client'));
app.use('/manifest.json', express.static(__dirname + '/common/manifest.json'));

app.listen(port, function () {
	console.log('Ready to time da staff people!');
});

// not done
//console.log('loading main.js');
//require('./boh/main/srv/main.js')(app);

console.log('loading admin.js');
require('./boh/admin/srv/admin.js')(app);

console.log('loading assets.js');
require('./boh/assets/srv/assets.js')(app);

console.log('loading editemployees.js');
require('./boh/editemployees/srv/editemployees.js')(app);

console.log('loading edittimes.js');
require('./boh/edittimes/srv/edittimes.js')(app);

console.log('loading feedback.js');
require('./boh/feedback/srv/feedback.js')(app);

console.log('loading reports.js');
require('./boh/reports/srv/reports.js')(app);

//where is roster ?

console.log('loading shop.js');
require('./boh/shop/srv/shop.js')(app);

console.log('loading taskedit.js');
require('./boh/taskedit/srv/taskedit.js')(app);

console.log('loading timesheet.js');
require('./boh/timesheet/srv/timesheet.js')(app);

console.log('loading tools.js');
require('./boh/tools/srv/tools.js')(app);

console.log('loading employee.js');
require('./employee/srv/employee.js')(app);

console.log('loading how.js');
require('./foh/help/srv/how.js')(app);

console.log('loading main.js again');
require('./foh/main/srv/main.js')(app);

console.log('loading tasks.js');
require('./foh/tasks/srv/tasks.js')(app);