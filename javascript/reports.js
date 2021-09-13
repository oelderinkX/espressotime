var reports = [
    {
        name: "Daily Tasks",
        id: "dailytasks",
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

/*
          <label for="notes">Notes:</label>
          <textarea class="form-control" rows="2" id="notes"></textarea>
*/

/*
          <button type="button" class="btn btn-em" onclick="save()">Save</button>
*/

function loadReport() {
    var reportselect = document.getElementById('reportselect');
    reportselect.innerHTML = '';

    for(var i = 0; i < reports.length; i++) {
        var report = reports[i];
        var option = document.createElement('option');
        option.setAttribute('value', report.id);
        option.innerHTML = report.name;
        reportselect.appendChild(option);
    } 
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

    for(var i = 0; i < report.parameters.length; i++) {
        var name = report.parameters[i].name;
        var type = report.parameters[i].type;
        var id = report.parameters[i].id;

        if (type == 'date') {
            var label = document.createElement('label');
            label.setAttribute('for',id);
            label.innerHTML = name + ':';
            reportArea.appendChild(label);

            var input = document.createElement('input');
            input.setAttribute('type', type);
            input.classList.add('form-control');
            input.setAttribute('id', id);
            reportArea.appendChild(input);

            var br = document.createElement('br');
            reportArea.appendChild(br);
        }
    }
}