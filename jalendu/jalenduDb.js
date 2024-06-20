const pg = require('pg');
const table = require('text-table');

var jautomod = require('./jautomod.js');

module.exports.setup = function() {

  const arpquuxb = process.env['arpquuxb'];

  const jalendu = new pg.Client({
    user: 'marqw',
    host: '127.0.0.1',
    database: 'marqw',
    port: 5432,
  });

  jalendu.connect();

  let sql = 'create table if not exists dms (dm varchar, count int);';
  //console.log("sql1=" + sql);

  jalendu.query(sql)
  .catch(err => { console.error(err); })
  ;

  sql = 'create table if not exists intents (expression varchar, intent varchar, parms varchar);';
  //console.log("sql2=" + sql);

  jalendu.query(sql)
  .catch(err => { console.error(err); })
  ;

  sql = 'create table if not exists replies ' +
  '(context varchar, intent varchar, reply varchar, context_out varchar);';
   //console.log("sql3=" + sql);

  jalendu.query(sql)
  .catch(err => { console.error(err); })
  ;

  sql = 'create table if not exists users ' +
  '(username varchar, contexts varchar, blocked varchar, updated timestamptz, botintro boolean);';
   //console.log("sql4=" + sql);

  jalendu.query(sql)
  .catch(err => { console.error(err); })
  ;


  return jalendu;
}



module.exports.message = function(client, jalendu, message) {

  if (message.author.bot) {
    return;
  }

  message.reply(`You are a newcomer to Gay+ Men Meditating. That means that you don't have full access to the server until ` +
        `you are verified. Please go to <#851056727419256902> and follow the instructions there.`);

  return;


  var msglc = message.content.trim().toLowerCase().replace(/<[@#!&](.*?)>/g, '');

  if (msglc == '' || message.author.bot) {
    return;
  }


  const automod = jautomod.test(jautomod.msglc(message));

  if ((Date.now() - message.author.createdAt) / (24 * 60 * 60 * 1000) < 56) {
    automod.selfie = "required"
  }
  else {
    automod.selfie = "not-required";
  }


  //console.log(JSON.stringify(automod, null, 2));

  const username = message.author.username;

  const guild = client.guilds.cache.get('827888294100074516');

  const marq = message.client.users.cache.get('679465390841135126');

  const member = guild.members.cache.get(message.author.id);

  const mods = guild.channels.cache.get('871628022388764672');
  const dels = guild.channels.cache.get('871628022388764672');
  //const mods = guild.channels.cache.get('827889605994872863');
  //const dels = guild.channels.cache.get('874900065142046720');

  const newcomer = member.roles.cache.has('851071523543973928'); 
  const verified = member.roles.cache.has('836590097318019092');

  console.log(`newcomer ${newcomer}`);

  const d = new Date();

  const time = d.toLocaleTimeString();
  const UTC = d.toUTCString();

  let contexts = ['*'];

  let blocked = 'N';

  const now = new Date();

  let updated = new Date();

  let botintro = false;

  sql = `select * from users where username = '${username}';`;
  //console.log("sql5=" + sql);

  jalendu.query(sql, function(error, results) {
    if (error) { console.log(error); }
    else if (results.rowCount > 0) {
      contexts = JSON.parse(results.rows[0].contexts);
      blocked = results.rows[0].blocked;
      updated = new Date(results.rows[0].updated);
      botintro = results.rows[0].botintro;

      ctprofanity = results.rows[0].profanity + (automod.type === 'profanity') ? 1 : 0;
      ctracism = results.rows[0].racism + (automod.type === 'racist language') ? 1 : 0;
      cthomophobia = results.rows[0].homophobia + (automod.type === 'homophobic language') ? 1 : 0;
      ctverify = results.rows[0].verify + (automod.type === 'verify') ? 1 : 0;
      ctselfie = results.rows[0].selfie;
    }
    else {
      sql = 'insert into users (username, contexts, blocked, updated, botintro, profanity, racism, homophobia, verify, selfie) ' +
      `values ('${username}', '${JSON.stringify(contexts)}' ,'${blocked}', to_timestamp(${Date.now()} / 1000.0), false,` +
      (automod.type === 'profanity') ? '1' : '0' + ',' + (automod.type === 'racist language') ? '1' : '0' + ',' + 
      (automod.type === 'homophobic language') ? '1' : '0' + ',' + (automod.type === 'verify') ? '1' : '0' + ', 0);';
      console.log("sql6=" + sql);
      jalendu.query(sql, function(error) {
        if (error) { console.log(error); }
      });
    }

    if (blocked === 'Y') {
      if ((now - updated) > (1 * 60 * 60 * 1000)) {
        blocked = 'N';
      }
      else {
        return;
      }
    }


    let reply = '';


    console.log(`newcomer ${newcomer}`);


    if(!verified && !newcomer){
      role = guild.roles.cache.find(rolen => rolen.name === `newcomer`);
      member.roles.add(role).catch(err => console.log(err));
      message.author.send('Sorry something went wrong. You now should have the newcomer role so you can see <#851056727419256902>').catch(err => console.log(err));
    }

    if(!botintro){
      botintro = true;
      reply = "Hi. I am a bot. My name is Jalendu. Enter /readme to read information and commands. " +
      "You can also enter other questions and I will do my best to reply."
      if (newcomer) {
        reply = reply + `\nYou are a newcomer to Gay+ Men Meditating. That means that you don't have full access to the server until ` +
        `you are verified. Please go to <#851056727419256902> and follow the instructions there.`;
        if(automod.selfie === 'required'){
          reply = reply + `\nIn addition, since your account is newer than 56 days old (${(Date.now() - message.author.createdAt) / (24 * 60 * 60 * 1000)}) ` +
          `you are required to send a selfie holding a paper on which is hand-written your Discord user tag "${message.author.tag}".`;
        }
      }
      message.author.send(reply).catch(err => console.log(err));
    }

    let context = contexts[contexts.length - 1];
    let context_out = context;

    sql = `select intent from intents where '${msglc}' ~ expression;`;
    //console.log("sql7=" + sql);

    jalendu.query(sql, function(error, results) {
      if (error) { console.log(error); }
      else if (results.rowCount > 0) {
        let index = 0;
        if (results.rowCount > 1) {
          console.log('Warning: dm matches more than one intent.');
          index = Math.floor(Math.random() * (results.rowCount - 1));
        }

        const intent = results.rows[index].intent;

        sql = `select reply, context_out from replies where context in ('${context}','*') and intent = '${intent}' ` +
        'order by context desc;';
        //console.log("sql8=" + sql);

        jalendu.query(sql, function(error, results) {
          if (error) { console.log(error); }
          else if (results.rowCount > 0) {
            let index = 0;
            if(results.rowCount > 1) {
            	marq.send(`Warning: intent matches more than one reply. context:'${context}' intent:'${intent}'`);
            	index = Math.floor(Math.random() * (results.rowCount - 1));
            }

            let reply = results.rows[index].reply;
            reply = reply.replace('${username}', `${message.author}`);
            reply = reply.replace('${time}', `${time}`);
            reply = reply.replace('${UTC}', `${UTC}`);
            reply = reply.replace('${tag}', `${message.author.tag}`);

            message.channel.send(reply).catch(err => { console.error(err); });
            context_out = results.rows[index].context_out;

            if (context_out === 'blocked') {
              blocked = 'Y';
            }

            // if(context_out === '*') {
            // 	context_out = context;
            // }

            if (context_out === '*') {
              contexts.length = 1;
            }
            else if (contexts[contexts.length - 1] !== context_out) {
              contexts.push(context_out);
            }

            sql = `update users set contexts = '${JSON.stringify(contexts)}', ` +
            `blocked = '${blocked}', updated = to_timestamp(${Date.now()} / 1000.0), botintro = ${botintro}, ` +
            `profanity = ${ctprofanity}, racism = ${ctracism}, homophobia = ${cthomophobia}, verify = ${ctverify} ` +
            `where username = '${username}';`;
            console.log("sql9=" + sql);
            jalendu.query(sql, function(error) {
              if (error) { console.log(error); }
            });
          }
          else {
            message.channel.send('Sorry, I don\'t understand what you are saying. (No reply for context and intent).');
          }
        });
      }
      else {
        console.log(JSON.stringify(automod, null, 2));

        if(newcomer){
          dels.send(`**newcomer ${message.author} wrote (in a DM to the bot):**`).catch(err => console.log(err));
          dels.send(`${message.content}`).catch(err => console.log(err));

          dels.send(`**Jalendu automod classified this as type "${automod.type}" by rule "${automod.rule}"**`);
        }

        if (automod.type==='profanity') {
          profanity = ['Profanity will get you nowhere',
            `What is "${automod.rule}" supposed to mean to a bot?`,
            `I'm sure you suffer from buried penis syndrome. https://www.realself.com/question/buried-penisscrotumconstriction-pain`,
            `fuck off`,
            `Madarchod`,
            `You know what a bhenchod is? Look in a mirror`,
            `suck my dick slimy cunt`,
            `eat your own shit arsehole`,
            `https://cdn.discordapp.com/attachments/1098691876128825515/1099321502211506196/5dbaf5c026a88f3c4c68290ea4b90e27.jpg?ex=66440bae&is=6642ba2e&hm=899504666cbe55e70b11839bfccb2ad3c0d0c7bc2d8ce6c581fbb302d95e584a&`,
            `https://cdn.discordapp.com/attachments/865842783524225054/967008933191499816/x72xwobydvu81.jpg?ex=66448e3f&is=66433cbf&hm=91e023690c9d8d7eac92c58b56ab39d76bf73dd51746775aa93b012f2701bf06&`];
          message.channel.send(profanity[(Math.floor(Math.random() * profanity.length))]);
        }
        else if (automod.type==='homophobic language') {
          homophobia = ['Homophobia turns me on. I know you secretly want a dick up your arse',
            `Why do homophobes laugh and scream at the same time when they're being fucked?`,
            `How do you turn a straight man into a bisexual? Two shots of vodka. 🤣`,
            `It's well known that people confident of their own gender and sexuality don't have a problem with anyone else's.`,
            `https://www.adl.org/resources/blog/what-grooming-truth-behind-dangerous-bigoted-lie-targeting-lgbtq-community`,
            `https://www.insidehighered.com/news/2016/01/26/study-suggests-faculty-members-are-disproportionately-likely-be-gay`,
            `http://www.historyisaweapon.com/defcon1/queernation.html`,
            `https://www.economist.com/middle-east-and-africa/2021/05/27/gay-people-are-reclaiming-an-islamic-heritage`,
            `https://cdn.discordapp.com/attachments/1098691876128825515/1224816986291306608/IMG_4007.jpg?ex=66447175&is=66431ff5&hm=454d7de71efdc078dbd956d850f1a1f362ba8b037371737c920b47ad31309e29&`,
            `https://cdn.discordapp.com/attachments/1098691876128825515/1178962246727110706/F_8tiGsbEAA1geY.jpeg?ex=664465a7&is=66431427&hm=57523655d1a0aee216e4c12cc160f5b3a269af9f48a05ebe1c86e617646019c6&`,
            `https://cdn.discordapp.com/attachments/1098691876128825515/1117062627848372304/QE51-feature.jpg?ex=6643fce4&is=6642ab64&hm=3d9fafe47818e6f371c473bcdbdbaad8cada06555676c1d60d15ea3ad391a5b4&`,
            `https://cdn.discordapp.com/attachments/1098691876128825515/1116171598039367830/spot_the_groomer.png?ex=66440ace&is=6642b94e&hm=0f93ba747a9f0fd096f03bfc66e31ae9585aafab0603bd562a4bc17617389aae&`,
            `https://cdn.discordapp.com/attachments/1098691876128825515/1099661667698225182/b8f3910bd3a61c1fbb8be3a48eed7807_1.gif?ex=6643f6fc&is=6642a57c&hm=cf0904a01cbe25b1b5c62c01546b6a02ee536c7f126eb5499c41cc15bd5b3511&`,
            `https://cdn.discordapp.com/attachments/1098691876128825515/1099664521217462333/oezmdyvd5qe81.jpg.webp?ex=6643f9a4&is=6642a824&hm=f73076662af57582fa5d52f731b0a7cc3de53f6524bc7e0697092441a5b1206c&`,
            `https://cdn.discordapp.com/attachments/1098691876128825515/1099666629362712696/IMG_2710.png?ex=6643fb9b&is=6642aa1b&hm=5d59069bdb72c90da1dbaf3777986068a361c01ca69793bc9bec14f6533e7b37&`,
            `https://cdn.discordapp.com/attachments/1098691876128825515/1099659990878396477/5fca7bf8dd73b.jpeg?ex=6643f56c&is=6642a3ec&hm=cfd16b8dbc374cbd5cc2b2ae2f314ade5a5db3514cdcd527a8eba29fac020c83&`,
            `https://cdn.discordapp.com/attachments/865842783524225054/1196062393395056690/GDtwusAaIAA_hNC.jpeg?ex=6643fc28&is=6642aaa8&hm=9617ec4ce5144272e816bed5fe465d97f90f58ac2d3a32a8b2470523d17b4701&`,
            `https://cdn.discordapp.com/attachments/865842783524225054/1059434091310755961/image0-15.png?ex=66449d62&is=66434be2&hm=0ac56d6bb25b845bdee6846fdb9bcfe5c0148e7e7e3c1457a2dae09eb02f5a36&`,
            `https://cdn.discordapp.com/attachments/865842783524225054/865843911418314802/9CCD8945-578D-418C-8508-179A9D770825.png?ex=6644577b&is=664305fb&hm=db93e5594e7ddabb0f92467954b24cbcfe045609073b6e03fcd6697beb276335&`];
          message.channel.send(homophobia[(Math.floor(Math.random() * homophobia.length))]);
        }
        else if (automod.type==='racist language') {
          racism = [`This is a gay server. I'm a bot.. written by a white gay male. What the fuck is a racist insult supposed to do here?`,
            `What does it feel like to be a racist cunt?`,
            `Why do racists have eyes so close together?`,
            `I hope your mother is behind you. https://www.researchgate.net/figure/Two-4-mm-chancres-on-the-penis-caused-by-primary-syphilis_fig2_230827721`,
            `https://cdn.discordapp.com/attachments/1098691876128825515/1183294642654031902/GA7H1a0WgAALQbK-2.jpeg?ex=66445683&is=66430503&hm=a37f82cd803245fd9a578c724bb5d69406c1b649fc4d27c63b69d9e6f03c6a1f&`,
            `Is this you? https://cdn.discordapp.com/attachments/1098691876128825515/1176783283179245648/F_e4oj3boAA_R4U.jpeg?ex=66450a16&is=6643b896&hm=f760ede6a13fcc18cbae21a6c3693ad2908dc58312287eb5257d4b4045105e7c&`];
          message.channel.send(racism[(Math.floor(Math.random() * racism.length))]);
        }
        else if (automod.type==='verify' && newcomer) {
          //message.channel.send('If you are trying to join Gay+ Men Meditating, please go to <#851056727419256902> and follow the instructions there.');

          if ((Date.now() - message.author.createdAt) / (24 * 60 * 60 * 1000) < 56) {
            dels.send(`${message.author} was not auto-verified because the account is less than 56 days old.`).catch(err => console.log(err));
            message.author.send(`Thankyou for your message in Gay+ Men Meditating. You would have been verified automatically however our group has been seriously attacked recently so we no longer automatically verify relatively new Discord accounts. Please send a selfie holding a paper on which is written your Discord ID ${message.author.tag} to a mod if you still want to join.`).catch(err => console.log(err)); 
          }                                                                                                                                                                                                                                                                              
          else {

            let role = guild.roles.cache.find(rolen => rolen.name === `verified`);
            member.roles.add(role).catch(err => console.log(err));
            role = guild.roles.cache.find(rolen => rolen.name === `newcomer`);
            member.roles.remove(role).catch(err => console.log(err));
            role = guild.roles.cache.find(rolen => rolen.name === `member`);
            member.roles.add(role).catch(err => console.log(err));
            role = guild.roles.cache.find(rolen => rolen.name === `newcomer-muted`);
            member.roles.remove(role).catch(err => console.log(err));
            role = guild.roles.cache.find(rolen => rolen.name === `newcomer-reminded`);
            member.roles.remove(role).catch(err => console.log(err));
            role = guild.roles.cache.find(rolen => rolen.name === `newcomer-spoke`);
            member.roles.remove(role).catch(err => console.log(err));
            role = guild.roles.cache.find(rolen => rolen.name === `newcomer-kicked`);
            member.roles.remove(role).catch(err => console.log(err));

            this.welcomeDM(message.author, message.client);

            mods.send(`${message.author} has been verified by rule "${automod.rule}".`).catch(err => console.log(err));
            mods.send(`Their message was:\n${message.content}`).catch(err => console.log(err));

            dels.send(`**${message.author} was verified.**`).catch(err => console.log(err));
          }
        }
        else {
          message.channel.send(`Sorry, I don\'t understand what you are saying. I\'m just learning. (I\'m a bot.) ` +
            `If you are trying to apply to join Gay+ Men Meditating, Please go to <#851056727419256902> and follow the instructions there.`);

          sql = `select * from dms where dm = '${msglc}';`;
        //console.log("sql10=" + sql);

          jalendu.query(sql, function(error, results) {
            if (error) { console.log(error); }
            else if (results.rowCount > 0) {
              const count = parseInt(results.rows[0].count, 10) + 1;
              sql = `update dms set count = ${count} where dm = '${msglc}'`;
            //console.log("sql11=" + sql);
              jalendu.query(sql, function(error) {
                if (error) { console.log(error); }
              });
            }
            else {
              sql = `insert into dms (dm, count) values ('${msglc}', 1);`;
            //console.log("sql12=" + sql);
              jalendu.query(sql, function(error) {
                if (error) { console.log(error); }
                marq.send(`An unknown DM was sent to the bot: ${msglc}`);
              });
            }
          });
        }
        sql = `update users set contexts = '${JSON.stringify(contexts)}', ` +
        `blocked = '${blocked}', updated = to_timestamp(${Date.now()} / 1000.0), botintro = ${botintro}, ` +
        `profanity = ${ctprofanity}, racism = ${ctracism}, homophobia = ${cthomophobia}, verify = ${ctverify} ` +
        `where username = '${username}';`;
        console.log("sql9a=" + sql);
        jalendu.query(sql, function(error) {
          if (error) { console.log(error); }
        });
      }
    });
});
}


const wrap = (s, w) => s.replace(
  new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n'
  );


var tabulate = function(results) {

  if (results.rows.length > 0) {
    let rows = [];
    let cols = [];
    let lens = [];

    for (j = 0; j < results.fields.length; j++) {
      cols[j] = results.fields[j].name;
      lens[j] = results.fields[j].name.length;
    }

    console.log(lens);

    rows.push(cols);

    let val;

    for (i = 0; i < results.rows.length; i++) {
      let cols = [];
      for (j = 0; j < results.fields.length; j++) {
        val = String(results.rows[i][results.fields[j].name]);
        if (val.length >= 50) {
          cols[j] = val.substring(0, 49) + '+';
        }
        else {
          cols[j] = val;
        }
        lens[j] = Math.max(lens[j], cols[j].length);
      }
      console.log(lens);
      rows.push(cols);
    }

    console.log(lens);

    var table = '';

    for (i = 0; i < rows.length; i++) {
      for (j = 0; j < cols.length; j++) {
        table = table + String(rows[i][j]).padEnd(lens[j] + 1, ' ');
      }
      table = table + '\n';
    }



    //const tab = table(rows);

    return '```' + table.substring(0, 1000) + '```';
  }
  else {
    return 'no rows in results';
  }
}

module.exports.tabulate = tabulate;


module.exports.commands = function(jalendu, message) {
  const args = message.content.toLowerCase().split(' ');
  let sql = '';

  if (args[1] === 'list') {
    sql = `select * from ${args[2]};`;
    jalendu.query(sql, function(error, results) {
      if (error) {
        message.reply(error).catch(err => { console.error(err); });
      }
      else {
        message.reply(tabulate(results)).catch(err => { console.error(err); });
      }
    });
  }
  else if (args[1] === 'tables') {
    sql = `select tablename from pg_catalog.pg_tables where schemaname = 'public'`;
    jalendu.query(sql, function(error, results) {
      if (error) {
        message.reply(error).catch(err => { console.error(err); });
      }
      else {
        //console.log(results);
        message.reply(tabulate(results)).catch(err => { console.error(err); });
      }
    });
  }
  else if (args[1] === 'intents') {
    sql = `insert into intents (intent,expression) values ('${args[2]}','${args.slice(3).join(' ')}')`;
    jalendu.query(sql, function(error, results) {
      if (error) {
        message.reply(error).catch(err => { console.error(err); });
      }
      else {
        //console.log(results);
        message.reply(tabulate(results)).catch(err => { console.error(err); });
      }
    });
  }
  else if (args[1] === 'sql') {
    sql = args.slice(2).join(' ');
    jalendu.query(sql, function(error, results) {
      if (error) {
        message.reply(error).catch(err => { console.error(err); });
      }
      else {
        if (results.command === 'SELECT') {
          //console.log(results);
          message.reply(tabulate(results)).catch(err => { console.error(err); });
        }
        else {
          console.log(results);
          //message.reply(`${results.rowCount} rows affected`).catch(err => { console.error(err); });
        }
      }
    });
  }
  else {
    message.reply('[/cb|/chatbot] [list|tables|sql]');
  }
}


