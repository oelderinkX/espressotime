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
  for(var i = 0; i < 7; i++)  {
    rosterdates.push(rosterStart.getFullYear() + '-' + pad(rosterStart.getMonth()+1) + '-' + pad(rosterStart.getDate()));
    rosterStart.setDate(rosterStart.getDate() + 1);
  }
}

function loadEmployeeRoster() {
  var employee_rosterdate = document.getElementById('employee_rosterdate');
  var employee_roster = document.getElementById('employee_roster');

  employee_rosterdate.innerHTML = '';
  employee_roster.innerHTML = '';

  employeestimes = [];
  var request = { date: rosterdates[0] };

  sendPost("/getemployeeweek", JSON.stringify(request), function(response) {
      employeestimes =  JSON.parse(response);

      for(var i = 0; i < employeestimes[0].times.length; i++) {
        var tr = document.createElement('tr');

        var day = document.createElement('td');
        day.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 160px; background: white;');
        day.innerHTML = employeestimes.times[i].date;
      
        var time_role = document.createElement('td');
        time_role.setAttribute('style', 'text-align: center; vertical-align: middle; height: 40px; width: 160px; background: white;');
        var timerole = employeestimes.times[i].start;
        timerole += ' - ';
        timerole += employeestimes.times[i].end;
        timerole += '<br/>';
        timerole += employeestimes.times[i].role;
        time_role.innerHTML = timerole;
        time_role.style.backgroundColor = getRoleColour(employeestimes.times[i].role);
        time_role.style.color = getRoleTextColour(employeestimes.times[i].role);
 
        tr.appendChild(day);
        tr.appendChild(time_role);

        employee_roster.appendChild(tr);
      }  
  });
}