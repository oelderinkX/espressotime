let refreshPageTimer;
let employees = [];
let allemployees = [];

function clock() {
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let ampm = "am";
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

function loadAllEmployees() {
    const request = {};
    sendPost("/getemployees",  JSON.stringify(request), function(response) {
        allemployees = JSON.parse(response);
    });
}

function loadEmployees() {
    const date = getDbFormat() + ' 00:00:00';
    sendPost("/gettaskrecurringemployees", '{ "date": "' + date + '"}', function(response) {
        employees = [];
        const taskemployees = JSON.parse(response);

        for(let i = 0; i < taskemployees.length; i++) {
            employees.push({id: taskemployees[i].id, name: taskemployees[i].name});
        }
    });
}

function getEmployeeNameById(id) {
    for(let i = 0; i < allemployees.length; i++) {
        if (allemployees[i].id === id) {
            return allemployees[i].name;
        }
    }
}

// 1 = Monday
// 2 = Tuesday
// 3 = Wednesday
// 4 = Thursday
// 5 = Friday
// 6 = Saturday
// 0 = Sunday
// 9 = Monthly
// 10 = January
// 11 = February
// 12 = March
// 13 = April
// 14 = May
// 15 = June
// 16 = July
// 17 = August
// 18 = September
// 19 = October
// 20 = November
// 21 = December
// -1 = Disabled
function getRecurrentTasks() {
    const date = new Date();

    const month = parseInt(date.getMonth()) + 10;
    const day = parseInt(date.getDay());
    const request = {date: date, day: day, month: month};

    sendPost("/getrecurringtasks", JSON.stringify(request), function(response) {
        const tasks = JSON.parse(response);
        let hasTasks = false;
        let hasCompletedTasks = false;

        const tasksarea = document.getElementById("tasksarea")
        tasksarea.innerHTML = '';
        const taskscompletedarea = document.getElementById("taskscompletedarea");
        taskscompletedarea.innerHTML = '';

        for(const t in tasks) {
            if (tasks[t].completed_user === null) {
                hasTasks = true;
                const task = document.createElement("li");
                task.innerHTML = tasks[t].name;
                task.className = 'list-group-item d-flex justify-content-between align-items-center li-em';
                let description = tasks[t].description;
                description = replaceAll(description, '\n', '<br/>');
                description = replaceAll(description, '\'', '&#39;');
                let params = "'" + tasks[t].id + "',";
                params += "'" + tasks[t].name + "',";
                params += "'" + tasks[t].inputtype + "',";
                params += "'" + description + "'";
                task.setAttribute('onclick', 'showDescription(' + params + ');');
                
                tasksarea.appendChild(task);
            } else {
                hasCompletedTasks = true;
                const task = document.createElement("li");
                task.innerHTML = `${tasks[t].name} &#x2705; ( ${getEmployeeNameById(tasks[t].completed_user)} )`;

                taskscompletedarea.append(task);
            }
        }

        const taskstatus = document.getElementById("taskstatus");
        if (hasTasks === false) {
            taskstatus.innerHTML = '<h4>&nbsp;&nbsp;&nbsp;Nothing to do at the moment...</h4>';
        } else {
            taskstatus.innerHTML = '';
        }

        const completedtasksheader = document.getElementById("completedtasksheader");
        if (hasCompletedTasks === true) {
            completedtasksheader.innerHTML = 'Recently completed tasks &nbsp;';
        }
    });

    window.clearTimeout(refreshPageTimer);
    refreshPageTimer = window.setTimeout(function() {
        const randomPage = Math.floor(Math.random() * 4) + 1;
        const refresh = Math.floor(Math.random() * 9007199254740990) + 1;

        if (randomPage == 1) {
            window.location.href = "/device?refresh=" + refresh;
        } else if (randomPage == 2) {
            window.location.href = "/how?refresh=" + refresh;
        } else if (randomPage == 3) {
            window.location.href = "/foh_roster?refresh=" + refresh;
        } else if (randomPage == 4) {
            window.location.href = "/tasks?refresh=" + refresh;
        }
    }, 240000);
}

function showDescription(taskid, name, inputtype, description) {
    const descriptionarea = document.getElementById('descriptionarea');
    const desciptiontitle = document.getElementById('descriptiontitle');
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
        const b = document.createElement('button');
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

    var inputvalue = '';
    var notes = '';

    var valueelement = document.getElementById("input");
    if (valueelement) {
        inputvalue = valueelement.value;
    }

    var noteselement = document.getElementById("extranotes");
    if (noteselement) {
        notes = noteselement.value;
    }

    var request = { "taskid": taskid, "timestamp": timestamp, "by": by, "value": inputvalue, "notes": notes };

    sendPost("/completerecurringtask", JSON.stringify(request), function(response) {
        var descriptionarea = document.getElementById('descriptionarea');
        descriptionarea.innerHTML = '';
        var desciptiontitle = document.getElementById('descriptiontitle');
        descriptionarea.classList.add("invisible");
        desciptiontitle.classList.add("invisible");

        var success  = JSON.parse(response);

        getRecurrentTasks();
    });
}