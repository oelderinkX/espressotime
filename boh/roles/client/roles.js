var roles = [];

function displayHow(id) {
    for(var i = 0; i < hows.length; i++) {
        if (hows[i].id == id) {
            how = hows[i];
            break;
        }
    }
    
    var id = document.getElementById('id');
    id.value = how.id;

    var name = document.getElementById('howinput');
    name.value = how.name;

    var description = document.getElementById('description');
    description.value = how.description;
}

function loadHow() {
    var request = {};
    sendPost("/gethows", JSON.stringify(request), function(response) {
        hows  = JSON.parse(response);
        
        if (canSave == true) {
            hows.push({ id: 0, name: '*** New Help', description: 'Enter name and description and Save'});
        }

        hows = hows.sort((a, b) => {
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

        loadHowCombo();
    });
}

function loadHowCombo() {
    var howlist = document.getElementById('howlist');

    howlist.innerHTML = '';

    for(var i = 0; i < hows.length; i++) {
        if (filter == '' || hows[i].name.toUpperCase().includes(filter)) {
            var how = hows[i];

            var button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.setAttribute('class', 'list-group-item list-group-item-action');
            button.setAttribute('onclick', 'displayHow(' + how.id + ');');
            button.style = "font-size:16px";
            button.innerText = how.name;

            howlist.appendChild(button);
        }
    }
}

function saveHow() {
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