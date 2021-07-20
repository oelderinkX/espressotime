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
        //alert('re-load the tasks for the hour');
    }

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
    sendPost("/gettasks", '{}', function(response) {
        var tasks = JSON.parse(response);

        var tasksarea = document.getElementById("tasksarea")

        for(var t in tasks) {
            var task = document.createElement("li");
            task.innerHTML = tasks[t].name;
            task.className = 'list-group-item d-flex justify-content-between align-items-center li-em';
            task.setAttribute('onclick', 'showDescription("' + tasls[t].name + '","' +  tasks[t].description + '");');

            var tasktime = document.createElement("span");
            tasktime.innerHTML = tasks[t].starttime;
            tasktime.className = 'badge badge-primary badge-pill';

            task.appendChild(tasktime);
            tasksarea.appendChild(task);
        }
    });
}

function showDescription(name, description) {
    var desciptionarea = document.getElementById('descriptionarea');
    var desciptiontitle = document.getElementById('descriptiontitle');
    desciptiontitle.classList.remove("invisible");
    descriptionarea.innerHTML = '<h4>' + name + '</h4><br/>' + description + '<br/><br/><h4>Completed by:</h4><br/><span id="buttonarea"></span>';

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