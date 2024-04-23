
//const Database = require("@replit/database");

//const db = new Database();

const db = require('../common/text_database.js');

const fs = require('fs');

const table = require('text-table');

const format = require('format-duration');


module.exports.vcmon_sessions = {};
module.exports.vcmon_usage = {};
module.exports.vcmon_log = {};


function reviver(key, value) {
  if (typeof value === "string" && (key.includes('time') || key.includes('start') || key.includes('end'))) {
    return new Date(value);
  }
  return value;
}


module.exports.init = function() {

  db.get('vcmon_usage')
    .then(value => {
      this.vcmon_usage = JSON.parse(value, reviver);
    })
    .catch(err => { console.log(err) });

  db.get('vcmon_sessions')
    .then(value => {
      this.vcmon_sessions = JSON.parse(value, reviver);
    })
    .catch(err => { console.log(err) });

  db.get('vcmon_log')
    .then(value => {
      this.vcmon_log = JSON.parse(value, reviver);
    })
    .catch(err => { console.log(err) });
}


module.exports.commands = function(message) {
  if (message.content === '/vcmon dump') {
    fs.writeFileSync('./data/vcmon_usage.json', JSON.stringify(this.vcmon_usage, null, 2), 'utf-8');

    fs.writeFileSync('./data/vcmon_sessions.json', JSON.stringify(this.vcmon_sessions, null, 2), 'utf-8');
  }
  else if (message.content === '/vcmon summary') {
    console.log(this.summary(message.client));
  }
  else if (message.content === '/vcmon reset sessions') {
    this.vcmon_sessions = new Object();

    db.set('vcmon_sessions', JSON.stringify(this.vcmon_sessions))
      .then(() => { })
      .catch(err => { console.log(err) });
  }
  else if (message.content === '/vcmon reset usage') {
    this.vcmon_usage = new Object();

    db.set('vcmon_usage', JSON.stringify(this.vcmon_usage))
      .then(() => { })
      .catch(err => { console.log(err) });
  }
}


module.exports.summary = function(client) {

  const date = new Date();

  let summary = [];

  for (let i = 0; i < 48; i++) {
    summary[i] = new Object();
    summary[i].UTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, i * 30, 0, 0));
  }

  var name;

  for (const [channelId, vc] of Object.entries(this.vcmon_usage)) {

    name = (vc.name || channelId);

    for (let i = 0; i < 48; i++) {
      summary[i][name] = 0;
    }

    for (const [id, duration] of Object.entries(vc)) {
      let time = new Date(id);
      if (id !== 'name') {
        if (time < Date.now() - 14 * 24 * 60 * 60 * 1000) {
          delete vc[id];
        }
        else {
          index = Math.floor(time.getUTCHours() * 2) + (time.getUTCMinutes() === 30);

          summary[index][name] = (summary[index][name] || 0) + (duration || 0);
        }
      }
    }
  }

  return summary;
}


module.exports.calendar = function() {
  var array = this.summary();

  //console.log(array);

  var html = '<!DOCTYPE html>\n<html>\n<head>\n';

  html = html + '<style>\n' + fs.readFileSync(`./public/css/css.css`) + '</style>\n';

  html = html + '<script type="text/javascript">\n' + fs.readFileSync(`./public/js/js.js`) + '</script>\n';

  html = html + '</head>\n<body onload="onload();">\n';

  html = html + '<div class="header"><img class="logo" src="images/logo.jpg" alt="logo">\n';

  html = html + '<h1>G+MM Discord - Practice Times</h1></div>\n';

  var head = '', cols = 1;

  for (const [id, data] of Object.entries(array[0])) {
    if (!id.includes('test')) {
      head = head + `<th style="width:10%">${id.replace(/-/g, '<br>')}</th>`;
      if (id === 'UTC') {
        head = head + `<th style="width:20%">Local<br>Time</th>`;
      }
      cols = cols + 1;
    }
  }

  html = html + '<div>\n<table class="j-table">\n';

  html = html + `<tfoot><tr><td colspan="${cols}">Rolling 14 days activity in the vc rooms. Numbers are the total minutes in each half-hour period.</td></tr></tfoot>\n`;

  html = html + `<thead>\n<tr>\n${head}\n</tr>\n</thead>\n`;


  html = html + `<tbody >\n`;

  for (var i = 0; i < array.length; i++) {
    html = html + `<tr>`;
    for (const [id, data] of Object.entries(array[i])) {
      if (!id.includes('test')) {
        if (id === 'UTC') {
          let hhmmss = ("0" + data.getUTCHours()).slice(-2) + ":" + ("0" + data.getUTCMinutes()).slice(-2);

          html = html + `<td><div class="iso" hidden>${data.toISOString()}</div><div>${hhmmss}</div></td>`;
          html = html + `<td><div class="local"></div></td > `;
        }
        else {
          html = html + `<td> ${Math.round(data / (1000 * 60))}</td>`;
        }
      }
    }
    html = html + `</tr>\n`;
  }
  html = html + '</tbody>\n</table>\n<div>\n</body>\n<html>';

  return html;
}


module.exports.usagecount = function(client, channelId, start, end, duration) {

  if (duration < 5 * 60 * 1000) {
    //return;
  }

  const guild = client.guilds.cache.get('827888294100074516');

  const channel = guild.channels.cache.get(channelId);

  let vc, mins, oehr, bohr, stime, etime;

  if (!this.vcmon_usage[channelId]) {
    vc = new Object();
  }
  else {
    vc = this.vcmon_usage[channelId];
  }

  vc.name = channel.name;

  if (start.getUTCMinutes() < 30) {
    mins = 0;
  }
  else {
    mins = 30
  }

  stime = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), start.getUTCHours(), start.getUTCMinutes(), start.getUTCSeconds(), start.getUTCMilliseconds()));

  do {
    if (mins === 0) {
      bohr = new Date(Date.UTC(stime.getUTCFullYear(), stime.getUTCMonth(), stime.getUTCDate(), stime.getUTCHours(), 0, 0, 0));
      eohr = new Date(Date.UTC(stime.getUTCFullYear(), stime.getUTCMonth(), stime.getUTCDate(), stime.getUTCHours(), 29, 59, 999));
      mins = 30;
    }
    else {
      bohr = new Date(Date.UTC(stime.getUTCFullYear(), stime.getUTCMonth(), stime.getUTCDate(), stime.getUTCHours(), 30, 0, 0));
      eohr = new Date(Date.UTC(stime.getUTCFullYear(), stime.getUTCMonth(), stime.getUTCDate(), stime.getUTCHours() + 1, 0, 0, 0));
      mins = 0;
    }

    etime = new Date(Math.min(Number(end), Number(eohr)));

    split = Number(etime) - Number(stime);

    vc[bohr.toISOString()] = (vc[bohr.toISOString()] || 0) + split;

    stime = new Date(Number(etime) + 1);

  } while (etime < end);

  this.vcmon_usage[channelId] = vc;

  //console.log(this.vcmon_usage);

  db.set('vcmon_usage', JSON.stringify(this.vcmon_usage))
    .then(() => { })
    .catch(err => { console.log(err) });
}

module.exports.sitting_times = function(client, member) {
  const guild = client.guilds.cache.get('827888294100074516');

  //const sitting_times = client.channels.cache.get('834018953834922005');
  const sitting_times = client.channels.cache.get('871627629831290920');
}


module.exports.log = function(client, member) {
  //console.log('vcmon update - log');

  const guild = client.guilds.cache.get('827888294100074516');

  const logs = client.channels.cache.get('880223898413695046');

  const monitor = client.channels.cache.get('1079913414236852254');

  const channel = guild.channels.cache.get(member.channelId);

  if (channel.members.size === 0) {

    if (!this.vcmon_sessions[member.channelId]) {
      console.log('vcmon error sessions end but no sessions');
      return;
    }

    let init = true;
    let title = '';
    const rows = new Array();

    for (const [id, session] of Object.entries(this.vcmon_sessions[member.channelId])) {

      if (init) {
        title = 'Voice session in ' + channel.name + ' has ended.\n';

        const cols = new Array();
        cols[0] = 'Member';
        cols[1] = 'Joined';
        cols[2] = 'Duration';
        cols[3] = 'Camera';
        cols[4] = '%';

        rows.push(cols);
        init = false;
      }

      mem = guild.members.cache.get(id);

      const cols = new Array();
      cols[0] = session.username;
      cols[1] = session.start.toLocaleTimeString('en-US', { hour12: false });
      try {
        cols[2] = format(session.duration);
      }
      catch (err) {
        cols[2] = '0';
      }
      try {
        cols[3] = format(session.selfVideo_duration);
      }
      catch (err) {
        cols[3] = '0';
      }
      cols[4] = (session.selfVideo_duration / session.duration)
        .toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 });

      rows.push(cols);
    }

    if (!init) {
      const tab = table(rows);
      logs.send('```' + title + tab + '```');
    }

    const vcr10_channels = ['827991599304015922', '878067707889713193', '879950904848179232'];

    for (const [cammerid, cammer] of Object.entries(this.vcmon_sessions[member.channelId])) {
      cammer_start = new Date(cammer.selfVideo_on);
      cammer_end = new Date(cammer.selfVideo_off);
      camtime = (cammer_end - cammer_start) / 1000;
      if (camtime > 0) {
        monitor.send(`vccam <@${cammerid}> ${cammer.username} cam on session in ${channel.id} ${channel.name} ${camtime} s`);
      }
      for (const [watcherid, watcher] of Object.entries(this.vcmon_sessions[member.channelId])) {
        if (cammerid !== watcherid) {
          if (cammer_end >= cammer_start) {
            watcher_start = new Date(watcher.start);
            watcher_end = new Date(watcher.end);

            watcher_cam_start = new Date(watcher.selfVideo_on);
            watcher_cam_end = new Date(watcher.selfVideo_off);

            if (watcher_end >= watcher_start) {
              //console.log(`cammer ${cammerid} ${cammer.username} ${cammer_start} - ${cammer_start}`);
              //console.log(`watcher ${watcherid} ${watcher.username} ${watcher_start} - ${watcher_end}`);
              //console.log(`watcher cam ${watcherid} ${watcher.username} ${watcher_cam_start} - ${watcher_cam_end}`);

              let overlap = (Math.max(0, Math.min(watcher_end, cammer_end) - Math.max(watcher_start, cammer_start) + 1) / 1000);

              let cam_overlap = (Math.max(0, Math.min(watcher_cam_end, cammer_end) - Math.max(watcher_cam_start, cammer_start) + 1) / 1000);

              watcher.violation = Math.max((watcher.violation || 0), + overlap - cam_overlap);

              //console.log(`${watcher.username} overlap ${overlap} cam_overlap ${cam_overlap} violation ${+ overlap - cam_overlap} watcher.violation ${watcher.violation}`);

            }
          }
        }
      }
    }

    for (const [watcherid, watcher] of Object.entries(this.vcmon_sessions[member.channelId])) {
      if (watcher.violation > 0 && vcr10_channels.includes(channel.id)) {
        monitor.send(`vcr10 ${watcherid} ${watcher.username} watching x in ${channel.id} ${channel.name} violation time ${watcher.violation} s`);
      }
    }

    this.vcmon_sessions[member.channelId] = {};

    delete this.vcmon_sessions[member.channelId];
  }
}


module.exports.session_start = function(client, member) {
  //console.log('vcmon update - session_start');

  const guild = client.guilds.cache.get('827888294100074516');

  const mem = guild.members.cache.get(member.id);

  //console.log(JSON.stringify(mem,null,2));

  //console.log(JSON.stringify(member,null,2));

  const sitting_times = client.channels.cache.get('834018953834922005');

  //const anonymous_sitters = client.channels.cache.get('1074957843784011817');

  const channel = guild.channels.cache.get(member.channelId);

  let vc;

  if (!this.vcmon_sessions[member.channelId]) {
    vc = new Object();
  }
  else {
    vc = this.vcmon_sessions[member.channelId];
  }

  let session;

  if (!vc[member.id]) {
    session = new Object();
    const user = client.users.cache.get(member.id);

    session.username = member.id;

    if (user) {
      session.username = user.username;
    }

    session.start = new Date();
    session.end = null;

    session.selfVideo = member.selfVideo;

    if (member.selfVideo) {
      session.selfVideo_on = session.start;
    }
    else {
      session.selfVideo_on = null;
    }

    session.selfVideo_off = null;

    session.streaming = member.streaming;

    if (member.streaming) {
      session.streaming_on = session.start;
    }
    else {
      session.streaming_on = null;
    }

    session.streaming_off = null;

    session.duration = 0;
    session.selfVideo_duration = 0;
    session.streaming_duration = 0;

    vc[member.id] = session;

    this.vcmon_sessions[member.channelId] = vc;

    //new code for sitting-times

    let pingrole = '';

    if(channel.id === '827888294100074520'){
      pingrole = pingrole + '<@&1232309879260057622>';
    }
    if(channel.id === '827890804701003827'){
      pingrole = pingrole + '<@&1232309118526689373>';
    }
    if(channel.id === '878067342888808448'){
      pingrole = pingrole + '<@&1232309665207943168>';
    }
    if(channel.id === '827993501920657479'){
      pingrole = pingrole + '<@&1232310035355406386>';
    }

    if(channel.id === '827991599304015922'){
      pingrole = pingrole + '<@&1232310173092155464>';
    }
    if(channel.id === '878067707889713193'){
      pingrole = pingrole + '<@&1232310305498071061>';
    }
    if(channel.id === '835771866064093184'){
      pingrole = pingrole + '<@&1232310461500883005>';
    }

    // if (member.member.roles.cache.get('941031781065433139') && !channel.name.includes("test")) {
    //   sitting_times.send(`<@${member.id}> has joined the ${channel.name} <@&941031781065433139> ${pingrole}`);
    // }
    // else {
    //   anonymous_sitters.send(`<@${member.id}> has joined the ${channel.name} <@&941031781065433139> ${pingrole}`);
    // }

    sitting_times.send(`${mem.displayName} has joined the ${channel.name} ${pingrole}`);

  }
  else {
    this.session_change(client, member);
  }
}


module.exports.session_change = function(client, member) {
  //console.log('vcmon update - session_change');
  if (!this.vcmon_sessions[member.channelId]) {
    console.log('vcmon unexpected session_change but no session');
    this.session_begin(client, member);
    return;
  }

  let vc = this.vcmon_sessions[member.channelId];

  if (!vc[member.id]) {
    console.log('vcmon unexpected session_change but no session');
    this.session_begin(client, member);
    return;
  }

  let session = vc[member.id];

  if (!session.selfVideo && member.selfVideo) {
    session.selfVideo_on = new Date();
  }
  else if (session.selfVideo && !member.selfVideo) {
    session.selfVideo_off = new Date();
    session.selfVideo_duration = session.selfVideo_duration + (session.selfVideo_off - session.selfVideo_on);
  }

  session.selfVideo = member.selfVideo;

  if (!session.streaming && member.streaming) {
    session.streaming_on = new Date();
  }
  else if (session.streaming && !member.streaming) {
    session.streaming_off = new Date();
    session.streaming_duration = session.streaming_duration + (session.streaming_off - session.streaming_on);
  }

  session.streaming = member.streaming;

  vc[member.id] = session;

  this.vcmon_sessions[member.channelId] = vc;

  //console.log(this.vcmon_sessions);
}


module.exports.session_end = function(client, member) {
  //console.log('vcmon update - session_end');
  if (!this.vcmon_sessions[member.channelId]) {
    console.log('vcmon unexpected session_end but no session');
    return;
  }

  let vc = this.vcmon_sessions[member.channelId];

  if (!vc[member.id]) {
    console.log('vcmon unexpected session_change but no session');
    return;
  }

  let session = vc[member.id];

  if (session.selfVideo) {
    session.selfVideo_off = new Date();
    session.selfVideo_duration = session.selfVideo_duration + (session.selfVideo_off - session.selfVideo_on);
  }

  session.selfVideo = false;

  if (session.streaming) {
    session.streaming_off = new Date();
    session.streaming_duration = session.streaming_duration + (session.streaming_off - session.streaming_on);
  }

  session.streaming = false;

  session.end = new Date();

  session.duration = session.duration + (session.end - session.start);

  vc[member.id] = session;

  this.vcmon_sessions[member.channelId] = vc;

  console.log(JSON.stringify(this.vcmon_sessions,null,2));

  this.log(client, member);

  this.usagecount(client, member.channelId, session.start, session.end, session.selfVideo_duration);
}


module.exports.update = function(client, oldmember, newmember) {
  //console.log('vcmon update');
  //console.log(this.vcmon_sessions);
  if (newmember.channelId) {
    if (oldmember.channelId) {
      if (newmember.channelId === oldmember.channelId) {
        this.session_change(client, newmember);
      }
      else {
        this.session_end(client, oldmember);
        this.session_start(client, newmember);
      }
    }
    else {
      this.session_start(client, newmember);
    }
  }
  else {
    this.session_end(client, oldmember);
  }

  db.set('vcmon_sessions', JSON.stringify(this.vcmon_sessions))
    .then(() => { })
    .catch(err => { console.log(err) });

  db.set('vcmon_log', JSON.stringify(this.vcmon_log))
    .then(() => { })
    .catch(err => { console.log(err) });

}


module.exports.ga = function(req, query) {
  html = '<html>';
  html = html + '  <head>';
  html = html + '    <script src="/scripts/ga.js"></script>';
  html = html + '</head>\n';
    html = html + '<body onLoad="init()">';

  html = html + '<form method="post" action="/ga" id="dataform">';
  html = html + `<input type="hidden" name="id" value="${query.id}"/>`;
  html = html + `<input type="hidden" name="tag" value="${query.tag}"/>`;
  html = html + `<input type="hidden" name="ip" value="${req.headers['x-forwarded-for']}"/>`;
  html = html + `<input type="hidden" name="agent" value="${req.headers['user-agent']}"/>`;
  html = html + `<input type="hidden" name="localtime" value=""/>`;
  html = html + `<input type="hidden" name="servertime" value="${new Date()}"/>`;
  html = html + `<input type="hidden" name="lat" value=""/>`;
  html = html + `<input type="hidden" name="long" value=""/>`;
  html = html + '</form>';

  html = html + '<img src="/images/lgbtantifa.png" width="80" height="80">';
  html = html + '<br><code>Violation detected and logged: [homophobic abuse]</code>';
  html = html + '<br><code>Platform: DISCORD - undefined - undefined</code>';
  html = html + `<br><code>Platform User ID: ${query.id} ${query.tag}</code>`;
  html = html + `<br><code>User's local IP address: ${req.headers['x-forwarded-for']}</code>`;
  html = html + `<br><code>At user's local time: <span id="time"></span></code>`;
  html = html + `<br><code>Location tracking: active - logging</code>`;
  html = html + `<br><code>Location source: client [${req.headers['user-agent']}]</code>`;
  html = html + `<br><code>Database: GAE35 (public lgbtqi+ (gay) antifa elephant #35)</code>`;
  html = html + `<br><code>Table: smhab.smhab_rawdata_violator_geolocate</code>`;
  html = html + `<br><code>[<span id="recs"></span> record(s) inserted]</code>`;

  html = html + '</body></html>';

  return html;
}
