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
            option.setAttribute('onclick', "displayAsset(" + asset.id + ");");
            assetselect.appendChild(option);
        }   
    });
}

function displayAsset(id)
{
    var selectedId =  document.getElementById('assetselect');
    var id = document.getElementById('id');
    var name = document.getElementById('name');
    var cost = document.getElementById('cost');
    var status = document.getElementById('status');
    var employeeid = document.getElementById('employeeid');
    var notes = document.getElementById('notes');

    var dateassigned = document.getElementById('dateassigned');
    var statuschangedate = document.getElementById('statuschangedate');

    for(var i = 0; i < assets.length; i++) {
        var asset = assets[i];
        if (asset.id == selectedId.value)
        {
            id.value = asset.id;
            name.value = asset.name;
            cost.value = asset.cost;
            status.value = asset.status;
            employeeid.value = asset.employeeid;  //not right, need to combo box it!
            notes.value = asset.notes;
            dateassigned.value = readableDate(asset.assigneddate);
            statuschangedate.value = readableDate(asset.status_change_date);
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

    if (name.trim().length == 0)
    {
        alert('you must enter an asset name');
    }
    else if (name.includes("(New Asset)"))
    {
        alert('the asset name must not contain "(New Asset)"');
    }
    else
    {
        var dateassigned = getDbFormat() + ' ' + getTime() + ":00";
		var statuschangedate = getDbFormat() + ' ' + getTime() + ":00";

        var json = {id: id, name: name, cost: cost, status: status, employeeid: employeeid, notes: notes, dateassigned: dateassigned, statuschangedate: statuschangedate};

        sendPost("/saveasset", JSON.stringify(json), function(response) {
            loadAssets(); 
        });
    }
}