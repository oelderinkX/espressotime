var roles = [
  {"name": "FOH", "colour": "#303F9F", "textcolour": "white"},
  {"name": "Open", "colour": "#43A047", "textcolour": "white"},
  {"name": "Close", "colour": "#F4511E", "textcolour": "white"},
  {"name": "Sandwich", "colour": "#FFE0B2", "textcolour": "black"},
  {"name": "Cook", "colour": "yellow", "textcolour": "black"},
  {"name": "Sandwich/Cook", "colour": "#D7CCC8", "textcolour": "black"},
  {"name": "Kitchen Open", "colour": "#FF9900", "textcolour": "black"},
  {"name": "Dishwasher", "colour": "#4DD0E1", "textcolour": "black"},
  {"name": "Manager", "colour": "#2196F3", "textcolour": "white"},
  {"name": "Training", "colour": "#673AB7", "textcolour": "white"},
  {"name": "Annual Leave", "colour": "black", "textcolour": "white"},
  {"name": "Sick", "colour": "black", "textcolour": "white"}];

var rosterStart = new Date(); // GLOBAL

var expectedBreakFinishTime = new Date();
var breakFinishTimeId;

function getRoleColour(role) {
  for(var i = 0; i < roles.length; i++) {
    if (roles[i].name.toLowerCase() == role.toLowerCase()) {
      return roles[i].colour;
    }
  }
}

function getRoleTextColour(role) {
  for(var i = 0; i < roles.length; i++) {
    if (roles[i].name.toLowerCase() == role.toLowerCase()) {
      return roles[i].textcolour;
    }
  }
}

function goRosterBack() {
  var d = new Date(rosterStart);
  d.setDate(d.getDate()-7);
  getRosterDates(d);
  loadEmployeeRoster();
}

function goRosterForward() {
  var d = new Date(rosterStart);
  d.setDate(d.getDate()+7);
  getRosterDates(d);
  loadEmployeeRoster();
}

function getRosterDates(newDate) {
  var employee_rosterdate = document.getElementById("employee_rosterdate");

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

  employee_rosterdate.innerHTML = ' ' + from + ' - ' + to + ' ';

  rosterdates = [];
  var rostdate = new Date(rosterStart);
  for(var i = 0; i < 7; i++)  {
    rosterdates.push(rostdate.getFullYear() + '-' + pad(rostdate.getMonth()+1) + '-' + pad(rostdate.getDate()));
    rostdate.setDate(rostdate.getDate() + 1);
  }
}

function loadEmployeeRoster() {
  var employee_roster = document.getElementById('employee_roster');

  employeestimes = [];
  var request = { date: rosterdates[0] };

  sendPost("/getemployeeweek", JSON.stringify(request), function(response) {
      employeestimes =  JSON.parse(response);

      employee_roster.innerHTML = '';

      for(var i = 0; i < rosterdates.length; i++) {
        var rosterinfo = getTimeByDate(employeestimes, rosterdates[i]);

        var tr = document.createElement('tr');

        var day = document.createElement('td');
        day.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 160px; background: white;');
        var d = new Date(rosterinfo.date);
        var dayinner = '';
        dayinner += dayNames[d.getDay()];
        dayinner += ' ';
        dayinner +=  pad(d.getDate());
        day.innerHTML = dayinner;
      
        var time_role = document.createElement('td');
        time_role.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 160px; background: white;');
        var timerole = '';
        if (rosterinfo.start.length > 0) {
          timerole += formatAMPM(rosterinfo.start);
          timerole += ' - ';
          timerole += formatAMPM(rosterinfo.end);
          timerole += '<br/>';
          timerole += rosterinfo.role;
        }
        time_role.innerHTML = timerole;
        time_role.style.backgroundColor = getRoleColour(rosterinfo.role);
        time_role.style.color = getRoleTextColour(rosterinfo.role);
 
        tr.appendChild(day);
        tr.appendChild(time_role);

        employee_roster.appendChild(tr);
      }  
  });
}

function getTimeByDate(employeestimes, date) {
  for(var i = 0; i < employeestimes[0].times.length; i++) {
    if (employeestimes[0].times[i].date == date) {
      return employeestimes[0].times[i];
    }
  }

  return {date: date, start: '', end: '', role: ''};
}

function loadBreaks() {
  var breakstable = document.getElementById('breaks');
  breakstable.innerHTML = '';

  var today = new Date();
  var request = { date: getDbFormat(today) };

  var expected10Count = 0;
  var expected30Count = 0;
  var totalRosteredMinutes = 0;
  var totalTimeRemaining = 0;
  var isOnBreak = false;

  sendPost("/employee_breaks", JSON.stringify(request), function(response) {
    var employee_breaks =  JSON.parse(response);

    if (employee_breaks.roster) {
      totalRosteredMinutes = calculateMinutes(employee_breaks.roster.start, employee_breaks.roster.finish);

      if (totalRosteredMinutes > 120 && totalRosteredMinutes <= 240) {
        expected10Count = 1;
      } else if (totalRosteredMinutes > 240 && totalRosteredMinutes <= 300) {
        expected10Count = 1;
        expected30Count = 1;
      } else if (totalRosteredMinutes > 300 && totalRosteredMinutes <= 600) {
        expected10Count = 2;
        expected30Count = 1;
      } else if (totalRosteredMinutes > 600 && totalRosteredMinutes <= 720) {
        expected10Count = 3;
        expected30Count = 1;
      } else if (totalRosteredMinutes > 720 && totalRosteredMinutes <= 840) {
        expected10Count = 3;
        expected30Count = 2;
      } else if (totalRosteredMinutes > 840 && totalRosteredMinutes <= 960) {
        expected10Count = 4;
        expected30Count = 2;
      }
    }

    for(var i = 0; i < employee_breaks.breaks.length; i++) {
      var tr = document.createElement('tr');

      var breaktype = document.createElement('td');
      breaktype.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 40px;');

      var breaktypeicon = '';
      if (employee_breaks.breaks[i].breaktype == '10') {
        expected10Count--;
        var st = new Date(removeZuluTime(employee_breaks.breaks[i].starttime));
        expectedBreakFinishTime = new Date(st.getTime() + 10*60000);
        breaktypeicon = '<span class="glyphicon glyphicon-time"></span>';
      } else {
        expected30Count--;
        breaktypeicon = '<span class="glyphicon glyphicon-cutlery"></span>';
        var st = new Date(removeZuluTime(employee_breaks.breaks[i].starttime));
        expectedBreakFinishTime = new Date(st.getTime() + 30*60000);
      }
      breaktype.innerHTML = breaktypeicon;

      var startbreak = document.createElement('td');
      startbreak.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 100px;');
      startbreak.innerHTML = '<h4>' + formatAMPM(formatTime(employee_breaks.breaks[i].starttime)) + '</h4>';

      var endbreak = document.createElement('td');
      endbreak.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 100px;');
      if (employee_breaks.breaks[i].finishtime == '-') {
        endbreak.innerHTML = '<h4> - </h4>';
        var now = new Date();
        totalTimeRemaining = calculateMinutes(now, expectedBreakFinishTime);
        if (now > expectedBreakFinishTime) {
          totalTimeRemaining = totalTimeRemaining * -1;
        }
        isOnBreak = true;
      } else {
        endbreak.innerHTML = '<h4>' + formatAMPM(formatTime(employee_breaks.breaks[i].finishtime)) + '</h4>';
      }
      
      tr.appendChild(breaktype);
      tr.appendChild(startbreak);
      tr.appendChild(endbreak);

      breakstable.appendChild(tr);
    }

    for(; expected10Count > 0; expected10Count--) {
      var tr = document.createElement('tr');
      var breaktype = document.createElement('td');
      breaktype.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 40px;');
      breaktype.innerHTML = '<span class="glyphicon glyphicon-time"></span>';

      var startbreak = document.createElement('td');
      startbreak.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 100px;');
      startbreak.innerHTML = '<h4> - </h4>';

      var endbreak = document.createElement('td');
      endbreak.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 100px;');
      endbreak.innerHTML = '<h4> - </h4>';

      tr.appendChild(breaktype);
      tr.appendChild(startbreak);
      tr.appendChild(endbreak);

      breakstable.appendChild(tr);      
    }

    for(; expected30Count > 0; expected30Count--) {
      var tr = document.createElement('tr');
      var breaktype = document.createElement('td');
      breaktype.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 40px;');
      breaktype.innerHTML = '<span class="glyphicon glyphicon-cutlery"></span>';

      var startbreak = document.createElement('td');
      startbreak.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 100px;');
      startbreak.innerHTML = '<h4> - </h4>';

      var endbreak = document.createElement('td');
      endbreak.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 100px;');
      endbreak.innerHTML = '<h4> - </h4>';

      tr.appendChild(breaktype);
      tr.appendChild(startbreak);
      tr.appendChild(endbreak);

      breakstable.appendChild(tr);      
    }

    if (isOnBreak) {
      updateTimeRemaining();
      const breakFinishTimeId = setTimeout(updateTimeRemaining(), 30000);
    }
  });
}

function updateTimeRemaining() {
  var timeremaining = document.getElementById('timeremaining');

  var now = new Date();
  var totalTimeRemaining = calculateMinutes(now, expectedBreakFinishTime);

  if (now > expectedBreakFinishTime) {
    totalTimeRemaining = totalTimeRemaining * -1;
  }

  if (totalTimeRemaining >= 0) {
    timeremaining.innerHTML = 'You have ' + totalTimeRemaining + ' mins left on your break';
  } else {
    timeremaining.innerHTML = 'Your break is finished.  Please clock back in';
    clearTimeout(breakFinishTimeId);
  }
}

function loadHelps() {
  var howlist = document.getElementById('howlist');
  howlist.innerHTML = '';

  var request = {};
  
  sendPost("/gethows", JSON.stringify(request), function(response) {
      helps =  JSON.parse(response);
      displayHelps('');
  });
}

function displayHelps(contains) {
  var howlist = document.getElementById('howlist');
  howlist.innerHTML = '';
  
  for(var i = 0; i < helps.length; i++) {
    var name = helps[i].name;
    var id = helps[i].id;
    if (name.toUpperCase().includes(contains.toUpperCase())) {
      var help  = document.createElement('li');
      help.classList.add('list-group-item');
      help.innerHTML = name;
      help.setAttribute('onclick', 'showHelp(' + id + ');');

      howlist.appendChild(help);
    }
  }
}

function showHelp(id) {
  for(var i = 0; i < helps.length; i++) {
    if (id == helps[i].id) {
      alert(helps[i].description);
      break;
    }
  }  
}

function loadTimeOff() {
  var unapproved_title = document.getElementById('unapproved_title');
  var sickdays_title = document.getElementById('sickdays_title');
  var timeoff_title = document.getElementById('timeoff_title');

  var unapproved_table = document.getElementById('unapproved_table');
  var sickdays_table = document.getElementById('sickdays_table');
  var timeoff_table = document.getElementById('timeoff_table');
  unapproved_table.innerHTML = '';
  sickdays_table.innerHTML = '';
  timeoff_table.innerHTML = '';

  unapproved_title.style = "display: none";
  sickdays_title.style = "display: none";
  timeoff_title.style = "display: none";

  var request = {};

  sendPost("/employee_timeoff", JSON.stringify(request), function(response) {
    var allTimeOff =  JSON.parse(response);

    var unapprovedItems = [];
    var sickItems = [];
    var timeoffItems = [];

    for(var i = 0; i < allTimeOff.length; i++) {
      if (allTimeOff[i].approved == 0) {
        unapprovedItems.push(allTimeOff[i]);
      } else if (allTimeOff[i].role.toLowerCase().includes('sick') && allTimeOff[i].approved == 1) {
        sickItems.push(allTimeOff[i]);
      } else if (allTimeOff[i].approved == 1) {
        timeoffItems.push(allTimeOff[i]);
      }
    }

    for(var i = 0; i < unapprovedItems.length; i++) {
        unapproved_title.style = "display: inline";
        addTimeOffRow(unapproved_table, 'lightgray', 'Start', 'white', new Date(unapprovedItems[i].start_date).toDateString());
        addTimeOffRow(unapproved_table, 'lightgray', 'End', 'white', new Date(unapprovedItems[i].end_date).toDateString());
        addTimeOffRow(unapproved_table, 'lightgray', 'Type', 'white', unapprovedItems[i].role);
        addTimeOffRow(unapproved_table, 'lightgray', 'Paid', 'white', YesOrNo(unapprovedItems[i].paid));
        addTimeOffRow(unapproved_table, 'lightgray', 'Reason', 'white', unapprovedItems[i].reason);
        addTimeOffEdit(unapproved_table, unapprovedItems[i].id);
    }

    for(var i = 0; i < sickItems.length; i++) {
        sickdays_title.style = "display: inline";
        addTimeOffRow(sickdays_table, 'MediumSeaGreen', 'Start', 'white', new Date(sickItems[i].start_date).toDateString());
        addTimeOffRow(sickdays_table, 'MediumSeaGreen', 'End', 'white', new Date(sickItems[i].end_date).toDateString());
        addTimeOffRow(sickdays_table, 'MediumSeaGreen', 'Paid', 'white', sickItems[i].paid);
        addTimeOffRow(sickdays_table, 'MediumSeaGreen', 'Reason', 'white', sickItems[i].reason);
        if (i+1 < sickItems.length) {
          addTimeOffSpace(sickdays_table);
        }
    }

    for(var i = 0; i < timeoffItems.length; i++) {
      timeoff_title.style = "display: inline";
      addTimeOffRow(timeoff_table, 'DodgerBlue', 'Start', 'white', new Date(timeoffItems[i].start_date).toDateString());
      addTimeOffRow(timeoff_table, 'DodgerBlue', 'End', 'white', new Date(timeoffItems[i].end_date).toDateString());
      addTimeOffRow(timeoff_table, 'DodgerBlue', 'Paid', 'white', timeoffItems[i].paid);

      if (i+1 < timeoffItems.length) {
        addTimeOffSpace(timeoff_table);
      }
    }
  });
}

function addTimeOffRow(table, labelbackground, labeltext, valuebackground, valuetext) {
  var row = document.createElement('tr');
  var label = document.createElement('td');
  label.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 160px; background: ' + labelbackground + ';');
  label.innerText = labeltext;
  var value = document.createElement('td');
  value.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 160px; background: ' + valuebackground + ';');
  value.innerText = valuetext;

  row.appendChild(label);
  row.appendChild(value);

  table.appendChild(row);

  return value;
}

function addTimeOffSpace(table) {
  var row = document.createElement('tr');
  var label = document.createElement('td');
  label.setAttribute('style', 'text-align: center; vertical-align: middle; height: 20px; width: 160px; border-left-style: hidden; border-right-style: hidden;');
  label.innerText = ' ';
  var value = document.createElement('td');
  value.setAttribute('style', 'text-align: center; vertical-align: middle; height: 20px; width: 160px; border-left-style: hidden; border-right-style: hidden;');
  value.innerText = ' ';

  row.appendChild(label);
  row.appendChild(value);

  table.appendChild(row);
}

function addTimeOffEdit(table, id) {
  var row = document.createElement('tr');
  var label = document.createElement('td');
  label.setAttribute('style', 'text-align: center; vertical-align: middle; height: 50px; width: 160px; border-left-style: hidden; border-right-style: hidden; border-bottom-style: hidden;');
  label.innerText = ' ';
  var value = document.createElement('td');
  value.setAttribute('style', 'text-align: right; vertical-align: top; height: 50px; width: 160px; border-left-style: hidden; border-right-style: hidden; border-bottom-style: hidden; padding: 5px');
  value.innerHTML = '<button type="button" onclick="editTimeOff(' + id + ');">Edit</button>';

  row.appendChild(label);
  row.appendChild(value);

  table.appendChild(row);
}

function editTimeOff(id) {
  window.location.href = '/employee_request_timeoff?id=' + id;
}

function requestTimeOff() {
  window.location.href = '/employee_request_timeoff?id=0';
}

function loadRequestTimeOff() {
  var id = document.getElementById('id');
  var request_table = document.getElementById('request_table');
  request_table.innerHTML = '';
  request_table.style = "display: none";

  var date7days = new Date();
  date7days.setDate(date7days.getDate() + 7);

  var isoDate = date7days.toISOString();
  var oneWeekAfter = isoDate.split('T')[0];

  var rowValue = addTimeOffRow(request_table, 'yellow', 'Start Date', 'white', '');
  var startDate = document.createElement('input');  
  startDate.type = 'date';
  startDate.value = oneWeekAfter;
  startDate.setAttribute('min', oneWeekAfter);
  startDate.setAttribute('id', 'startDate');
  rowValue.appendChild(startDate);

  rowValue = addTimeOffRow(request_table, 'yellow', 'End Date', 'white', '');
  var endDate = document.createElement('input');  
  endDate.type = 'date';
  endDate.value = oneWeekAfter;
  endDate.setAttribute('min', oneWeekAfter);
  endDate.setAttribute('id', 'endDate');
  rowValue.appendChild(endDate);

  rowValue = addTimeOffRow(request_table, 'yellow', 'Type', 'white', '');
  var select = document.createElement('select');
  select.setAttribute('id', 'role');
  var option1 = document.createElement('option');
  option1.setAttribute('value', 'Annual Leave');
  option1.innerHTML = 'Annual Leave';
  select.appendChild(option1);

  var option2 = document.createElement('option');
  option2.setAttribute('value', 'Time off');
  option2.innerHTML = 'Time off';
  select.appendChild(option2);

  var option3 = document.createElement('option');
  option3.setAttribute('value', 'Sick');
  option3.innerHTML = 'Sick';
  select.appendChild(option3);

  rowValue.appendChild(select);

  rowValue = addTimeOffRow(request_table, 'yellow', 'Paid', 'white', '');
  var paid = document.createElement('input');  
  paid.type = 'checkbox';
  paid.setAttribute('id', 'paid');
  rowValue.appendChild(paid);

  rowValue = addTimeOffRow(request_table, 'yellow', 'Reason', 'white', '');
  var reason = document.createElement('textarea');  
  reason.setAttribute('style', 'border: none; outline: none;');
  reason.setAttribute('rows', '2');
  reason.setAttribute('cols', '20');
  reason.setAttribute('wrap', 'soft');
  reason.setAttribute('id', 'reason');
  rowValue.appendChild(reason);

  if (id.value  > 0) {
    var request = { id: id.value };
    sendPost("/employee_gettimeoffquest", JSON.stringify(request), function(response) {
      var timeoffRequest =  JSON.parse(response);
      startDate.valueAsDate = new Date(timeoffRequest[0].start_date);
      endDate.valueAsDate = new Date(timeoffRequest[0].end_date);
      select.value = timeoffRequest[0].role;
      paid.checked = timeoffRequest[0].paid;
      reason.value = timeoffRequest[0].reason;
      request_table.style = "display: inline";
    });
  } else {
    request_table.style = "display: inline";
  }

}

function saveLeaveRequests()
{
  var id = document.getElementById('id');
  var startDate = document.getElementById('startDate');
  var endDate = document.getElementById('endDate');
  var role = document.getElementById('role');
  var paid = document.getElementById('paid');
  var reason = document.getElementById('reason');

  var request = {
    id: id.value,
    start_date: startDate.valueAsDate,
    end_date: endDate.valueAsDate,
    role: role.value,
    paid: paid.checked,
    reason: reason.value
  };

  sendPost("/employee_timeoff_update", JSON.stringify(request), function(response) {
    window.location.href = '/employee_timeoff';
  }); 
}
