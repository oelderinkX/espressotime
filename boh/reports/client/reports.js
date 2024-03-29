var employees = [];

var reports = [
    {
        name: "Daily Tasks",
        id: "dailytasks",
        description: "All the daily tasks done, time and who did them",
        parameters: [
            {
                name: "Start",
                id: "start",
                type: "date"
            },
            {
                name: "End",
                id: "end",
                type: "date"
            }
        ]
    },
    {
        name: "Feedback",
        id: "feedback",
        description: "All the feedback given over time",
        parameters: [
            {
                name: "Start",
                id: "start",
                type: "date"
            },
            {
                name: "End",
                id: "end",
                type: "date"
            }
        ]
    },
    {
        name: "Asset Report",
        id: "assetreport",
        description: "List all assets",
        parameters: []
    },
    {
        name: "Labels",
        id: "labels",
        description: "List all labels for products",
        parameters: []
    },
    {
        name: "Custom Label",
        id: "customlabel",
        description: "Create a one-off label",
        parameters: [
            {
                name: "Name",
                id: "name",
                type: "text"
            },
            {
                name: "Description",
                id: "description",
                type: "text"
            },
            {
                name: "Price (include description and $, multiple prices OK)",
                id: "price",
                type: "textarea"
            },
            {
                name: "Specials",
                id: "specials",
                type: "text"
            }
        ]
    },
    {
        name: "Employee Report",
        id: "employeereport",
        description: "Details about an employee",
        parameters: [
            {
                name: "Employee",
                id: "employee",
                type: "employee"
            }
        ]
    }
];
/*
          Status:
          <div class="input-group">
            <select class="input-large form-control" id="status">
              <option value="0">Unassigned</option>
              <option value="1">Assigned</option>
              <option value="2">Lost</option>
              <option value="3">Damaged</option>
              <option value="4">Cost-recouped</option>
            </select>
          </div>
          <br/>
*/

function loadReport() {
    sendPost("/admin_getemployees", '{ "showEx": false }', function(response) {
        employees = JSON.parse(response);

        var reportselect = document.getElementById('reportselect');
        reportselect.innerHTML = '';

        for(var i = 0; i < reports.length; i++) {
            var report = reports[i];
            var option = document.createElement('option');
            option.setAttribute('value', report.id);
            option.innerHTML = report.name;
            reportselect.appendChild(option);
        } 
    });
}

function getReport(id) {
    for(var i = 0; i < reports.length; i++) {
        if (reports[i].id == id) {
            return reports[i];
        }
    } 
}

function displayReport() {
    var reportselect = document.getElementById('reportselect');
    var reportArea = document.getElementById('report');
    var id = reportselect.value;
    var report = getReport(id);

    reportArea.innerHTML = '';

    var h2 = document.createElement('h2');
    h2.innerHTML = report.name;
    reportArea.appendChild(h2);
    var h5 = document.createElement('h5');
    h5.innerHTML = report.description;
    reportArea.appendChild(h5);
    var br = document.createElement('br');
    reportArea.appendChild(br);

    for(var i = 0; i < report.parameters.length; i++) {
        var name = report.parameters[i].name;
        var type = report.parameters[i].type;
        var id = report.parameters[i].id;

        var label = document.createElement('label');
        label.setAttribute('for',id);
        label.innerHTML = name + ':';
        reportArea.appendChild(label);

        if (type == 'textarea') {
            var textarea = document.createElement('textarea');
            textarea.setAttribute('rows', 3);
            textarea.setAttribute('cols', 30);
            textarea.setAttribute('id', id);
            textarea.classList.add('form-control');
            reportArea.appendChild(textarea);
        } else if (type == 'employee') {
            var select = document.createElement('select');
            select.setAttribute('id', 'employee');
            for(var x = 0; x < employees.length; x++) {
                var option = document.createElement('option');
                option.setAttribute('value', employees[x].id);
                option.innerHTML = employees[x].name;
                select.appendChild(option);
            }
            reportArea.appendChild(select);
        } else {
            var input = document.createElement('input');
            input.setAttribute('type', type);
            input.classList.add('form-control');
            input.setAttribute('id', id);
            reportArea.appendChild(input);
        }

        var br = document.createElement('br');
        reportArea.appendChild(br);
    }

    var br3 = document.createElement('br');
    reportArea.appendChild(br3);
    var button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', 'Run Report');
    button.setAttribute('onclick', 'runReport();');
    reportArea.appendChild(button);
}

function runReport() {
    var reportselect = document.getElementById('reportselect');
    var id = reportselect.value;
    var report = getReport(id);

    var request = {};
    request.id = report.id;
    for(var i = 0; i < report.parameters.length; i++) {
        var param_type = report.parameters[i].type;
        var param_id = report.parameters[i].id;

        var element = document.getElementById(param_id);

        if (param_type == 'employee') {
            request[param_id]= element.value;
        } else {
            request[param_id] = element.value;
        }
    }

    let windowName = report.id + '_' + Date.now() + Math.floor(Math.random() * 100000).toString();
    var windowSpecs = 'resizable=yes,height=600,width=800,location=0,menubar=0,scrollbars=1';

    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", "/runreport");
    form.setAttribute("target", windowName);
    
    var hiddenField = document.createElement("input"); 
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", "request");
    hiddenField.setAttribute("value", JSON.stringify(request, null, 4));
    form.appendChild(hiddenField);

    document.body.appendChild(form);
    window.open('', windowName, windowSpecs);
    form.submit();

    document.body.removeChild(form);
}