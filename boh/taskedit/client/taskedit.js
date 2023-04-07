function getTasks() {
    var tasklist = document.getElementById('tasklist');
    var showOldTasksCheckbox = document.getElementById('showOldTasks');

    while (tasklist.firstChild) {
        tasklist.removeChild(tasklist.firstChild);
    }

    var showOld = showOldTasksCheckbox.checked;

    sendPost("/admin_gettasks", '{ "showOld": ' + showOld + ' }', function(response) {
        var tasks = JSON.parse(response);

        for(var i = 0; i < tasks.length; i++) {
            var tr = document.createElement("tr");

            var th = document.createElement('th');
            th.setAttribute('scope', 'row');
            th.innerHTML = tasks[i].id;

            var td1 = document.createElement('td');
            var input1 = document.createElement('input');
            input1.setAttribute('type', 'text');
            input1.setAttribute('id', 'name' + tasks[i].id);
            input1.setAttribute('value', tasks[i].name);
            td1.appendChild(input1);

            var td2 = document.createElement('td');
            var select1 = document.createElement('select');
            select1.setAttribute('id', 'input' + tasks[i].id);
            var option1 = document.createElement('option');
            option1.setAttribute('value', '0');
            option1.innerHTML = 'None';
            var option2 = document.createElement('option');
            option2.setAttribute('value', '1');
            option2.innerHTML = 'Text';
            var option3 = document.createElement('option');
            option3.setAttribute('value', '2');
            option3.innerHTML = 'Number';
            select1.appendChild(option1);
            select1.appendChild(option2);
            select1.appendChild(option3);
            select1.value = tasks[i].inputtype;
            td2.appendChild(select1);

            var td3 = document.createElement('td');
            var textarea3 = document.createElement('textarea');
            textarea3.setAttribute('id', 'description' + tasks[i].id);
            textarea3.setAttribute('rows', '4');
            textarea3.setAttribute('cols', '90');
            textarea3.innerHTML = tasks[i].description;
            td3.appendChild(textarea3);

            var td4 = document.createElement('td');
            var input4 = document.createElement('input');
            input4.setAttribute('type', 'time');
            input4.setAttribute('id', 'starttime' + tasks[i].id);
            input4.setAttribute('value', tasks[i].starttime);
            td4.appendChild(input4);

            var td5 = document.createElement('td');
            var input5 = document.createElement('input');
            input5.setAttribute('type', 'button');
            input5.setAttribute('value', 'Update');
            input5.setAttribute('onclick', 'updateTask(' + tasks[i].id + ');');
            td5.appendChild(input5);

            tr.appendChild(th);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);

            tasklist.appendChild(tr);
        }

        var tr = document.createElement("tr");

        var th = document.createElement('th');
        th.setAttribute('scope', 'row');
        th.innerHTML = '0';

        var td1 = document.createElement('td');
        var input1 = document.createElement('input');
        input1.setAttribute('type', 'text');
        input1.setAttribute('id', 'name0');
        input1.setAttribute('value', '');
        td1.appendChild(input1);

        var td2 = document.createElement('td');
        var select1 = document.createElement('select');
        select1.setAttribute('id', 'input0');
        var option1 = document.createElement('option');
        option1.setAttribute('value', '0');
        option1.innerHTML = 'None';
        var option2 = document.createElement('option');
        option2.setAttribute('value', '1');
        option2.innerHTML = 'Text';
        var option3 = document.createElement('option');
        option3.setAttribute('value', '2');
        option3.innerHTML = 'Number';
        select1.appendChild(option1);
        select1.appendChild(option2);
        select1.appendChild(option3);
        select1.value = 0;
        td2.appendChild(select1);

        var td3 = document.createElement('td');
        var textarea3 = document.createElement('textarea');
        textarea3.setAttribute('id', 'description0');
        textarea3.setAttribute('rows', '4');
        textarea3.setAttribute('cols', '90');
        td3.appendChild(textarea3);

        var td4 = document.createElement('td');
        var input4 = document.createElement('input');
        input4.setAttribute('type', 'time');
        input4.setAttribute('id', 'starttime0');
        input4.setAttribute('value', '09:00:00');
        td4.appendChild(input4);

        var td5 = document.createElement('td');
        var input5 = document.createElement('input');
        input5.setAttribute('type', 'button');
        input5.setAttribute('value', 'Add');
        input5.setAttribute('onclick', 'addTask();');
        td5.appendChild(input5);

        tr.appendChild(th);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);

        tasklist.appendChild(tr);
    });
}

function updateTask(id) {
    var name = document.getElementById('name' + id).value;
    var inputtype = document.getElementById('input' + id).value;
    var description = document.getElementById('description' + id).value;
    var starttime = document.getElementById('starttime' + id).value;

    if (name.length == 0 || description.length == 0) {
        alert('Make sure you have enter the name and description of the task');
    } else {
        if (starttime.length == 0) {
            starttime = '00:00:00';
        }

        var json = { "id": id, "name": name, "inputtype": inputtype, "description": description, "starttime": starttime };

        sendPost("/updatetask", JSON.stringify(json), function(response) {
            getTasks();
        });
    }
}

function addTask() {
    var name = document.getElementById('name0').value;
    var inputtype = document.getElementById('input0').value;
    var description = document.getElementById('description0').value;
    var starttime = document.getElementById('starttime0').value;

    if (name.length == 0 || description.length == 0) {
        alert('Make sure you have enter the name and description of the task');
    } else {
        var json = { "name": name, "inputtype": inputtype, "description": description, "starttime": starttime };

        sendPost("/addtask", JSON.stringify(json), function(response) {
            getTasks();
        });
    }
}