

const { Client, Intents, MessageEmbed } = require('discord.js');

require('dotenv').config();

var path = require('path');

var filename = path.basename(__filename) + ': ';
var filenamn = filename + '/n';

const fs = require('fs');

const table = require('text-table');

const format = require('format-duration');

const querystring = require('querystring');

const db = require('./common/text_database.js');

db.load();

//var fetch = require('node-fetch');

const { exec } = require('node:child_process');

const { get } = require("https");

var jautomod = require('./jalendu/jautomod.js');

jautomod.setup();

var qotd = require('./jalendu/qotd.js');

qotd.qotd('init');


var vcmon = require('./jalendu/vcmon.js');

vcmon.init();

const jalendu_code = require('./jalendu/jalendu.js');

const gayantifa_code = require('./gayantifa/gayantifa.js');

// var automod = require('../gayantifa/automod.js');

// automod.init();

var guilds = require('./gayantifa/guilds.js');

guilds.init();

var dossiers = require('./gayantifa/dossiers.js');

var setup = require('./gayantifa/setup.js');

const common_code = require('./common/common.js');


const jalendu_token = process.env.JALENDU_TOKEN;


const gayantifa_token = process.env.GAYANTIFA_TOKEN;


const intents = new Intents();

intents.add(Intents.FLAGS.GUILDS);
intents.add(Intents.FLAGS.GUILD_MEMBERS);
intents.add(Intents.FLAGS.GUILD_BANS);
intents.add(Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS);
intents.add(Intents.FLAGS.GUILD_INTEGRATIONS);
intents.add(Intents.FLAGS.GUILD_WEBHOOKS);
intents.add(Intents.FLAGS.GUILD_INVITES);
intents.add(Intents.FLAGS.GUILD_VOICE_STATES);
intents.add(Intents.FLAGS.GUILD_PRESENCES);
intents.add(Intents.FLAGS.GUILD_MESSAGES);
intents.add(Intents.FLAGS.GUILD_MESSAGE_REACTIONS);
//intents.add(Intents.FLAGS.GUILD_MESSAGE_TYPING);
intents.add(Intents.FLAGS.DIRECT_MESSAGES);
intents.add(Intents.FLAGS.DIRECT_MESSAGE_REACTIONS);
//intents.add(Intents.FLAGS.DIRECT_MESSAGE_TYPING);


const jalendu = new Client({ intents: intents, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

const gayantifa = new Client({ intents: intents, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

var quiz = require('./gayantifa/quiz.js');

quiz.init(gayantifa);


function handleRateLimit() {
  get(`https://discord.com/api/v10/gateway`, ({ statusCode }) => {
    if (statusCode == 429) { process.kill(1) }
  });
};

handleRateLimit();

setInterval(handleRateLimit, 3e5);


try {
  jalendu.login(jalendu_token);
} catch (e) {
  console.log(filename + e);
  process.kill(1);
}


try {
  gayantifa.login(gayantifa_token);
} catch (e) {
  console.log(filename + e);
  process.kill(1);
}


//jalendu.on('debug', console.log);

jalendu.on("debug", function(info) {
  let check429error = info.split(" ");
  if (check429error[2] === `429x`) {
    console.log(filename + `Caught a 429 error!`);
    exec('kill 1', (err, output) => {
      if (err) {
        console.error(filename + "could not execute command: ", err);
        return;
      }
      console.log(filename + `Kill 1 command succeeded`);
    });
  }
});


gayantifa.on("debug", function(info) {
  let check429error = info.split(" ");
  if (check429error[2] === `429x`) {
    console.log(filename + `Caught a 429 error!`);
    exec('kill 1', (err, output) => {
      if (err) {
        console.error(filename + "could not execute command: ", err);
        return;
      }
      console.log(filename + `Kill 1 command succeeded`);
    });
  }
});


var jalendu_ready = false;

jalendu.once('ready', async () => {

  jalendu_ready = true;

  jalendu_code.ready(jalendu);

  jalendu_code.newcomers(jalendu);
  qotd.ask(jalendu);
  jautomod.monitor_maint(jalendu);
  //jalendu_code.roles_fix(jalendu);

  checkminutes = 120;
  checkthe_interval = checkminutes * 60 * 1000;

  setInterval(function() {
    jalendu_code.newcomers(jalendu);
    qotd.ask(jalendu);
    jautomod.monitor_maint(jalendu);
    //jalendu_code.roles_fix(jalendu);
  }, checkthe_interval);


  jautomod.message_cleanup(jalendu);
  jautomod.gate(jalendu, false);

  checkminutes = 1;
  checkthe_interval = checkminutes * 60 * 1000;

  setInterval(function() {
    jautomod.message_cleanup(jalendu);
    jautomod.gate(jalendu, false);
    db.filesave();
  }, checkthe_interval);


  //remove any extraeneous emojis from the reaction role questions

  const roles = jalendu.channels.cache.get('828724253938942014');

  await roles.messages.fetch({ limit: 10 }).then(async messages => {
    messages.forEach(message => {
      if (message.reactions) {
        message.reactions.cache.each(async (reaction) => {
          jalendu_code.reactions_fix(reaction);
        });
      }
    });
  });
});


gayantifa.on('ready', () => {
  gayantifa_code.ready(gayantifa);

  gayantifa_code.cleanup(gayantifa);

  checkminutes = 120;
  checkthe_interval = checkminutes * 60 * 1000;

  setInterval(function() {
    gayantifa_code.cleanup(gayantifa);
  }, checkthe_interval);

  gayantifa_code.demote_code(gayantifa);

  checkminutes = 5;
  checkthe_interval = checkminutes * 60 * 1000;

  setInterval(function() {
    gayantifa_code.demote_code(gayantifa);
  }, checkthe_interval);

  gayantifa_code.remind(gayantifa);

  checkminutes = 24 * 60;
  checkthe_interval = checkminutes * 60 * 1000;

  setInterval(function() {
    gayantifa_code.remind(gayantifa);
  }, checkthe_interval);
});


jalendu.on('interactionCreate', async interaction => {
  jalendu_code.interactionCreate(jalendu, interaction);
});


jalendu.on('messageCreate', async (message) => {
  jalendu_code.messageCreate(jalendu, message);
});


gayantifa.on('messageCreate', async (message) => {
  gayantifa_code.messageCreate(gayantifa, message);
});


jalendu.on('guildMemberAdd', async (member) => {
  jalendu_code.guildMemberAdd(jalendu, member);
});


gayantifa.on('guildMemberAdd', async (member) => {
  gayantifa_code.guildMemberAdd(gayantifa, member);
});


jalendu.on("guildMemberRemove", member => {
  jalendu_code.guildMemberRemove(jalendu, member);
});


gayantifa.on("guildMemberRemove", member => {
  gayantifa_code.guildMemberRemove(gayantifa, member);
});


jalendu.on('voiceStateUpdate', (oldmember, newmember) => {
  vcmon.update(jalendu, oldmember, newmember);
});


jalendu.on('messageReactionAdd', (reaction, user) => {
  jalendu_code.messageReactionAdd(jalendu, reaction, user);
});


gayantifa.on('messageReactionAdd', (reaction, user) => {
  gayantifa_code.messageReactionAdd(gayantifa, reaction, user);
});


gayantifa.on('messageReactionRemove', (reaction, user) => {
  gayantifa_code.messageReactionRemove(gayantifa, reaction, user);
});


jalendu.on("guildMemberUpdate", (oldMember, newMember) => {
  jalendu_code.guildMemberUpdate(jalendu, oldMember, newMember);
});


gayantifa.on("guildMemberUpdate", (oldMember, newMember) => {
  gayantifa_code.guildMemberUpdate(gayantifa, oldMember, newMember);
});


gayantifa.on("channelDelete", channel => {
  gayantifa_code.channelDelete(gayantifa, channel);
});


gayantifa.on("guildCreate", channel => {
  gayantifa_code.guildCreate(gayantifa, guild);
});


gayantifa.on("guildDelete", channel => {
  gayantifa_code.guildDelete(gayantifa, guild);
});


function quit(sig){
  db.filesave();
  qotd.qotd('tojson');
  fs.appendFileSync('./logs/restarts.log', sig + ' ' + common_code.ts() + '\n');
  console.log('/n' + filename + 'bye bye');
  process.exit();
}

process.on('SIGTERM', () => {
  quit('SIGTERM');
})

process.on('SIGINT', () => {
  quit('SIGINT');
})

process.on('SIGQUIT', () => {
  quit('SIGQUIT');
})


var os = require('os');

console.log(filename + os.hostname());

const express = require('express');

//const { fileURLToPath } = require('url');
var ExifImage = require('exif').ExifImage;

var formidable = require('formidable');

const selfie = require('./common/selfie.js');

const app = express();

app.use(express.json());

app.use(express.static('public'));

app.set('view engine', 'ejs');

function parseDate(s) {
  var b = s.split(/\D/);
  return new Date(b[0], b[1] - 1, b[2], b[3], b[4], b[5]);
}


app.post('/selfie', async (req, res, next) => {

  const selfie_verification = jalendu.channels.cache.get('1148886832080240700');

  const form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {

    console.log(filename + JSON.stringify(req.headers, null, 2));

    console.log(filename + JSON.stringify(fields, null, 2));

    id = fields.id[0];

    ext = files.selfie[0].originalFilename.split('.').pop();

    ts = Date.now();

    let oldPath = files.selfie[0].filepath;

    let newPath = path.join(__dirname, 'uploads')
    + `/${ts}_${id}.${ext}`;

    let rawData = fs.readFileSync(oldPath);

    fs.writeFileSync(newPath, rawData);

    new ExifImage({ image: newPath }, function(error, exifData) {

      if (error) {
        console.log(filename + 'Error: ' + error.message);
      }
      else {
        error = '';
      }

      if (!exifData) {
        return res.send(selfie.selfie(fields.id[0], `<font color="red">Photo has no exif metadata. Please follow the instructions above. ${error}</font>`));
      }

      if (!exifData.exif || !exifData.exif.CreateDate) {
        return res.send(selfie.selfie(fields.id[0], `<font color="red">Photo has no exif CreateDate. Please follow the instructions above.</font>`));
      }

      console.log(filenamn + exifData);

      tzo = fields.submitTZO[0] * 60;

      CreateDate = parseDate(exifData.exif.CreateDate);
      submitTime = new Date(fields.submitTime[0]);
      age = ((submitTime - CreateDate) / (1000)) - tzo;

      if (Math.floor(age) > 30) {
        return res.send(selfie.selfie(fields.id[0], `<font color="red">Photo was taken more than 30 seconds before upload. Please follow the instructions above.</font>`, exifData));
      }

      if (exifData.image.ModifyDate) {
        ModifyDate = parseDate(exifData.image.ModifyDate);
        mod = Math.abs((CreateDate - ModifyDate) / 1000);
        if (mod > 0) {

          return res.send(selfie.selfie(fields.id[0], `<font color="red">Photo appears to have been modified. Please follow the instructions above.</font>`, exifData));
        }
      }

      return res.send(selfie.selfie(fields.id[0], `<font color="green">Successfully uploaded</font>`, exifData));

    });
  });
});

app.get('/', (req, res) => {
  if (req.query.function === 'vcmon') {
    let calendar = vcmon.calendar();
    res.status(200).send(calendar);
  }
  else if (req.query.function === 'ga') {
    let ga = vcmon.ga(req, query);
    res.status(200).send(ga);

    const marq = jalendu.users.cache.get('679465390841135126');
    marq.send(`${query.tag} fell into track`);
  }
  else if (req.query.function === 'selfie') {
    res.status(200).send(selfie.selfie(req.query.id));
  }
  else {
    res.status(200).render('index');
  }
});

app.get('/vcmon', (req, res) => {
  res.status(200).send(vcmon.calendar());
});

app.get('/selfie', (req, res) => {
  res.status(200).send(selfie.selfie(req.query.id, ""));
});


app.post("/ga", function(req, res) {
  const form = new IncomingForm();
  form.parse(req, (err, field, file) => {
    const dox = gayantifa.channels.cache.get('1144764910639792128');
    dox.send(JSON.stringify(field, null, 2));
  });
});

app.get('/ga', (req, res) => {
  res.status(200).send(vcmon.ga(req, req.query));
});

app.listen(3400);
