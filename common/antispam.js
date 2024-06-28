
const fs = require('fs');

const common_code = require('./common.js');

const immuneRoles = [];

const spam = new Object();

module.exports.spamtest = async function(client,message){
  message.channel.messages.fetch({limit: 10}).then(msgs => {
  for (const [key, value] of msgs)
    this.spam(client,value,true);
  });
}

module.exports.spam = async function(client,message,test){

  if (message.author.bot || message.channel.type === 'DM'){
    return;
  }

  if(message.channel.name.startsWith('exam')){
    return;
  }

  if(message.channel.name.startsWith('question-submission')){
    return;
  }


	if(!spam.hasOwnProperty(message.author.id)){
    spam[message.author.id] = new Object();
    spam[message.author.id].id = message.author.id;
    spam[message.author.id].username = message.author.username;
    spam[message.author.id].channelid = new Array();
    spam[message.author.id].messageid = new Array();
    spam[message.author.id].content = new Array();
    spam[message.author.id].createdAt = new Array();
    spam[message.author.id].uppercase = new Array();
    spam[message.author.id].length = new Array();
    spam[message.author.id].attachments = new Array();
  } 

  spam[message.author.id].channelid.unshift(message.channel.id);
  spam[message.author.id].messageid.unshift(message.id);
  spam[message.author.id].content.unshift(message.content);
  spam[message.author.id].createdAt.unshift(message.createdAt);


  if (message.content.toUpperCase() === message.content){
    spam[message.author.id].uppercase.unshift(1);
  }
  else {
    spam[message.author.id].uppercase.unshift(0);
  }

  spam[message.author.id].length.unshift(message.content.length);

  spam[message.author.id].attachments.unshift(message.attachments.size);

  spam[message.author.id].channelid = spam[message.author.id].channelid.slice(0,10);
  spam[message.author.id].messageid = spam[message.author.id].messageid.slice(0,10);
  spam[message.author.id].content = spam[message.author.id].content.slice(0,4);
  spam[message.author.id].createdAt = spam[message.author.id].createdAt.slice(0,4);
  spam[message.author.id].uppercase = spam[message.author.id].uppercase.slice(0,4);
  spam[message.author.id].length = spam[message.author.id].length.slice(0,4);
  spam[message.author.id].attachments = spam[message.author.id].attachments.slice(0,4);

  //console.log(JSON.stringify(spam,null,2));

  mindate = new Date(spam[message.author.id].createdAt.slice(-1));
  maxdate = new Date(spam[message.author.id].createdAt[0]);
  spam[message.author.id].duration = Math.abs(maxdate.getTime() - mindate.getTime())/1000;

  spam[message.author.id].uppercasesum = 0;
  spam[message.author.id].lengthsum = 0;
  spam[message.author.id].lengthxssum = 0;
  spam[message.author.id].attachmentssum = 0;

  for (let i = 0; i < spam[message.author.id].content.length; i++ ) {
    spam[message.author.id].uppercasesum = spam[message.author.id].uppercasesum + spam[message.author.id].uppercase[i];
    spam[message.author.id].lengthsum = spam[message.author.id].lengthsum + spam[message.author.id].length[i];
    spam[message.author.id].attachmentssum = spam[message.author.id].attachmentssum + spam[message.author.id].attachments[i];
    if(spam[message.author.id].length[i]>800){
      spam[message.author.id].lengthxssum = spam[message.author.id].lengthxssum + 1;
    }
  }


  spam[message.author.id].same = false;


  if(spam[message.author.id].content.length>2){
    if(spam[message.author.id].content[0] === spam[message.author.id].content[1] && 
    spam[message.author.id].content[1] === spam[message.author.id].content[2]){
      spam[message.author.id].same = true;
    }
  }

  if(spam[message.author.id].content.length>3){
    if(spam[message.author.id].content[0].substring(0,20) === spam[message.author.id].content[1].substring(0,20) && 
    spam[message.author.id].content[1].substring(0,20) === spam[message.author.id].content[2].substring(0,20) && 
    spam[message.author.id].content[2].substring(0,20) === spam[message.author.id].content[3].substring(0,20)){
      spam[message.author.id].same = true;
    }
  };


  if(test){
    return;
  }

  let spammer = false;

  if (spam[message.author.id].duration < 60){
    if(spam[message.author.id].same || spam[message.author.id].lengthxssum > 2 || spam[message.author.id].uppercasesum > 2 || spam[message.author.id].lengthsum > 3000 || spam[message.author.id].attachmentssum > 3){
      spammer = true;
    }
  }
  else if (spam[message.author.id].duration < 120){
    if(spam[message.author.id].lengthxssum > 2 || spam[message.author.id].lengthsum > 2000 || spam[message.author.id].attachmentssum > 3){
      spammer = true;
    }
  }

  if(spammer){
    message.reply('TIMEOUT 120 MINS: Spamer detected. Contact a mod if incorrect.').catch(err => console.log(err));;
    message.member.timeout(120 * 60 * 1000).catch(err => console.log(err));

    //for (let i = 0; i < spam[message.author.id].messageid.length; i++ ) {
    for (let i = 0; i < 3; i++ ) {
      client.channels.fetch(spam[message.author.id].channelid[i]).then(channel => {
        channel.messages.delete(spam[message.author.id].messageid[i]).catch(err => console.log(err));
      });
    }

    fs.writeFileSync(`./spammers/${message.author.id}_${common_code.ts()}.json`, JSON.stringify(spam[message.author.id], null, 2), 'utf-8');

    console.log(JSON.stringify(spam[message.author.id],null,2));
  }


  for (const [key, value] of Object.entries(spam)) {
    let now = new Date();
    let newest = new Date(value.createdAt[0]);
    let age = (now - newest) / 1000;

    if(age > 3 * 60){
      delete spam[value.id];
    }
  }

  //console.log(JSON.stringify(message,null,2));
}