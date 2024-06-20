
const immuneRoles = [];

const spam = new Object();

module.exports.spam = async function(message){

  if (message.author.bot || message.channel.type === 'DM'){
    return;
  }

  var now = new Date();

	spam[message.author.id] = new Object();

	spam[message.author.id].username = message.author.username;
  
  if (spam.hasOwnProperty("content")){
    spam[message.author.id].contentPrev = spam[message.author.id].content;
  }
  else {
    spam[message.author.id].contentPrev = 'Unknown Message';
  }

  spam[message.author.id].content = message.content

  if (spam.hasOwnProperty("createdAt")){
    spam[message.author.id].createdAtPrev = spam[message.author.id].createdAt;
  }
  else {
    var oneHourAgo = new Date(now.setHours(now.getHours()-12));
    spam[message.author.id].createdAtPrev = oneHourAgo;
  }

  spam[message.author.id].createdAt = message.createdAt;




	console.log(JSON.stringify(spam,null,2));

	console.log(JSON.stringify(message,null,2));
}