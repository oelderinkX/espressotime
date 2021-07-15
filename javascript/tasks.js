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

    if (m == 40) {
        alert('re-load the tasks for the hour');
    }

    t = setTimeout(function() {
      clock()
    }, 10000);
  }

function loadEmployees() {
    //get from DB!!!
    employees.push({name: 'Emma Lee'});
    employees.push({name: 'Neha'});
    employees.push({name: 'Jamela'});
}

function getTasksForHour() {
    var tasks = [];
    //get from json, just fake at the moment
    tasks.push({ name: 'back floor', starttime: '4:00 pm', description: 'clean it people!'});

    var tasksarea = document.getElementById("tasksarea")

    for(var t in tasks) {
        var task = document.createElement("li");
        task.innerHTML = tasks[t].name;
        task.className = 'list-group-item d-flex justify-content-between align-items-center li-em';
        task.setAttribute('onclick', 'showDescription("' +  tasks[t].description + '");');

        var tasktime = document.createElement("span");
        tasktime.innerHTML = tasks[t].starttime;
        tasktime.className = 'badge badge-primary badge-pill';

        task.appendChild(tasktime);
        tasksarea.appendChild(task);
    }
}

function showDescription(description) {
    var desciptionarea = document.getElementById('descriptionarea');
    descriptionarea.innerHTML = '<h1>' + description + '</h1>';

    var buttonarea = document.getElementById('buttonarea');
    buttonarea.innerHTML = '';

    for(var e in employees) {
        var b = document.createElement('button');
        b.setAttribute('type', 'button');
        b.className = 'btn btn-em';
        b.innerHTML = employees[e].name;
        buttonarea.appendChild(b);
        buttonarea.innerHTML = buttonarea.innerHTML + '&nbsp;'
    }
}