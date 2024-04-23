const fs = require('fs');

const db = require('../common/text_database.js');

const { MessageAttachment, MessageEmbed } = require('discord.js');

var path = require('path');

var filename = path.basename(__filename) + ': ';
var filenamn = filename + '/n';


module.exports.qotds = {};
module.exports.qotd_activity = {};
module.exports.qotd_scores = {};


function reviver(key, value) {
  if (typeof value === "string" && key.includes('time')) {
    return new Date(value);
  }
  return value;
}


module.exports.save = function() {
  db.set('qotds', JSON.stringify(this.qotds, null, 2))
    .then(() => { })
    .catch(err => { console.log(filename + err) });
}


module.exports.send = async function(message, index, attach = true) {
  let q = '```';

  if (this.qotds.questions[index].attachment && attach) {
    const question = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle(`#${this.qotds.questions[index].id}`)
      .setImage(`${this.qotds.questions[index].attachment}`)
      .addField('\u200B', `${q}${this.qotds.questions[index].question}${q}`, false);

    message.channel.send({ embeds: [question] });
  }
  else {
    const question = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle(`#${this.qotds.questions[index].id}`)
      .addField('\u200B', `${q}${this.qotds.questions[index].question}${q}`);

    message.channel.send({ embeds: [question] });
  }
}


Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}


module.exports.qotd = async function(message, mod = true, admin = true) {

  function perm(adder) {
    return (mod || admin || adder === message.author.username);
  }

  function foruser() {
    if (admin || mod) {
      return '';
    }
    else {
      return ` for ${message.author.username}`;
    }
  }

  var command, args, words, id, index;

  if (typeof message === 'object') {
    words = message.content.replace(/[#\[\]]/g, '').split(' ');
    command = words[1].toLowerCase();
    id = words[2];
    args = words.slice(2).join(' ');
  }
  else {
    words = message.split(' ');
    command = words[0].toLowerCase();
    id = words[1];
    args = words.slice(1).join(' ');
  }

  let q = '```';

  switch (command) {
    case 'init':
      if (admin) {
        db.get('qotds')
          .then(value => {
            this.qotds = JSON.parse(value, reviver);
          })
          .catch(err => { console.log(filename + err) });

        db.get('qotd_activity')
          .then(value => {
            this.qotd_activity = JSON.parse(value, reviver);
          })
          .catch(err => { console.log(filename + err) });

        db.get('qotd_scores')
          .then(value => {
            this.qotd_scores = JSON.parse(value, reviver);
          })
          .catch(err => { console.log(filename + err) });
      }
      break;
    case 'save':
      if (admin) {
        this.save();
      }
      break;
    case 'bump':
      index = this.qotds.questions.findIndex((o, i) => {
        if (o.id == id && perm(this.qotds.questions[i].addedby)) {
          return true;
        }
      });
      if (!index) {
        message.reply(`Question ${id} wasn't found${foruser()}.`);
      }
      else {
        this.qotds.questions[index].bump = (this.qotds.questions[index].bump || 0) + 1;
        this.qotds.questions[index].random = Math.random() - (this.qotds.questions[index].bump || 0) / 10;
        this.qotds.questions.sort((a, b) => a.random - b.random);
        this.save();
      }
      break;
    case 'start':
      if (mod) {
        this.qotds.active = true;
        this.qotds.channelid = message.channel.id;
        const now = new Date();
        if (isNaN(id)) {
          this.qotds.starttime = now;
        }
        else {
          this.qotds.starttime = now.addDays(Number(id));
        }
        this.qotds.lastasktime = null;
        this.save();
        this.ask(message.client);
      }
      break;
    case 'stop':
      if (mod) {
        this.qotds.active = false;
        this.save();
      }
      break;
    case 'fromjsonxxx':
      if (admin) {
        var fileContent = fs.readFileSync('./data/qotds.json');
        this.qotds = JSON.parse(fileContent);
        this.save();
      }
      break;
    case 'tojson':
      if (admin) {
        try {
          fs.writeFileSync('./data/qotds.json', JSON.stringify(this.qotds, null, 2), 'utf-8');
          fs.writeFileSync('./data/qotd_activity.json', JSON.stringify(this.qotd_activity, null, 2), 'utf-8');
          fs.writeFileSync('./data/qotd_scores.json', JSON.stringify(this.qotd_scores, null, 2), 'utf-8');
        }
        catch (err) {
          console.log(filename + err);
        }
      }
      break;
    case 'list':
      if (!args) {
        var reply = '';
        var found = 0;
        for (i = 0; i < this.qotds.questions.length; i++) {
          if (this.qotds.questions[i].status !== 'deleted' && perm(this.qotds.questions[i].addedby)) {
            found = found + 1;
            let item = `#${this.qotds.questions[i].id} ${q}${this.qotds.questions[i].question}${q}`;
            if (this.qotds.questions[i].attachment) {
              item = item + '+ image. ';
            }
            item = item + `(**${this.qotds.questions[i].status}**)\n`;
            if ((`${reply}\n${item}`).length > 2000) {
              message.channel.send(reply);
              reply = '\u200B';
            }
            reply = `${reply}\n${item}`;
          }
        }
        if (reply) {
          message.channel.send(reply);
        }
        if (found === 0) {
          message.reply(`No questions found${foruser()}.`);
        }
      }
      else {
        const list = this.qotds.questions.find((o, i) => {
          if (o.id == args && o.status !== 'deleted' && perm(this.qotds.questions[i].addedby)) {
            this.send(message, i);
            return true;
          }
        });
        if (!list) {
          message.reply(`Question ${id} wasn't found${foruser()}.`);
        }
      }
      break;
    case 'find':
      var found = 0;
      for (var i = 0; i < this.qotds.questions.length; i++) {
        if (this.qotds.questions[i].question.includes(args) && this.qotds.questions[i].status !== 'deleted' && perm(this.qotds.questions[i].addedby)) {
          found = found + 1;
          await this.send(message, i);
        }
      }
      if (found === 0) {
        message.reply(`No questions found including "${args}"${foruser()}.`);
      }
      break;
    case 'deleted':
      var found = 0;
      for (var i = 0; i < this.qotds.questions.length; i++) {
        if (this.qotds.questions[i].status === 'deleted' && perm(this.qotds.questions[i].addedby)) {
          found = found + 1;
          await this.send(message, i);
        }
      }
      if (found === 0) {
        message.reply(`No deleted questions found.`);
      }
      break;
    case 'review':
      if (mod) {
        var found = 0;
        for (var i = 0; i < this.qotds.questions.length; i++) {
          if (this.qotds.questions[i].status === 'submitted') {
            found = found + 1;
            await this.send(message, i);
          }
        }
        if (found === 0) {
          message.reply(`No questions require review.`);
        }
      }
      break;
    case 'add':
      q = new Object();
      q.id = this.qotds.nextid;
      this.qotds.nextid = this.qotds.nextid + 1;
      q.question = args;
      q.asked = 0;
      q.replies = 0;
      q.addedby = message.author.username;
      q.status = 'submitted';
      q.reviewedby = null;
      q.askedtime = null;
      q.random = Math.random();
      if (message.attachments.size) {
        q.attachment = message.attachments.first().url;
      }
      index = this.qotds.questions.push(q) - 1;
      await this.send(message, index, true);
      message.channel.send('Thanks for adding a question. Enter /qo help for instructions on how to edit your question.');

      this.qotds.questions.sort((a, b) => a.random - b.random);
      this.save();
      break;
    case 'delete':
      index = this.qotds.questions.findIndex((o) => {
        if (o.id == id && perm(this.qotds.questions[i].addedby)) {
          return true;
        }
      });
      if (index > -1) {
        this.qotds.questions[index].status = 'deleted';
        this.save();
        message.reply(`Question ${id} deleted.`);
      }
      else {
        message.reply(`Question ${id} wasn't found.`);
      }
      break;
    case 'undelete':
      index = this.qotds.questions.findIndex((o, i) => {
        if (o.id == id && o.status === 'deleted' && perm(this.qotds.questions[i].addedby)) {
          return true;
        }
      });
      if (index > -1) {
        this.qotds.questions[index].status = 'submitted';
        this.save();
        message.reply(`Question ${id} undeleted.`);
      }
      else {
        message.reply(`Deleted question ${id} wasn't found.`);
      }
      break;
    case 'edit':
      const edit = words.slice(3).join(' ');
      index = this.qotds.questions.findIndex((o) => {
        if (o.id == id && perm(o.addedby)) {
          return true;
        }
      });
      if (index > -1) {
        this.qotds.questions[index].question = edit;
        this.qotds.questions[index].status = 'submitted';
        if (message.attachments.size) {
          this.qotds.questions[index].attachment = message.attachments.first().url;
        }
        this.save();
        this.send(message, index);
      }
      else {
        message.reply(`Question ${id} wasn't found${foruser()}.`);
      }
      break;
    case 'attach':
      const url = words.slice(3).join(' ');
      index = this.qotds.questions.findIndex((o) => {
        if (o.id == id && perm(o.addedby)) {
          return true;
        }
      });
      if (index > -1) {
        if (message.attachments.size) {
          this.qotds.questions[index].attachment = message.attachments.first().url;
          this.send(message, index);
          this.save();
        }
        else {
          message.reply(`Nothing to attach.`);
        }
      }
      else {
        message.reply(`Question ${id} wasn't found${foruser()}.`);
      }
      break;
    case 'detach':
      index = this.qotds.questions.findIndex((o) => {
        if (o.id == id && perm(o.addedby)) {
          return true;
        }
      });
      if (index > -1) {
        if (this.qotds.questions[index].attachment) {
          delete this.qotds.questions[index].attachment;
          this.send(message, index);
          this.save();
        }
        else {
          message.reply(`Nothing to detach.`);
        }
      }
      else {
        message.reply(`Question ${id} wasn't found${foruser()}.`);
      }
      break;
    case 'approve':
      if (mod) {
        if (id === 'all') {
          let found = 0;
          for (i = 0; i < this.qotds.questions.length; i++) {
            if (this.qotds.questions[i].status === 'submitted') {
              this.qotds.questions[i].status = 'approved';
              found = found + 1;
              this.qotds.questions[i].reviewedby = message.author.username;
            };
          }
          if (found > 0) {
            message.reply(`${found} questions approved.`);
            this.save();
          }
          else {
            message.reply(`No questions required approval.`);
          }
        }
        else {
          index = this.qotds.questions.findIndex((o) => {
            if (o.id == id) {
              return true;
            }
          });
          if (index > -1) {
            this.qotds.questions[index].status = 'approved';
            this.qotds.questions[index].reviewedby = message.author.username;
            this.save();
            message.reply(`Question ${id} approved.`);
          }
          else {
            message.reply(`Question ${id} wasn't found.`);
          }
        }
      }
      break;
    case 'reject':
      if (mod) {
        index = this.qotds.questions.findIndex((o) => {
          if (o.id == id) {
            return true;
          }
        });
        if (index > -1) {
          this.qotds.questions[index].status = 'rejected';
          this.qotds.questions[index].reviewedby = message.author.username;
          this.save();
          message.reply(`Question ${id} rejected.`);
        }
        else {
          message.reply(`Question ${id} wasn't found.`);
        }
      }
      break;
    case 'randomise':
      if (mod) {
        for (i = 0; i < this.qotds.questions.length; i++) {
          if (args === 'clean') {
            this.qotds.questions[i].bump = 0;
          }
          this.qotds.questions[i].random = Math.random() - (this.qotds.questions[i].bump || 0) / 10;
        }
        this.qotds.questions.sort((a, b) => a.random - b.random);
        this.save();
      }
      break;
    case 'status':
      reply = '';
      var counts = new Object();
      var asked = 0;
      for (i = 0; i < this.qotds.questions.length; i++) {
        counts['total questions'] = (counts['total questions'] || 0) + 1;
        counts[this.qotds.questions[i].status] = (counts[this.qotds.questions[i].status] || 0) + 1;
        if (this.qotds.questions[i].asked === this.qotds.maxasked) {
          asked = asked + 1;
        }
      }
      reply = 'status of questions system\n--------------------------\n';
      for (const [key, value] of Object.entries(counts)) {
        reply = reply + `\n${key.padEnd(20)}: ${String(value).padStart(5)}`;
      }
      reply = reply + `\n\n${'asked'.padEnd(20)}: ${String(asked).padStart(5)} ${(asked / counts['approved']).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}`;

      const currenttime = new Date();
      const lastasktime = new Date(this.qotds.lastasktime || 0);
      const starttime = new Date(this.qotds.starttime);

      nextasktime = new Date(Math.max(starttime, lastasktime.addDays(this.qotds.intervaldays)));

      countdown = (nextasktime - currenttime) / (1000 * 60 * 60 * 24);

      reply = `${reply}\n\n${('current UTC time').padEnd(20)}: ${currenttime.toUTCString()}`;
      reply = `${reply}\n${('start time').padEnd(20)}: ${starttime.toUTCString()}`;
      reply = `${reply}\n${('last time asked').padEnd(20)}: ${lastasktime.toUTCString()}`;
      reply = `${reply}\n${('next question').padEnd(20)}: ${nextasktime.toUTCString()}`;
      reply = `${reply}\n${('days to go').padEnd(20)}: ${countdown}`;

      message.reply('```' + reply + '```');

      break;
    case 'reset':
      if (mod) {
        this.qotds.maxasked = this.qotds.maxasked + 1;
        this.save();
      }
      break;
    case 'resetxxx':
      if (admin) {
        for (i = 0; i < this.qotds.questions.length; i++) {
          this.qotds.questions[i].asked = 0;
        }
        this.qotds.maxasked = 1;
        this.qotds.lastasktime = null;
        this.save();
      }
      break;
    case 'deletexxx':
      if (admin) {
        for (i = this.qotds.questions.length - 1; i > 0; i--) {
          if (this.qotds.questions[i].status === 'deleted') {
            this.qotds.questions.splice(i, 1);
          }
        }
        this.save();
      }
      break;
    case 'ask':
      if (admin) {
        index = this.qotds.questions.findIndex((o) => {
          if (o.asked < this.qotds.maxasked && o.status === 'approved') {
            return true;
          }
        });
        if (index === -1) {
          console.log(filename + 'qotd has run out of questions');
        }
        else {
          this.qotds.questions[index].asked = this.qotds.maxasked;
          this.save();
          this.send(message, index);
        }
      }
      break;
    case 'help':
      var fileContent = await fs.readFileSync('./data/qotd-help.json');
      help = await JSON.parse(fileContent);
      await message.channel.send(help.pream);
      await message.channel.send('\u200B\n' + help.users1);
      await message.channel.send('\u200B\n' + help.users2);
      if (mod && help.mods != '') {
        await message.channel.send('\u200B\n' + help.mods);
      }
      if (admin && help.mods != '') {
        await message.channel.send('\u200B\n' + help.admin);
      }
      await message.channel.send('\u200B\n(This it the bottom of the instructions. Scroll up to read from the top.)');
      break;
    default:
      if (typeof message === 'object') {
        message.reply(`qotd unknown command ${command}`);
      }
  }
}


module.exports.replies = function(message, event) {
  if (!this.qotd_activity) {
    this.qotd_activity = new Object();
  }

  if (event === 'question' || (event === 'reply' && !message.author.bot && message.reference && this.qotd_activity[message.reference.messageId])) {
    act = new Object();
    act.type = event;
    act.user = message.author.id;
    act.name = message.author.username;
    act.time = new Date();

    this.qotd_activity[message.id] = act;

    var currentdate = new Date();

    for (let [id, value] of Object.entries(this.qotd_activity)) {
      if (currentdate - value.time > 1 * 24 * 60 * 60 * 1000) {
        delete this.qotd_activity[id];
      }
    }

    db.set('qotd_activity', JSON.stringify(this.qotd_activity))
      .then(() => { })
      .catch(err => { console.log(filename + err) });


    if (event === 'reply') {
      if (!this.qotd_scores) {
        this.qotd_scores = new Object();
      }

      if (this.qotd_scores[message.author.id]) {
        this.qotd_scores[message.author.id].replies = this.qotd_scores[message.author.id].replies + 1;
      }
      else {
        scr = new Object();
        scr.replies = 1;
        this.qotd_scores[message.author.id] = scr;
      }

      db.set('qotd_scores', JSON.stringify(this.qotd_scores))
        .then(() => { })
        .catch(err => { console.log(filename + err) });
    }
  }
}


module.exports.question = async function(channel, index, attach=true) {

  let q = '```';

  if (this.qotds.questions[index].attachment && attach) {
    const question = new MessageEmbed()
      .setColor('RANDOM')
      .setDescription(`Question of the Week <@&897259252031291464>`)
      .setImage(`${this.qotds.questions[index].attachment}`)
      .addField('\u200B', `${q}${this.qotds.questions[index].question}${q}`, false);

    channel.send({ embeds: [question] }).then(sent => {
      this.qotds.questions[index].messageid = sent.id;
      this.save();
      this.replies(sent, 'question');
    });
  }
  else {
    const question = new MessageEmbed()
      .setColor('RANDOM')
      .setDescription(`Question of the Week <@&897259252031291464>`)
      .addField('\u200B', `${q}${this.qotds.questions[index].question}${q}`);

    channel.send({ embeds: [question] }).then(sent => {
      this.qotds.questions[index].messageid = sent.id;
      this.save();
      this.replies(sent, 'question');
    });
  }
}

module.exports.remind = async function(channel) {
  channel.send('There will be a new question of the week in 2 days. If you want to add a question or topic for discussion to the list, please send ```/qo add [your question]``` in a direct message to @jalendu.');
}


module.exports.ask = async function(client, force = false, test = false) {

  var channeld;

  if (test) {
    channelid = '871627629831290920';
  }
  else {
    channelid = this.qotds.channelid;
  }

  client.channels.fetch(channelid)
    .then(channel => {
      if (this.qotds.active || force) {
        const currenttime = new Date();
        const lastasktime = new Date(this.qotds.lastasktime || 0);
        const starttime = new Date(this.qotds.starttime);

        nextasktime = new Date(Math.max(starttime, lastasktime.addDays(this.qotds.intervaldays)));

        countdown = (nextasktime - currenttime) / (1000 * 60 * 60 * 24);
        console.log(filename + `qotd countdown days ${countdown}`);

        this.qotds.reminded = (this.qotds.reminded || false);

        if (countdown < 2 && !this.qotds.reminded) {
          this.remind(channel);
          this.qotds.reminded = true;
                this.save();
        }

        if (countdown < 0 || force) {
          const index = this.qotds.questions.findIndex((o) => {
            if (o.asked < this.qotds.maxasked && o.status === 'approved') {
              return true;
            }
          });
          if (index === -1) {
            console.log(filename + 'qotd has run out of questions');
          }
          else {
            this.qotds.questions[index].asked = this.qotds.maxasked;
            this.qotds.questions[index].askedtime = currenttime;
            this.qotds.lastasktime = currenttime;
            this.qotds.reminded = false;

            this.question(channel, index);
          }
        }
      }
      else {
        console.log(filename + 'qotd is inactive');
      }
    });
}






