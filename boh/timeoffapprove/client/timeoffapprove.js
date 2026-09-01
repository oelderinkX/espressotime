var timeoffs = { };

function getEmployeeNameById(id) {
    if (timeoffs && timeoffs.employee) {
        for(var i = 0; i < timeoffs.employee.length; i++) {
            if (timeoffs.employee[i].id == id) {
                return timeoffs.employee[i].name;
            }
        }
    }

    return 'unknown employee';
}

function loadTimeOffs() {
    var timeoffapproval =  document.getElementById('timeoffapproval');
    timeoffapproval.style = "display: none";

    var request = {};
    sendPost("/gettimeoffs", JSON.stringify(request), function(response) {
        timeoffs  = JSON.parse(response);
    
        var status = document.getElementById('status');
        status.value = 0;

        loadEmployees();

        displayAllTimeoffs();

        timeoffapproval.style = "display: table;";
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
    employees.appendChild(option);

    for(var i = 0; i < timeoffs.employee.length; i++) {
        if (timeoffs.employee[i].ex == false || displayExEmployees == true) {
            var option = document.createElement('option');
            option.value = timeoffs.employee[i].id;
            option.innerText = timeoffs.employee[i].name;
            employees.appendChild(option);
        }
    }
    employees.value = 0;
}

function displayAllTimeoffs() {
    const employees = document.getElementById('employees');
    const status = document.getElementById('status');

    const timeoffs_table = document.getElementById('timeoffs');
    timeoffs_table.innerHTML = '';

    const row = document.createElement('tr');
    row.style = 'background: white';

    const heading1 = document.createElement('th');
    heading1.innerText = 'Employee Name';
    heading1.style = 'text-align: center;';
    row.appendChild(heading1);

    const heading2 = document.createElement('th');
    heading2.innerText = 'Start Date';
    heading2.style = 'text-align: center;';
    row.appendChild(heading2);

    const heading3 = document.createElement('th');
    heading3.innerText = 'End Date';
    heading3.style = 'text-align: center;';
    row.appendChild(heading3);

    const heading4 = document.createElement('th');
    heading4.innerText = 'Type';
    heading4.style = 'text-align: center;';
    row.appendChild(heading4);

    const heading5 = document.createElement('th');
    heading5.innerText = 'Paid';
    heading5.style = 'text-align: center;';
    row.appendChild(heading5);

    const heading6 = document.createElement('th');
    heading6.innerText = 'Reason';
    heading6.style = 'padding-left: 5px; padding-right: 5px;'
    row.appendChild(heading6);

    const heading7 = document.createElement('th');
    heading7.innerText = 'Status';
    heading7.style = 'padding-left: 5px; padding-right: 5px;'
    row.appendChild(heading7);

    const heading8 = document.createElement('th');
    heading8.innerText = 'Action';
    heading8.style = 'padding-left: 5px; padding-right: 5px;'
    row.appendChild(heading8);

    timeoffs_table.appendChild(row);

    const formatter = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    for(let i = 0; i < timeoffs.timeoff.length; i++) {
        if (employees.value == 0 || employees.value == timeoffs.timeoff[i].employee_id) {
            if (status.value == -1 || status.value == timeoffs.timeoff[i].approved) {
                const row = document.createElement('tr');

                const column1 = document.createElement('td');
                column1.innerText = getEmployeeNameById(timeoffs.timeoff[i].employee_id);
                column1.style = 'text-align: center;';
                row.appendChild(column1);
            
                const column2 = document.createElement('td');
                const startDate = new Date(removeZuluTime(timeoffs.timeoff[i].start_date));
                const startDateDay = dayNames[startDate.getDay()];
                column2.innerText = `${formatter.format(startDate)} (${startDateDay})`;
                column2.style = 'text-align: center;';
                row.appendChild(column2);

                const column3 = document.createElement('td');
                const endDate = new Date(removeZuluTime(timeoffs.timeoff[i].end_date));
                const endDateDay = dayNames[endDate.getDay()];
                column3.innerText = `${formatter.format(endDate)} (${endDateDay})`;
                column3.style = 'text-align: center;';
                row.appendChild(column3);

                const column4 = document.createElement('td');
                column4.innerText =  timeoffs.timeoff[i].role;
                column4.style = 'text-align: center;';
                row.appendChild(column4);
            
                const column5 = document.createElement('td');
                column5.innerText =  YesOrNo(timeoffs.timeoff[i].paid);
                column5.style = 'text-align: center;';
                row.appendChild(column5);
            
                const column6 = document.createElement('td');
                column6.innerText =  timeoffs.timeoff[i].reason;
                column6.style = 'padding-left: 5px; padding-right: 5px;';
                row.appendChild(column6);
            
                const column7 = document.createElement('td');

                if (timeoffs.timeoff[i].approved == 0) {
                    column7.innerHTML =  'Pending...';
                } else if (timeoffs.timeoff[i].approved == 1) {
                    column7.innerHTML =  'Approved';
                } else if (timeoffs.timeoff[i].approved == 2) {
                    column7.innerText =  'Unapproved: ' + timeoffs.timeoff[i].unapproved_reason;
                }

                column7.style = 'padding-left: 5px; padding-right: 5px;';
                row.appendChild(column7);
            
                const column8 = document.createElement('td');
                const select = document.createElement("select");

                const option1 = document.createElement("option");
                option1.value = '-1';
                option1.innerHTML = '--- Select Action ---';
                select.appendChild(option1);

                const option2 = document.createElement("option");

                if (timeoffs.timeoff[i].approved == 0) {
                    option2.value = '0';
                    option2.innerHTML = 'Approve';
                    option2.onclick = () => { update(timeoffs.timeoff[i].id, timeoffs.timeoff[i].employee_id, 1); };
                } else if (timeoffs.timeoff[i].approved == 1) {
                    option2.value = '1';
                    option2.innerHTML = 'Reset Approval';
                    option2.onclick = () => { update(timeoffs.timeoff[i].id, timeoffs.timeoff[i].employee_id, 0); };
                }
                select.appendChild(option2);

                // TODO: Update Roster with Time off or Unavailable or Annual leave and stuff

                column8.appendChild(select);
                row.appendChild(column8);

                timeoffs_table.appendChild(row);
            }
        }
    }
}

function update(id, employeeid, approved) {
    var request = {
        id: id,
        employeeid: employeeid,
        approved: approved
    };
    sendPost("/updateapprove", JSON.stringify(request), function(response) {
        loadTimeOffs();
        alert('Updated approval');
    });
}