function drawTable() {
    var roster_weekview = document.getElementById('roster_weekview');
  
    var table = document.createElement('table');
    table.setAttribute('width', '100%');
    table.setAttribute('border', '1');
  
    table.appendChild(getHeaderRow());
  
    for(var i = 0; i < employeestimes.length; i++)
    {
      table.appendChild(getEmployeeRow(employeestimes[i]));
    }
  
    roster_weekview.appendChild(table);
  }
  
  function getHeaderRow() {
    var row = createRow();
    row.appendChild(createHeader('Employee'));
  
    for(var i = 0; i < rosterdates.length; i++)
    {
      var headerDate = new Date(rosterdates[i]);
      row.appendChild(createHeader(dayNames[headerDate.getDay()] + ' ' + headerDate.getDate()));
    }
  
    row.appendChild(createHeader('Hours'));
  
    return row;
  }
  
  function createHeader(text) {
    var header = document.createElement('td');
    header.setAttribute('style', 'text-align: center; vertical-align: middle; height: 50px; width: 160px;');
    header.innerHTML = text;
    return header;
  
  }
  
  function getEmployeeRow(employeetimes) {
    var row = createRow();
    var nameCell = createCell();
    nameCell.innerHTML = employeetimes.name;
    row.appendChild(nameCell);
  
    for(var i = 0; i < rosterdates.length; i++) {
      var time = '';
      for(var x = 0; x < employeetimes.times.length; x++) {
        if (employeetimes.times[x].date == rosterdates[i]) {
          time = employeetimes.times[x].start + '-' + employeetimes.times[x].end;
        }
      }
      
      var cell = createCell();
      var control = createControl();
      control.innerHTML = time;
      control.setAttribute('employee_id', employeetimes.id);
  
      var modaltarget = i + '_' + employeetimes.id;
      control.setAttribute('data-target', '#' + modaltarget);
  
      var modal = createModal(modaltarget, employeetimes, rosterdates[i]);
  
      cell.appendChild(control);
  
      row.appendChild(cell);
    }

    var hourCell = createCell();
    row.appendChild(hourCell);
  
    return row;
  }
  
  function createRow() {
    return document.createElement('tr');
  }
  
  function createCell() {
    var cell = document.createElement('td');
    cell.setAttribute('style', 'text-align: center; vertical-align: middle; height: 50px; width: 160px;');
    return cell;
  }
  
  function createControl() {
    var control = document.createElement('a');
    control.setAttribute('class', 'btn');
    control.setAttribute('style', 'display:inline-block; width: 160px; height: 50px;')
    control.setAttribute('width', '100%');
    control.setAttribute('data-toggle', 'modal');
  
    return control;
  }
  
  function createModal(modaltarget, employeetimes, date) {
    var modals = document.getElementById('modals');
  
    var modal = document.createElement('div');
    modal.setAttribute('class', 'modal fade');
    modal.setAttribute('id', modaltarget);
    modal.setAttribute('role', 'dialog');
  
    var modaldialog = document.createElement('div');
    modaldialog.setAttribute('class', 'modal-dialog');
  
    var modalcontent = document.createElement('div');
    modalcontent.setAttribute('class', 'modal-content');
  
    var modalheader = document.createElement('div');
    modalheader.setAttribute('class', 'modal-header');
  
    //<button type="button" class="close" data-dismiss="modal">&times;</button>  (for X)
  
    var title = document.createElement('h4');
    title.setAttribute('class', 'modal-title');
    title.innerHTML = 'Edit Shift for ' + employeetimes.name + ' ' + date;
  
    modalheader.appendChild(title);
  
    var modalbody = document.createElement('div');
    modalbody.setAttribute('class', 'modal-body');
  
    var p = document.createElement('p');
  
    var startlabel = document.createElement('label');
    startlabel.setAttribute('for', 'start_' + modaltarget);
    startlabel.innerHTML = 'Start Time:';
    p.appendChild(startlabel);
  
    var startinput = document.createElement('input');
    startinput.setAttribute('type', 'time');
    startinput.setAttribute('class', 'form-control');
    startinput.setAttribute('id', 'start_' + modaltarget);
    startinput.value = getStartTime(employeetimes.id, date);
    p.appendChild(startinput);
  
    var finishlabel = document.createElement('label');
    finishlabel.setAttribute('for', 'finish_' + modaltarget);
    finishlabel.innerHTML = 'Finish Time:';
    p.appendChild(finishlabel);
  
    var finishinput = document.createElement('input');
    finishinput.setAttribute('type', 'time');
    finishinput.setAttribute('class', 'form-control');
    finishinput.setAttribute('id', 'finish_' + modaltarget);
    finishinput.value = getEndTime(employeetimes.id, date);
    p.appendChild(finishinput);
  
    // will need combo i think!
    var rolelabel = document.createElement('label');
    rolelabel.setAttribute('for', 'role_' + modaltarget);
    rolelabel.innerHTML = 'Role:';
    p.appendChild(rolelabel);
  
    var roleinput = document.createElement('input');
    roleinput.setAttribute('type', 'text');
    roleinput.setAttribute('class', 'form-control');
    roleinput.setAttribute('id', 'role_' + modaltarget);
    p.appendChild(roleinput);
  
    modalbody.appendChild(p);
  
    var modalfooter = document.createElement('div');
    modalfooter.setAttribute('class', 'modal-footer');
  
    var cancel = document.createElement('button');
    cancel.setAttribute('type', 'button');
    cancel.setAttribute('class', 'btn btn-default');
    cancel.setAttribute('data-dismiss', 'modal');
    cancel.innerHTML = 'Cancel';
  
    var save = document.createElement('button');
    save.setAttribute('type', 'button');
    save.setAttribute('class', 'btn btn-default');
    save.setAttribute('data-dismiss', 'modal');
    save.innerHTML = 'Save';
    save.setAttribute('onclick', 'save(' + employeetimes.id + ', \'' + date + '\', \'' + modaltarget + '\');');
  
    modalfooter.appendChild(cancel);
    modalfooter.appendChild(save);
  
    modaldialog.appendChild(modalcontent);
    modalcontent.appendChild(modalheader);
    modalcontent.appendChild(modalbody);
    modalcontent.appendChild(modalfooter);
    modal.appendChild(modaldialog);
  
    modals.appendChild(modal);
  
    return modal;
  }
  
  function getTimes(employeeid, date) {
    for(var i = 0; i < employeestimes.length; i++) {
      if (employeestimes[i].id == employeeid) {
        return employeestimes[i].times;
      }
    }
  }
  
  function getStartTime(employeeid, date) {
    var times = getTimes(employeeid, date);
  
    if (times) {
      for(var i = 0; i < times.length; i++) {
        if (times[i].date == date) {
          return times[i].start;
        }
      }
    }
  }
  
  function updateStartTime(employeeid, date, start) {
    var times = getTimes(employeeid, date);
  
    if (times) {
      for(var i = 0; i < times.length; i++) {
        if (times[i].date == date) {
          times[i].start = start;
          break;
        }
      }
    }
  }
  
  function getEndTime(employeeid, date) {
    var times = getTimes(employeeid, date);
  
    if (times) {
      for(var i = 0; i < times.length; i++) {
        if (times[i].date == date) {
          return times[i].end;
        }
      }
    }
  }
  
  function updateEndTime(employeeid, date, end) {
    var times = getTimes(employeeid, date);
  
    if (times) {
      for(var i = 0; i < times.length; i++) {
        if (times[i].date == date) {
          times[i].end = end;
          break;
        }
      }
    }
  }
  
  function save(id, date, modaltarget) {
    var controlQuery = "[data-target='#" + modaltarget + "']";
    var control = document.querySelector(controlQuery);
  
    var startId = 'start_' + modaltarget;
    var start = document.getElementById(startId);
  
    var finishId = 'finish_' + modaltarget;
    var finish = document.getElementById(finishId);
  
    var roleId = 'role_' + modaltarget;
    var role = document.getElementById(roleId);

    var startTime = start.valueAsDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    var finishTime = finish.valueAsDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    control.innerHTML = startTime + ' - ' + finishTime;

    if (role.value.toLowerCase() == 'manager') {
      control.style.background = 'yellow';
    } else if (role.value.toLowerCase() == 'foh') {
      control.style.background = 'aqua';
    } else {
      control.style.background = 'White';
    }

    updateStartTime(id, date, start.value);
    updateEndTime(id, date, finish.value);
  
    //call post with json and don't care about the result
   
  }
  
  function getRosterDates(newDate) {
      var rosterDate = document.getElementById("rosterDate");
  
      var d = new Date();
      if (newDate) {
          d = new Date(newDate);
      }
      var day = d.getDay();
  
      rosterStart = new Date(d);
      if (day == 0) {
        rosterStart.setDate( rosterStart.getDate() - 6 );
      } else {
          rosterStart.setDate( rosterStart.getDate() - (day - 1) );
      }
      rosterEnd = new Date(rosterStart);
      rosterEnd.setDate(rosterEnd.getDate() + 6);
  
      var from = pad(rosterStart.getDate()) + ' ' + monthNames[rosterStart.getMonth()] + ' ' + rosterStart.getFullYear();
      var to = pad(rosterEnd.getDate()) + ' ' + monthNames[rosterEnd.getMonth()] + ' ' + rosterEnd.getFullYear();
  
      rosterDate.innerHTML = ' ' + from + ' <---> ' + to + ' ';

      rosterdates = [];
      for(var i = 0; i < 7; i++)
      {
        rosterdates.push(rosterStart.getFullYear() + '-' + pad(rosterStart.getMonth()+1) + '-' + pad(rosterStart.getDate()));
        rosterStart.setDate(rosterStart.getDate() + 1);
      }
  }

  function getEmployeeTimes() {
    employeestimes = [];
    var request = { date: rosterdates[0] };
    sendPost("/getemployeetimes", JSON.stringify(request), function(response) {
        employeestimes =  JSON.parse(response);
        drawTable();
    });
  }