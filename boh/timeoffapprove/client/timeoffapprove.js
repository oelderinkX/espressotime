var timeoffs = { };

function loadTimeOffs() {
    // hide everything!!!
    var timeoffapproval =  document.getElementById('timeoffapproval');
    timeoffapproval.style = "display: none";

    var request = {};
    sendPost("/gettimeoffs", JSON.stringify(request), function(response) {
        timeoffs  = JSON.parse(response);
        
        loadEmployees();

        displayAllTimeoffs();

        timeoffapproval.style = "display: inline";
    });
}

function loadEmployees() {
    var employees = document.getElementById('employees');
    employees.innerHTML = '';
    var ex = document.getElementById('ex');
    var displayExEmployees = ex.checked;

    var option = document.createElement('option');
    option.value = '0';
    option.innerText = '--- All ---';
    option.setAttribute('selected', 'selected');
    employees.appendChild(option);

    for(var i = 0; i < timeoffs.employee.length; i++) {
        if (timeoffs.employee[i].ex == true || displayExEmployees == true) {
            var option = document.createElement('option');
            option.value = timeoffs.employee[i].id;
            option.innerText = timeoffs.employee[i].name;
            employees.appendChild(option);
        }
    }
}

function displayAllTimeoffs() {
    var employees = document.getElementById('employees');
    var status = document.getElementById('status');

    var timeoffs_table = document.getElementById('timeoffs');
    timeoffs_table.innerHTML = '';

    var row = document.createElement('tr');

    var heading = document.createElement('th');
    heading.innerText = 'Employee Name';
    row.appendChild(heading);

    var heading = document.createElement('th');
    heading.innerText = 'Time Off Dates';
    row.appendChild(heading);

    var heading = document.createElement('th');
    heading.innerText = 'Type';
    row.appendChild(heading);

    var heading = document.createElement('th');
    heading.innerText = 'Paid';
    row.appendChild(heading);

    var heading = document.createElement('th');
    heading.innerText = 'Reason';
    row.appendChild(heading);

    var heading = document.createElement('th');
    heading.innerText = 'Status';
    row.appendChild(heading);

    timeoffs_table.appendChild(row);

    for(var i = 0; i < timeoffs.timeoff.length; i++) {
        if (employees.value == 0 || employees.value == timeoffs.timeoff[i].employeeid) {
            if (status.value == -1 || status.value == timeoffs.timeoff[i].status) {
                var row = document.createElement('tr');

                var column = document.createElement('td');
                column.innerText = timeoffs.timeoff[i].id;  // get name from id!!
                row.appendChild(column);
            
                var column = document.createElement('td');
                column.innerText =  timeoffs.timeoff[i].id;
                row.appendChild(column);
            
                var column = document.createElement('td');
                column.innerText =  timeoffs.timeoff[i].type;
                row.appendChild(column);
            
                var column = document.createElement('td');
                column.innerText =  timeoffs.timeoff[i].paid;
                row.appendChild(column);
            
                var column = document.createElement('td');
                column.innerText =  timeoffs.timeoff[i].reason;
                row.appendChild(column);
            
                var column = document.createElement('td');
                column.innerText =  timeoffs.timeoff[i].status;  // add buttons with calls!
                row.appendChild(column);
            
                timeoffs_table.appendChild(row);
            }
        }
    }
}