var roles = [];

/*
id: 0, 
 name: '-', 
 colour: '#FFFFFF', 
 textcolour: '#000000', 
 rights: 0
*/

function displayRole(id) {
    for(var i = 0; i < roles.length; i++) {
        if (roles[i].id == id) {
            role = roles[i];
            break;
        }
    }
    
    //var id = document.getElementById('id');
    //id.value = how.id;

    var name = document.getElementById('roleinput');
    name.value = role.name;

    var colour = document.getElementById('colourinput');
    colour.value = role.colour;

    var textcolour = document.getElementById('textcolourinput');
    textcolour.value = role.textcolour;

    var displayrole = document.getElementById('displayrole');
    displayrole.style = 'background-color: ' + role.colour + '; color: ' + role.textcolour + '; font-size:16px; text-align: center; resize: none; border-radius: 10px;';
    displayrole.value  = '6:30 AM - 3:00 PM\n' + role.name; 
}

function loadRoles() {
    var request = {};
    sendPost("/getroles", JSON.stringify(request), function(response) {
        roles  = JSON.parse(response);

        roles = roles.sort((a, b) => {
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

        loadRoleCombo();
    });
}

function loadRoleCombo() {
    var rolelist = document.getElementById('rolelist');

    rolelist.innerHTML = '';

    for(var i = 0; i < roles.length; i++) {
        var role = roles[i];

        var button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('class', 'list-group-item list-group-item-action');
        button.setAttribute('onclick', 'displayRole(' + role.id + ');');
        button.style = "font-size:16px";
        button.innerText = role.name;

        rolelist.appendChild(button);
    }
}

function saveHow() {
    return;

    var howlist = document.getElementById('howlist');
    var selectedIndex = howlist.selectedIndex;

    var id = document.getElementById('id');
    var name = document.getElementById('howinput');
    var description = document.getElementById('description');

    var how = {
        id: id.value,
        name: name.value,
        description: description.value,
    };

    sendPost("/updatehow", JSON.stringify(how), function(response) {
        loadHow();
        howlist.selectedIndex = selectedIndex;
        alert('Saved!');
    });
}