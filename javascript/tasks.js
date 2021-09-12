var reloadTasks;
var employees = [];

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

function getTasksForHour() {
    var time = getTime() + ':00';
    var date = getDbFormat();
    var request = {date: date, time: time};

    sendPost("/gettasks", JSON.stringify(request), function(response) {
        var tasks = JSON.parse(response);

        var tasksarea = document.getElementById("tasksarea")
        tasksarea.innerHTML = '';

        for(var t in tasks) {
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

            var tasktime = document.createElement("span");
            tasktime.innerHTML = formatAMPM(tasks[t].starttime);
            tasktime.setAttribute('style', 'font-size: 1.1em;');

            var today = new Date();
            var starttime = new Date(getDbFormat() + ' ' + tasks[t].starttime);
            var minutesDiff = calculateMinutes(today, starttime);

            if (minutesDiff < 60)
            {
                tasktime.className = 'badge badge-success badge-pill';
            }
            else if (minutesDiff < 120)
            {
                tasktime.className = 'badge badge-warning badge-pill';
            }
            else
            {
                tasktime.className = 'badge badge-danger badge-pill';
            }

            task.appendChild(tasktime);
            tasksarea.appendChild(task);
        }
    });

    window.clearTimeout(reloadTasks);
    reloadTasks = window.setTimeout(function() {
        window.location.href = "/tasks";
      }, 5 * 60 * 1000);
}

function showDescription(taskid, name, inputtype, description) {
    var descriptionarea = document.getElementById('descriptionarea');
    var desciptiontitle = document.getElementById('descriptiontitle');
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
        b.setAttribute('style', 'margin:3px');
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