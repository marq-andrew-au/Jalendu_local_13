
//const Database = require("@replit/database");

//const db = new Database();

const db = require('../common/text_database.js');

const fs = require('fs');

function reviver(key, value) {
  if (typeof value === "string" && key.includes('time')) {
    return new Date(value);
  }
  return value;
}

module.exports.ga_guilds = new Object();

module.exports.init = function() {
  db.get('ga_guilds')
    .then(value => {     
      if(value){
        this.ga_guilds = JSON.parse(value, reviver);
      }
      else{
        var fileContent = fs.readFileSync('./gadata/ga_guilds.json');
        this.ga_guilds = JSON.parse(fileContent);
      }
      console.log(JSON.stringify(this.ga_guilds,null,2));
    })
    .catch(err => { console.log(err) });
}


module.exports.home = {
  guild : {
    id : "1086894060914098176",
    system_channel : "1088321214205931520",
    invite: "https://discord.gg/CEXGr7RN7A"
  },
  bot : {
    invite : "https://discord.com/api/oauth2/authorize?client_id=1087250515932483664&permissions=335621329&scope=bot%20applications.commands"
  }
}


module.exports.joined = function(client, guild) {
  const homesys = client.channels.cache.get(this.home.guild.system_channel);

  homesys.send(`${client.user.username} added to ${guild.name}`).catch(err => { console.log(err) });

  if (!this.ga_guilds) {
    this.ga_guilds = new Object();
  }
  
  const newguild = new Object();

  newguild.name = guild.name;
  newguild.system_channel = guild.systemChannelId;
  delete newguild.system_channel_status;

  const thissys = client.channels.cache.get(newguild.system_channel);

  this.ga_guilds[guild.id] = newguild;

  this.set_logging_channel(client,thissys);

  db.set('ga_guilds', JSON.stringify(this.ga_guilds)).catch(err => { console.log(err) });
}


module.exports.left = function(client, guild) {
  const homesys = client.channels.cache.get(this.home.guild.system_channel);

  homesys.send(`${client.user.name} removed from ${guild.name}`).catch(err => { console.log(err) });
}


module.exports.set_logging_channel = function(client, channel) {
  if(!this.ga_guilds[channel.guildId]){
    this.joined(client,channel.guild);
  }
  
  channel.send(`${client.user.username} will send messages here. Use !ga-set-logging-channel #channel to reset.`)
    .catch(err => {
      const current = client.channels.cache.get(this.ga_guilds[channel.guildId].system_channel);
      current.send(`No permissions for ${client.user.username} to send messages to ${channel}. Use !ga-set-logging-channel #channel to reset or grant permissions.`)
        .catch(err => {
          channel.guild.fetchOwner()
            .then(owner => { 
              owner.user.send(`No permissions for ${client.user.username} to send messages to ${channel}. Use !ga-set-logging-channel #channel to reset or grant permissions.`).catch(console.error);
            });
        })
      })
      .then (message => {
        this.ga_guilds[channel.guildId].system_channel = channel.id;
        this.ga_guilds[channel.guildId].system_channel_name = channel.name;
        db.set('ga_guilds', JSON.stringify(this.ga_guilds)).catch(console.error);
    })
}


module.exports.set_admin_role = function(client, role, user) {
  const sys = client.channels.cache.get(this.ga_guilds[role.guild.id].system_channel);
  sys.send(`<@${user.id}> set <@${client.user.id}> bot admin role to <@&${role.id}>`).catch(console.error);

  this.ga_guilds[role.guild.id].admin_role = role.id;
  this.ga_guilds[role.guild.id].admin_role_name = role.name;
  db.set('ga_guilds', JSON.stringify(this.ga_guilds)).catch(console.error);
}