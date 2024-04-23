

// exam taken - number on spectum

// left wing - right wing, progressiv - conservative, pro gay - ant gay, pro trans anti trans, pro trans youth and trans youth,

var guilds = require('./guilds.js');

var automod = require('../jalendu/jautomod.js');

var quiz = require('./quiz.js');

//const Database = require("@replit/database");

//const db = new Database();

const db = require('../common/text_database.js');

function reviver(key, value) {
  if (typeof value === "string" && key.includes('time')) {
    return new Date(value);
  }
  return value;
}


module.exports.dossier = function(client, member, event, reason = 'Unknown') {

  delete this.ga_dossiers;
    db.delete("ga_dossiers").catch(err => { console.log(err) });

  db.get(`dossier_${member.user.id}`)
    .then(value => {
      dossier = JSON.parse(value, reviver);
      //console.log(JSON.stringify(this.ga_dossiers, null, 2));

      if (typeof dossier !== 'undefined' && dossier !== null) {
      }
      else {
        dossier = new Object();
      }

      // if (!this[`dossier_${member.user.id}]`) {
      //   this[`dossier_${member.user.id}]` = new Object();
      // }

      // if (!dossier.hasOwnProperty(member.user.id)) {
      //   dossier[member.user.id] = new Object();
      // }

      if (!dossier.hasOwnProperty('summary')) {
        dossier.summary = new Object();
      }

      if (!dossier.hasOwnProperty(member.guild.id)) {
        dossier[member.guild.id] = new Object();
      }

      dossier[member.guild.id].guildid = member.guild.id;
      dossier[member.guild.id].server_name = member.guild.name;

      dossier[member.guild.id].userid = member.user.id;
      dossier[member.guild.id].username = member.user.username;
      dossier.summary.userid = member.user.id;
      dossier.summary.username = member.user.username;

      display_names(dossier, member.guild.id, member);
      display_names(dossier, 'summary', member);


      if (!dossier[member.guild.id].hasOwnProperty('joined')) {
        dossier[member.guild.id].joined = new Array();
      }
      if (!dossier[member.guild.id].hasOwnProperty('left')) {
        dossier[member.guild.id].left = new Array();
      }
      if (!dossier[member.guild.id].hasOwnProperty('presence')) {
        dossier[member.guild.id].presence = new Array();
      }
      if (!dossier[member.guild.id].hasOwnProperty('reason')) {
        dossier[member.guild.id].reason = new Array();
      }

      if (event === 'joined') {
        dossier[member.guild.id].joined.unshift(new Date());
        dossier[member.guild.id].left.unshift(null);
        dossier[member.guild.id].presence.unshift('present');
        dossier[member.guild.id].reason.unshift('');
        events(dossier, member.guild.id, event);
      }
      else if (event === 'left' || event === 'kicked' || event === 'banned') {
        if (!dossier[member.guild.id].joined[0]) {
          dossier[member.guild.id].joined[0] = member.joinedAt;
        }
        dossier[member.guild.id].left[0] = new Date();
        dossier[member.guild.id].presence[0] = event;
        dossier[member.guild.id].reason[0] = reason;
        events(dossier, member.guild.id, event);
      }
      else if (event === 'update') {
        if (dossier[member.guild.id].joined.length === 0) {
          if (!dossier[member.guild.id].joined[0]) {
            dossier[member.guild.id].joined[0] = member.joinedAt;
          }
          dossier[member.guild.id].presence[0] = 'present';
        }
        else if (dossier[member.guild.id].presence[0] !== 'present') {
          dossier[member.guild.id].joined.unshift(member.joinedAt);
          dossier[member.guild.id].left.unshift(null);
          dossier[member.guild.id].presence.unshift('present');
          dossier[member.guild.id].reason.unshift('');
        }
      }

      dossier[member.guild.id].owner = false;
      dossier[member.guild.id].administrator = false;
      dossier[member.guild.id].moderator = false;
      dossier[member.guild.id].verified = false;

      if (member.id === member.guild.ownerId) {
        dossier[member.guild.id].owner = true;
        dossier[member.guild.id].administrator = true;
        dossier[member.guild.id].moderator = true;
        dossier[member.guild.id].verified = true;
      }
      else if (member.permissions.has('ADMINISTRATOR')) {
        dossier[member.guild.id].administrator = true;
        dossier[member.guild.id].moderator = true;
        dossier[member.guild.id].verified = true;
      }
      else if ((member.permissions.has('KICK_MEMBERS') ||
        member.permissions.has('BAN_MEMBERS') ||
        member.permissions.has('MODERATE_MEMBERS') ||
        member.permissions.has('MANAGE_MESSAGES') ||
        member.permissions.has('MANAGE_NICKNAMES') ||
        member.permissions.has('MANAGE_ROLES'))) {
        dossier[member.guild.id].moderator = true;
        dossier[member.guild.id].verified = true;
      }

      var roles = member.guild.roles.cache;

      for (const role of roles.values()) {
        if (role.name.toLowerCase().startsWith('verified') ||
          role.name.toLowerCase() === 'member') {
          if (member.roles.cache.has(role.id)) {
            dossier[member.guild.id].verified = true;
          }
        }
      }

      var channels = member.guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT');

      var text_channels = 0;
      var send_messages = 0;
      var view_channels = 0;

      for (const channel of channels.values()) {
        text_channels = text_channels + 1;
        send_messages = send_messages + channel.permissionsFor(member).has('SEND_MESSAGES');
        view_channels = view_channels + channel.permissionsFor(member).has('VIEW_CHANNEL');
      }

      // dossier[member.guild.id].text_channels = text_channels;
      // dossier[member.guild.id].send_messages = send_messages;
      // dossier[member.guild.id].view_channels = view_channels;

      // delete dossier[member.guild.id].text_channels;
      // delete dossier[member.guild.id].send_messages;
      // delete dossier[member.guild.id].view_channels;

      if (send_messages > 2 && view_channels / text_channels > 0.5) {
        dossier[member.guild.id].verified = true;
      }

      dossier[member.guild.id].racist_language = dossier[member.guild.id].racist_language || 0;
      dossier[member.guild.id].homophobic_language = dossier[member.guild.id].homophobic_language || 0;
      dossier[member.guild.id].profanity = dossier[member.guild.id].profanity || 0;
      dossier[member.guild.id].display_name_banned_symbol = dossier[member.guild.id].display_name_banned_symbol || (automod.banned(member.displayName) != null);

      dossier['summary'].racist_language = dossier['summary'].racist_language || 0;
      dossier['summary'].homophobic_language = dossier['summary'].homophobic_language || 0;
      dossier['summary'].profanity = dossier['summary'].profanity || 0;
      dossier['summary'].display_name_banned_symbol = dossier['summary'].display_name_banned_symbol || (automod.banned(member.displayName) != null);

      // this.ga_dossiers[member.user.id] = dossier;

      db.set(`dossier_${member.user.id}`, JSON.stringify(dossier))
        .catch(err => { console.log(err) })
        //.then(console.log(JSON.stringify(dossier, null, 2)));

    })
    .catch(err => { console.log(err) });
}


function display_names(dossier, type, member) {
  if (!dossier[type].hasOwnProperty('display_names')) {
    dossier[type].display_names = new Array();
    dossier[type].display_names.unshift(member.user.username);
  }

  if (dossier[type].display_names.indexOf(member.displayName) === -1) {
    dossier[type].display_names.unshift(member.displayName);
  }
}


function events(dossier, guildid, event) {
  dossier[guildid][event] = (dossier[guildid][event] || 0) + 1;
  dossier.summary[event] = (dossier.summary[event] || 0) + 1;
}


module.exports.dossier_messages = function(client, message) {
  if (!message.member) {
    return;
  }

  if (message.author.bot) {
    return;
  }

  const immune = ["1088323549263052862"];

  if (immune.includes(message.channel)) {
    return;
  }

  const test = automod.gtest(message);

  if (test.type !== 'homophobic language' && test.type !== 'racist language' && test.type !== 'profanity') {
    return;
  }

  db.get(`dossier_${message.author.id}`)
    .then(value => {
      dossier = JSON.parse(value, reviver);

      if (typeof dossier !== 'undefined' && dossier !== null) {
      }
      else {
        dossier = new Object();
      }

      if (!dossier.hasOwnProperty('summary')) {
        this.dossier(client, message.member, 'update');
      }



      dossier[message.member.guild.id][test.type] = (dossier[message.member.guild.id][test.type] || 0) + 1;
      dossier.summary[test.type] = (dossier.summary[test.type] || 0) + 1;

      db.set(`dossier_${message.author.id}`, JSON.stringify(dossier))
        .catch(err => { console.log(err) });
        //.then(console.log(JSON.stringify(dossier, null, 2)));
    })
    .catch(err => { console.log(err) });
}


module.exports.dossier_ban = function(client, guild, user, reason = 'unknown') {
  db.get(`dossier_${user.id}`)
    .then(value => {
      dossier = JSON.parse(value, reviver);

      if (typeof dossier !== 'undefined' && dossier !== null) {
      }
      else {
        dossier = new Object();
      }

      // if (!this.ga_dossiers) {
      //   this.ga_dossiers = new Object();
      // }

      // if (!this.ga_dossiers.hasOwnProperty(user.id)) {
      //   this.ga_dossiers[user.id] = new Object();
      // }

      if (!dossier.hasOwnProperty('summary')) {
        dossier.summary = new Object();
      }

      if (!dossier.hasOwnProperty(guild.id)) {
        dossier[guild.id] = new Object();
      }

      dossier[guild.id].guildid = guild.id;
      dossier[guild.id].server_name = guild.name;

      dossier[guild.id].userid = user.id;
      dossier[guild.id].username = user.username;
      dossier.summary.userid = user.id;
      dossier.summary.username = user.username;

      if (!dossier.summary.hasOwnProperty('display_names')) {
        dossier.summary.display_names = new Array();
        dossier.summary.display_names.unshift(user.username);
      }

      if (!dossier[guild.id].hasOwnProperty('joined')) {
        dossier[guild.id].joined = new Array();
      }
      if (!dossier[guild.id].hasOwnProperty('left')) {
        dossier[guild.id].left = new Array();
      }
      if (!dossier[guild.id].hasOwnProperty('presence')) {
        dossier[guild.id].presence = new Array();
      }
      if (!dossier[guild.id].hasOwnProperty('reason')) {
        dossier[guild.id].reason = new Array();
      }

      dossier[guild.id].left[0] = new Date();
      dossier[guild.id].presence[0] = 'banned';
      dossier[guild.id].reason[0] = reason;

      events(dossier, guild.id, 'banned');

      db.set(`dossier_${user.id}`, JSON.stringify(dossier))
        .catch(err => { console.log(err) })
        //.then(console.log(JSON.stringify(dossier, null, 2)));
    })
    .catch(err => { console.log(err) });
}


module.exports.spectra = function(client, user, spectra) {
  db.get(`dossier_${user.id}`)
    .then(value => {
      dossier = JSON.parse(value, reviver);

      if (typeof dossier !== 'undefined' && dossier !== null) {
      }
      else {
        dossier = new Object();
      }

      if (!dossier.hasOwnProperty('summary')) {
        dossier.summary = new Object();
      }

      dossier.summary.programmers_note = 'The dossier object is created and updated by several events and functions and the code has developed over time. Not all properties may exist for all users and guilds. It is recommended that your code checks that the property exists before referencing it.';

      dossier.summary.userid = user.id;
      dossier.username = user.username;

      if (!dossier.summary.hasOwnProperty('display_names')) {
        dossier.summary.display_names = new Array();
        dossier.summary.display_names.unshift(user.username);
      }

      //delete this.ga_dossiers[user.id].spectra;

      //delete this.ga_dossiers[user.id].summary.spectra;

      if (!dossier.summary.spectra) {
        dossier.summary.spectra = new Array();
      }

      for (s = 0; s < spectra.length; s++) {
        di = dossier.summary.spectra.findIndex((element) => element.spectra === spectra[s].spectra);

        if (di === -1) {
          dossier.summary.spectra.push(spectra[s]);
        }
        else {

          dossier.summary.spectra[di].positive = (dossier.summary.spectra[di].positive || 0) + (spectra[s].positive || 0);
          dossier.summary.spectra[di].negative = (dossier.summary.spectra[di].negative || 0) + (spectra[s].negative || 0);
        }
      }

      for (ds = 0; ds < dossier.summary.spectra.length; ds++) {
        scale = quiz.scale(dossier.summary.spectra[ds].negative, dossier.summary.spectra[ds].positive);
        dossier.summary.spectra[ds].percent = scale.percent;
      }

      //console.log(this.ga_dossiers[user.id].summary.spectra);

      db.set(`dossier_${user.id}`, JSON.stringify(dossier))
        .catch(err => { console.log(err) })
        //.then(console.log(JSON.stringify(dossier, null, 2)));
    })
    .catch(err => { console.log(err) });
}
