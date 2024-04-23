const pg = require('pg');
const table = require('text-table');

module.exports.setup = function() {

  const arpquuxb = process.env['arpquuxb'];

  const jalendu = new pg.Client({
    user: 'arpquuxb',
    host: 'rosie.db.elephantsql.com',
    database: 'arpquuxb',
    password: arpquuxb,
    port: 5432,
  });

  jalendu.connect();

  let sql = 'create table if not exists dms (dm varchar, count int);';

  jalendu.query(sql)
    .catch(err => { console.error(err); })
    ;

  sql = 'create table if not exists intents (expression varchar, intent varchar, parms varchar);';

  jalendu.query(sql)
    .catch(err => { console.error(err); })
    ;

  sql = 'create table if not exists replies ' +
    '(context varchar, intent varchar, reply varchar, context_out varchar);';

  jalendu.query(sql)
    .catch(err => { console.error(err); })
    ;

  sql = 'create table if not exists users ' +
    '(username varchar, contexts varchar, blocked varchar, updated timestamptz);';

  jalendu.query(sql)
    .catch(err => { console.error(err); })
    ;

  return jalendu;
}


module.exports.message = function(jalendu, message) {

  var msglc = message.content.trim().toLowerCase().replace(/<[@#!&](.*?)>/g, '');

  if (msglc == '' || message.author.bot) {
    return;
  }

  const username = message.author.username;

  let contexts = ['*'];

  let blocked = 'N';

  const now = new Date();

  let updated = new Date();

  sql = `select * from users where username = '${username}';`;

  jalendu.query(sql, function(error, results) {
    if (error) { console.log(error); }
    else if (results.rowCount > 0) {
      contexts = JSON.parse(results.rows[0].contexts);
      blocked = results.rows[0].blocked;
      updated = new Date(results.rows[0].updated);
    }
    else {
      sql = 'insert into users (username, contexts, blocked, updated) ' +
        `values ('${username}', '${JSON.stringify(contexts)}' ,'${blocked}', to_timestamp(${Date.now()} / 1000.0));`;
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

    let context = contexts[contexts.length - 1];
    let context_out = context;

    sql = `select intent from intents where '${msglc}' ~ expression;`;

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

        jalendu.query(sql, function(error, results) {
          if (error) { console.log(error); }
          else if (results.rowCount > 0) {
            let index = 0;
            // if(results.rowCount > 1) {
            // 	console.log('Warning: intent matches more than one reply.');
            // 	index = Math.floor(Math.random() * (results.rowCount - 1));
            // }

            let reply = results.rows[index].reply;
            reply = reply.replace('${username}', `${message.author}`);

            message.channel.send(reply);
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
              `blocked = '${blocked}', updated = to_timestamp(${Date.now()} / 1000.0) where username = '${username}';`;
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
        message.channel.send('Sorry, I don\'t understand what you are saying. I\'m just learning.');

        sql = `select * from dms where dm = '${msglc}';`;

        jalendu.query(sql, function(error, results) {
          if (error) { console.log(error); }
          else if (results.rowCount > 0) {
            const count = parseInt(results.rows[0].count, 10) + 1;
            sql = `update dms set count = ${count} where dm = '${msglc}'`;
            jalendu.query(sql, function(error) {
              if (error) { console.log(error); }
            });
          }
          else {
            sql = `insert into dms (dm, count) values ('${msglc}', 1);`;
            jalendu.query(sql, function(error) {
              if (error) { console.log(error); }

              const marq = message.client.users.cache.get('679465390841135126');
              marq.send(`An unknown DM was sent to the bot: ${msglc}`);
            });
          }
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
        message.reply(error);
      }
      else {
        message.reply(tabulate(results));
      }
    });
  }
  else if (args[1] === 'tables') {
    sql = `select tablename from pg_catalog.pg_tables where schemaname = 'public'`;
    jalendu.query(sql, function(error, results) {
      if (error) {
        message.reply(error);
      }
      else {
        //console.log(results);
        message.reply(tabulate(results));
      }
    });
  }
  else if (args[1] === 'intents') {
    sql = `insert into intents (intent,expression) values ('${args[2]}','${args.slice(3).join(' ')}')`;
    jalendu.query(sql, function(error, results) {
      if (error) {
        message.reply(error);
      }
      else {
        //console.log(results);
        message.reply(tabulate(results));
      }
    });
  }
  else if (args[1] === 'sql') {
    sql = args.slice(2).join(' ');
    jalendu.query(sql, function(error, results) {
      if (error) {
        message.reply(error);
      }
      else {
        if (results.command === 'SELECT') {
          //console.log(results);
          message.reply(tabulate(results));
        }
        else {
          console.log(results);
          //message.reply(`${results.rowCount} rows affected`);
        }
      }
    });
  }
  else {
    message.reply('[/cb|/chatbot] [list|tables|sql]');
  }
}


