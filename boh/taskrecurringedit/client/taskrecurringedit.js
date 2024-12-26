var tasks = [];

function displayRecurringTask(id) {
    var task = {};

    for(var i = 0; i < tasks.length; i++) {
        if (tasks[i].id == id) {
            task = tasks[i];
            break;
        }
    }
  
    var id = document.getElementById('id');
    id.value = task.id;

    var name = document.getElementById('name');
    name.value = task.name;

    var description = document.getElementById('description');
    description.value = task.description;

    var input = document.getElementById('input');
    input.selectedIndex = task.input;

    var recur = document.getElementById('recur');
    recur.selectedIndex = task.recur;
}

function loadRecurringTasks(id) {
    var request = {};
    sendPost("/getallrecurringtasks", JSON.stringify(request), function(response) {
        tasks  = JSON.parse(response);

        tasks = tasks.sort((a, b) => {
            var n1 = a.name.toUpperCase();
            var n2 = b.name.toUpperCase();
            if (n1 > n2) {
                return 1;
            } else if (n1 < n2) {
                return - 1;
            } else {
                return 0;
            }
        });

        loadTaskCombo(id);
    });
}

function loadTaskCombo(id) {
    var tasklist = document.getElementById('tasklist');

    tasklist.innerHTML = '';

    for(var i = 0; i < tasks.length; i++) {
        var task = tasks[i];

        if (task.id != 0) {
            var button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.setAttribute('class', 'list-group-item list-group-item-action');
            button.setAttribute('onclick', 'displayRecurringTask(' + task.id + ');');
            button.style = "font-size:16px";
            button.innerText = task.name;

            tasklist.appendChild(button);
        }
    }

    if (tasks.length > 1) {
        if (id) {
            displayRecurringTask(id);
        } else {
            displayRecurringTask(tasks[1].id);
        }
    }
}

function addnew() {
    var id = document.getElementById('id');
    var name = document.getElementById('name');
    var description = document.getElementById('description');
    var input = document.getElementById('input');
    var recur = document.getElementById('recur');

    id.value = -1;
    name.value = '';
    description.value = '';
    input.selectedIndex = 0;
    recur.selectedIndex = 0;
}

function save() {
    var id = document.getElementById('id');
    var name = document.getElementById('name');
    var description = document.getElementById('description');
    var input = document.getElementById('input');
    var recur = document.getElementById('recur');

    var task = {
        id: id.value,
        name: name.value,
        description: description.value,
        input: input.selectedIndex,
        recur: recur.selectedIndex
    };

    if (task.name.length > 0 && task.description.length > 0) {
        sendPost("/updaterecurringtask", JSON.stringify(task), function(response) {
            var json  = JSON.parse(response);
            loadRecurringTasks(json.taskid);
            alert('Saved!');
        });
    } else {
        alert('Please include a name and description');
    }
}