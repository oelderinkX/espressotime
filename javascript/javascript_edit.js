function getEmployees() {
    var employeecombo = document.getElementById('employeecombox');

    sendPost("/admin_getemployees", '{ "showEx": false }', function(response) {
        var employees = JSON.parse(response);

        for(var i = 0; i < employees.length; i++) {
            var option = document.createElement("option");
            option.setAttribute('value', employees[i].id);
            option.text(employees[i].name);
            employeecombo.appendChild(option);
        }
    });
}

function setDates() {
    var day = document.getElementById('employeecombox');
    var month = document.getElementById('month');
    var year = document.getElementById('year');

    for(var i = 1; i < 32; i++) {
        var option = document.createElement("option");
        option.setAttribute('value', i);
        option.text(i);
        day.appendChild(option);
    }

    for(var i = 0; i < 12; i++) {
        var option = document.createElement("option");
        option.setAttribute('value', i+1);
        option.text(monthNames[i]);
        month.appendChild(option);
    }

    for(var i = 2021; i < 2023; i++) {
        var option = document.createElement("option");
        option.setAttribute('value', i);
        option.text(i);
        month.appendChild(option);
    }

}