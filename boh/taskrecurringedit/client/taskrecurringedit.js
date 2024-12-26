var tasks = [];

function displayRecurringTask(id) {
    for(var i = 0; i < roles.length; i++) {
        if (roles[i].id == id) {
            role = roles[i];
            break;
        }
    }
    
    var id = document.getElementById('id');
    id.value = role.id;

    var name = document.getElementById('roleinput');
    name.value = role.name;

    var isjob = document.getElementById('isjob');
    isjob.checked = role.isjob;

    var colour = document.getElementById('colourinput');
    colour.value = role.colour;

    var textcolour = document.getElementById('textcolourinput');
    textcolour.value = role.textcolour;

    showExample();
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
    var rolelist = document.getElementById('tasklist');

    rolelist.innerHTML = '';

    for(var i = 0; i < roles.length; i++) {
        var role = roles[i];

        if (role.id != 0) {
            var button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.setAttribute('class', 'list-group-item list-group-item-action');
            button.setAttribute('onclick', 'displayRole(' + role.id + ');');
            button.style = "font-size:16px";
            button.innerText = role.name;

            rolelist.appendChild(button);
        }
    }

    if (roles.length > 1) {
        if (id) {
            displayRole(id);
        } else {
            displayRole(roles[1].id);
        }
    }
}

function addnew() {
    var id = document.getElementById('id');
    var name = document.getElementById('roleinput');
    var colour = document.getElementById('colourinput');
    var textcolour = document.getElementById('textcolourinput');
    var isjob = document.getElementById('isjob');

    id.value = -1;
    name.value = 'New Role';
    colour.value = '#FFFFFF';
    textcolour.value = '#000000';
    isjob.checked = false;

    showExample();
}

function save() {
    var id = document.getElementById('id');
    var name = document.getElementById('roleinput');
    var colour = document.getElementById('colourinput');
    var textcolour = document.getElementById('textcolourinput');
    var isjob = document.getElementById('isjob');

    var role = {
        id: id.value,
        name: name.value,
        colour: colour.value,
        textcolour: textcolour.value,
        isjob: isjob.checked,
        rights: 0
    };

    sendPost("/updaterecurringtask", JSON.stringify(role), function(response) {
        var json  = JSON.parse(response);
        loadRoles(json.roleid);
        alert('Saved!');
    });
}

function disableRecurringTask() {
    var id = document.getElementById('id');
    var name = document.getElementById('roleinput');

    var role = {
        id: id.value,
    };

    var doDelete = confirm('Are you sure you want to DELETE "' + name.value + '"');

    if (doDelete) {
        sendPost("/disablerecurringtask", JSON.stringify(role), function(response) {
            loadRoles();
        });
    }
}