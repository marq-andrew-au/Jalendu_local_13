const { MessageEmbed } = require('discord.js');

var quiz = require('./quiz.js');

module.exports.setup = function(client, channel) {

  if (channel.id === '1089622121346514974') {
    channel.bulkDelete(100).catch(err => { console.log(err) });
  }
  else if (channel.id === '1088321214205931520') {
    channel.bulkDelete(100).catch(err => { console.log(err) });
  }
  else if (channel.id === '1124570586518126633') {
    channel.bulkDelete(100).catch(err => { console.log(err) });
  }
  else if (channel.id === '1089313201151299605') {
    channel.bulkDelete(100).catch(err => { console.log(err) });
  }
  else if (channel.id === '1088323549263052862') {
    channel.bulkDelete(100).catch(err => { console.log(err) });
  }
  else if (channel.id === '1229631587633725462') {
    channel.bulkDelete(100).catch(err => { console.log(err) });

    channel.send("**Welcome to the LGBTQIA+ Antifa Reaction Roles.**" +
     "\nSet your roles by reacting to each setting with the appropriate emoji. " +
     "Since this page is rebuilt from time to time, the emoji may show as unreacted even though the role is set. " +
     "Check your profile to clarify.")
      .catch(err => { console.log(err) });

      const embed = new MessageEmbed()
        .setTitle(`Gate Channels Access`)
        .setDescription('By default, for privacy and security, members lose access to the gate channels when they are verified. ' +
        'You can regain access to the gate channels by selecting this role. Your user name will appear in the channel list ' +
        'and since the gate channels are minimally moderated, you may be exposed to abuse.\n' +
        '🚧 = role: gater');

      channel.send({ embeds: [embed] })
        .then(function(message) { message.react('🚧') })
        .catch(err => { console.log(err) });

  }
  else if (channel.id === '1086895233037516800') {
    channel.bulkDelete(100).catch(err => { console.log(err) });

    channel.send("```Welcome to the LGBTQIA+ Antifa (Anti-fascist) International Collective. The activities of this group are secret but are in full compliance with the Discord TOS.\n\n⚠️ This server is trans 🏳️‍⚧️inclusive. 2S people are also warmly welcomed. Fascists, NAZIs, MAGAs, racists, homophobes, transphobes, TERFs or any other category of arsehole need not apply (i.e. fuck off!)\n\nIn order to gain admission, you must pass an examination consisting of a number of multiple choice questions that will be asked in a private channel named 'exam-[your member id number]'. To create your private channel and begin your interrogation, react to this message with ✅```")
      .then(function(message) { message.react('✅') })
      .catch(err => { console.log(err) });
  }
  else if (channel.id === '1089313388187885690') {
    channel.bulkDelete(100).catch(err => { console.log(err) });

    const specta = ['racist - unprejudiced', 'homophobic - homofavorable', 'transphobic - transfavorable', 'right-leaning - left-leaning', 'conservative - progressive', 'authoritarian - democratic', 'capitalist - socialist', 'totalitarian - anarchist'];

    const example =
    {
      "question": "Should books that realistically portray diverse types of romantic relationships, family structures and gender identities be made available to young children?",
      "spectra": ['homophobic - homofavorable', 'transphobic - transfavorable', 'conservative - progressive', 'right-leaning - left-leaning'],
      "answers": [
        {
          "answer": "No.",
          "reply": "Wrong",
          "score": -5
        },
        {
          "answer": "Yes, but only if parents/guardians approve.",
          "reply": "Wrong",
          "score": -5
        },
        {
          "answer": "Yes, even if parents/guardians disapprove.",
          "reply": "Correct",
          "score": 5
        },
        {
          "answer": "I don't know.",
          "reply": "Neutral",
          "score": 0
        },
      ]
    };

    channel.send(`To submit a new question to the entry test, the only way to do it at the moment is to submit as a message to <#1088323549263052862> a properly formed JSON string for example:\`\`\`${JSON.stringify(example, null, 2)}\`\`\`\n\nEnter JSON (JavaScript Object Notation) in this format as a message in <#1088323549263052862>. If your question is properly formatted, it will be immediately submitted to <#1089032248017293333>, otherwise you will get a reply indicating the format error.\n\nThe example above has 4 answer choices. The minimum is 2.  Scores should usually be in the range -5 to +5 with -5 being wrong, 0 being null answers and 5 being correct from an lgbtqia+ antifa (pro-trans, pro-gay, left-leaning, progressive) perspective.\n\nIf you delete the fourth answer, be careful to delete the trailing comma after the previous "}". Trailing commas are a syntax error. All property names and string values must be in double quotes. Use ":" not "=" between property names and values.`).catch(err => { console.log(err) });

    channel.send(`All answers must have the three properties "answer" (the multiple choice answer option), "reply" (the response if that answer is chosen. This can be insulting if you wish), "score" (the number of points added or subtracted from the score if this answer is chosen.\n\nThere is also an optional property "entrap" that must have values true or false (no quotes). This should only be set to true in extreme circumstances. If someone choses an answer with "entrap" set to true, they will never get verified (level 1) no matter how many points they have.\n\nRemember to use shift-enter to make a new line if editing within discord. Don't worry about endenting etc. The bot will do that for you.`).catch(err => { console.log(err) });

    channel.send(`NEW: Please try to include at least 1 positive score (right), at least 1 negative score (wrong) and zero score (e.g. I don't know) answer in your questions.`).catch(err => { console.log(err) });

    channel.send(`NEW: Please include at least 1 profiling spectrum "spectra" to your question. The currently valid spectra are: \`\`\`${JSON.stringify(quiz.spectra, null, 2)}\`\`\`\nThe score adds to these spectra in a user's dossier. Negative scores indicate that the user is on the left side of these spectra and positive scores to the right (opposite to political left-right just to be confusing).`).catch(err => { console.log(err) });

  }
  else if (channel.id === '1089313731273568256') {
    channel.bulkDelete(100).catch(err => { console.log(err) });

    channel.send("Check the status of the question in the first line for example:\n```Question submitted by @member [🔥]```\n🔥 means question not yet approved and open for voting.\n✅ means question has been approved.\n🚫 means question rejected by a convenor (decision reversable).\n⚠️ means question suspended by a convenor or the question author, probably meaning that an edited version will be submitted later.\n\nDebate question and vote by reacting with 👍  or 👎 . Net +5 triggers accepted ✅").catch(err => { console.log(err) });
  }
  else if (channel.id === '1089658127814770848') {
    channel.bulkDelete(100).catch(err => { console.log(err) });

    const embed = new MessageEmbed()
      .setTitle(`Welcome to ${channel.guild.name}`)
      .setImage(channel.guild.iconURL({ format: 'png', size: 1024 }));

    channel.send({ embeds: [embed] }).catch(err => { console.log(err) });

    channel.send("`Congratulations on attaining Level 1 Verification. If you want to take the test again, send a direct message to the server bot` <@1087250515932483664> `!ga-exam.\n\nIf you haven't realised by now, the original purpose of this server was to lure fascists, right wing keyboard culture warriors and trolls, racists, homophobes, transphobes and various other scumbags into answering a whole lot of questions that would annoy the shlt out of them, and possibly re-educate them if they answered correctly, and then when finally admitted, find that there isn't actually much here! 🤣😂🤣😂🤣😂🤣😂🤣😂🤣😂🤣😂 \n\nHowever, assuming some real, decent, intelligent, lgbtqia+ anti-fascists have  joined, we are trying to build something useful here.\n\n`").catch(err => { console.log(err) });

    //channel.send("`The LGBTQIA+ Bot being developed in conjunction with this server continues development. So far, the following functions have been built.\n\n1. As you know if you're here, you have to get enough points by correctly answering multiple choice questions to get to the level of verification that would allow you to read this.\n2. You can submit your own questions that if approved will be added to the verification test! Read how in `<#1089313388187885690>`\n3. You can debate and vote on the questions others have submitted. Enough votes and your question will be included in the verification test.`<#1089313731273568256>\n\n").catch(err => { console.log(err) });

    //channel.send("`4. There is a list of invitation links to other lgbtqia+ discord servers at `<#1086895050304262304>`. Please add any more that you know or like.\n5. Unverified members who write homophobic or racist words instead of valid answers get trapped in the exam forever no matter how many points they get.\n\n\nPlease write any ideas you have to develop this server further in `<#1089802797341478932>`.\n\n`").catch(err => { console.log(err) });

    channel.send("`LGBTQIA+ Antifa\n\nThis server is dedicated to fighting Anti-LGBTQIA+ Fascism, hate and discrimination in all its forms in whatever way we can and supporting those members of the community who are its survivors.\n\nThis group is not sexually focussed and we push back strongly against any suggestion that because we are a sexuality and gender focussed group, it is necessarily sexual (as some claim).\n\n`").catch(err => { console.log(err) });

    channel.send("`Content.\n\nLGBTQIA+ Antifa is a “SFW” group open to all ages that Discord is also open to (13+), however, we recognise that people are aware of their gender and their gender non-conformance from a very early age and aware of their sexuality and experience sexual attraction from puberty, so discussion of gender and sexuality issues, especially as they relate to politics, is open to everyone.\n\nDo not post images of gore, animal cruelty or anything of that nature. Pornographic or sexually explicit images should be avoided unless there is an Antifa context. Do not post any nude or sexually suggestive image of a person who is or appears to be under age 18, including if it is yourself.\n\n`").catch(err => { console.log(err) });

    channel.send("`In recent years, conservative politicians have tied to push back on LGBTQIA+ acceptance by restricting access to books and information that normalise gender and sexuality diversity. One consequence of that is anxiety about what kind of content young teens (13 - 17) can access as well as anxiety about adults discussing gender and sexuality with teens. Adults who normalise and discuss gender and sexuality issues with young teens are often accused of being “groomers”. We reject that and do not place any age restriction on the content here. There is nothing illegal or unethical about the inclusion of young teens in the discussion of these issues. However, adults should not use the contact facilitated by this server to engage with young teens sexually and vice versa, even when that engagement would be legal in your jurisdiction. People found to be doing so will be excluded from the group.\n\n`").catch(err => { console.log(err) });

    channel.send("`Please treat verified members with respect. Verified members are free to raise any issue but freedom of speech has never been an excuse to tell lies or to intentionally cause offence. Give us facts or honest opinion. Do not use terms of personal abuse. Although most profanity is allowed, do not use racist, transphobic or homophobic slurs. If you do, the bot will detect it and demote your verification level. That means for most people, you would need to pass the exam again to get access.\n\nFacts (including honest personal experience) take precedence over opinion. Rational fact-based opinion takes precedence over ideology or belief. We reject post-truth.\n\n`").catch(err => { console.log(err) });

    channel.send("`Political discussion is welcome but we recognise that not everyone who has experience of or opposes anti-lgbtqia+ violence, discrimination, oppression or hate is political or has a clear idea of the technical definition of fascism as militant authoritarianism and ultranationalism where the individual is subservient to the corporate state and leader. Antifa has always been defined by what it opposes which is a wider definition than some 1930's textbook definition of Fascism. People who identify as Antifa or who have been identified by others as Antifa have political beliefs ranging from liberals to anarchists to none at all. Anyone who persists in the boring, useless and endless discussion that implies that a member (including the owner) is unwelcome, that they are \"not serious\", \"a liberal\" or \"not interested in the liberation of the working class\" may find themselves banned without warning.\n\n`").catch(err => { console.log(err) });

    channel.send("`Direct Messages\n\nDirect messages are facilitated by making someone a friend or by having at least one server in common, however they do not go through the server in any sense. Direct messages are your business. You can block direct messages from an individual (in which case you may not be able to see their messages in server channels as well) or you can block direct messages from all members of the server (you can still see their messages in channels and also if you are their friend or share another server).\n\nIn general, do not post personal direct messages to channels or complain about them to convenors. It up to you to manage or block them. However, there are exceptions:\n\n1. Racist, transphobic or homophobic abuse should be reported to the group in a chat channel, not just to convenors privately.\n2. Scammers, people posting malicious links, pushing financial advice or “my brother is a crypto-currency broker”, “free nitro”, “light workers” etc. report to the group.\n\n`").catch(err => { console.log(err) });

    channel.send("`If you can, turn on developer mode (in user settings / advanced). Then when you right click on the user, you will see “Copy User ID”, then paste the number e.g. 679465390841135126, into the channel. This allows server mods and admins to pre-emptively ban them from sensitive servers, even if they have not yet joined. (Type a message  <@679465390841135126> using the number you copied and it will resolve to a user’s mention which mods can right click on and ban even if they are not in the server. Only works on PC I think).\n\nDo not click on links sent to you in direct messages unless you are certain what they will open. Links sent in direct messages may contain parameters that will identify your discord id in an external server that will also know your IP address and other information. Do not enter your password into any page that opens from a link sent in direct messages. Invite links should open directly in discord without having to re-athenticate. It is strongly recommend that you turn on two-factor authentication.`").catch(err => { console.log(err) });
  }
  else if (channel.id === '1126838071871156284') {
    channel.bulkDelete(100).catch(err => { console.log(err) });

    const embed = new MessageEmbed()
      .setTitle(`Welcome to ${channel.guild.name}`)
      .setImage(channel.guild.iconURL({ format: 'png', size: 1024 }));

    channel.send({ embeds: [embed] }).catch(err => { console.log(err) });

    channel.send("`Direct Messages\n\nDirect messages are facilitated by making someone a friend or by having at least one server in common, however they do not go through the server in any sense. Direct messages are your business. You can block direct messages from an individual (in which case you may not be able to see their messages in server channels as well) or you can block direct messages from all members of the server (you can still see their messages in channels and also if you are their friend or share another server).\n\nIn general, do not post personal direct messages to channels or complain about them to convenors. It up to you to manage or block them. However, there are exceptions:\n\n1. Racist, transphobic or homophobic abuse should be reported to the group in a chat channel, not just to convenors privately.\n2. Scammers, people posting malicious links, pushing financial advice or “my brother is a crypto-currency broker”, “free nitro”, “light workers” etc. report to the group.\n\n`").catch(err => { console.log(err) });
  }}
