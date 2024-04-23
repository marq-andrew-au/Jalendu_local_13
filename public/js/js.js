function localstringx(isostring) {
  let ftime = new Date(isostring);

  let ttime = new Date(Number(ftime) + 30 * 60 * 1000);

  return ftime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - '+ttime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


function localstring(hours, mins) {
  if (hours === 0) {
    if (mins === 0) {
      return '12:00 - 12:30 AM';
    }
    else {
      return '12:30 - 01:00 AM';
    }
  }
  if (hours === 11) {
    if (mins === 0) {
      return '11:00 - 11:30 AM';
    }
    else {
      return '11:30 - 12:00 PM';
    }
  }
  if (hours === 12) {
    if (mins === 0) {
      return '12:00 - 12:30 PM';
    }
    else {
      return '12:30 - 01:00 PM';
    }
  }
  if (hours === 23) {
    if (mins === 0) {
      return '11:00 - 11:30 PM';
    }
    else {
      return '11:30 - 12:00 AM';
    }
  }
  else if (hours < 12) {
    if (mins === 0) {
      return hours.toString().padStart(2, '0') + ':00 - ' + hours.toString().padStart(2, '0') + ':30 AM';
    }
    else {
      return hours.toString().padStart(2, '0') + ':30 - ' + (hours + 1).toString().padStart(2, '0') + ':00 AM';
    }
  }
  else {
    if (mins === 0) {
      return (hours - 12).toString().padStart(2, '0') + ':00 - ' + (hours - 12).toString().padStart(2, '0') + ':30 PM';
    }
    else {
      return (hours - 12).toString().padStart(2, '0') + ':30 - ' + (hours - 12 + 1).toString().padStart(2, '0') + ':00 PM';
    }
  }
}


function calcLocal() {
  var iso = document.getElementsByClassName('iso');
  var local = document.getElementsByClassName('local');

  for (var i = 0; i < iso.length; i++) {
    let tlocal = new Date(iso[i].innerHTML);

    let hhmmss=localstringx(iso[i].innerHTML);

    //let hhmmss = localstring(tlocal.getHours(), tlocal.getMinutes());

    local[i].innerHTML = hhmmss;
  }
}


function formatCells(table) {
  var tbody = table.getElementsByTagName('tbody')[0];
  var cells = tbody.getElementsByTagName('td');

  var max = [];
  var number = 0;

  for (var c = 0; c < cells.length; c++) {
    if (cells[c].cellIndex > 1) {
      number = parseInt(cells[c].textContent);
      max[cells[c].cellIndex] = Math.max(number, (max[cells[c].cellIndex] || 0));
    }
  }

  for (var c = 0; c < cells.length; c++) {

    if (cells[c].cellIndex > 1) {
      number = parseInt(cells[c].textContent);

      var h = 51 * (cells[c].cellIndex - 2);
      var s = 100;
      if(number===0|| max[cells[c].cellIndex]===0){
        var l = 100; 
      }
      else{
        var l = Math.round(85 - 45 * number / max[cells[c].cellIndex]);
      }


      cells[c].style.backgroundColor = `hsl(${h},${s}%,${l}%)`;
      if (l < 60) {
        cells[c].style.color = `#FFF`;
        cells[c].style.textShadow = `1px 1px 1px #6B6B6B`;
      }
    }
  }
}


var oldindex = 0;

function rowtime() {
  var time = new Date();
  newindex = time.getUTCHours() * 2 + (time.getUTCMinutes() >= 30);

  var table = document.getElementsByTagName('table')[0]
  var tbody = table.getElementsByTagName('tbody')[0];
  var rows = tbody.getElementsByTagName('tr');

  if (newindex != oldindex) {
    if (oldindex > 0) {
      rows[oldindex].style.border = 'solid 1px #EEEEEE';
    }
    rows[newindex].style.border = 'solid 3px #BC002D';
    oldindex = newindex;
  }

  var h1 = document.getElementsByTagName('h1')[0];
  var ts = h1.getElementsByTagName('div')[1];
  ts.style.textAlign = 'left';
  ts.style.fontSize = 'small'

  var htime = 'Current UTC: ' + time.getUTCHours().toString().padStart(2, '0') + ':' + time.getUTCMinutes().toString().padStart(2, '0') + ':' + time.getUTCSeconds().toString().padStart(2, '0') + ' = Current Local: ' + time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0') + ':' + time.getSeconds().toString().padStart(2, '0') + ' = ' + time.toLocaleTimeString();

  ts.innerHTML = htime;
}


function onload() {
  calcLocal();
  formatCells(document.getElementsByTagName('table')[0]);
  rowtime();

  setInterval(rowtime, 1000);
}