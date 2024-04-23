//const Database = require("@replit/database");

const { MessageEmbed } = require('discord.js');

const fs = require('fs');

var automod = require('../jalendu/jautomod.js');

var dossiers = require('./dossiers.js');

var guilds = require('./guilds.js');

//const db = new Database();

const db = require('../common/text_database.js');

function reviver(key, value) {
  if (typeof value === "string" && key.includes('time')) {
    return new Date(value);
  }
  return value;
}

module.exports.scale = function(negative, positive) {
  negative = negative || 0;
  positive = positive || 0;

  result = new Object();

  if (Math.max(Math.abs(negative), positive) === 0) {
    result.number = 0;
  }
  else {
    result.number = (positive - Math.abs(negative)) / Math.max(Math.abs(negative), positive);
  }
  result.percent = 100 * result.number;
  result.round_percent = Math.round(result.percent);

  range = Math.round(10 * result.number) + 10;//(result.number>0 ? 10 : 9);


  str = '----------0----------';
  str = str.split('');
  str[range] = '*';
  str = str.join('');

  result.scale = str;

  return result;
}


module.exports.ga_questions = [];

module.exports.spectra = ["racist - unprejudiced", "homophobic - homofavorable", "transphobic - transfavorable", "bi-erasing - bi-affirming", "right-leaning - left-leaning", "conservative - progressive", "authoritarian - democratic", "capitalist - socialist", "totalitarian - anarchist", "nationalist - internationalist", "libertarian - communalist", "fascist - anti-fascist", "post-truth - pro-truth", "pro-violence - pacifist"];

const neutral = ["I don\'t know", "I prefer not to answer"];


module.exports.init = function(client) {
  db.get('ga_questions')
    .then(value => {
      if (value) {
        this.ga_questions = JSON.parse(value, reviver);
      }
      else {
        var fileContent = fs.readFileSync('./gadata/ga_questions.json');
        this.ga_questions = JSON.parse(fileContent);
      }
    })
    .catch(err => { console.log(err) });

  db.list().then(keys => {

    ct_exam = 0;
    ct_dossier = 0;

    for (i = 0; i < keys.length; i++) {
      if (keys[i].split('_')[0] === 'exam') {
        ct_exam = ct_exam + 1;
      }
      else if (keys[i].split('_')[0] === 'dossier') {
        ct_dossier = ct_dossier + 1;
      }
      else {
        console.log(keys[i]);
      }

      if (i === keys.length - 1) {
        console.log(`exam-* x ${ct_exam}`);
        console.log(`dossier-* x ${ct_dossier}`);
      }

      if (keys[i].split('_')[0] === 'exam') {
        //db.delete(keys[i]);
        db.get(keys[i]).then(value => {
          exam = JSON.parse(value, reviver);
          if (exam.userid) {
            age = (new Date() - exam.start_time) / (1000 * 60 * 60);
            if (age > 24) {
              key = `exam-${exam.mode}-${exam.userid}`;
              db.delete(key).catch(err => { console.log(err) });
              if (exam.mode === 'dm') {
                user = client.users.cache.get(exam.userid);
                if (user) {
                  user.send('Exam period expired. Enter !ga-exam to restart.')
                }
              }
            }
          }
        })
          .catch(err => { console.log(err) });
      }
    }
  });
}


module.exports.setup_channel = async function(guild, user) {

  let userchannel = guild.channels.cache.find(channel => channel.name === `exam-${user.id}`);

  if (userchannel) {
    //console.log(`exam-${user.id} already exists.`);
    return userchannel;
  }
  else {
    //console.log(`Creating exam-${user.id}.`);

    return await guild.channels.create(`exam-${user.id}`, {
      type: 'GUILD_TEXT',
      parent: '1087464585411436615',
      permissionOverwrites: [
        {
          id: guild.id,
          deny: 'VIEW_CHANNEL'
        },
        {
          id: user.id,
          allow: 'VIEW_CHANNEL'
        }
      ]
    });
  }
}


module.exports.qarray = function() {
  const qarray = new Array();

  for (i = 0; i < this.ga_questions.length; i++) {
    let q = new Object();

    q.index = i;
    q.random = Math.random();
    q.question = this.ga_questions[i].question;
    q.amap = [];

    for (j = 0; j < this.ga_questions[i].answers.length; j++) {
      let a = new Object();

      a.index = j;
      a.random = Math.random();
      q.amap[j] = a;
    }

    q.amap.sort((a, b) => a.random - b.random);

    for (k = 0; k < q.amap.length; k++) {
      q.amap[k].key = String.fromCharCode(65 + k);
    }

    qarray[i] = q;
  }

  qarray.sort((a, b) => a.random - b.random);

  return qarray;
}


module.exports.setup = async function(client, guildId, user, mode) {

  const mirror = await client.channels.cache.get('1124570586518126633');

  if (mode === 'verification') {
    guild = client.guilds.cache.get(guildId);
    userchannel = await this.setup_channel(guild, user);
    member = guild.members.cache.get(user.id);
    displayName = member.displayName;
  }
  else {
    userchannel = user;
    displayName = user.username;
  }

  const exam = new Object();

  exam.userid = user.id;
  exam.name = user.username;
  exam.mode = mode;
  exam.start_time = new Date();
  exam.channel = userchannel.id;
  exam.trapped = false;
  exam.qindex = 0;
  exam.score = 0;
  exam.penalties = 0;
  exam.positives = 0;
  exam.negatives = 0;
  exam.zeros = 0;
  exam.questions = 0;
  exam.question_limit = Math.min(40, this.ga_questions.length);
  exam.score_limit = 150;

  // if (user.username === 'marq_andrew') {
  //   exam.question_limit = 3;
  //   exam.score_limit = 15;
  // }

  if (automod.banned(displayName)) {
    exam.trapped = true;
    userchannel.send("`Banned character in your name`");
  }

  exam.qarray = this.qarray();

  exam.spectra = new Array();

  for (i = 0; i < this.spectra.length; i++) {
    exam.spectra[i] = new Object();
    exam.spectra[i].spectra = this.spectra[i];
    exam.spectra[i].positive = null;
    exam.spectra[i].negative = null;
  }


  db.get(`exam_${mode}_${user.id}`)
    .then(value => {
      examdb = JSON.parse(value, reviver);

      if (typeof examdb !== 'undefined' && examdb !== null) {

        if ((mode === 'dm' && examdb.questions < examdb.question_limit) || (mode === 'verification' && examdb.score < examdb.score_limit)) {

          if (mode === 'verification') {
            exam.score = examdb.score - 10;
            exam.penalties = examdb.penalties + 1;
          }
          else {
            exam.score = examdb.score;
            exam.penalties = examdb.penalties;
          }

          exam.positives = examdb.positives;
          exam.zeros = examdb.zeros;
          exam.negatives = examdb.negatives;
          exam.trapped = examdb.trapped;

          if (examdb.spectra) {
            exam.spectra = examdb.spectra;
          }

          exam.questions = 0;

          userchannel.send(`\`\`\`Reset (-10:${exam.score})\`\`\``).catch(err => console.log(err));

          if (mode === 'verification') {
            mirror.send(`\`\`\`${user.username} reset the exam (-10:${exam.score}}\`\`\``).catch(err => console.log(err));
          }
        }
        else {
          exam.trapped = examdb.trapped;
        }
      }
      else {
        examdb = new Object();
      }

      examdb = exam;

      db.set(`exam_${mode}_${user.id}`, JSON.stringify(examdb)).catch(err => console.log(err));

      //console.log(JSON.stringify(examdb, null, 2));

      this.ask(client, user, mode, examdb);

    })
    .catch(err => { console.log(err) });
}



module.exports.ask = async function(client, user, mode, examdb) {

  const mirror = await client.channels.cache.get('1124570586518126633');

  if (mode === 'verification') {
    channel = client.channels.cache.get(examdb.channel);
  }
  else {
    channel = user;
  }

  if (examdb.qindex === 0) {
    if (mode === 'verification') {
      channel.send(`\`\`\`Beginning questioning of ${user.username}.\n\n* You need ${examdb.score_limit} points to pass. Questioning will continue until your score exceeds ${examdb.score_limit}, 24 hours elapses or you leave the server.\n* Correct answers give a maximum of 5 points.\n* Incorrect or invalid answers subtract from your score. Other penalties may apply.\n* Questions are submitted, debated and approved by verified server members. As an unverified member, you accept their verdict without question.\`\`\``).catch(err => console.log(err));

      const embed = new MessageEmbed()
        .setColor(0x00ffff)
        .setDescription(`<@${user.id}> has started the verification exam.`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }));

      mirror.send({ embeds: [embed] }).catch(err => console.log(err));
    }
    else {
      channel.send(`\`\`\`Beginning questioning of ${user.username}.\n\n* You will be asked ${examdb.question_limit} questions. Answers have scores in the range -5 to 5. In addition there are penalties for invalid answers, restarting the exam and severe penalties for invalid answers that contain homophobic or racist language. Positive scores are typically inline with the truth and the values of LGBTQIA+ Antifa so if you conclude the exam with a score > ${examdb.score_limit}, you will get an invitation to the group. There you can contribute your own questions and debate or vote on other's contributions. Scores also contribute to a range of profile spectra that will be shown at the conclusion of the test. The test expires after 24 hours.\`\`\``).catch(err => console.log(err));
    }
  }
  else if (examdb.qindex === examdb.qarray.length) {
    channel.send(`\`\`\`You have been asked all of the questions. Questions will recycle.\`\`\``).catch(err => console.log(err));

    examdb.qindex = 0;

    examdb.qarray = this.qarray();

    db.set(`exam_${mode}_${user.id}`, JSON.stringify(examdb)).catch(err => console.log(err));
  }

  const question = this.ga_questions[examdb.qarray[examdb.qindex].index];

  let format = `QUESTION: ${question.question} (#${question.index})\n\n`;

  for (i = 0; i < question.answers.length; i++) {
    amap = examdb.qarray[examdb.qindex].amap[i];
    format = `${format} (${amap.key}) ${question.answers[amap.index].answer}\n`;
  }

  channel.send(`\`\`\`${format}\`\`\``).catch(err => console.log(err));

  mirror.send(`\`\`\`${user.username} was asked: ${question.question}\`\`\``).catch(err => console.log(err));
}


module.exports.answer = function(client, message, mode) {

  db.get(`exam_${mode}_${message.author.id}`)
    .then(value => {
      examdb = JSON.parse(value, reviver);
      //console.log(JSON.stringify(examdb, null, 2));

      const mirror = client.channels.cache.get('1124570586518126633');

      if (typeof examdb !== 'undefined' && examdb !== null) {

        const answer = message.content.trim()[0].toUpperCase();

        const qindex = examdb.qindex;

        const qmap = examdb.qarray[qindex];

        const index = qmap.index;

        const amap = qmap.amap;

        const amapi = amap.findIndex(a => a.key === answer);

        if (amapi === -1) {
          let score = -10;
          examdb.score = examdb.score + score;
          examdb.penalties = examdb.penalties + 1;
          message.channel.send(`\`\`\`Invalid answer (${score}:${examdb.score}). You must answer with just a, b, c, d etc. without brackets.\`\`\``).catch(err => console.log(err));

          mirror.send(`\`\`\`${message.author.username} gave an invalid answer (${score}:${examdb.score})\`\`\``).catch(err => console.log(err));

          const test = automod.gtest(message);

          if (test.type === 'homophobic language' || test.type === 'racist language') {
            let score = -100;
            examdb.score = examdb.score + score;
            examdb.penalties = examdb.penalties + 1;
            examdb.trapped = true;
            message.channel.send(`\`\`\`Answer included ${test.type} (${score}:${examdb.score})\`\`\``).catch(err => console.log(err));

            mirror.send(`\`\`\`${message.author.username}'s answer included ${test.type} (${score}:${examdb.score}). They are now trapped in the exam.\`\`\``).catch(err => console.log(err));

            message.delete();
          }
          else if (test.type !== 'none') {
            message.delete();
          }
        }
        else {
          const aindex = examdb.qarray[qindex].amap[amapi].index;

          const response = this.ga_questions[index].answers[aindex];

          let score = response.score;
          examdb.score = examdb.score + score;

          if (score === 0) {
            examdb.zeros = examdb.zeros + 1;
          }
          else if (score > 0) {
            examdb.positives = examdb.positives + 1;
          }
          else {
            examdb.negatives = examdb.negatives + 1;
          }

          if (response.entrap) {
            examdb.trapped = true;
          }

          if (score !== 0) {
            if (this.ga_questions[index].spectra) {
              for (s = 0; s < this.ga_questions[index].spectra.length; s++) {
                si = examdb.spectra.findIndex((element) => element.spectra === this.ga_questions[index].spectra[s]);

                if (si > -1) {
                  if (score > 0) {
                    examdb.spectra[si].positive = (examdb.spectra[si].positive || 0) + score;
                  }
                  else {
                    examdb.spectra[si].negative = (examdb.spectra[si].negative || 0) + score;
                  }
                }
              }
            }

            if (response.spectra) {
              for (s = 0; s < response.spectra.length; s++) {
                si = examdb.spectra.findIndex((element) => element.spectra === response.spectra[s]);

                if (this.ga_questions[index].spectra && this.ga_questions[index].spectra.findIndex((element) => element.spectra === response.spectra[s]) > -1) {
                  //if the spectra in the answer also exists in the question don't count it twice
                  si = -1;
                }

                if (si > -1) {
                  if (score > 0) {
                    examdb.spectra[si].positive = (examdb.spectra[si].positive || 0) + score;
                  }
                  else {
                    examdb.spectra[si].negative = (examdb.spectra[si].negative || 0) + score;
                  }
                }
              }
              //console.log(JSON.stringify(examdb.spectra, null, 2));
            }
          }

          if (mode === 'dm') {
            message.reply(`\`\`\`LGBTQIA+ Antifa opinion : ${response.reply}, score = ${score}:${examdb.score}\`\`\``).catch(err => console.log(err));
          }
          else {
            if (message.channel) {
              message.reply(`\`\`\`${response.reply} (${score}:${examdb.score})\`\`\``).catch(err => console.log(err));

              mirror.send(`\`\`\`${message.author.username} answered (${examdb.qarray[qindex].amap[amapi].key}): ${response.answer}\nResponse is ${response.reply} (${response.score}:${examdb.score}).\`\`\``).catch(err => console.log(err));
            }
          }
        }

        examdb.qindex = examdb.qindex + 1;

        examdb.questions = examdb.questions + 1;

        db.set(`exam_${mode}_${message.author.id}`, JSON.stringify(examdb)).catch(err => console.log(err));

        terminate = false;
        invite = false;

        if (mode === 'dm') {
          if (examdb.questions >= examdb.question_limit) {
            terminate = true;
            if (examdb.score >= examdb.score_limit) {
              invite = true;
            }
          }
        }
        else {
          if (examdb.score >= examdb.score_limit && !examdb.trapped) {
            terminate = true;
          }
        }

        if (terminate) {

          userid = message.author.id;

          spectra_results = '';
          for (s = 0; s < examdb.spectra.length; s++) {
            if (examdb.spectra[s].negative !== null || examdb.spectra[s].positive !== null) {
              spectra_results = `${examdb.spectra[s].spectra.padEnd(30)} : ${this.scale(examdb.spectra[s].negative, examdb.spectra[s].positive).scale}\n${spectra_results}`;
            }
          }

          if (mode === 'dm') {
            this.dm_terminate(client, mode, message, examdb);

            message.channel.send(`\`\`\`${message.author.username}'s spectra results from this test:\n${spectra_results}\`\`\``).catch(err => console.log(err));
          }
          else {
            this.verify(client, message, examdb);

            mirror.send(`\`\`\`Spectra results from this test:\n${spectra_results}\`\`\``).catch(err => console.log(err));
          }

          dossiers.spectra(client, message.author, examdb.spectra);

          db.delete(`exam-${mode}-${userid}`).catch(err => { console.log(err) });

          if (invite) {
            user.send(guilds.home.guild.invite).catch(err => console.log(err));
          }

          if (mode === 'verification') {
            message.channel.delete().catch(err => console.log(err));
          }
        }
        else {
          this.ask(client, message.author, mode, examdb);
        }
      }
    })
    .catch(err => { console.log(err) });
}


module.exports.dm_terminate = function(client, mode, message, examdb) {

  message.channel.send(`\`\`\`Congratulations. Exam complete. Your total score was ${examdb.score}\`\`\``).catch(err => console.log(err));
  message.channel.send(`\`\`\`+ve ${examdb.positives} -ve ${examdb.negatives} 0s ${examdb.zeros}\`\`\``).catch(err => console.log(err));

  // spectra_results = '';
  // for (s = 0; s < examdb.spectra.length; s++) {
  //   if (examdb.spectra[s].negative !== null || examdb.spectra[s].positive !== null) {
  //     spectra_results = `${examdb.spectra[s].spectra.padEnd(30)} : ${this.scale(examdb.spectra[s].negative, examdb.spectra[s].positive).scale}\n${spectra_results}`;
  //   }
  // }
  // message.channel.send(`\`\`\`Spectra results from this test:\n${spectra_results}\`\`\``).catch(err => console.log(err));

}


module.exports.verify = function(client, message, examdb) {
  verified = message.guild.roles.cache.find(rolen => rolen.id === '1086897285461463050');
  message.member.roles.add(verified);

  unverified = message.guild.roles.cache.find(rolen => rolen.id === '1086896507686494238');
  message.member.roles.remove(unverified);

  const result = `+ve ${examdb.positives} -ve ${examdb.negatives} 0s ${examdb.zeros}`;

  const welcome = client.channels.cache.get('1089313201151299605');

  const embed = new MessageEmbed()
    .setTitle(`Welcome ${message.author.username}`)
    .setColor(0x00ffff)
    .setDescription(`<@${message.author.id}>`)
    .addFields(
      { name: '`\u200B`', value: `${result}` },
      { name: '`\u200B`', value: 'Please read <#1089658127814770848>' }
    )
    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
  //.setImage(message.author.displayAvatarURL({ format: 'png', size: 1024 }));

  welcome.send({ embeds: [embed] }).catch(err => console.log(err));
}


module.exports.cleanup = function(client) {

}


// let editi = -1;
// let editq = {};

// Object.byString = function(o, s) {
//   s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
//   s = s.replace(/^\./, '');           // strip a leading dot
//   var a = s.split('.');
//   for (var i = 0, n = a.length; i < n; ++i) {
//     var k = a[i];
//     if (k in o) {
//       o = o[k];
//     }
//     else {
//       return;
//     }
//   }
//   return o;
// }




// module.exports.edit = function(client, message) {

//   if (message.content.startsWith('backup')) {
//     const bu = `ga_questions_${(new Date().toJSON().slice(0, 10))}.json`;
//     fs.writeFileSync(`./data/${bu}`, JSON.stringify(this.ga_questions, null, 2), 'utf-8');
//   }
//   else if (message.content.startsWith('recall')) {
//     qid = Number(message.content.split(' ')[1]);

//     editi = this.ga_questions.findIndex((element) => element.id === qid);

//     if (editi > -1) {
//       editq = this.ga_questions[editi];
//       message.reply(`\`\`\`${JSON.stringify(editq, null, 2)}\`\`\``)
//         .then(function(message) {
//         });
//     }
//     else {
//       message.reply(`Could not find question with id = ${qid}`);
//     }
//   }
//   else if (message.content.startsWith('spectra')) {
//     sids = message.content.split(' ')[1].slice(1);
//     message.reply(sids);
//   }
//   else if (message.content.startsWith('edit')) {
//     property = message.content.split(' ')[1];
//     attrib = Object.byString(editq, property);
//     message.reply(`\`\`\`${JSON.stringify(attrib, null, 2)}\`\`\``)
//   }
// }



module.exports.json = function(client, message) {

  if (message.content.startsWith('recall')) {
    index = Number(message.content.split(' ')[1]);

    recall_index = this.ga_questions.findIndex((element) => element.index === index);

    if (recall_index > -1) {
      editq = this.ga_questions[recall_index];
      editq.status = 'recalled';
      message.reply(`${JSON.stringify(editq, null, 2)}`)
        .then(function(message) {
          message.channel.send('Message recalled. Please do not change the "index" field otherwise there will be no way to replace it in the questions array and you might overwrite another question. Delete the index property completely if you want to create a new question.');
        });
    }
    else {
      message.reply(`Could not find question with index = ${index}`);
    }
  }
  else if (message.content.trim().startsWith('{') && message.content.trim().endsWith('}')) {

    var newq;

    var json = message.content
      .trim()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"');

    try {
      newq = JSON.parse(json, reviver);
    } catch (err) {
      message.reply(`\`\`\`Did you try to submit a question?\nYour JSON has syntax errors ("${err}")\nUse https://jsonformatter.curiousconcept.com to validate your syntax.\`\`\``).catch(err => console.log(err));
      return;
    }

    if (!newq.hasOwnProperty('question')) {
      message.reply(`\`\`\`Your question does not have a "question" property.\`\`\``).catch(err => console.log(err));
      return;
    }

    if (typeof newq.question !== "string" || newq.question.length < 10 || !newq.question.includes('?')) {
      message.reply(`\`\`\`The value of your "question" property must be a string of at least 10 characters and contain a question mark.\`\`\``).catch(err => console.log(err));
      return;
    }

    if (!newq.hasOwnProperty('answers')) {
      message.reply(`\`\`\`Your question does not have an "answers" property (an array of answer objects).\`\`\``).catch(err => console.log(err));
      return;
    }

    if (!Array.isArray(newq.answers) || newq.answers.length < 2) {
      message.reply(`\`\`\`The value of your "answers" property must be an array [] with at least 2 elements.\`\`\``).catch(err => console.log(err));
      return;
    }

    answers_have_spectra = true;
    answers_have_positives = false;
    answers_have_negatives = false;
    answers_have_zeros = false;

    for (i = 0; i < newq.answers.length; i++) {
      if (typeof newq.answers[i] !== "object") {
        message.reply(`\`\`\`The elements of the "answers" array must be objects {} (error in ${i + 1}).\`\`\``).catch(err => console.log(err));
        return;
      }

      if (!newq.answers[i].hasOwnProperty('answer')) {
        message.reply(`\`\`\`Each object in the "answers" array must have an "answer" property (error in ${i + 1}).\`\`\``).catch(err => console.log(err));
        return;
      }

      if (!newq.answers[i].hasOwnProperty('reply')) {
        message.reply(`\`\`\`Each object in the "answers" array must have a "reply" property (error in ${i + 1}).\`\`\``).catch(err => console.log(err));
        return;
      }

      if (!newq.answers[i].hasOwnProperty('score')) {
        message.reply(`\`\`\`Each object in the "answers" array must have a "score" property (error in ${i + 1}).\`\`\``).catch(err => console.log(err));
        return;
      }

      if (typeof newq.answers[i].answer != 'string') {
        message.reply(`\`\`\`Value of the "answer" property must be a string (error in ${i + 1}).\`\`\``).catch(err => console.log(err));
        return;
      }

      if (typeof newq.answers[i].reply != 'string') {
        message.reply(`\`\`\`Value of the "reply" property must be a string (error in ${i + 1}).\`\`\``).catch(err => console.log(err));
        return;
      }

      if (typeof newq.answers[i].score != 'number') {
        message.reply(`\`\`\`Value of the "score" property must be a number (error in ${i + 1}).\`\`\``).catch(err => console.log(err));
        return;
      }

      newq.answers[i].score = Math.min(5, Math.max(-5, newq.answers[i].score));

      if (newq.answers[i].hasOwnProperty('entrap') && typeof newq.answers[i].entrap != 'boolean') {
        message.reply(`\`\`\`Value of the "entrap" property must be a boolean (true/false) (error in ${i + 1}).\`\`\``).catch(err => console.log(err));
        return;
      }

      if (!newq.answers[i].hasOwnProperty('spectra') && newq.answers[i].score !== 0) {
        answers_have_spectra = false;
      }

      if (newq.answers[i].hasOwnProperty('spectra')) {
        if (newq.answers[i].score === 0) {
          delete newq.answers[i].spectra;
        }
        else if (!Array.isArray(newq.answers[i].spectra) || newq.answers[i].spectra.length < 1) {
          message.reply(`\`\`\`The value of your "spectra" property in answer ${i + 1} must be an array [] with at least 1 element.\`\`\``).catch(err => console.log(err));
          return;
        }
        else {
          for (s = 0; s < newq.answers[i].spectra.length; s++) {
            if (!this.spectra.includes(newq.answers[i].spectra[s])) {
              message.reply(`\`\`\`The element "${newq.answers[i].spectra[s]}" of your "spectra" array in answer ${i + 1} is not a valid spectrum: ${this.spectra}\`\`\``).catch(err => console.log(err));
              return;
            }
          }
        }
      }

      if (newq.answers[i].score === 0) {
        answers_have_zeros = true;
      }
      else if (newq.answers[i].score > 0) {
        answers_have_positives = true;
      }
      else if (newq.answers[i].score < 0) {
        answers_have_negatives = true;
      }
    }

    if (!newq.hasOwnProperty('spectra') && !answers_have_spectra) {
      message.reply(`\`Your question must either have a global "spectra" property at question level or a "spectra" property for each non-zero answer. A "spectra" property is an array property of the form\n"spectra" : ${JSON.stringify(this.spectra, null, 2)}\n(include one or more of the valid spectra). You can have a global "spectra" property at question level and more specific "spectra" properties on some answers.\``).catch(err => console.log(err));
      return;
    }

    if (newq.hasOwnProperty('spectra')) {
      if (!Array.isArray(newq.spectra) || newq.spectra.length < 1) {
        message.reply(`\`\`\`The value of your global "spectra" property must be an array [] with at least 1 element.\`\`\``).catch(err => console.log(err));
        return;
      }
      else {
        for (s = 0; s < newq.spectra.length; s++) {
          if (!this.spectra.includes(newq.spectra[s])) {
            message.reply(`\`\`\`The element "${newq.spectra[s]}" of your global "spectra" property is not a valid spectrum: ${this.spectra}\`\`\``).catch(err => console.log(err));
            return;
          }
        }
      }
    }


    if (!answers_have_positives) {
      message.reply(`\`\`\`Your question must have at least one positive score answer. At least one positive, one negative and one zero (e.g. I don't know) score answer is recommended.\`\`\``).catch(err => console.log(err));
      return;
    }

    if (!(newq.hasOwnProperty('status') && newq.status === 'valid')) {
      if (!answers_have_negatives || !answers_have_zeros) {
        message.reply(`\`\`\`At least one positive, one negative and one zero (e.g. I don't know) score answer is recommended but there may be cases where that isn't approprate. To override this error, add a property "status" : "valid" to the question level of your question.\`\`\``).catch(err => console.log(err));
        return;
      }
    }

    if (newq.hasOwnProperty('status') && newq.status === 'recalled') {
      message.reply(`\`Your question has a correct form but the property "status" is set to "recalled" preventing its submission so that you had time to edit it. Remove the property or set its value to "valid" and resubmit when you have your final version.\``);
      return;
    }

    message.reply(`Your question has been submitted to <#1089032248017293333>\n\`\`\`${JSON.stringify(newq, null, 2)}\`\`\``).catch(err => console.log(err));

    const vote = client.channels.cache.get('1089032248017293333');

    vote.send(`Question submitted by <@${message.author.id}> [🔥]\n\`\`\`${JSON.stringify(newq, null, 2)}\`\`\``)
      .then(function(message) {
        message.react('👍');
        message.react('👎');
        message.react('✅');
        message.react('🚫');
        message.react('⚠️');
      }).catch(err => console.log(err));
  }
}


module.exports.checkemojis = function(client, message) {
  const istatus = message.content.split(/[\[\]]+/)[1];

  let score = 0;
  let approved = 0;
  let rejected = 0;
  let suspended = 0;

  let dbadd = false;

  //there is something wrong

  //console.log(message.reactions);

  if (message.reactions) {
    message.reactions.cache.each(async (reaction) => {
      if (reaction.emoji.name === '✅') approved = (reaction.count - 1);
      else if (reaction.emoji.name === '👍') score = score + (reaction.count - 1);
      else if (reaction.emoji.name === '👎') score = score - (reaction.count - 1);
      else if (reaction.emoji.name === '🚫') rejected = (reaction.count - 1);
      else if (reaction.emoji.name === '⚠️') suspended = (reaction.count - 1);
    });
  }

  let ostatus = istatus;

  if (istatus === '🔥') {
    if (approved) {
      ostatus = '✅';
      dbadd = true;
    }
    if (rejected) {
      ostatus = '🚫';
    }
    else if (suspended) {
      ostatus = '⚠️';
    }
    else if (score >= 5) {
      ostatus = '✅';
      dbadd = true;
    }
  }
  else if (istatus === '✅') {
  }
  else if (istatus === '🚫') {
    if (!rejected) {
      if (approved) {
        ostatus = '✅';
        dbadd = true;
      }
      else if (suspended) {
        ostatus = '⚠️';
      }
      else if (score >= 5) {
        ostatus = '✅';
        dbadd = true;
      }
      else {
        ostatus = '🔥';
      }
    }
  }
  else if (istatus === '⚠️') {
    if (!suspended) {
      if (approved) {
        ostatus = '✅';
        dbadd = true;
      }
      else if (rejected) {
        ostatus = '🚫';
      }
      else if (score >= 5) {
        ostatus = '✅';
        dbadd = true;
      }
      else {
        ostatus = '🔥';
      }
    }
  }

  message.edit(message.content.replace(`[${istatus}]`, `[${ostatus}]`)).catch(err => console.log(err));

  if (dbadd) {
    const newq = JSON.parse(message.content.split("`")[3]);

    if (!newq.hasOwnProperty('author')) {
      newq.author = message.mentions.users.first().id;
    }

    if (!newq.hasOwnProperty('status')) {
      newq.status = 'active';
    }
    else if (newq.status !== 'deleted') {
      newq.status = 'active';
    }

    if (newq.hasOwnProperty('index') && this.ga_questions[newq.index]) {
      this.ga_questions[newq.index] = newq;
      //console.log('replaced');
    }
    else {
      newq.index = this.ga_questions.length;
      this.ga_questions[newq.index] = newq;
      //console.log('added');
    }

    db.set('ga_questions', JSON.stringify(this.ga_questions))
      .then(() => {
      })
      .catch(err => {
        console.log(err);
      });

    const bu = `ga_questions_${(new Date().toJSON().slice(0, 10))}.json`;

    fs.writeFileSync(`./data/${bu}`, JSON.stringify(this.ga_questions, null, 2), 'utf-8');

    fs.writeFileSync(`./data/ga_questions.json`, JSON.stringify(this.ga_questions, null, 2), 'utf-8');

  }
}



module.exports.mirror = async function(client, message) {

  const mirror = await client.channels.cache.get('1124570586518126633');

  // console.log(message.author.id);
  // console.log(client.user.id);
  // console.log(message.author.id === client.user.id);

  const userid = message.channel.name.substring(5);

  const user = client.users.cache.get(userid);

  if (message.author.id === client.user.id) {

    if (message.content.startsWith('```Beginning questioning of')) {
      // const embed = new MessageEmbed()
      //   .setColor(0x00ffff)
      //   .setDescription(`<@${user.id}> has started the verification exam.`)
      //   .setThumbnail(user.displayAvatarURL({ dynamic: true }));

      // mirror.send({ embeds: [embed] }).catch(err => console.log(err));
    }
    else if
      (message.content.startsWith('```QUESTION:')) {
      // mirror.send(`\`\`\`${user.username} was asked: ${message.content.split('\n')[0].substring(13)}\`\`\``).catch(err => console.log(err));
    }
  }
}
//var firstLine = theString.split('\n')[0];.