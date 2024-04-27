const fs = require('fs');

const { MessageEmbed } = require('discord.js');

//const Database = require("@replit/database");

//const db = new Database();

const db = require('../common/text_database.js');

var path = require('path');

var filename = path.basename(__filename) + ': ';
var filenamn = filename + '/n';

function reviver(key, value) {
  if (typeof value === "string" && key.includes('time')) {
    return new Date(value);
  }
  return value;
}

module.exports.data = {
  verify: [],
  homophobic: [],
  racist: [],
  profane: [],
  except: [],
}

module.exports.scumbags = [];
module.exports.warnings = [];

module.exports.setup = function() {
  var fileContent = fs.readFileSync('./data/data.json');
  data = JSON.parse(fileContent);
}

module.exports.welcomeDM = function(member, client, test = false) {
  var fileContent = fs.readFileSync('./data/messages.json');
  messages = JSON.parse(fileContent);

  member.send(messages.welcomedm.content).catch(err => console.log(err));

  var memberintro;

  if (test) {
    memberintro = client.channels.cache.get('871627629831290920');
  }
  else {
    memberintro = client.channels.cache.get('833559519611060244');
  }

  //memberintro.send(`Please welcome ${member}.`);

  const embed = new MessageEmbed()
    .setColor(0x00ffff)
    .setThumbnail(member.displayAvatarURL({ format: 'png' }))
    .addField('\u200B', `Welcome ${member}.`, true)
    .addField('\u200B', `${member}, when you get a chance, set your <#828724253938942014> so you can see all the channels and review the <#827891914216177685>.`, true);

  memberintro.send({ embeds: [embed] });
}


module.exports.banned = function(text) {

  const banned = ['ᛋ', '卐', '࿕', 'ϟ'];

  const input = text.split("");

  for (i = 0; i < input.length; i++) {
    index = banned.indexOf(input[i]);

    if (index > -1) {
      return banned[index];
    };
  }
  return null;
}


module.exports.msglc = function(message) {

  const msglc = new Object;

  var string;

  if (message.content.startsWith('/')) {
    string = message.content.split(' ').slice(1).join(' ');
  }
  else {
    string = message.content;
  }

  if (string === string.toUpperCase()) {
    msglc.uppercase = true;
  }
  else {
    msglc.uppercase = false;
  }

  msglc.string = string.toLowerCase();

  msglc.normal = msglc.string.normalize("NFD").replace(/\p{Diacritic}/gu, "");

  msglc.alpha = msglc.normal.replace(/[^a-zA-Z]+/g, "*");

  return msglc;
}

module.exports.except = function(string, rule) {
  const words = string.split(' ');

  let exception;

  for (let i = 0; i < words.length; i++) {
    if (words[i].includes(rule)) {
      exception = false;
      for (let j = 0; j < data.except.length; j++) {
        if (words[i].includes(data.except[j])) {
          exception = true;
          break;
        }
      }
    }
    if (!exception) {
      return false;
    }
  }
  return true;
}


module.exports.test = function(msglc) {

  result = new Object();

  for (let i = 0; i < data.verify.length; i++) {
    if (msglc.normal.includes(data.verify[i])) {
      result.type = 'verify';
      result.rule = data.verify[i];
      return result;
    }
  }

  if (msglc.string.length > 2200) {
    result.type = 'excessive length';
    result.rule = msglc.string.length;
    return result;
  }

  if (msglc.string.length > 40 && msglc.uppercase) {
    result.type = 'all upper case';
    result.rule = msglc.string.length;
    return result;
  }

  for (let i = 0; i < data.homophobic.length; i++) {
    if (msglc.normal.includes(data.homophobic[i])) {
      if (!this.except(msglc.normal, data.homophobic[i])) {
        result.type = 'homophobic language';
        result.rule = data.homophobic[i];
        return result;
      }
    }
  }

  for (let i = 0; i < data.racist.length; i++) {
    if (msglc.normal.includes(data.racist[i])) {
      if (!this.except(msglc.normal, data.racist[i])) {
        result.type = 'racist language';
        result.rule = data.racist[i];
        return result;
      }
    }
  }

  for (let i = 0; i < data.profane.length; i++) {
    if (msglc.normal.includes(data.profane[i])) {
      if (!this.except(msglc.normal, data.profane[i])) {
        result.type = 'profanity';
        result.rule = data.profane[i];
        return result;
      }
    }
  }


  let urlrx1 = new RegExp("$(http:\/\/|https:\/\/|ftp:\/\/|email:\/\/|file:\/\/)?([a-z0-9]+\.?)+");

  //let urlrx2 = new RegExp("([a-z0-9]+\.)+(com|co|org|edu|gov|biz|info)$");

  let urlrx2 = new RegExp("([a-z0-9]+\.)+(com|co|org|edu|gov|biz|info|js|gif|png|jpg|jpeg)$");

  let words = msglc.string.split(' ');

  for (let i = 0; i < words.length; i++) {
    if (urlrx1.test(words[i]) || urlrx2.test(words[i])) {
      result.type = 'URL or file links';
      result.rule = 'words[i]';
      return result;
    }
  }

  result.type = 'none';
  result.rule = 'none';
  return result;
}


module.exports.monitor_test = function(msglc) {
  result = new Object();
  result.quoted = false;

  for (let i = 0; i < data.homophobic.length; i++) {

    found = msglc.normal.indexOf(data.homophobic[i]);
    qfound = msglc.normal.indexOf('"' + data.homophobic[i] + '"');

    if (found > -1) {
      if (!this.except(msglc.normal, data.homophobic[i])) {
        result.type = 'homophobic language';
        result.rule = data.homophobic[i];
        if (qfound > -1 && qfound == (found - 1)) {
          result.quoted = true
        }

        return result;
      }
    }
  }

  for (let i = 0; i < data.racist.length; i++) {
    found = msglc.normal.indexOf(data.racist[i]);
    qfound = msglc.normal.indexOf('"' + data.racist[i] + '"');

    if (found > -1) {
      if (!this.except(msglc.normal, data.racist[i])) {
        result.type = 'racist language';
        result.rule = data.racist[i];
        if (qfound > -1 && qfound == (found - 1)) {
          result.quoted = true
        }
        return result;
      }
    }
  }

  for (let i = 0; i < data.profane.length; i++) {
    if (msglc.normal.includes(data.profane[i])) {
      if (!this.except(msglc.normal, data.profane[i])) {
        result.type = 'profanity';
        result.rule = data.profane[i];
        return result;
      }
    }
  }

  if (msglc.string.length > 2200) {
    result.type = 'excessive length';
    result.rule = msglc.string.length;
    return result;
  }

  if (msglc.string.length > 40 && msglc.uppercase) {
    result.type = 'all upper case';
    result.rule = msglc.string.length;
    return result;
  }


  let urlrx1 = new RegExp("$(http:\/\/|https:\/\/|ftp:\/\/|email:\/\/|file:\/\/)?([a-z0-9]+\.?)+");

  let urlrx2 = new RegExp("([a-z0-9]+\.)+(com|co|org|edu|gov|biz|info|gg)$");

  let words = msglc.string.split(' ');

  for (let i = 0; i < words.length; i++) {
    if (urlrx1.test(words[i]) || urlrx2.test(words[i])) {
      result.type = 'URL or file links';
      result.rule = words[i];
      return result;
    }
  }

  result.type = 'none';
  result.rule = 'none';
  return result;
}

module.exports.automod = function(message, test = false) {

  if (!message.content || message.author.bot) {
    return;
  }

  let mods;
  let dels;
  let pfx;

  if (test) {
    mods = message.client.channels.cache.get('871628022388764672');
    dels = message.client.channels.cache.get('871628022388764672');
    pfx = 'test_';
  }
  else {
    mods = message.client.channels.cache.get('827889605994872863');
    dels = message.client.channels.cache.get('874900065142046720');
    pfx = '';
  }


  if (!message.member.roles.cache.some(rolen => rolen.name === `${pfx}verified`)) {


    const nsrole = message.guild.roles.cache.find(rolen => rolen.name === 'newcomer-spoke');
    message.member.roles.add(nsrole).catch(err => console.log(err));

    const automod = this.test(this.msglc(message));

    dels.send(`**${message.author} wrote:**`).catch(err => console.log(err));
    dels.send(`${message.content}`).catch(err => console.log(err));

    dels.send(`**Jalendu automod classified this as type "${automod.type}" by rule "${automod.rule}"**`);

    if (automod.type === 'none') {
      return;
    }

    if (automod.type === 'verify') {

      //return;

      if ((Date.now() - message.author.createdAt) / (24 * 60 * 60 * 1000) < 56) {
        dels.send(`${message.author} was not auto-verified because the account is less than 56 days old.`).catch(err => console.log(err));
        message.author.send(`Thankyou for your message in Gay+ Men Meditating. You would have been verified automatically however our group has been seriously attacked recently so we no longer automatically verify relatively new Discord accounts. Please send a selfie holding a paper on which is written your Discord ID to <@679465390841135126> or <@365725452809011211> if you still want to join.`).catch(err => console.log(err));
        return;
      }

      let role = message.guild.roles.cache.find(rolen => rolen.name === `${pfx}verified`);
      message.member.roles.add(role).catch(err => console.log(err));
      role = message.guild.roles.cache.find(rolen => rolen.name === `${pfx}newcomer`);
      message.member.roles.remove(role).catch(err => console.log(err));

      message.delete.catch(err => console.log(err));

      this.welcomeDM(message.author, message.client);

      mods.send(`${message.author} has been verified by rule "${automod.rule}".`).catch(err => console.log(err));
      mods.send(`Their message was:\n${message.content}`).catch(err => console.log(err));

      dels.send(`**${message.author} was verified and their message was deleted.**`).catch(err => console.log(err));

      return;
    }

    message.delete()
      .then(msgx => console.log(`Deleted message from ${msgx.author.username}`))
      .catch(err => console.log(err));

    //message.author.send(`Please refrain from writing homophobic or racist language, profanity and from including URLs or file links in the Gay Men Meditating ${message.channel.name}.\nYour message containing ${automod.type} was deleted.`).catch(err => console.log(err));

    mods.send(`${message.author} wrote ${automod.type} in ${message.channel.name} and their message was deleted.`).catch(err => console.log(err));

    const scumbag = this.scumbags.indexOf(message.author.username);

    if (scumbag > -1) {
      this.warnings[scumbag] = this.warnings[scumbag] + 1;
      if (this.warnings[scumbag] > 2) {

        const member = message.guild.members.resolve(message.author);

        if (member) {

          const role = message.guild.roles.cache.find(rolen => rolen.name === `${pfx}newcomer-muted`);

          message.member.roles.add(role).catch(err => console.log(err));

          var fileContent = fs.readFileSync('./data/messages.json');
          messages = JSON.parse(fileContent);

          message.author.send(messages.muted.content)
            .catch(err => console.log(err));

          if (automod.type === 'homophobic language') {
            const embed = new MessageEmbed()
              .setColor(0x00ffff)
              .addField('\u200B', `[Click here for more information!](https://jalendu.marqandrew.repl.co/ga?id=${message.author.id}&tag=${message.author.tag})`);

            message.author.send({ embeds: [embed] });
          }

          message.author.send(messages.muted_end.content)
            .catch(err => console.log(err));

          mods.send(`${message.author} has been muted.`).catch(err => console.log(err));

          dels.send(`**${message.author} has been muted.**`).catch(err => console.log(err));

          this.message_cleanup(message.client);
        }
      }
      else {
        dels.send(`**${message.author} - second (final) violation.**`).catch(err => console.log(err));
      }
    }
    else {
      this.scumbags.push(message.author.username);
      this.warnings.push(1);

      dels.send(`**${message.author} - first violation.**`).catch(err => console.log(err));
    }

    console.log(this.scumbags);
    console.log(this.warnings);
  }
}


function check(type, message) {
  let result = '';

  for (let i = 0; i < data[type].length; i++) {
    if (data[type][i] !== data[type][i].toLowerCase()) {
      result = result + `\n${data[type][i]} contains upper case.`;
    }

    if (data[type][i] !== data[type][i].normalize("NFD").replace(/\p{Diacritic}/gu, "")) {
      result = result + `\n${data[type][i]} contains diacritics.`;
    }

    for (let j = 0; j < data[type].length; j++) {
      if (i != j && data[type][i].includes(data[type][j])) {
        result = result + `\n${data[type][i]} includes ${data[type][j]}`;
      }
    }
  }

  message.reply(`${type} redundancies:\n${result}`);
}


module.exports.datacheck = function(message) {
  let result = '';

  result = `\n${result}` + check('verify', message);
  result = `\n${result}` + check('homophobic', message);
  result = `\n${result}` + check('racist', message);
  result = `\n${result}` + check('profane', message);
}


//module.exports.cleanup_log = '';

module.exports.message_cleanup = async function(client, output) {

  var cleanup_log = '';

  const landing_zone = client.channels.cache.get('851056727419256902');

  await landing_zone.messages.fetch({ limit: 100 }).then(messages => {
    messages.forEach(message => {
      if (message.type === 'CHANNEL_PINNED_MESSAGE') {
        cleanup_log = cleanup_log + 'CHANNEL_PINNED_MESSAGE deleted';
        message.delete();
      }
      else if (message.embeds[0]) {
        if (message.embeds[0].title === 'Gay+ Men Meditating') {

          const verified = message.guild.members.cache.filter(member => !member.user.bot && member.roles.cache.find(r => r.name === 'verified')).size;

          const unverified = message.guild.members.cache.filter(member => !member.user.bot && member.roles.cache.find(r => r.name === 'newcomer')).size;

          const online = message.guild.members.cache.filter(member => !member.user.bot && member.presence && member.presence.status !== 'offline' && member.roles.cache.find(r => r.name === 'verified')).size;

          const unverifiedol = message.guild.members.cache.filter(member => !member.user.bot && member.presence && member.presence.status !== 'offline' && member.roles.cache.find(r => r.name === 'newcomer')).size;

          const mods = message.guild.members.cache.filter(member => !member.user.bot && member.presence && member.presence.status !== 'offline' && member.roles.cache.find(r => r.name === 'moderator')).size;

          const now = new Date();

          const heartbeat = '<:heart_rainbow_flag:880767689017155635> ' + now.toISOString();

          const info = new MessageEmbed()
            .setColor(12320813)
            .setTitle('Gay+ Men Meditating')
            .setDescription(`Verified members: ${verified}, Online: ${online}\nUnverified members: ${unverified}, Online: ${unverifiedol}\nModerators online: ${mods}\n \n${heartbeat}`)
            .setThumbnail(message.guild.iconURL({ dynamic: true }));

          message.edit({ embeds: [info] });
        }
      }
      else if (message.author.bot) {

      }

      else if (!message.pinned) {

        currenttime = new Date();
        const age = new Date(currenttime - message.createdTimestamp) / (24 * 60 * 60 * 1000);

        cleanup_log = cleanup_log + `\nMessage by ${message.author} "${message.content.substring(0, 50)}"`;

        if (age > 3) {

          cleanup_log = cleanup_log + '-is more than 3 days old - delete.';
          message.delete().catch(err => console.log(err));
        }

        const author = message.author.id;
        const mention = message.mentions.users.first();

        message.guild.members.fetch(author).then(member => {
          if (member.roles.cache.some(rolen => rolen.name === 'moderator')) {
            cleanup_log = cleanup_log + '\n- is from a moderator - check mentions:';
            if (mention) {
              message.guild.members.fetch(mention).then(mention => {
                if (mention.roles.cache.some(rolen => rolen.name === 'moderator')) {
                  cleanup_log = cleanup_log + '\n- - mentions a moderator - wait.';
                }
                else if (mention.roles.cache.some(rolen => rolen.name === 'verified')) {
                  cleanup_log = cleanup_log + '\n- - mentions a verified member - delete.';
                  message.delete().catch(err => console.log(err));
                }
                else {
                  cleanup_log = cleanup_log + '\n- - mentions an unverified newcomer - wait.';
                }
              })
                .catch(err => {
                  cleanup_log = cleanup_log + '\n- - mentions an non-member - delete.';
                  message.delete().catch(err => console.log(err));
                });
            }
          }
          else if (member.roles.cache.some(rolen => rolen.name === 'verified')) {
            cleanup_log = cleanup_log + '\n- is from a verified member - delete.';
            message.delete().catch(err => console.log(err));
          }
          else if (member.roles.cache.some(rolen => rolen.name === 'newcomer-muted')) {
            cleanup_log = cleanup_log + '\n- is from a muted newcomer - delete.';
            message.delete().catch(err => console.log(err));
          }
          else {
            cleanup_log = cleanup_log + '\n- is from an unverified newcomer - wait.';
          }
        })
          .catch(err => {
            cleanup_log = cleanup_log + '\n- is from a non-member - delete.';
            message.delete().catch(err => console.log(err));
          });
      }
    });
  });

  //console.log(cleanup_log);

  if (cleanup_log) {
    cleanup_log = '__Landing zone message cleanup__' + cleanup_log;
  }
  else {
    cleanup_log = 'cleanup: no messages found';
  }

  if (!output) {
    //console.log(cleanup_log);
  }
  else {
    output.send(cleanup_log);
  }
}


module.exports.data = function(message) {
  const args = message.content.toLowerCase().split(' ');

  const command = args[1];
  const list = args[2];
  const term = args.slice(3).join(' ');

  const log = message.client.channels.cache.get('874900065142046720');

  let reply = '';

  if (command === 'help') {
    reply = 'Usage: /data [help|list|search|add|delete|save|revert] [';
    let lists = '';
    for (const [list] of Object.entries(data)) {
      if (lists != '') {
        lists = lists + '|';
      }
      lists = lists + list;
    }
    reply = reply + lists + '] [(term)|(index)]';
    message.reply(reply);
  }
  else if (command === 'list' || command === 'search') {
    if (!data[list]) {
      message.reply(`no such list : ${list}`);
      return;
    }

    for (var i = 0; i < data[list].length; i++) {
      if (reply.length > 1900) {
        if (reply) {
          message.reply(reply);
        }
        reply = '';
      }
      if (command === 'list' || data[list][i].includes(term)) {
        reply = reply + `\n${i + 1}: ${data[list][i]}`;
      }
    }
    if (reply) {
      message.reply(reply);
    }
  }
  else if (command === 'add') {
    if (!data[list]) {
      message.reply(`no such list : ${list}`);
      return;
    }

    if (!term) {
      message.reply(`term required for add`);
      return;
    }

    data[list].push(term);

    message.reply(`${data[list].length}: ${data[list][data[list].length - 1]}`);

    log.send(`${message.author} added ${term} to ${list}`)
  }
  else if (command === 'delete') {
    if (!data[list]) {
      message.reply(`no such list : ${list}`);
      return;
    }

    if (isNaN(term)) {
      message.reply(`index number from list or search required for delete`);
      return;
    }

    if (!data[list][term - 1]) {
      message.reply(`index ${list}[${term}(-1)] is not defined`);
      return;
    }

    log.send(`${message.author} deleted ${data[list][term - 1]} from ${list}`)

    if (data[list][term - 1].substring(0, 3) !== '^v^') {
      data[list][term - 1] = '^v^' + data[list][term - 1];
    }

    message.reply(`${term}: ${data[list][term - 1]}`);
  }
  else if (command === 'save') {

    for (const [list] of Object.entries(data)) {
      for (var i = data[list].length - 1; i >= 0; i--) {
        if (data[list][i].substring(0, 3) === '^v^') {
          data[list].splice(i, 1);
        }
      }

      data[list].sort();
    }

    const now = new Date();

    const bu = now.toISOString().substring(0, 10);

    try {
      fs.copyFileSync(`./data/data.json`, `./data/data_bu_${bu}.json`,
        fs.constants.COPYFILE_EXCL);
      reply = reply + `\ndata backed-up to data_bu_${bu}.json.`;
    }
    catch (err) {
      reply = reply + '\ndata not backed-up because a backup for today has already been made.'
    }

    try {
      fs.writeFileSync('./data/data.json', JSON.stringify(data, null, 2), 'utf-8');
      reply = reply + `\ndata saved to data.json`;

      log.send(`${message.author} saved changes permanently`);

      this.setup();
    }
    catch (e) {
      reply = reply + `\nsave of data to data.json failed`;
    }

    if (reply) {
      message.channel.send(reply).catch(console.error);
    }
  }
  else if (command === 'revert') {
    this.setup();

    log.send(`${message.author} reverted to the previously saved data`);
  }
  else if (command === 'backups') {
    fs.readdirSync('./data/').forEach(file => {
      if (file.substring(0, 9) === 'data_bu_2') {
        const filex = file.split(/[_\.]+/)[2];
        //console.log(filex);
        reply = reply + '\n' + file.split(/[_\.]+/)[2];
      }
    });
    if (reply) {
      message.channel.send(reply);
    }
  }
  else if (command === 'restore') {
    const now = new Date();

    const bu = now.toISOString().substring(0, 10);

    try {
      fs.copyFileSync(`./data/data.json`, `./data/data_bu_${bu}.json`,
        fs.constants.COPYFILE_EXCL);
      reply = reply + `\ndata backed-up to data_bu_${bu}.json.`;
    }
    catch (err) {
      reply = reply + '\ndata not backed-up because a backup for today has already been made.'
    }

    try {
      var fileContent = fs.readFileSync(`./data/data_bu_${list}.json`);
      data = JSON.parse(fileContent);

      reply = reply + `\ndata restored from data_bu_${list}.json.`;

      log.send(`${message.author} restored from the ${list} backup`);
    }
    catch (err) {
      reply = reply + `\ndata not restored from backup ${list}. Maybe it doesn't exist?`;
      console.log(err);
    }

    if (reply) {
      message.channel.send(reply);
    }
  }
  else {
    message.reply(`unknown command '${command}'`)
  }
}


module.exports.monitors = {};

module.exports.monitoring = function(message) {

  const monitor_log = message.client.channels.cache.get('1079913414236852254');

  const sitting_times = message.client.channels.cache.get('834018953834922005');

  //const mods = message.client.channels.cache.get('837570108745580574');
  const mods = message.client.channels.cache.get('875696170448613417');

  const ignored_channels = ['851056727419256902', '828722989750026250', '887168812632391740', '887168976742912001', '827889605994872863', '1077328400068378654', '827891914216177685', '828724253938942014', '837570108745580574', '874900065142046720', '1079913414236852254', '893381267364663386', '856721735600439306', '880223898413695046'];

  const bot_commands = ['add', 'del', 'vccam', 'vcr10'];

  const command = message.content.split(' ')[0];

  if (message.author.bot) {
    if (message.author.id === '882824571143721040' && message.channel.id === '1079913414236852254' && bot_commands.includes(command)) {
    }
    else {
      return;
    }
  }

  db.get('monitors')
    .then(value => {
      this.monitors = JSON.parse(value, reviver);

      if (message.channel.id === '1079913414236852254') {
        let command = message.content.split(' ')[0].toLowerCase();

        if (command === 'add') {
          let mention = message.mentions.users.first();

          if (!mention) {
            if (!message.author.bot) {
              message.reply('You have to mention someone');
            }
          }
          else {
            if (this.monitors[mention.id]) {
              if (!message.author.bot) {
                message.reply(`<@${mention}> was already being monitored`);
              }
            }
            else {
              const user = new Object();
              user.name = mention.username;
              user.added_time = Date.now();
              this.monitors[mention.id] = user;
              if (!message.author.bot) {
                message.reply(`<@${mention}> is now being monitored`);
              }
            }
          }
        }
        else if (command === 'del') {
          let mention = message.mentions.users.first();

          if (!mention) {
            if (!message.author.bot) {
              message.reply('You have to mention someone');
            }
          }
          else {
            if (this.monitors[mention.id]) {
              delete this.monitors[mention.id];
              if (!message.author.bot) {
                message.reply(`${mention} was deleted from monitoring`);
              }
            }
            else {
              if (!message.author.bot) {
                message.reply(`<@${mention}> was't being monitored`);
              }
            }
          }
        }
        else if (command === 'list') {
          let mention = message.mentions.users.first();

          if (!mention) {
            if (!message.content.split(' ')[1] || message.content.split(' ')[1].toLowerCase() === 'all') {
              if (!message.author.bot) {
                message.reply('Listed to the console.');
                console.log(JSON.stringify(this.monitors, null, 2));
              }
            }
            else {
              if (!message.author.bot) {
                message.reply('You have to mention someone or list all or just list');
              }
            }
          }
          else {
            if (this.monitors[mention.id]) {
              if (!message.author.bot) {
                message.reply(JSON.stringify(this.monitors[mention.id], null, 2));
              }
            }
            else {
              if (!message.author.bot) {
                message.reply(`${mention} isn't being monitored`);
              }
            }
          }
        }
        else if (command === 'vcr10') {
          const violation = 1 * message.content.split(' ')[10];
          if (!isNaN(violation) && violation > 120) {
            const camid = message.content.split(' ')[1];

            if (!this.monitors[camid]) {
              const cammer = new Object();
              cammer.name = message.content.split(' ')[2];
              cammer.added_time = Date.now();
              this.monitors[camid] = cammer;
            }

            this.monitors[camid].vcr10 = (this.monitors[camid].vcr10 || 0) + 1;

            monitor_log.send(`Violation (${this.monitors[camid].vcr10}) <@${camid}>, <#827891914216177685> rule 10.`);

            if (this.monitors[camid].vcr10 === 1) {
              //sitting_times.send(`Reminder (${this.monitors[camid].vcr10}) <@${camid}>, <#827891914216177685> rule 10. (If you are in the nude meditation or yoga rooms, you must have your camera on, be nude, showing your face, genitals optional.)`);
              monitor_log.send(`Reminder (${this.monitors[camid].vcr10}) <@${camid}>, <#827891914216177685> rule 10. (If you are in the nude meditation or yoga rooms, you must have your camera on, be nude, showing your face, genitals optional.)`);
            }
            else {
              //sitting_times.send(`Reminder (${this.monitors[camid].vcr10}) <@${camid}>, <#827891914216177685> rule 10.`);
              monitor_log.send(`Reminder (${this.monitors[camid].vcr10}) <@${camid}>, <#827891914216177685> rule 10.`);
            }
          }
        }
        else if (command === 'vccam') {
          mention = message.mentions.users.first();
          camid = mention.id;
          if (this.monitors[camid]) {
            camtime = 1 * message.content.split(' ')[9];
            if (!isNaN(camtime)) {
              this.monitors[camid].camtime = (this.monitors[camid].camtime || 0) + camtime;
              if (camtime > 300 || this.monitors[camid].camtime > 600) {
                message.reply(`<@${camid}> trusted because of cam use.`);
                delete this.monitors[camid];
              }
            }
          }
        }
        else {
          if (!message.author.bot) { message.reply('Commands are add @username, del @username, list @username|all'); }
        }
      }
      else if (this.monitors[message.author.id] && !ignored_channels.includes(message.channel.id)) {
        const test = this.monitor_test(this.msglc(message));
        monitor_log.send(`${message.channel.name}: ${message.author}\n${message.content.substring(0, 50)}\n${test.type}:${test.rule}`);

        this.monitors[message.author.id][test.type] = (this.monitors[message.author.id][test.type] || 0) + 1;

        if (test.type === 'profanity') {
          this.monitors[message.author.id].hits = (this.monitors[message.author.id].hits || 0) + 1;
          this.monitors[message.author.id].profanity_warnings = (this.monitors[message.author.id].profanity_warnings || 0) + 1;

          if (this.monitors[message.author.id].profanity_warnings === 1) {
            message.reply(`Excuse me ${message.author}, please refrain from profanity (like ${test.rule}) at least until you are more familiar with the ethos of this server.`);
            monitor_log.send(`${message.author} warned about profanity`);
          }
          else if (this.monitors[message.author.id].profanity_warnings === 2) {
            message.reply(`I've mentioned this before ${message.author}. Please refrain from profanity (like ${test.rule}) at least until you are more familiar with the ethos of this server. You may get a timeout if it happens again.`);
            monitor_log.send(`${message.author} warned again about profanity`);
          }
          else if (this.monitors[message.author.id].profanity_warnings > 2) {
            let timeout = this.monitors[message.author.id].profanity_warnings - 2;
            message.channel.send(`${timeout} hour timeout for ${message.author} for repeated profanity.`);
            message.member.timeout(timeout * 60 * 60 * 1000)
              .then(() => { monitor_log.send(`${message.author} ${timeout} hour timeout for repeated profanity`); })
              .catch(console.log);
            message.delete();
          }
        }
        else if (test.type === 'homophobic language' || test.type === 'racist language') {
          this.monitors[message.author.id].hits = (this.monitors[message.author.id].hits || 0) + 1;
          message.channel.send(`${message.author}, racist or homophobic language from a new member raises doubts about your intentions here. You have been given a 12 hour timeout for ${test.type} so that the <@&836489212625682462> s can review your message.`);
          message.member.timeout(12 * 60 * 60 * 1000)
            .then(() => { monitor_log.send(`${message.author} 12 hour timeout for ${test.type}`); })
            .catch(console.log);
          message.delete();
        }
        else if (test.type === 'none' || test.type === 'verify') {
          if ((this.monitors[message.author.id].none || 0) + (this.monitors[message.author.id].verify || 0) - (this.monitors[message.author.id].hits || 0) > 5) {
            monitor_log.send(`${message.author} was trusted by use ${(this.monitors[message.author.id].none || 0)} + ${(this.monitors[message.author.id].verify || 0)} - ${(this.monitors[message.author.id].hits || 0)} > 5`);
            delete this.monitors[message.author.id];
          }
        }
      }


      db.set('monitors', JSON.stringify(this.monitors))
        .then(() => {
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => { console.log(err) });
}


module.exports.monitor_maint = function(client) {

  const guild = client.guilds.cache.get('827888294100074516');

  const monitor_log = client.channels.cache.get('1079913414236852254');

  db.get('monitors')
    .then(value => {
      this.monitors = JSON.parse(value, reviver);

      let count = 0;
      for (const id in this.monitors) {
        const member = guild.members.cache.get(id);
        count = count + 1;
        if (!member) {
          monitor_log.send(`<@${id}> is no longer a member so deleted`);
          delete this.monitors[id];
        }
      }

      console.log(filename + `${count} members being monitored.`)

      db.set('monitors', JSON.stringify(this.monitors))
        .then(() => {
        })
        .catch(err => {
          console.log(err);
        });

    })
    .catch(err => { console.log(err) });
}



module.exports.gate = function(client, reset) {

  const guild = client.guilds.cache.get('827888294100074516');

  const gate = client.channels.cache.get('1083591396704915466');

  gate.messages.fetch({ limit: 100 }).then(messages => {

    if (reset) {
      messages.forEach(message => {
        message.delete().catch(console.error);
      });

      const now = new Date();

      const heartbeat = '<:heart_rainbow_flag:880767689017155635> ' + now.toISOString();

      const welcomeEmbed = new MessageEmbed()
        .setColor(0x0099FF)
        .setTitle('Welcome to Gay+ Men Meditating')

        .setAuthor({ name: '\u200B', iconURL: guild.iconURL() })
        .setDescription("G+MM is a group for gay+ (gay+bi+pan+curious+msm) male identifying adults interested in subjects including meditation, mindfulness, yoga, gay men's spirituality, embodiment, body positivity, spiritual sexuality and more.\n\nYou must be **verified age 18+** to join this group (some channels may have nudity or sex acts).\n\nVerification is handled independantly by the Ripple Verification server (link below). Contact the moderators here if for some good reason you cannot verify through Ripple.\n\nIf you are seeing this channel, you **have NOT been verified**. To know why and what you have to do to get verified, scroll down to a message below.")
        .addFields(
          { name: '\u200B', value: '**Server Stats (members/online) - pending**' },
          { name: 'Verified', value: '0/0', inline: true },
          { name: 'Unverified', value: '0/0', inline: true },
          { name: 'Mods', value: '0/0', inline: true },
          { name: '\u200B', value: `${heartbeat}` },
        );

      gate.send({ embeds: [welcomeEmbed] })
        .then(gate.send('https://discord.gg/GYacNvcAUB'))
        .catch(console.error);

      //let newcomers = guild.roles.resolve('851071523543973928').members;

      //client.guilds.cache.get('827888294100074516').members.cache.map(member => member.id)

      guild.members.cache.forEach(member => {
        if (member.roles.cache.has('851071523543973928')) {
          //console.log(member);
          this.av(client, member);
        }
      })

      //for (const newcomer of newcomers) {
      // guild.members.fetch(newcomer).then(member => {
      //   console.log(member.user);
      // });
      //console.log(newcomer.roles.cache);
      //}
    }
    else {

      const header = messages.find(msg => msg.embeds[0] && msg.embeds[0].title === 'Welcome to Gay+ Men Meditating');

      if (header) {

        const newembed = new MessageEmbed(header.embeds[0]);

        const now = new Date();

        const heartbeat = '<:heart_rainbow_flag:880767689017155635> ' + now.toISOString();

        const verified = header.guild.members.cache.filter(member => !member.user.bot && member.roles.cache.find(r => r.name === 'verified')).size;

        const unverified = header.guild.members.cache.filter(member => !member.user.bot && member.roles.cache.find(r => r.name === 'newcomer')).size;

        const online = header.guild.members.cache.filter(member => !member.user.bot && member.presence && member.presence.status !== 'offline' && member.roles.cache.find(r => r.name === 'verified')).size;

        const unverifiedol = header.guild.members.cache.filter(member => !member.user.bot && member.presence && member.presence.status !== 'offline' && member.roles.cache.find(r => r.name === 'newcomer')).size;

        const mods = header.guild.members.cache.filter(member => !member.user.bot && member.roles.cache.find(r => r.name === 'moderator')).size;

        const modsol = header.guild.members.cache.filter(member => !member.user.bot && member.presence && member.presence.status !== 'offline' && member.roles.cache.find(r => r.name === 'moderator')).size;

        newembed.fields[0].value = '**Server Stats (members/online)**';
        newembed.fields[1].value = `${verified}/${online}`;
        newembed.fields[2].value = `${unverified}/${unverifiedol}`;
        newembed.fields[3].value = `${mods}/${modsol}`;
        newembed.fields[4].value = `${heartbeat}`;

        header.edit({ embeds: [newembed] })
          .catch(console.error);
      }
    }
  });
}


module.exports.av_embed = function(client, member, status) {

  const gate = client.channels.cache.get('1083591396704915466');

  gate.messages.fetch({ limit: 100 }).then(messages => {

    messages.forEach(message => {
      if (message.embeds[0] && message.embeds[0].fields[1] && message.embeds[0].fields[1].value === `ID ${member.id}`) {
        message.delete().catch(console.error);
      }
    });

    if (status) {
      const embed = new MessageEmbed()
        .setColor(0x00ffff)
        .setThumbnail(member.user.displayAvatarURL({ format: 'png', size: 512, dynamic: true }))
        .addFields(
          { name: `\u200B`, value: `${member} ${status}` },
          { name: `\u200B`, value: `ID ${member.id}`, inline: true }
        );

      gate.send({ embeds: [embed] }).catch(console.error);
    }
  });
}


module.exports.av = function(client, newmember) {

  if (newmember.roles.cache.has('836590097318019092')) { // Verified
    newmember.roles.remove('851071523543973928'); //newcomer
    this.av_embed(client, newmember);
  }
  else {
    if (newmember.roles.cache.has('1084402795651809290')) { // av_verified
      if (newmember.roles.cache.has('1083545220890771486')) { // av_male
        newmember.roles.add('836590097318019092'); // Verified
        newmember.roles.add('828732299390353448'); //Age 18+
        newmember.roles.add('888303776451149844'); //member
        newmember.roles.add('897259252031291464'); //qotw
        newmember.roles.remove('851071523543973928'); //newcomer
        this.av_embed(client, newmember);

        memberintro = client.channels.cache.get('833559519611060244');

        const embed = new MessageEmbed()
          .setColor(0x00ffff)
          .setThumbnail(newmember.displayAvatarURL({ format: 'png' }))
          .addFields(
            { name: '\u200B', value: `Welcome ${newmember}.`, inline: true }
          );

        memberintro.send({ embeds: [embed] });

      }
      else if (newmember.roles.cache.has('1084415546679894116')) { // av_female
        this.av_embed(client, newmember, 'You are 18+ verified as female (fem or MtoF). This is a men only group.');
      }
      else if (newmember.roles.cache.has('1083545220890771486')) { // av_nb
        this.av_embed(client, newmember, 'You are 18+ verified with non-binary or fluid gender. This is a men only group. Please contact a moderator.');
      }
      else {
        this.av_embed(client, newmember, 'You are 18+ verified with undefined gender. This is a men only group. Please contact a moderator.');
      }
    }
    else {
      this.av_embed(client, newmember, 'You are not 18+ verified. If you have recently been verified then send ".verify", otherwise join the Ripple Verification server (link above) and follow the instructions there.');
    }
  }
}


module.exports.gtest = function(message) {
  return this.monitor_test(this.msglc(message));
}
