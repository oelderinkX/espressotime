function getEmployees() {
    sendPost("/getemployees", '', function(response) {
        var employees = JSON.parse(response);

        var employeelist = document.getElementById('employeelist');

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
            input4.setAttribute('value', employees[i].ex);
            td4.appendChild(input4);

            var td5 = document.createElement('td');
            var input5 = document.createElement('input');
            input5.setAttribute('type', 'button');
            input5.setAttribute('value', 'Update');
            input5.setAttribute('onclick', 'alert("Update in DB"');
            td5.appendChild(input5);

            tr.appendChild(th);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);

            employeelist.appendChild(tr);
        }
    });
}