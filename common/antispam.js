
const immuneRoles = [];

const spam = new Object();

module.exports.spamtest = async function(message){
  message.channel.messages.fetch({limit: 10}).then(msgs => {
  for (const [key, value] of msgs)
    this.spam(value,true);
  });
}

module.exports.spam = async function(message,test){

  if (message.author.bot || message.channel.type === 'DM'){
    return;
  }

	if(!spam.hasOwnProperty(message.author.id)){
    spam[message.author.id] = new Object();
    spam[message.author.id].id = message.author.id;
    spam[message.author.id].username = message.author.username;
    spam[message.author.id].content = new Array();
    spam[message.author.id].createdAt = new Array();
    spam[message.author.id].same = new Array();
    spam[message.author.id].uppercase = new Array();
    spam[message.author.id].same20 = new Array();
    spam[message.author.id].length = new Array();
    spam[message.author.id].attachments = new Array();
    spam[message.author.id].warned = false;
  } 

  spam[message.author.id].content.unshift(message.content);
  spam[message.author.id].createdAt.unshift(message.createdAt);

  if(spam[message.author.id].content.length>1){
    if (spam[message.author.id].content[0] === spam[message.author.id].content[1]){
      spam[message.author.id].same.unshift(1);
    }
    else {
      spam[message.author.id].same.unshift(0);
    }

    console.log(spam[message.author.id].content[1]);

    if (spam[message.author.id].content[0].substring(0,20) === spam[message.author.id].content[1].substring(0,20)){
      spam[message.author.id].same20.unshift(1);
    }
    else {
      spam[message.author.id].same20.unshift(0);
    }
  }
  else {
    spam[message.author.id].same.unshift(0);
    spam[message.author.id].same20.unshift(0);
  }

  if (message.content.toUpperCase() === message.content){
    spam[message.author.id].uppercase.unshift(1);
  }
  else {
    spam[message.author.id].uppercase.unshift(0);
  }

  spam[message.author.id].length.unshift(message.content.length);

  spam[message.author.id].attachments.unshift(message.attachments.size);

  spam[message.author.id].content = spam[message.author.id].content.slice(0,3);
  spam[message.author.id].createdAt = spam[message.author.id].createdAt.slice(0,3);
  spam[message.author.id].same = spam[message.author.id].same.slice(0,3);
  spam[message.author.id].uppercase = spam[message.author.id].uppercase.slice(0,3);
  spam[message.author.id].same20 = spam[message.author.id].same20.slice(0,3);
  spam[message.author.id].length = spam[message.author.id].length.slice(0,3);

  console.log(JSON.stringify(spam,null,2));

  mindate = new Date(spam[message.author.id].createdAt.slice(-1));
  maxdate = new Date(spam[message.author.id].createdAt[0]);
  duration = Math.abs(maxdate.getTime() - mindate.getTime())/1000;

  let samesum = 0;
  let uppercasesum = 0;
  let same20sum = 0;
  let lengthsum = 0;
  let length800sum = 0;
  let attachmentssum = 0;

  for (let i = 0; i < spam[message.author.id].same.length; i++ ) {
    samesum = samesum + spam[message.author.id].same[i];
    uppercasesum = uppercasesum + spam[message.author.id].uppercase[i];
    same20sum = same20sum + spam[message.author.id].same20[i];
    lengthsum = lengthsum + spam[message.author.id].length[i];
    attachmentssum = attachmentssum + spam[message.author.id].attachments[i];
    if(spam[message.author.id].length[i]>800){
      length800sum = length800sum + 1;
    }
  }

  console.log(`duration ${duration}`);
  console.log(`samesum ${samesum}`);
  console.log(`uppercasesum ${uppercasesum}`);
  console.log(`same20sum ${same20sum}`);
  console.log(`lengthsum ${lengthsum}`);
  console.log(`length800sum ${length800sum}`);
  console.log(`attachmentssum ${attachmentssum}`);

  if(test){
    return;
  }

  if (duration < 60){
    if(samesum === 3 || same20sum === 3 || length800sum === 3 || uppercasesum === 3 || lengthsum > 1000 || attachmentssum > 3){
      message.reply('MEMBER TIMEOUT 120 MINS: Potential spamer detected.').catch(err => console.log(err));;
      message.member.timeout(120 * 60 * 1000).catch(err => console.log(err));
    }
  }
  else if (duration < 120){
    if(length800sum === 3 || lengthsum > 1000 || attachmentssum > 3){
      message.reply('MEMBER TIMEOUT 120 MINS: Potential spamer detected.').catch(err => console.log(err));;
      message.member.timeout(120 * 60 * 1000).catch(err => console.log(err));
    }
  }

  //console.log(JSON.stringify(message,null,2));
}