const { Client, Intents, MessageEmbed } = require('discord.js');

const db = require('../common/text_database.js');

const antispam = require('../common/antispam.js');

var quiz = require('./quiz.js');

var dossiers = require('./dossiers.js');

var setup = require('./setup.js');

var guilds = require('./guilds.js');

var automod = require('../jalendu/jautomod.js');

var path = require('path');

var filename = path.basename(__filename) + ': ';
var filenamn = filename + '/n';

function reviver(key, value) {
  if (typeof value === "string" && key.includes('time')) {
    return new Date(value);
  }
  return value;
}


module.exports.ready = function(client) {
  console.log(filename + `Logged in as: ${client.user.tag}`);

  client.user.setUsername('LGBTQIA+ Antifa');

  client.user.setActivity();
  client.user.setStatus(':rainbow_flag:');
}


module.exports.demote = async function(message) {
  let timeout = 0;

  if (message.member.roles.cache.has('1086897285461463050')) {
    timeout = 5;
  }

  if (message.member.roles.cache.has('1086896507686494238')) {
    timeout = 20;
  }

  const excuse = ['pedo','nazi','antilgbt','anti-lgbt','groom','sinful','unnatural','pervert'];


  if (timeout > 0) {
    test = automod.gtest(message);

    if (test.type === "homophobic language" || test.type === "racist language") {
      if (test.quoted || excuse.includes(test.rule)) {
        await message.react("🤬");
      }
      else {
        await message.reply(`${message.author} wrote ${test.type} ("${test.rule}"). They are timed-out for ${timeout} minutes and their verification level will be reduced.`).catch(err => console.log(filename + err));
        await message.member.timeout(timeout * 60 * 1000).catch(err => console.log(filename + err));
        await message.member.roles.add("1117046096569565255").catch(err => console.log(filename + err)); // demote
        //await message.member.roles.add("1183348471898578996").catch(err => console.log(filename + err)); // immune
        message.delete().catch(err => console.log(filename + err));
      }
    }
  }
} 


module.exports.demote_code = function(client) {
  const guild = client.guilds.cache.get('1086894060914098176');

  let pending = guild.roles.resolve('1117046096569565255').members;

  for (const member of pending) {
    console.log(filename + `${member[1].user.username} demoted`);
    member[1].roles.remove("1117046096569565255").catch(err => console.log(filename + err)); // demote
    member[1].roles.remove("1086897285461463050").catch(err => console.log(filename + err)); // verified 1
    member[1].roles.remove("1228724705976913961").catch(err => console.log(filename + err)); // gater
    member[1].roles.add("1086896507686494238").catch(err => console.log(filename + err));    // unverified

    examp = quiz.examp_init(member[1].id);

    if(member[1].roles.cache.has('1253324399390621707')){ //spade
      examp.average_limit = 5.1;
    }
    else if(examp.average_limit === 5.1){
      member[1].roles.add("1253324399390621707").catch(err => console.log(filename + err));    // spade
    }
    else if(!member[1].roles.cache.has('1183348471898578996')){
      examp.average_limit = 2.5;
    }
    else {
      examp.average_limit = Math.min(5,examp.average_limit + 0.5);
    }

    db.db.save = true;
  }
}


module.exports.cleanup = async function(client) {

  const guild = client.guilds.cache.get('1086894060914098176');

  let channels = await guild.channels.cache.filter(channel => channel.parentId === '1087464585411436615');

  carray = Array.from(channels);

  let keys = await db.list();

  for (c = 0; c < carray.length; c++) {
    if (carray[c][1].name.startsWith('exam-')) {
      userid = carray[c][1].name.split('-')[1];

      key = `exam_verification_${carray[c][1].name.split('-')[1]}`;
      if (keys.indexOf(key) === -1) {
        console.log(filename + `gayantifa cleanup: database key no longer exists ${key}`);
        carray[c][1].delete();
      }
      else {
        const isMember = await guild.members.fetch(userid).then(() => true).catch(() => false);
        if (!isMember) {
          console.log(filename + `${userid} is no longer a member`);
          carray[c][1].delete();
        }
      }
    }
  }

  for (k = 0; k < keys.length; k++) {
    if (keys[k].split('_')[0] === 'exam') {
      if (keys[k].split('_')[1] === 'verification') {
        userid = keys[k].split('_')[2]
        const isMember = await guild.members.fetch(userid).then(() => true).catch(() => false);
        if (!isMember) {
          console.log(filename + `${userid} is no longer a member`);
          db.delete(keys[k]);
        }

        let userchannel = guild.channels.cache.find(channel => channel.name === `exam-${userid}`);

        if (!userchannel) {
          console.log(filename + `exam-${userid} channel no longer exists. Delete database key.`);
          db.delete(keys[k]);
        }
      }

      db.get(keys[k]).then(value => {
        exam = JSON.parse(value, reviver);
        if (exam) {
          key = `exam_${exam.mode}_${exam.userid}`;
          age = (new Date() - exam.start_time) / (1000 * 60 * 60);
          if (age > 24) {
            console.log(filename + `${key} is too old`);
            db.delete(key);
          }
        }
      });
    }
  }

}

let prev_message = '';
let repeats = 0;


module.exports.messageCreate = async function(client, message) {
  antispam.spam(client,message,false);

  if (message.author.bot) {
    if (message.channel.type !== 'DM' && message.channel.name.startsWith('exam-')) {
    }
  }
  else if (message.channel.type === 'DM') {
    if (message.content.startsWith("!ga")) {
      this.ga_commands(client, message, 'dm');
    }
    else {
      quiz.answer(client, message, 'dm');
    }
  }
  else if (message.guild.id === guilds.home.guild.id) {
    if (message.channel.id === '1090515438284320798') { //testing channel
      if (message.content.startsWith("!ga")) {
        this.ga_commands(client, message, 'test');
      }
      else if (message.content === '*automod') {
        message.reply(`\`\`\`${JSON.stringify(automod.automod(message), null, 2)}\`\`\``);
      }
      else if (message.content === '*qarray') {
        message.reply(`\`\`\`${JSON.stringify(quiz.qarray(), null, 2)}\`\`\``);
      }
      else if (message.content === '*dossier') {
        dossiers.dossier(client, message.member);
        //message.reply(`\`\`\`${JSON.stringify(quiz.qarray(), null, 2)}\`\`\``);
      }
      else if (message.content === '*cleanup') {
        let channels = await message.guild.channels.cache.filter(channel => channel.parentId === '1087464585411436615');

        carray = Array.from(channels);

        let keys = await db.list();

        console.log(filename + keys);

        for (c = 0; c < carray.length; c++) {
          console.log(filename + carray[c][1].name);
          if (carray[c][1].name.startsWith('exam-')) {
            key = `exam_verification_${carray[c][1].name.split('-')[1]}`;
            console.log(filename + carray[c][1].name);
            console.log(filename + keys.indexOf(key));
            if (keys.indexOf(key) === -1) {
              carray[c][1].delete();
            }
          }
        }
      }
      else {
        this.demote(message);
      }
    }
    else if (message.channel.id === '1088323549263052862') { //question submission
      quiz.json(client, message);
    }
    else if (message.channel.name === `exam-${message.author.id}`) {
      quiz.answer(client, message, 'verification');
    }
    else if (message.content === '*setup' && message.author.id === message.guild.ownerId) {
      setup.setup(client, message.channel);
    }
    else if (message.content.startsWith("!ga")) {
      this.ga_commands(client, message, 'home');
    }
    else {
      this.demote(message);

      if(prev_message.length > 100 && prev_message === message.content){
        message.delete().catch(err => console.log(filename + err));
        repeats = repeats + 1;

        if(repeats > 5){
          message.member.timeout(120 * 60 * 1000).catch(err => console.log(filename + err));
        }
      }
      else {
        repeats = 0;
      }
    }
  }
  else if (message.content.startsWith("!ga")) { //foreign guild
    this.ga_commands(client, message, 'foreign');
  }

  if (!message.author.bot && message.channel.type !== 'DM') {
    //dossiers.dossier_messages(client, message);
  }

  prev_message = message.content;
};


module.exports.ga_commands = function(client, message, guildtype){
  let command = message.content.split(" ")[0].split("-");
  let parms = message.content.split(" ").slice(1);

  let admin = false;

  if (guildtype !== 'dm') {
    admin = message.member.permissions.has('ADMINISTRATOR');

    if (!admin && guilds.ga_guilds[message.guildId].hasOwnProperty('admin_role')) {
      admin = message.member.roles.cache.has(guilds.ga_guilds[message.guildId].admin_role);
    }
  }

  console.log(filename + `command : ${JSON.stringify(command, null, 2)}`);
  console.log(filename + `parms : ${JSON.stringify(parms, null, 2)}`);
  console.log(filename + `admin : ${admin}`);

  if (command[1] === 'exam') {
    message.reply(`Exam started in a direct message conversation with the bot <@${client.user.id}>.`);
    quiz.setup(client, message.guild, message.author, 'dm');
  }
  else if (command[1] === 'bot') {
    if (command[2] === 'invite') {
      message.reply(`\`${guilds.home.bot.invite}\``).catch(err => { console.log(filename + err) });
    }
  }
  else if (command.slice(1).join("-") === 'home-server-invite') {
    message.reply(`\`${guilds.home.guild.invite}\``).catch(err => { console.log(filename + err) });
  }
  else if (admin && command[1] === 'guild' && guildtype !== 'dm') {
    if (command[2] === 'joined') {
      guilds.joined(client, message.guild);
    }
    else if (command[2] === 'left') {
      guilds.left(client, message.guild);
    }
  }
  else if (admin && command[1] === 'set' && guildtype !== 'dm') {
    if (command.slice(2).join("-") === 'logging-channel') {
      if (message.mentions.channels.first()) {
        if (message.mentions.channels.first().guildId !== message.guildId) {
          message.reply('Mentioned channel is not on this server.').catch(console.error);
        }
        else {
          guilds.set_logging_channel(client, message.mentions.channels.first());
        }
      }
      else {
        message.reply('No channel mentioned.').catch(console.error);
      }
    }
  }
  else if (admin && command.slice(2).join("-") === 'admin-role' && guildtype !== 'dm') {
    if (message.mentions.roles.first()) {
      if (message.mentions.roles.first().guild.id !== message.guildId) {
        message.reply('Mentioned role is not on this server.').catch(console.error);
      }
      else {
        guilds.set_admin_role(client, message.mentions.roles.first(), message.author);
      }
    }
    else {
      message.reply('No role mentioned.').catch(console.error);
    }
  }
  else if (admin && command[1] === 'dossier') {
    if (message.mentions.users.first()) {
      user = message.mentions.users.first();
      if (dossiers.ga_dossiers[user.id]) {
        if (command[2]) {
          if (dossiers.ga_dossiers[user.id][command[2]]) {
            message.reply(`For security, !ga-server-settings command sends it's results to you in a direct message from the bot <@${client.user.id}>.`);
            message.author.send(`\`\`\`${JSON.stringify(dossiers.ga_dossiers[user.id][command[2]], null, 2)}\`\`\``).catch(console.error);
          }
          else {
            message.reply(`Property "${command[2]}" does not exist on dossier for <@${user.id}>`)
          }
        }
        else {
          message.reply(`for security, !ga-server-settings command sends it's results to you in a direct message from the bot <@${client.user.id}>.`);
          message.author.send(`\`\`\`${JSON.stringify(dossiers.ga_dossiers[user.id], null, 2)}\`\`\``).catch(console.error);
        }
      }
      else {
        message.reply(`No dossier on ${command[2]}`).catch(console.error);
      }
    }
    else {
      message.reply('No valid user mentioned.').catch(console.error);
    }
  }
  else if (admin && command.slice(1).join("-") === 'server-settings' && guildtype !== 'dm') {
    message.reply(`for security, !ga-server-settings command sends it's results to you in a direct message from the bot <@${client.user.id}>.`);
    message.author.send(`\`\`\`${JSON.stringify(guilds.ga_guilds[message.guildId], null, 2)}\`\`\``).catch(console.error);
  }
  else if (command[1] === 'help') {
    if (guildtype !== 'dm') {
      message.reply(`for security, !ga-help command sends it's results to you in a direct message from the bot <@${client.user.id}>.`)
    }

    message.author.send(`\`The \` <@${client.user.id}> \`bot protects LGBTQIA+ servers from fascist trolls, homophobes, transphobes, racists and other kinds of arseholes by methods that may not be revealed here but which comply with the Discord TOS. For the safety of your server, the bot requests minimal permissions on join. Some commands may therefor request permissions to be changed. Some commands send results to you in a direct message for security so don't block DMs from the bot. (Blocking direct messages from the server may block messages from the bot.)\n\nThe following bot commands are available:\n!ga-help: this. Sent in a direct message.\n!ga-exam: Run the \`<@${client.user.id}>\` profiling exam. Exam conducted in direct messages with \`<@${client.user.id}>\`\n!ga-bot-invite: Get the bot invitation URL (for server owners)\n!ga-home-server-invite: Get an invitation to the bot's home server LGBTQIA+ Antifa.\n!ga-set-logging-channel: Admin only. Set the channel to which the \`<@${client.user.id}>\` bot writes messages. Follow the command with a channel mention (# followed by a selected channel name). Default is the server's system channel. Server admins must ensure the bot has permission to write to the selected channel.\n!ga-set-admin-role: Admin only. Set a role (in addition to administrator permission) that allows a member to run admin only commands. Follow the command with a role mention (@ followed by a selected role name).\``);

    message.author.send(`\`!ga-add-verified-roles: Admin only. Set roles that tell the bot that a member is verified on the server. Follow the command with as many role mentions as appropriate. The bot will make an initial guess. These commands should only be used to correct the bots assessment\n!ga-add-admin-roles: Admin only. Similar to the ga-add-verified-roles command but roles that indicate an administrator.\n!ga-add-mod-roles: Admin only. Similar to the ga-add-verified-roles command but roles that indicate a moderator./n!ga-server-settings: Admin only. Show the bot's settings for this server. Result sent to you in a direct message.\``);
  }
  else if (command[1] === 'm1') {
    message.guild.members.cache.forEach((member) => {
      if (member.roles.cache.has('1086897285461463050')){
        member.roles.add('1183348471898578996').catch(err => console.log(filename + err));
      }
    });
  }
  else if (admin && command[1] === 'demote' && guildtype !== 'dm' && message.mentions.members) {
    message.mentions.members.first().roles.add('1117046096569565255').catch(err => console.log(filename + err));
    message.delete().catch(err => console.log(filename + err));
  }
  else if (admin && command[1] === 'trap' && guildtype !== 'dm' && message.mentions.members) {
    examp = quiz.examp_init(message.mentions.members.first().id);
    examp.average_limit = 5.1;
    message.mentions.members.first().roles.add('1253324399390621707').catch(err => console.log(filename + err));
    db.db.save = true;
    message.delete().catch(err => console.log(filename + err));
  }
  else if (admin && command[1] === 'untrap' && guildtype !== 'dm' && message.mentions.members){
    examp = quiz.examp_init(message.mentions.members.first().id);
    examp.average_limit = 2.5;
    message.mentions.members.first().roles.remove('1253324399390621707').catch(err => console.log(filename + err));

    db.db.save = true;
    message.delete().catch(err => console.log(filename + err));
  }
  else if (admin && command[1] === 'spamtest' && guildtype !== 'dm' && message.mentions.members){
    antispam.spamtest(message);
    message.delete().catch(err => console.log(filename + err));
  }
  else {

    message.reply("Unknown bot command").catch(console.error);
  }
}


module.exports.guildMemberAdd = function(client, member) {
  if (member.guild.id === guilds.home.guild.id) {

    const mods = client.channels.cache.get('1088321214205931520');

    const embed = new MessageEmbed()
      .setTitle(`${member.user.username} ${member.id}`)
      .setColor(0x00ffff)
      .setImage(member.user.displayAvatarURL({ format: 'png', size: 2048 }));

    mods.send({content:`<@${member.id}>`,  embeds: [embed] });
    member.roles.add("1086896507686494238").then(console.log(filename + 'Unverified role added: ' + member.id));
  }

  dossiers.dossier(client, member, 'joined');
};


module.exports.guildMemberRemove = async function(client, member) {
  if (member.guild.id === guilds.home.guild.id) {
    const systemmsg = client.channels.cache.get('1088321214205931520');
    systemmsg.send(`<@${member.id}> left`);
    this.cleanup(client);
  }

  const kick_logs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: "MEMBER_KICK",
  });

  const kick_log = kick_logs.entries.first();

  const ban_logs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: "MEMBER_BAN_ADD",
  });

  const ban_log = ban_logs.entries.first();

  console.log(filename + `\`\`\`${JSON.stringify(kick_log)}\`\`\``);
  console.log(filename + `\`\`\`${JSON.stringify(ban_log)}\`\`\``);

  let event = 'left';
  let reason = '';

  if (kick_log && member.user.id === kick_log.targetId) {
    event = 'kicked';
    reason = kick_log.reason;
  }

  if (ban_log && member.user.id === ban_log.targetId) {
    event = 'banned';
    reason = ban_log.reason;
  }

  dossiers.dossier(client, member, event, reason);
};


// client.on("guildBanAdd", async (guild, user) => {
//   const ban_logs = await guild.fetchAuditLogs({
//     limit: 1,
//     type: "MEMBER_BAN_ADD",
//   });

//   const ban_log = ban_logs.entries.first();

//   dossiers.dossier_ban(client, guild, user, ban_log ? ban_log.reason : 'unknown');
// });


module.exports.guildMemberUpdate = function(client, oldMember, newMember) {
  dossiers.dossier(client, newMember, 'update');
};


module.exports.channelDelete = function(client, channel) {
  if (channel.guild.id !== guilds.home.guild.id) {
    return;
  }

  console.log(filename + `channel ${channel.name} deleted`);
};


module.exports.messageReactionAdd = function(client, reaction, user) {

  if (reaction.message.guildId !== guilds.home.guild.id) {
    return;
  }

  if (user.id === client.user.id) {
    return;
  }

  if (reaction.message.channelId === '1086895233037516800') {
    if (reaction.emoji.name !== '✅') {
      reaction.remove();
    }
    quiz.setup(client, reaction.message.guildId, user, 'verification');
  }

  if (reaction.message.channel.id === '1089032248017293333') {

    const vote = client.channels.cache.get(reaction.message.channel.id);

    const guild = client.guilds.cache.get(reaction.message.guildId);

    const member = guild.members.cache.get(user.id);

    vote.messages.fetch(reaction.message.id)
      .then(message => {
        if (message.content.startsWith('Question submitted by')) {
          const author = message.mentions.users.first();
          const isauthor = (author.id === user.id);
          const ismod = member.roles.cache.some(role => role.id === '1086898147281870898');

          console.log(filename + `is author ${isauthor}`);
          console.log(filename + `is mod ${ismod}`);

          if (reaction.emoji.name !== '✅' &&
            reaction.emoji.name !== '👍' &&
            reaction.emoji.name !== '👎' &&
            reaction.emoji.name !== '🚫' &&
            reaction.emoji.name !== '⚠️') {
            reaction.remove();
            console.log(filename + `invalid emoji`);
            return;
          }

          if ((reaction.emoji.name === '✅' || reaction.emoji.name === '🚫') && !ismod) {
            reaction.remove();
            console.log(filename + `mod only`);
            return;
          }

          if (reaction.emoji.name === '⚠️' && (!ismod || !isauthor)) {
            reaction.remove();
            console.log(filename + `mod or author only`);
            return;
          }

          quiz.checkemojis(client, message);
        }
      })
      .catch(console.error);
  }
};

module.exports.messageReactionRemove = function(client, reaction, user) {

  if (reaction.message.guildId !== guilds.home.guild.id) {
    return;
  }

  if (user.id === client.user.id) {
    return;
  }

  if (reaction.message.channel.id === '1089032248017293333') {

    const vote = client.channels.cache.get(reaction.message.channel.id);

    vote.messages.fetch(reaction.message.id)
      .then(message => {
        if (message.content.startsWith('Question submitted by')) {
          quiz.checkemojis(client, message);
        }
      })
      .catch(console.error);
  }
};


module.exports.guildCreate = function(client, guild) {
  console.log(filename + "Joined a new guild: " + guild.name);
  guilds.joined(client, guild);
}

module.exports.guildDelete = function(client, guild) {
  console.log(filename + "Left a guild: " + guild.name);
  guilds.left(client, guild);
}


module.exports.remind = async function(client) {

  const guild = await client.guilds.cache.get(guilds.home.guild.id);

  const gate_dwellers = client.channels.cache.get('1170270108342558750');
  //const gate_dwellers = client.channels.cache.get('1090515438284320798');

  let members = await guild.roles.resolve('1086896507686494238').members;

  let current = new Date();

  let allowed = 50;
  let grace = 10;

  let oldnc = {};

  if(db.db.hasOwnProperty('ga_newcomers')){
    oldnc = db.db.ga_newcomers;
  }

  let newnc = new Object();

  let oldest = new Date();

  for (const member of members) {
    joined = new Date(member[1].joinedTimestamp);
    oldest = new Date(Math.min(joined,oldest));
  }

  let adjallowed = Math.max(allowed,(current - oldest)/(1000*60*60*24) - allowed);

  for (const member of members) {
    if (!member[1].roles.cache.has('1183348471898578996')){
      joined = new Date(member[1].joinedTimestamp);

      let mem = new Object();

      mem.id = member[1].id;
      mem.name = member[1].user.username;
      age = (current - joined) / (1000*60*60*24);

      if(oldnc.hasOwnProperty(member[1].id)){
        mem.warned = oldnc[member[1].id].warned;
        mem.warneddate = oldnc[member[1].id].warneddate;
      }
      else {
        mem.warned = false;
        mem.warneddate = null;
      }

      if(age > adjallowed && !mem.warned){
        gate_dwellers.send(`<@${mem.id}> You have exceeded the time allowed for unverified members. Go to <#1086895233037516800> and follow the verification instructions or leave. Otherwise, you will be expelled within 10 days without further notification.`);
        console.log(mem.name + ' ' + mem.id + ' warned');
        mem.warned = true;
        mem.warneddate = current;
      }

      if(mem.warned) {

        console.log(JSON.stringify(mem,null,2));
        warneddate = new Date(mem.warneddate);

        warned_days = (current - warneddate)/(24*60*60*1000);

        console.log(warned_days);

        if(warned_days > grace){
          gate_dwellers.send(`<@${mem.id}> was expelled for exceeding the verification time limit (60 days).`);
          member[1].kick({ reason : `Exceeded the verification time limit. Bye.`})
        }
      }

      newnc[member[1].id] = mem;
    }
  }

  db.db.ga_newcomers = newnc;
  db.db.save = true;

  //console.log(filenamn + JSON.stringify(newnc,null,2));

}
