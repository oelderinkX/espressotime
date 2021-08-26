var assets = {};
var employees = {};

function readableDate(date)
{
    var split = date.split('T');
    if (split.length >= 2) {
        var date = split[0];
        var time = split[1];

        split = date.split('-');
        if (split.length >= 3) {
            var year = split[0];
            var month = split[1];
            var day = split[2];

            split = time.split(':');
            if (split.length >= 3) {
                var hour = split[0];
                var minute = split[1];

                split = minute.split('.');
                if (split.length > 0) {
                    minute = split[0];
                }

                return hour + ':' + minute + ' ' + day + '-' + month + '-' + year;
            }
        }
    }
}

function loadEmployees() {
    var json = {};
    sendPost("/getemployeesforassets", JSON.stringify(json), function(response) {
        employees = JSON.parse(response);

        var employeeidselect = document.getElementById('employeeid');
        employeeidselect.innerHTML = '';

        var employeehasselect = document.getElementById('employeehasselect');
        employeehasselect.innerHTML = '';

        for(var i = 0; i < employees.length; i++) {
            var employee = employees[i];
            var option = document.createElement('option');
            option.setAttribute('value', employee.id);
            option.innerHTML = employee.name;
            employeeidselect.appendChild(option);

            if (employee.id > 0)
            {
                var optiono = document.createElement('option');
                optiono.setAttribute('value', employee.id);
                optiono.innerHTML = employee.name;
                //set click too!
                employeehasselect.appendChild(optiono);
            }
        }   
    });
}

function loadAssets() {
    var json = {};

    sendPost("/getassets", JSON.stringify(json), function(response) {
        assets = JSON.parse(response);

        var assetselect = document.getElementById('assetselect');
        assetselect.innerHTML = '';
    
        for(var i = 0; i < assets.length; i++) {
            var asset = assets[i];
            var option = document.createElement('option');
            option.setAttribute('value', asset.id);
            option.innerHTML = asset.name;
            assetselect.appendChild(option);
        }   
    });
}

function getAssetById(id) {
    for(var i = 0; i < assets.length; i++) {
        var asset = assets[i];
        if (asset.id == id)
        {
            return asset;
        }
    }
}

function displayAsset() {
    var selectedId =  document.getElementById('assetselect');
    var id = document.getElementById('id');
    var name = document.getElementById('name');
    var cost = document.getElementById('cost');
    var status = document.getElementById('status');
    var employeeid = document.getElementById('employeeid');
    var notes = document.getElementById('notes');

    var dateassigned = document.getElementById('dateassigned');
    var statuschangedate = document.getElementById('statuschangedate');

    var asset = getAssetById(selectedId.value);

    id.value = asset.id;
    name.value = asset.name;
    cost.value = asset.cost;
    status.value = asset.status;
    employeeid.value = asset.employeeid;  //not right, need to combo box it!
    notes.value = asset.notes;
    dateassigned.value = readableDate(asset.assigneddate);
    statuschangedate.value = readableDate(asset.status_change_date);
}

function getStatusName(status) {
    if (status == 0) {
        return 'Unassigned';
    } else if (status == 1) {
        return 'Assigned';
    } else if (status == 2) {
        return 'Lost';
    } else if (status == 3) {
        return 'Damaged';
    } else if (status == 4) {
        return 'Cost recouped';
    } else {
        return 'Unknown status';
    }
}

function displayAssigned() {
    var haslist = document.getElementById('haslist');
    haslist.innerHTML = '';
    var employeeid = document.getElementById('employeehasselect').value;
    
    for(var i = 0; i < assets.length; i++) {
        var asset = assets[i];
        if (asset.employeeid == employeeid)
        {
            var h5 = document.createElement('h5');
            h5.innerHTML = asset.name + ' (' + getStatusName(asset.status) + ')';
            haslist.appendChild(h5);
        }
    }
}

function save()
{
    var id = document.getElementById('id').value;
    var name = document.getElementById('name').value;
    var cost = document.getElementById('cost').value;
    var status = document.getElementById('status').value; //this needs to be a combo box
    var employeeid = document.getElementById('employeeid').value;
    var notes = document.getElementById('notes').value;

    var originalAsset = getAssetById(id);

    if (status == 0)
    {
        employeeid = 0;
    }

    if (status == 1)
    {
        var dateassigned = getDbFormat() + ' ' + getTime() + ":00";
    } else {
        var dateassigned = originalAsset.assigneddate;
    }

    var statuschangedate = getDbFormat() + ' ' + getTime() + ":00";

    if (name.trim().length == 0) {
        alert('you must enter an asset name');
    } else if (name.includes("(New Asset)")) {
        alert('the asset name must not contain "(New Asset)"');
    } else if (status > 0 && employeeid <= 0) {
        alert('If an asset is assigned, lost, damage you need to set the employee');
    } else {
        var json = {id: id, name: name, cost: cost, status: status, employeeid: employeeid, notes: notes, dateassigned: dateassigned, statuschangedate: statuschangedate};

        sendPost("/saveasset", JSON.stringify(json), function(response) {
            loadAssets(); 
        });
    }
}