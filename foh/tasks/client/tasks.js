var refreshPageTimer;
var employees = [];
var alltasks = [];

function clock() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var ampm = "am";
    m = pad(m);

    if (h > 11) {
        ampm = "pm";
    }

    if (h > 12) {
        h = h - 12;
    }

    document.getElementById('time').innerHTML = h + ":" + m + ' ' + ampm + ' &nbsp;&nbsp;&nbsp;&nbsp;';

    t = setTimeout(function() {
        clock()
    }, 10000);
}

function loadEmployees() {
    var date = getDbFormat() + ' 00:00:00';
    sendPost("/gettaskemployees", '{ "date": "' + date + '"}', function(response) {
        employees = [];
        var taskemployees = JSON.parse(response);

        for(var i = 0; i < taskemployees.length; i++) {
            employees.push({id: taskemployees[i].id, name: taskemployees[i].name});
        }
    });
}

function loadTasks() {
    sendPost("/getalltasksv2", '{ }', function(response) {
        alltasks = JSON.parse(response);
    });
}

function getTasksForHour() {
    var time = getTime() + ':00';
    var date = getDbFormat();
    var request = {date: date, time: time};

    sendPost("/gettasks", JSON.stringify(request), function(response) {
        var tasks = JSON.parse(response);
        var hasTasks = false;

        var tasksarea = document.getElementById("tasksarea")
        tasksarea.innerHTML = '';

        for(var t in tasks) {
            hasTasks = true;
            var task = document.createElement("li");
            task.innerHTML = tasks[t].name;
            task.className = 'list-group-item d-flex justify-content-between align-items-center li-em';
            var description = tasks[t].description;
            description = replaceAll(description, '\n', '<br/>');
            description = replaceAll(description, '\'', '&#39;');
            var params = "'" + tasks[t].id + "',";
            params += "'" + tasks[t].name + "',";
            params += "'" + tasks[t].inputtype + "',";
            params += "'" + description + "'";
            task.setAttribute('onclick', 'showDescription(' + params + ');');

            tasksarea.appendChild(task);
        }

        var taskstatus = document.getElementById("taskstatus");
        if (hasTasks == false) {
            taskstatus.innerHTML = '<h4>&nbsp;&nbsp;&nbsp;Nothing to do at the moment...</h4>';
        } else {
            taskstatus.innerHTML = '';
        }
    });

    window.clearTimeout(refreshPageTimer);
    refreshPageTimer = window.setTimeout(function() {
        var randomPage = Math.floor(Math.random() * 5) + 1;
        var refresh = Math.floor(Math.random() * 9007199254740990) + 1;

        if (randomPage == 1) {
            window.location.href = "/device?refresh=" + refresh;
        } else if (randomPage == 2) {
            window.location.href = "/how?refresh=" + refresh;
        } else if (randomPage == 3) {
            window.location.href = "/foh_roster?refresh=" + refresh;
        } else if (randomPage == 4) {
            window.location.href = "/tasks?refresh=" + refresh;
        } else if (randomPage == 5) {
            window.location.href = "/tasksrecurring?refresh=" + refresh;
        }
    }, 240000);
}

function showDescription(taskid, name, inputtype, description) {
    var descriptionarea = document.getElementById('descriptionarea');
    var desciptiontitle = document.getElementById('descriptiontitle');
    descriptionarea.classList.remove("invisible");
    desciptiontitle.classList.remove("invisible");
    
    var innerHTML = '<h4>' + name + '</h4><br/>' + description + '<br/>';
    innerHTML += '<br/><hr noshade/>';

    if (inputtype == 1) {
        innerHTML += '<br/><h5>Value:</h5><input type="text" class="form-control" id="input"><br/>';
    } else if (inputtype == 2) {
        innerHTML += '<br/><h5>Value:</h5><input type="number" class="form-control" id="input"><br/>';
    }

    innerHTML += '<h5>Completed by:</h5><span id="buttonarea"></span>';
    innerHTML += '<br/><br/><h5>Extra notes:</h5><textarea class="form-control" rows="2" id="extranotes"></textarea><br/>';

    descriptionarea.innerHTML = innerHTML;

    var buttonarea = document.getElementById('buttonarea');
    buttonarea.innerHTML = '';

    for(var e in employees) {
        var b = document.createElement('button');
        b.setAttribute('type', 'button');
        b.className = 'btn btn-em';
        b.innerHTML = employees[e].name;
        b.setAttribute('onclick', 'completeTask(' + taskid + ',' + employees[e].id + ');');
        b.setAttribute('style', 'margin:4px');
        buttonarea.appendChild(b);
        buttonarea.innerHTML = buttonarea.innerHTML + '&nbsp;'
    }
}

function completeTask(taskid, by) {
    var timestamp = getDbFormat() + ' ' + getTime() + ':00';

    var value = '';
    var notes = '';

    var valueelement = document.getElementById("input");
    if (valueelement) {
        value = valueelement.value;
    }

    var noteselement = document.getElementById("extranotes");
    if (noteselement) {
        notes = noteselement.value;
    }

    var request = { "taskid": taskid, "timestamp": timestamp, "by": by, "value": value, "notes": notes };

    sendPost("/completetask", JSON.stringify(request), function(response) {
        var descriptionarea = document.getElementById('descriptionarea');
        descriptionarea.innerHTML = '';
        var desciptiontitle = document.getElementById('descriptiontitle');
        descriptionarea.classList.add("invisible");
        desciptiontitle.classList.add("invisible");

        var success  = JSON.parse(response);

        getTasksForHour();
    });
}

function getTasksForMobile() {
    var date = getDbFormat();
    var request = {date: date};

    sendPost("/getalltasks", JSON.stringify(request), function(response) {
        var tasks = JSON.parse(response);

        var tasksarea = document.getElementById("tasksarea")
        tasksarea.innerHTML = '';

        for(var t in tasks) {
            var task = document.createElement("li");
            task.innerHTML = tasks[t].name;
            task.className = 'list-group-item d-flex justify-content-between align-items-center li-em';

            var tasktime = document.createElement("span");

            var today = new Date();
            var safariDate = getDbFormat();
            safariDate = replaceAll(safariDate, '-', '/');

            var starttime = new Date(safariDate + ' ' + tasks[t].starttime);
            var minutesDiff = calculateMinutes(today, starttime);

            if (tasks[t].completed == true) {
                tasktime.className = 'badge badge-success badge-pill';
                tasktime.innerHTML = '&#10004;';
                tasktime.style = "font-family: 'Zapf Dingbats';";
            } else {
                if (today > starttime && minutesDiff > 120) {
                    tasktime.className = 'badge badge-danger badge-pill';
                    tasktime.innerHTML = '&#10008;';
                    tasktime.style = "font-family: 'Zapf Dingbats';";
                }
            }

            task.appendChild(tasktime);
            tasksarea.appendChild(task);
        }
    });
}

function reload(day) {
    var today = document.getElementById("today")
    var yesterday = document.getElementById("yesterday")

    if (day == 'today') {
        today.classList.add("active");
        today.classList.remove("btn-secondary");
        today.classList.add("btn-dark");

        yesterday.classList.remove("active");
        yesterday.classList.add("btn-secondary");
        yesterday.classList.remove("btn-dark");
        
        getTasksForHour();
    } else if (day == 'yesterday') {
        yesterday.classList.add("active");
        yesterday.classList.remove("btn-secondary");
        yesterday.classList.add("btn-dark");

        today.classList.remove("active");
        today.classList.add("btn-secondary");
        today.classList.remove("btn-dark");

        getYesterdaysTasks();
    }
}

function getYesterdaysTasks() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var yesterday = getDbFormat(date);
    var request = {date: yesterday};

    sendPost("/getyesterdayscompletedtasks", JSON.stringify(request), function(response) {
        var completedtasks = JSON.parse(response);

        var tasksarea = document.getElementById('tasksarea');
        tasksarea.innerHTML = '';
        var taskstatus = document.getElementById("taskstatus");
        taskstatus.innerHTML = '';

        var tasktable = document.createElement('table');
        tasktable.setAttribute('border', '1');
        tasktable.setAttribute('width', '100%');

        var row = document.createElement('tr');
        var namehead = document.createElement('th');
        namehead.innerHTML = 'Name';
        namehead.style = 'text-align: left; vertical-align: middle; background: white;';
        row.appendChild(namehead);

        var completedhead = document.createElement('th');
        completedhead.innerHTML = 'Completed at';
        completedhead.style = 'text-align: center; vertical-align: middle; background: white;';
        row.appendChild(completedhead);

        var byhead = document.createElement('th');
        byhead.innerHTML = 'Completed by';
        byhead.style = 'text-align: center; vertical-align: middle; background: white;';
        row.appendChild(byhead);

        var inputhead = document.createElement('th');
        inputhead.innerHTML = 'Input';
        inputhead.style = 'text-align: center; vertical-align: middle; background: white;';
        row.appendChild(inputhead);

        var noteshead = document.createElement('th');
        noteshead.innerHTML = 'Notes';
        noteshead.style = 'text-align: center; vertical-align: middle; background: white;';
        row.appendChild(noteshead);

        tasktable.appendChild(row);

        for(var t in alltasks) {
            var row = document.createElement('tr');

            var namecol = document.createElement('td');
            namecol.innerHTML = alltasks[t].name;
            namecol.style = 'text-align: left; vertical-align: middle; background: white;';
            row.appendChild(namecol);

            var id = alltasks[t].id;
            var completedtask = { timestamp: '00:00:00' };
            for(var ct in completedtasks) {
                if (completedtasks[ct].taskid == id) {
                    completedtask = completedtasks[ct];
                    break;
                }
            }

            if (completedtask.timestamp != '00:00:00') {
                var timestampcol = document.createElement('td');
                timestampcol.innerHTML = formatAMPM(completedtask.timestamp);
                timestampcol.style = 'text-align: center; vertical-align: middle; background: white;';
                row.appendChild(timestampcol);

                var bycol = document.createElement('td');
                bycol.innerHTML = completedtask.name;
                bycol.style = 'text-align: center; vertical-align: middle; background: white;';
                row.appendChild(bycol);

                var inputcol = document.createElement('td');
                inputcol.innerHTML = completedtask.input;
                inputcol.style = 'text-align: center; vertical-align: middle; background: white;';
                row.appendChild(inputcol);

                var notescol = document.createElement('td');
                notescol.innerHTML = completedtask.notes;
                notescol.style = 'text-align: left; vertical-align: middle; background: white;';
                row.appendChild(notescol);
            } else {
                var timestampcol = document.createElement('td');
                timestampcol.innerHTML = '&#10060;';
                timestampcol.style = 'text-align: center; vertical-align: middle; background: white;';
                row.appendChild(timestampcol);

                var bycol = document.createElement('td');
                bycol.innerHTML = '&#10060;';
                bycol.style = 'text-align: center; vertical-align: middle; background: white;';
                row.appendChild(bycol);

                var inputcol = document.createElement('td');
                inputcol.innerHTML = '';
                inputcol.style = 'text-align: center; vertical-align: middle; background: white;';
                row.appendChild(inputcol);

                var notescol = document.createElement('td');
                notescol.innerHTML = '';
                notescol.style = 'text-align: left; vertical-align: middle; background: white;';
                row.appendChild(notescol);
            }

            tasktable.appendChild(row);
        }

        tasksarea.appendChild(tasktable);
    });
}