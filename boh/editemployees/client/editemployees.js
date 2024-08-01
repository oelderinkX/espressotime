function getEmployees() {
    var employeelist = document.getElementById('employeelist');
    var showExCheckbox = document.getElementById('showEx');

    while (employeelist.firstChild) {
        employeelist.removeChild(employeelist.firstChild);
    }

    var showEx = showExCheckbox.checked;

    sendPost("/admin_getemployees", '{ "showEx": ' + showEx + ' }', function(response) {
        var employees = JSON.parse(response);

        for(var i = 0; i < employees.length; i++) {
            var tr = document.createElement("tr");

            var th = document.createElement('th');
            th.setAttribute('scope', 'row');
            th.innerHTML = employees[i].id;

            var td1 = document.createElement('td');
            var input1 = document.createElement('input');
            input1.setAttribute('type', 'text');
            input1.setAttribute('id', 'name' + employees[i].id);
            input1.setAttribute('value', employees[i].name);
            td1.appendChild(input1);

            var td2 = document.createElement('td');
            var input2 = document.createElement('input');
            input2.setAttribute('type', 'text');
            input2.setAttribute('id', 'contact' + employees[i].id);
            input2.setAttribute('value', employees[i].contact);
            td2.appendChild(input2);

            var td3 = document.createElement('td');
            var input3 = document.createElement('input');
            input3.setAttribute('type', 'text');
            input3.setAttribute('id', 'pin' + employees[i].id);
            input3.setAttribute('value', employees[i].pin);
            td3.appendChild(input3);

            var td4 = document.createElement('td');
            var input4 = document.createElement('input');
            input4.setAttribute('type', 'checkbox');
            input4.setAttribute('id', 'ex' + employees[i].id);
            input4.checked = employees[i].ex;
            td4.appendChild(input4);

            var td5 = document.createElement('td');
            var input5 = document.createElement('input');
            input5.setAttribute('type', 'button');
            input5.setAttribute('value', 'Update');
            input5.setAttribute('onclick', 'updateEmployee(' + employees[i].id + ');');
            td5.appendChild(input5);

            tr.appendChild(th);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);

            employeelist.appendChild(tr);
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
        var input2 = document.createElement('input');
        input2.setAttribute('type', 'text');
        input2.setAttribute('id', 'contact0');
        input2.setAttribute('value', '');
        td2.appendChild(input2);

        var td3 = document.createElement('td');
        var input3 = document.createElement('input');
        input3.setAttribute('type', 'text');
        input3.setAttribute('id', 'pin0');
        var randomPin = '' + Math.floor(Math.random() * 10) + '' + Math.floor(Math.random() * 10) + '' + Math.floor(Math.random() * 10) + '' + Math.floor(Math.random() * 10);
        input3.setAttribute('value', randomPin);
        td3.appendChild(input3);

        var td4 = document.createElement('td');
        var input4 = document.createElement('input');
        input4.setAttribute('type', 'checkbox');
        input4.setAttribute('id', 'ex0');
        td4.appendChild(input4);

        var td5 = document.createElement('td');
        var input5 = document.createElement('input');
        input5.setAttribute('type', 'button');
        input5.setAttribute('value', 'Add');
        input5.setAttribute('onclick', 'addEmployee();');
        td5.appendChild(input5);

        tr.appendChild(th);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);

        employeelist.appendChild(tr);
    });
}

function updateEmployee(id) {
    var name = document.getElementById('name' + id).value;
    var contact = document.getElementById('contact' + id).value;
    var pin = document.getElementById('pin' + id).value;
    var ex = document.getElementById('ex' + id).checked;

    var json = '{ "employeeId": "' + id +  '", "employeeName": "' + name.trim() + '", "employeeContact": "' + contact + '", "employeePin": "' + pin.trim() + '", "employeeEx": ' + ex + ' }';

    sendPost("/updateemployee", json, function(response) {
        getEmployees();
    });
}

function addEmployee() {
    var name = document.getElementById('name0').value;
    var contact = document.getElementById('contact0').value;
    var pin = document.getElementById('pin0').value;
    var ex = document.getElementById('ex0').checked;

    if (name.length == 0 || contact.length == 0 || pin.length == 0) {
        alert('All new employees need a name, contact number and pin');
    } else {
        var json = '{ "employeeName": "' + name.trim() + '", "employeeContact": "' + contact + '", "employeePin": "' + pin.trim() + '", "employeeEx": ' + ex + ' }';

        sendPost("/addemployee", json, function(response) {
            getEmployees();
        });
    }
}