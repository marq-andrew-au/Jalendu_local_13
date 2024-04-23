  const channel = message.client.channels.cache.get('874900065142046720');

      channel.messages.fetch({ limit: 100 }).then(async messages => {
        messages.forEach(message => {

          let urlrx1 = new RegExp("$(http:\/\/|https:\/\/|ftp:\/\/|email:\/\/|file:\/\/)?([a-z0-9]+\.?)+");

          let urlrx2 = new RegExp("([a-z0-9]+\.)+(com|co|org|edu|gov|biz|info)$");

          let words = message.content.split(' ');
          for (let i = 0; i < words.length; i++) {
            if (urlrx1.test(words[i]) || urlrx2.test(words[i])) {
              console.log(words[i]);
            }
          }
        });
      });


      // if (message.author.username === 'marq_andrew') {
      //   const channel = message.client.channels.cache.get('837570108745580574');

      //   channel.messages.fetch({ limit: 100 }).then(async messages => {
      //     messages.forEach(message => {
      //       if (message.author.username === 'Jalendu') {
      //         message.delete();
      //       }
      //     });
      //   });
      // }




// async function tz() {
//   const guild = jalendu.guilds.cache.get('827888294100074516');
//   console.log('hello');
//   await guild.members.fetch().then(members => {

//     for (const [id, member] of members) {
//       console.log(`${member.user.username} ${member.joinedTimestamp}`);
//     }
//   });
// }



  // const mod_allow = { id: '836489212625682462', type: 'ROLE', permission: true, };

  // const everyone_deny = { id: guild.roles.everyone.id, type: 'ROLE', permission: false, };

  // const everyone_allow = { id: guild.roles.everyone.id, type: 'ROLE', permission: true, };


  // commands = await jalendu.application.commands.fetch();

  // await commands.forEach(command => {
  //   console.log(`Setting application command permissions on ${command.id} ${command.name}`);
  //   if (command.name === 'moderate') {
  //     command.permissions.set({
  //       guild: guildId,
  //       command: command.id,
  //       permissions: [everyone_deny, mod_allow]
  //     });
  //   }
  //   else {
  //     command.permissions.set({
  //       guild: guildId,
  //       command: command.id,
  //       permissions: [everyone_allow]
  //     });
  //   }
  // });

