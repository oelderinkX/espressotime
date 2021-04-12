function getEmployees() {
    var employeecombo = document.getElementById('employeecombox');

    sendPost("/admin_getemployees", '{ "showEx": false }', function(response) {
        var employees = JSON.parse(response);

        for(var i = 0; i < employees.length; i++) {
            var option = document.createElement("option");
            option.setAttribute('value', employees[i].id);
            option.innerHTML = employees[i].name;
            employeecombo.appendChild(option);
        }
    });
}

function setDates() {
    var day = document.getElementById('day');
    var month = document.getElementById('month');
    var year = document.getElementById('year');

    for(var i = 1; i < 32; i++) {
        var option = document.createElement("option");
        option.setAttribute('value', i);
        option.innerHTML = i;
        day.appendChild(option);
    }

    for(var i = 0; i < 12; i++) {
        var option = document.createElement("option");
        option.setAttribute('value', i+1);
        option.innerHTML = monthNames[i];
        month.appendChild(option);
    }

    for(var i = 2021; i < 2023; i++) {
        var option = document.createElement("option");
        option.setAttribute('value', i);
        option.innerHTML = i;
        year.appendChild(option);
    }

    var today = new Date();

    day.selectedIndex = today.getDate();
    month.selectedIndex = (today.getMonth() + 1);
    year.selectedIndex = today.getFullYear();
}