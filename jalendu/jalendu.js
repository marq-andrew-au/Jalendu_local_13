
const { Client, Intents, MessageEmbed } = require('discord.js');

const fs = require('fs');

const querystring = require('querystring');

var fetch = require('node-fetch');

var jautomod = require('./jautomod.js');

var exif = require('./exif.js');

var qotd = require('./qotd.js');

var jalenduDb = require('./jalenduDb.js');

const jalenducb = jalenduDb.setup();

module.exports.ready = function(client) {
  console.log(`Logged in as: ${client.user.tag}`);

  client.user.setUsername('Jalendu');

  client.user.setActivity();
  client.user.setStatus(':rainbow_flag:');
}


module.exports.newcomer_report = '';

module.exports.newcomers = function(client) {

  newcomer_report = '';

  newcomer_report = newcomer_report + '\n' + '__Newcomers reminder and exclusion.__\n';

  const guild = client.guilds.cache.get('827888294100074516');

  const init = new Date('2021-08-17T12:00:00+06:00');

  let members = guild.roles.resolve('851071523543973928').members;

  const mods = client.channels.cache.get('827889605994872863');

  const newcomer = guild.roles.cache.find(rolen => rolen.name === 'newcomer');
  const newcomer_muted = guild.roles.cache.find(rolen => rolen.name === 'newcomer-muted');
  const newcomer_reminded = guild.roles.cache.find(rolen => rolen.name === 'newcomer-reminded');
  const newcomer_kicked = guild.roles.cache.find(rolen => rolen.name === 'newcomer-kicked');
  const member_role = guild.roles.cache.find(rolen => rolen.name === 'member');

  for (const member of members) {

    if (!member[1].bot && !member[1].roles.cache.some(rolen => rolen.name === 'verified')) {

      let spoke = '';

      if (member[1].roles.cache.some(rolen => rolen.name === 'newcomer-spoke')) {
        spoke = ' *';
      }

      let muted = '';

      if (member[1].roles.cache.some(rolen => rolen.name === 'newcomer-muted')) {
        muted = ' +';
      }

      let exmember = '';

      if (member[1].roles.cache.some(rolen => rolen.name === 'member')) {
        exmember = ' #';
      }

      let joined = member[1].joinedTimestamp;

      if (joined < init) {
        joined = init;
      }

      currenttime = new Date();
      const joinelapsed = new Date(currenttime - joined) / (24 * 60 * 60 * 1000);

      if (joinelapsed > 7) {
        newcomer_report = newcomer_report + '\n' + `${member[1].user.username}` + ' --> kicked : ' + joinelapsed.toFixed(1) + ' days.' + spoke + muted + exmember;
        if (!member[1].roles.cache.some(rolen => rolen.name === 'newcomer-kicked')) {
          member[1].roles.add(newcomer_kicked).catch(err => console.log(err));
          mods.send(`${member[1].user} has been removed (7 days after joining).`);
        }
        member[1].kick('Entry requirements unsatisfied after 7 days').catch(err => console.log(err));
      }
      else if (joinelapsed > 2) {
        newcomer_report = newcomer_report + '\n' + `${member[1].user.username}` + ' --> reminded : ' + joinelapsed.toFixed(1) + ' days.' + spoke + muted + exmember;
        if (!member[1].roles.cache.some(rolen => rolen.name === 'newcomer-reminded')) {
          member[1].roles.add(newcomer_reminded).catch(err => console.log(err));

          var fileContent = fs.readFileSync('./data/messages.json');
          messages = JSON.parse(fileContent);

          member[1].send(messages.reminder.content).catch(err => console.log(err));
          mods.send(`${member[1].user} has been reminded of the entry requirements (2 days after joining).`);
        }
      }
      else {
        newcomer_report = newcomer_report + '\n' + `${member[1].user.username}` + ' --> waiting : ' + joinelapsed.toFixed(1) + ' days.' + spoke + muted + exmember;
        if (member[1].roles.cache.some(rolen => rolen.name === 'newcomer-reminded')) {
          member[1].roles.remove(newcomer_reminded).catch(err => console.log(err));
        }
        if (member[1].roles.cache.some(rolen => rolen.name === 'newcomer-kicked')) {
          member[1].roles.remove(newcomer_kicked).catch(err => console.log(err));
        }
      }
    }
    else {
      // if (member[1].roles.cache.some(rolen => rolen.name === 'newcomer')) {
      //   member[1].roles.remove(newcomer).catch(err => console.log(err));
      // }
      // if (member[1].roles.cache.some(rolen => rolen.name === 'newcomer-muted')) {
      //   member[1].roles.remove(newcomer_muted).catch(err => console.log(err));
      // }
      // if (member[1].roles.cache.some(rolen => rolen.name === 'newcomer-reminded')) {
      //   member[1].roles.remove(newcomer_reminded).catch(err => console.log(err));
      // }
      // if (member[1].roles.cache.some(rolen => rolen.name === 'newcomer-kicked')) {
      //   member[1].roles.remove(newcomer_kicked).catch(err => console.log(err));
      // }
      // if (member[1].roles.cache.some(rolen => rolen.name === 'newcomer-spoke')) {
      //   member[1].roles.remove(newcomer-spoke).catch(err => console.log(err));
      // }
      // if (!member[1].roles.cache.some(rolen => rolen.name === 'member')) {
      //   member[1].roles.add(member_role).catch(err => console.log(err));
      // }
    }
  }
  // }
  //}
  //)
  //  .catch(err => console.log(err));

  newcomer_report = newcomer_report + '\n\n* Indicates that the member wrote a message in #landing-zone.';
  newcomer_report = newcomer_report + '\n+ Indicates that the member is muted.';
  newcomer_report = newcomer_report + '\n# Indicates that the member was previously a verified member.';

  console.log(newcomer_report);

  //jautomod.message_cleanup(jalendu);
}


module.exports.reactions_fix = function(reaction) {

  if (reaction.message.id === '834032215662526465') {
    if (reaction.emoji.name !== '⏲️') {
      reaction.remove();
    }
  }
  else if (reaction.message.id === '834057552668786699') {
    if (reaction.emoji.name !== '👦'
      && reaction.emoji.name !== '👨') {
      reaction.remove();
    }
  }
  else if (reaction.message.id === '834324950486876192') {
    if (reaction.emoji.name !== 'gay_flag'
      && reaction.emoji.name !== 'bi_flag'
      && reaction.emoji.name !== 'bi_curious_flag') {
      reaction.remove();
    }
  }
  else if (reaction.message.id === '881690698879995934') {
    if (reaction.emoji.name !== 'memes') {
      reaction.remove();
    }
  }
  else if (reaction.message.id === '881816102102003722') {
    if (reaction.emoji.name !== 'lotus_meditator'
      && reaction.emoji.name !== 'yoga') {
      reaction.remove();
      }
    }
    else if (reaction.message.id === '1232327452227932250') {
      if (reaction.emoji.name !== 'sloth'
        && reaction.emoji.name !== 'person_in_lotus_position'
        && reaction.emoji.name !== 'man_bowing'
        && reaction.emoji.name !== 'date'
        && reaction.emoji.name !== 'foot'
        && reaction.emoji.name !== 'leg'
        && reaction.emoji.name !== 'eggplant') {
        reaction.remove();
      }
    }
  }



module.exports.interactionCreate = async function(client, interaction) {
  if (interaction.isCommand()) {

    if (interaction.commandName === 'avatar') {

      const username = interaction.options.getUser('username');

      if (!username) {
        const embed = new MessageEmbed()
          .setTitle(interaction.user.username)
          .setColor(0x00ffff)
          .setImage(interaction.user.displayAvatarURL({ format: 'png', size: 2048 }));

        const messageId = await interaction.reply({ embeds: [embed] });
      }
      else {
        const embed = new MessageEmbed()
          .setTitle(username.username)
          .setColor(0x00ffff)
          .setImage(username.displayAvatarURL({ format: 'png', size: 2048 }));

        const messageId = await interaction.reply({ embeds: [embed] });
      }
    }
    else if (interaction.commandName === 'moderate') {

      if (interaction.member.roles.cache.some(rolen => rolen.name === 'moderator')) {

        const command = interaction.options.getString('command');
        const username = interaction.options.getUser('username');

        const member = interaction.guild.members.cache.get(username.id);

        //let test = 'test_';
        let test = '';

        if (test === '') {
          mods = client.channels.cache.get('827889605994872863');
        }
        else {
          mods = client.channels.cache.get('827889605994872863');
        }

        const marq = client.users.cache.get('679465390841135126');

        if (!member) {
          interaction.reply({ content: `${username} isn't a member. Maybe they left? :sob:`, ephemeral: true });
        }
        else if (command === 'verify') {

          if (member.roles.cache.some(role => role.name === `${test}verified`)) {
            interaction.reply({ content: `Member ${username} is already verified. :confused:`, ephemeral: true });
          }
          else {
            let role = interaction.guild.roles.cache.find(rolen => rolen.name === `${test}verified`);
            member.roles.add(role);
            role = interaction.guild.roles.cache.find(rolen => rolen.name === `${test}newcomer`);
            member.roles.remove(role);

            interaction.reply({ content: `Member ${username} has been verified. :partying_face:`, ephemeral: true })
              .catch((err) => console.log(err));

            mods.send(`Member ${username} has been verified by ${interaction.user}.`);

            jautomod.welcomeDM(member.user, client);

            jautomod.message_cleanup(client);
          }
        }
        else if (command === 'unverify') {
          let role = interaction.guild.roles.cache.find(rolen => rolen.name === `${test}verified`);
          member.roles.remove(role);
          role = interaction.guild.roles.cache.find(rolen => rolen.name === `Age 18+`);
          member.roles.remove(role);
          role = interaction.guild.roles.cache.find(rolen => rolen.name === `${test}newcomer`);
          member.roles.add(role);

          interaction.reply({ content: `Member ${username} has been unverified. :unamused:`, ephemeral: true });

          mods.send(`Member ${username} has been unverified by ${interaction.user}.`);
        }
        else if (command === 'mute') {
          if (!member.roles.cache.some(role => role.name === `${test}newcomer`)) {
            interaction.reply({ content: `Member ${username} is not a newcomer. :confused:`, ephemeral: true });
          }
          else {
            let role = interaction.guild.roles.cache.find(rolen => rolen.name === `${test}newcomer-muted`);
            member.roles.add(role);

            interaction.reply({ content: `Member ${username} has been muted. :zipper_mouth:`, ephemeral: true });

            mods.send(`Member ${username} has been muted by ${interaction.user}.`);
          }
        }
        else if (command === 'unmute') {
          if (!member.roles.cache.some(role => role.name === `${test}newcomer`)) {
            interaction.reply({ content: `Member ${username} is not a newcomer. :confused:`, ephemeral: true });
          }
          else {
            let role = interaction.guild.roles.cache.find(rolen => rolen.name === `${test}newcomer-muted`);
            member.roles.remove(role);

            interaction.reply({ content: `Member ${username} has been unmuted. :open_mouth:`, ephemeral: true });

            mods.send(`Member ${username} has been unmuted by ${interaction.user}.`);
          }
        }
        else if (command === 'kick') {
          if (!member.kickable) {
            interaction.reply({ content: `Member ${username} is not kickable. :confused:`, ephemeral: true });
          }
          else {
            member.kick()
              .then(member => {
                interaction.reply({ content: `Member ${username} has been kicked. :dancer:`, ephemeral: true });

                mods.send(`Member ${username} has been kicked by ${interaction.user}.`);
              })
              .catch(err => {
                interaction.reply({ content: `Failed to kick ${username}. :confused:`, ephemeral: true });
              });
          }
        }
        else if (command === 'ban') {
          if (!member.bannable) {
            interaction.reply({ content: `Member ${username} is not bannable. :confused:`, ephemeral: true });
          }
          else {
            member.ban({ days: 7 })
              .then(member => {
                interaction.reply({ content: `Member ${username} has been banned. :no_entry_sign:`, ephemeral: true });

                mods.send(`Member ${username} has been banned by ${interaction.user}.`);
              })
              .catch(err => {
                interaction.reply({ content: `Failed to ban ${username}. :confused:`, ephemeral: true });
              });
          }
        }
        else if (command === 'agelock') {
          if (member.roles.cache.some(role => role.name === `moderator`)) {
            interaction.reply({ content: `You can't age lock a moderator. :confused:`, ephemeral: true });
          }
          else {
            var fileContent = fs.readFileSync('./data/agelock.json');
            agelock = JSON.parse(fileContent);

            if (!agelock[username.id]) {
              const newagelock = new Object();
              newagelock.username = username.tag;
              newagelock.lockedbyid = interaction.user.id;
              newagelock.lockedbyname = interaction.user.tag;
              newagelock.lockdate = new Date();
              newagelock.months = 12;
              newagelock.expires = new Date();
              newagelock.expires.setMonth(newagelock.expires.getMonth() + newagelock.months);
              newagelock.notified = false;
              agelock[username.id] = newagelock;

              interaction.reply({ content: `Member ${username} has been age locked until ${agelock[username.id].expires.toISOString().split('T')[0]} :baby_chick:`, ephemeral: true });

              mods.send(`Member ${username} has been age locked by ${interaction.user}.`);
            }
            else {
              interaction.reply({ content: `Member ${username} is already age locked (until ${agelock[username.id].expires.split('T')[0]}) :confused:`, ephemeral: true });
            }

            let role = interaction.guild.roles.cache.find(rolen => rolen.name === `Age 18 +`);
            member.roles.remove(role);

            fs.writeFileSync('./data/agelock.json', JSON.stringify(agelock, null, 2), 'utf-8');
          }
        }
        else if (command === 'ageunlock') {
          var fileContent = fs.readFileSync('./data/agelock.json');
          agelock = JSON.parse(fileContent);

          if (agelock[username.id]) {
            delete agelock[username.id];

            interaction.reply({ content: `Member ${username} has been age unlocked. :chicken:`, ephemeral: true });

            mods.send(`Member ${username} has been age unlocked by ${interaction.user}.`);
          }
          else {
            interaction.reply({ content: `Member ${username} isn't age locked. :confused:`, ephemeral: true });
          }

          fs.writeFileSync('./data/agelock.json', JSON.stringify(agelock, null, 2), 'utf-8');
        }
        else {
          interaction.reply({ content: `${command}: Sorry, not implemented yet - working on it.`, ephemeral: true });
        }
      }
      else {
        interaction.reply({ content: 'Sorry, only a moderators can use moderate commands. :cry:', ephemeral: true });
      }
    }
    else if (interaction.commandName === 'joke') {

      const term = interaction.options.getString('term');

      const options = {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
      };

      var url = `https://icanhazdadjoke.com/`;

      if (term) {
        const query = querystring.stringify({ term: term });
        url = `https://icanhazdadjoke.com/search?${query}`;
      }

      result = await fetch(url, options)
        .then(response => response.text())
        .catch((err) => console.log(err));

      const joke = await JSON.parse(result);

      if (joke.joke) {
        interaction.reply(joke.joke);
      }
      else if (joke.results) {
        const rand = Math.floor(Math.random() * joke.results.length);
        interaction.reply(joke.results[rand].joke);
      }
    }
    else if (interaction.commandName === 'define') {

      const term = interaction.options.getString('term');
      const result_type = interaction.options.getString('result');

      const query = querystring.stringify({ term: term });

      const { list } = await fetch(`https://api.urbandictionary.com/v0/define?${query}`)
        .then(response => response.json())
        .catch(err => console.log(err));

      if (!list.length) {
        return interaction.reply(`No results found for **${term}**.`);
      }
      else {
        let select = 1;

        if (result_type === 'all') {
          select = 0;
        }
        else if (result_type === 'random') {
          select = Math.floor(Math.random() * list.length);
        }

        const embeds = [];

        for (let i = 0; i < list.length; i++) {

          if (select === 0 || i === (select - 1)) {

            const embed = new MessageEmbed()
              .setColor('RANDOM')
              .setTitle(list[i].word)
              .setURL(list[i].permalink)
              .addFields(
                { name: 'Definition', value: common_code.trim(list[i].definition, 1024) },
                { name: 'Example', value: common_code.trim(list[i].example, 1024) },
                { name: 'Rating', value: `${list[i].thumbs_up} thumbs up. ${list[i].thumbs_down} thumbs down.` },
              );

            embeds.push(embed);
          }
        }

        await interaction.reply({ embeds: embeds }).catch(console.error);
      }
    }
    else if (interaction.commandName === 'readme') {

      await interaction.reply('Jalendu bot help will be sent to you as a direct message.').catch(console.error);

      readmeraw = fs.readFileSync('./data/jalendu_readme.txt').toString();

      sections = readmeraw.split('\n');

      split = '';

      for (let i = 0; i < sections.length; i++) {
        if ((split + sections[i]).length > 2000) {
          interaction.user.send('\u200B\n' + split);
          split = sections[i];
        }
        else {
          split = split + '\n' + sections[i];
        }
      }
      interaction.user.send('\u200B\n' + split);
    }
  }
}


module.exports.messageCreate = async function(client, message) {

  console.log(message.channel.type + ' : ' + message.channel.name);

  if (message.embeds[0]) {
    console.log(message.author.username + ': ');
    console.log(message.embeds[0]);
  }
  else {
    console.log(message.author.username + ': ' + message.content);
  }

  if (message.author.bot && message.type === 'CHANNEL_PINNED_MESSAGE') {
    message.delete();
  }

  let member, moderator, dm, channel_name, admin, channelid;

  if (message.channel.type === 'DM') {
    const guild = client.guilds.cache.get('827888294100074516');
    member = await guild.members.fetch(message.author.id);
    dm = true;
    channel_name = 'dm';
    channelid = '0';
  }
  else {
    member = message.member;
    dm = false;
    channel_name = message.channel.name;
    channelid = message.channel.id;
  }

  if (!member) {
    //console.log('member undefined!');
    //console.log(message);
    return;
  }

  moderator = (member.roles.cache.some(rolen => rolen.name === 'moderator'));

  admin = (member.roles.cache.some(rolen => rolen.name === 'admin'));

  if (channel_name.includes('bot-commands')) {

    if (message.content.toLowerCase() === '-ft set') {
      message.reply('You now have to enter ```/set me```');
    }

  }

  if (!message.author.bot && (message.content.startsWith('/') || message.content.startsWith('+'))) {
    const content = message.content.substring(1);
    if (moderator && content === 'welcome') {
      var fileContent = fs.readFileSync('./data/welcome.json');
      welcome = JSON.parse(fileContent);

      const landing_zone = client.channels.cache.get('851056727419256902');

      const fetched = await landing_zone.messages.fetch({ limit: 100 });

      if (fetched.size > 0) {
        landing_zone.bulkDelete(fetched.size);
      }

      landing_zone.send({ embeds: [welcome] })
        .then((msg) => {
          msg.pin();

        })
        .catch(console.error);

      const info = new MessageEmbed()
        .setColor(0x0099FF)
        .setTitle('Gay+ Men Meditating')
        .setDescription('Server statistics pending...')
        .setThumbnail(message.guild.iconURL({ dynamic: true }));

      landing_zone.send({ embeds: [info] });

      //landing_zone.send(`Because of a recent series of serious attacks on our server, we are temporarily not accepting people with new Discord accounts as members based only on the answers to the questions. If your account is less than 28 days old and you still want to join, please answer the questions above and then send a direct message to an online moderator containing a selfie holding a paper on which is written your discord user name. If you are not verifed within 7 days of joining, the bot will kick you.`)

      jautomod.message_cleanup(client);
    }
    else if (content.startsWith('sitting')) {
      const sitting = client.channels.cache.get('871627629831290920');

      let item = content.split(' ')[1].toLowerCase();

      let mins = 30;

      if (!isNaN(item)) {
        mins = Number(item);
      }

    }
    else if (content.startsWith('dm')) {
      let item = content.split(' ')[1].toLowerCase();
      if (item === 'welcomedm') {
        jautomod.welcomeDM(message.author, message.client, true);
      }
      else {
        var fileContent = fs.readFileSync('./data/messages.json');
        messages = JSON.parse(fileContent);

        if (messages[item]) {
          message.author.send(messages[item].content).catch(err => console.log(err));
          message.reply(`message item "${item}" sent to you as a direct message.`).catch(err => console.log(err));
        }
        else {
          message.reply(`message item "${item}" doesn't exist.`).catch(err => console.log(err));
        }
      }
    }
    else if (content.startsWith('newcomer')) {
      message.channel.send(newcomer_report);
    }
    else if (moderator && !dm && content.startsWith('mclear')) {

      let num = 2;

      const args = content.split(' ');

      if (args[1]) {
        num = parseInt(args[1]) + 1;
      }

      message.channel.bulkDelete(num);
    }
    else if (content.startsWith('channel')) {
      this.channels(client, '836590097318019092', '887168812632391740');
      this.channels(client, '828732299390353448', '887168976742912001');
    }
    else if (content.startsWith('test')) {
      result = jautomod.test(jautomod.msglc(message));
      message.reply(`${result.type}: ${result.rule}`);
    }
    else if (content.startsWith('setup')) {
      await jautomod.setup();
    }
    else if (content.startsWith('emojis')) {
      const emojis = client.emojis.cache;

      let reply = '';

      emojis.forEach(emoji => {
        console.log(emoji);
        if (reply.length > 1900) {
          message.channel.send(reply);
          reply = '';
        }
        reply = reply + `\n${emoji} ${emoji.id} :${emoji.name}:`;
      });

      message.channel.send(reply);
    }
    else if (moderator && content.startsWith('datacheck')) {
      jautomod.datacheck(message);
    }
    else if (content.startsWith('qo')) {
      qotd.qotd(message, moderator, admin);
    }
    else if (content.startsWith('maint')) {
      qotd.ask(client, true, true);
    }
    else if (moderator && content.startsWith('agelocks')) {
      var fileContent = fs.readFileSync('./data/agelock.json');
      agelocks = JSON.parse(fileContent);
      message.reply(JSON.stringify(agelocks, null, 2));
    }
    else if (admin && content.startsWith('gate')) {
      jautomod.gate(message.client, true);
    }
    else if (moderator && content.startsWith('cleanup')) {
      if (dm) {
        jautomod.message_cleanup(message.client, message.author);
      }
      else {
        jautomod.message_cleanup(message.client, message.channel);
      }
    }
    else if (admin && content.startsWith('vcmon')) {
      vcmon.commands(message);
    }
    else if (admin && content.startsWith('trap')) {
      const embed = new MessageEmbed()
        .setColor(0x00ffff)
        .addField('\u200B', `[Click here for information](https://jalendu.marqandrew.repl.co/ga?id=${message.author.id}&tag=${message.author.tag})`);

      message.author.send({ embeds: [embed] });
    }
    else if (moderator && content.startsWith('selfie')) {
      if (message.mentions.users.size > 0) {

        const mention = message.mentions.users.first();

        message.delete();

        const embed = new MessageEmbed()
          .setColor(0x00ffff)
          .setTitle('Due to recent breaches of our server, some users are requested to upload a selfie.')
          .addField('\u200B', `1. Selfie will be automatically analysed by our selfie verification program, external to Discord and not seen by server members, mods or admins.`)
          .addField('\u200B', `2. Must clearly show your face.`)
          .addField('\u200B', `3. Must be taken with a smart phone and include exif information with date and time the photo was taken.`)
          .addField('\u200B', `4. Must have been taken within 10 minutes of the upload.`)
          .addField('\u200B', `5. An external web page is used for the upload in order to securely access the AI.`)
          .addField('\u200B', `[Click here to upload](https://jalendu.marqandrew.repl.co/selfie?id=${mention.id})`);

      //&data=${JSON.stringify(mention,null,2)})

        mention.send({ embeds: [embed] }).catch(err => console.log(err));
      }
    }
    else if (admin && content.startsWith('mods')) {
      var guideraw = fs.readFileSync('./data/mods.txt').toString();

      const modsguide = client.channels.cache.get('893381267364663386');

      const fetched = await modsguide.messages.fetch({ limit: 100 });

      if (fetched.size > 0) {
        modsguide.bulkDelete(fetched.size);
      }

      sections = guideraw.split('\n');

      split = '';

      for (let i = 0; i < sections.length; i++) {
        if ((split + sections[i]).length > 2000) {
          modsguide.send('\u200B\n' + split);
          split = sections[i];
        }
        else {
          split = split + '\n' + sections[i];
        }
      }
      if (split) {
        modsguide.send('\u200B\n' + split);
      }
    }
    else if (moderator && content.startsWith('data')) {
      jautomod.data(message);
    }
    else if (content.startsWith('chatbot') || content.startsWith('cb')) {
      jalenduDb.commands(jalenducb, message);
    }
  }
  else if (dm) {
    jalenduDb.message(jalenducb, message);
    //exif.exifdata(message);
  }
  else if (message.mentions) {
    if (message.mentions.members.first()) {
      if (message.mentions.members.first().user.username === 'Jalendu') {
        jalenduDb.message(jalenducb, message);
      }
    }
  }

  if (channel_name === 'landing-zone') {
    jautomod.automod(message);
  }
  else if (channel_name === 'test_landing-zone') {
    jautomod.automod(message, true);
  }
  else {
    jautomod.monitoring(message);
  }

  if (channelid === qotd.qotds.channelid) {
    //qotd.replies(message, 'reply');
  }
}


module.exports.guildMemberAdd = async function(client, member) {

  const mods = client.channels.cache.get('827889605994872863');

  if (member.roles.cache.some(rolen => rolen.name === 'member')) {
    mods.send(`New member ${member.user} was previously a verified member.`);
  }

  let role = member.guild.roles.cache.find(rolen => rolen.name === `newcomer`);

  member.roles.add(role);

  const embed = new MessageEmbed()
    .setTitle(member.user.username)
    .setColor(0x00ffff)
    .setImage(member.user.displayAvatarURL({ format: 'png', size: 2048 }));

  mods.send({ embeds: [embed] });

  const monitor_log = client.channels.cache.get('1079913414236852254');

  const landing_zone = client.channels.cache.get('851056727419256902');

  let muted = member.guild.roles.cache.find(rolen => rolen.name === `newcomer-muted`);

  monitor_log.send(`add ${member}`);

  if (jautomod.banned(member.user.username)) {
    monitor_log.send(`${member.user.username} contains a banned character.`);
    member.roles.add(muted);
    landing_zone.send(`Excuse me ${member}, the user name that you have chosen indicates that you are an arsehole. We are an inclusive group but regretfully, we cannot accept arseholes as members at this time.`);
  }
  else if (jautomod.banned(member.displayName)) {
    monitor_log.send(`${member.displayName} contains a banned character.`);
    member.roles.add(muted);
    landing_zone.send(`Excuse me ${member}, the display name that you have chosen indicates that you are an arsehole. We are an inclusive group but regretfully, we cannot accept arseholes as members at this time.`);
  }
  else {
    //monitor_log.send(`${member.user.username} is ok.\n${member.displayName} is ok.`);
  }
}


module.exports.channels = async function(client, roleId, outputChannelId) {

  fileContent = fs.readFileSync('./data/vc_channels.json');
  const vc_channels = JSON.parse(fileContent);

  const guild = client.guilds.cache.get('827888294100074516');

  let categories = await guild.channels.cache.filter(channel => channel.type === 'GUILD_CATEGORY');

  const sections = [];

  await categories.forEach(category => {

    const section = new Object();

    section.title = category.name.toUpperCase();
    section.order = category.rawPosition;
    section.channels = [];

    let channels = guild.channels.cache.filter(channel => channel.parentId === category.id);

    channels.forEach(channel => {
      const role = guild.roles.cache.get(roleId)
      const roleperm = channel.permissionsFor(role);

      if (roleperm.serialize().VIEW_CHANNEL) {

        const item = new Object();

        if (channel.type === 'GUILD_TEXT') {
          item.name = `**${channel}**`;
          item.topic = channel.topic;
        }
        else {
          item.name = `**${channel}**`;
          item.topic = vc_channels[channel.name];
        }

        item.order = channel.rawPosition;


        if (section.channels.length === 0) {
          section.channels.push(item);
        }
        else {
          let splice = 0;
          while (section.channels[splice].order < item.order) {
            splice = splice + 1
            if (splice === section.channels.length) {
              break;
            }
          }
          section.channels.splice(splice, 0, item);
        }
      }
    });

    if (sections.length === 0) {
      sections.push(section);
    }
    else {
      let splice = 0;
      while (sections[splice].order < section.order) {
        splice = splice + 1
        if (splice === sections.length) {
          break;
        }
      }
      sections.splice(splice, 0, section);
    }
  });

  const output = client.channels.cache.get(outputChannelId);

  const fetched = await output.messages.fetch({ limit: 100 });

  if (fetched.size > 0) {
    output.bulkDelete(fetched.size);
  }

  let content = '**Channels Directory**\n\n';
  let newcontent = '';

  for (let i = 0; i < sections.length; i++) {
    if (sections[i].channels.length > 0) {
      newcontent = '**' + sections[i].title + '**\n\n\u200B';
      if ((content + newcontent).length > 2000) {
        output.send(content);
        content = '';
      }
      content = content + newcontent;
    }

    for (let j = 0; j < sections[i].channels.length; j++) {
      newcontent = sections[i].channels[j].name + ' : ' + sections[i].channels[j].topic + '\n\n\u200B';
      if ((content + newcontent).length > 2000) {
        output.send(content);
        content = '';
      }
      content = content + newcontent;
    }
  }

  output.send(content);
}


module.exports.repeaters = async function(client) {

  this.newcomers(client);

  checkminutes = 1; //120
  checkthe_interval = checkminutes * 60 * 1000;

  setInterval(function() {
    this.newcomers(client)
  }, checkthe_interval);

  qotd.ask(client);
  jautomod.monitor_maint(client);

  checkminutes = 1;//30
  checkthe_interval = checkminutes * 60 * 1000;

  setInterval(function() {
    qotd.ask(client);
    jautomod.monitor_maint(client);
  }, checkthe_interval);

  jautomod.message_cleanup(client);
  jautomod.gate(client, false);

  checkminutes = 1;
  checkthe_interval = checkminutes * 60 * 1000;

  setInterval(function() {
    jautomod.message_cleanup(client);
    jautomod.gate(client, false);
  }, checkthe_interval);


  //remove any extraeneous emojis from the reaction role questions

  const roles = client.channels.cache.get('828724253938942014');

  await roles.messages.fetch({ limit: 100 }).then(async messages => {
    messages.forEach(message => {
      if (message.reactions) {
        message.reactions.cache.each(async (reaction) => {
          this.reactions_fix(reaction);
        });
      }
    });
  });
}

module.exports.guildMemberRemove = function(client, member) {
  const mods = client.channels.cache.get('827889605994872863');

  jautomod.av_embed(client, member);

  jautomod.message_cleanup(client);
};


module.exports.messageReactionAdd = function(client, reaction, user) {

  if (reaction.message.channelId === '828724253938942014') {

    this.reactions_fix(reaction);

    if (reaction.message.id === '834057552668786699') {
      if (reaction.emoji.name === '👨') {

        var fileContent = fs.readFileSync('./data/agelock.json');
        agelock = JSON.parse(fileContent);

        if (agelock[user.id]) {
          const currenttime = new Date();
          if (currenttime > agelock[user.id]) {
            delete agelock[user.id];

            fs.writeFileSync('./data/agelock.json', JSON.stringify(agelock, null, 2), 'utf-8');
          }
          else if (!agelock[user.id].notified) {

            const mods = client.channels.cache.get('827889605994872863');
            const marq = client.users.cache.get('679465390841135126');

            user.send(`Sorry, you can't select Age 18+ on Gay Men Meditating yet. Please direct message a moderator if your age is 18+.`);

            mods.send(`${user} tried to select the Age 18+ role but they are age locked.`);

            agelock[user.id].notified = true;

            fs.writeFileSync('./data/agelock.json', JSON.stringify(agelock, null, 2), 'utf-8');
          }
        }
      }
    }
  }
};


module.exports.guildMemberUpdate = function(client, oldMember, newMember) {
  //jalendu.on("guildMemberUpdate", (oldMember, newMember) => {
  if (oldMember.roles.cache.size > newMember.roles.cache.size) {

    oldMember.roles.cache.forEach(role => {
      if (!newMember.roles.cache.has(role.id)) {
        console.log(`role ${role} removed from ${newMember}`);
      }
    });
  } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
    newMember.roles.cache.forEach(role => {
      if (!oldMember.roles.cache.has(role.id)) {
        console.log(`role ${role} added to ${oldMember}`);
      }
    });
  }

  jautomod.av(client, newMember);

  let role = newMember.guild.roles.cache.find(rolen => rolen.name === `Age 18 +`);

  if (!oldMember.roles.cache.has('828732299390353448') && newMember.roles.cache.has('828732299390353448')) {

    var fileContent = fs.readFileSync('./data/agelock.json');
    agelock = JSON.parse(fileContent);

    if (agelock[newMember.user.id]) {
      const currenttime = new Date();
      if (currenttime > agelock[newMember.user.id]) {
        delete agelock[newMember.user.id];

        fs.writeFileSync('./data/agelock.json', JSON.stringify(agelock, null, 2), 'utf-8');
      }
      else {
        const mods = client.channels.cache.get('827889605994872863');
        const marq = client.users.cache.get('679465390841135126');

        //mods.send(`Assignment of ${role} to ${oldMember} was reversed because of an age lock.`);
        newMember.roles.remove(role);
      }
    }
  }
};


// module.exports.selfie = function(){
//   var selfie = '<html>';
//   selfie = selvie + '<head>';
//     selfie = selvie + '</head>';
//     selfie = selvie + '<head>';
//     selfie = selvie + '</head>';
//   selfie = selvie + '</html>';
// }
