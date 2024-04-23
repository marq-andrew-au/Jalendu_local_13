__Thankyou for your interest in the Jalendu bot.__

__Contents__
1. Overview.
2. Application commands.
3. Other commands.
4. Functions.

__1. Overview.__

Jalendu is a bot specifically designed for the Gay Men Meditating Discord. He is written in Node.js (Node Javascript) using the discord.js library (among others). Jalendu was written by Mark Andrew, the Gay Men Meditating server's founder and admin. He is running on the cloud computing platform Replit. The Jalendu Replit is private (because some sensitive files must be hidden) but the Jalendu code can be found in Mark's github: 

```https://github.com/marq-andrew/cloud-jalendu```

In the documentation of commands below, [parameter] means an optional parameter and [[parameter]] means it is not optional. Don't include the square brackets in your actual command.

The image used for the avatar of Jalendu is the Portrait of Paul Lemoyne by Jean-Auguste-Dominique Ingres. The name Jalendu is a Sanskrit male name meaning the reflection of the moon in water and is the name and main character of the novel *Jalendu* by Mark Andrew.


__2. Application commands.__

Application commands are accessed by typing / in the message field. To use them, type / and you can select the command from the list or keep typing the command name to narrow the list. Type TAB to move to the selections for each option.

**/avatar** [user]

Displays a large version of the [user]'s avatar. If [user] is not selected, your own avatar is displayed.

**/joke** [term]

Replies with a random joke. If [term] is added, Jalendu will search for a joke containing that term.

**/define** [[result]] [[term]]

Replies with the urban dictionary definition/s of [[term]]. [[result]] controls which definition to return when there are more than one. 

  *first* returns the first (most upvoted) definition.
  *all* returns all definitions (warning, there may be many). 
  *random* returns a random definition.

**/moderate** [[command]] [[user]] implements commands required by moderators. Only people with the @moderator role can use these commands.

  *verify* verifies the [[user]] by adding the @verified role, removing the @newcomer role and sending the [[user]] a welcoming and instructional direct message. It will also send a welcome message to the member introductions channel.

  *unverify* unverifies the [[user]] by adding the @newcomer role, and removing the @verified role. That means that it revokes all access to the server except for landing zone.

  *mute newcomer* applies only when [[user]] is a @newcomer. It adds the @newcomer-mutes role so that the [[user]] no longer has permission to post messages to #landing-zone (or anywhere).

  *unmute newcomer* removes the @newcomer-muted role so that the [[user]] has permission to post messages to #landing-zone.

  *kick* kicks the [[user]] off the server. Kicked members can rejoin with a new invitation link.

  *ban* bans the [[user]] from the server. Banned members are banned by IP and can no longer join even if they change their IDs.

  *agelock* removes the Age 18+ role from [[user]] if they have it and prevents Age 18+ from being self-assigned in #roles or by being assigned by a moderator. The user isn't notified when they are age locked but if they try to self-assign Age 18+ they will get a direct message indicating that they can't select the role and to direct message a moderator. A message is also logged to #system-messages. The messages to the user and to #system-messages are only sent after the first attempt at self-assignment. If the Age 18+ role is assigned by a moderator to an age locked member, the role is automatically removed and a message sent to #system-messages.

  Age locks automatically expire after 12 months.

  *age unlock* deletes the age lock on a member.

**/readme** sends you a direct message containing the instructions and information about the Jalendu bot that you are reading right now.


__3. Other commands.__

Other commands are also accessed by typing /[command] as a message but they are not implemented as application commands and they are mostly only of use to the server Admins and the bot developers. They are included here for transparency.

Most of these commands can be issued in a direct message session with Jalendu. That is probably preferred because some can reply with a lot of data.

**/welcome** re-generates the welcome message for the #landing-zone channel. WARNING: this command will delete all other messages in the landing-zone channel. It is restricted to only moderators for that reason.

**/dm** [message id] sends you a direct message that is the direct message Jalendu sends to a user when certain events occur:

  *welcomedm* sends you the direct message users are sent when they are verified either by the automod command (see below) or by the /moderate verify application command.

  */reminder* sends you the direct message that is sent to a user who has not satisfied the entry requirements after two days.

  */muted** sends you the direct message that is sent to a user who has been muted by the landing-zone automod rules.

**/newcomer** replies with a report on the newcomers waiting in the landing zone channel and their status at the last newcomer check performed by Jalendu. See below in functions. (unverified newcomers are reminded of the entry requirements after two days and kicked after 7 days).

**/mclear** [number] is a moderator only command that deletes the last [number] of messages from the channel. This command can't be used in a direct message. If [number] is omitted, only the last message (+ the /mclear message itself) are deleted. This command doesn't word in DMs to Jalendu.

**/channel** regenerates the channel directories.

**/test** [message] tests the [message] in Jalendu's auto-moderation functions (see below) that is applied to the [message]s of unverified members in landing zone. It replies with the auto-moderation function that would be triggered and the first word or phrase in the [message] that would have triggered it.

**/setup** re-reads the JSON containing the auto-moderation trigger words and phrases into memory when they have been changed. It doesn't reply with anything and should only be of interest to Admins.

**/emojis** lists the server emojis with their IDs and names.

**/datacheck** checks the auto-moderation trigger words and phrases for duplication and redundancy. These are used to not only check the newcomers messages for words and phrases that trigger auto-verification but also for homophobic and racist language, other forms of abuse or attemps to hack our server. Since the command responds with words and phrases that may be offensive as well as those that can be used to automatically trigger verification, this command is restricted to moderators.

**/bumpers** lists the data used to keep track of the latest bumper since the response from the Disboard bump no longer includes their name.

(After doing all this work, Disboard started including the name again!)

**/bumbots** replies with the current state of the bumpbot reminder system (either waiting for the bump after the reminder has been sent or waiting for the next allowed bump time). This is the same function that Jalendu runs every ten minutes to send the reminder so if you execute this command after the wait time has expired but before Jalendu's ten minute check, this will actually trigger the reminder.

**/bbdump** writes the in memory bumpbots data to json files for trouble shooting. (The bumpbots data is stored in a database so that it can be restored when the program restarts but it is more convenient to see it in json.)

**/agelocks** lists the data used to maiintain age locks. Since this is sensitive data, it is a moderator only command.

**/cleanup** runs the landing zone cleanup code in case for some reason it doesn't run when it should.

**/hearts** [number] tests the hearts counter. A representation of [number] as a base 5 number using rainbow coloured hearts emojis. If [number] is omitted a random number 0 - 16000 is used.

**/data** [[command]] [list] [term|index] is a set of commands that allow the sets of words and phrases that trigger auto-moderation in the landing-zone channel to be edited. These words and phrases are stored in a file called data.json but are read into memory when the Jalendu program starts.

The commands are:

  */data help* replies with a summary of the command syntax and lists the current lists in use by the automoderation program.

  */data list* [list] replies with a list of the terms in [list] with their index number.

  */data search* [list] [term] replies with a list of the terms in [list] that include the [term] with their index number.

  */data add* [list] [term] adds [term] to the list [list]. This only adds to the list in memory. You need to execute /data save to write it to the file.

  */data delete* [list] [index] deletes the term referenced by the index number [index] from [list]. The index number is found by using the list or search commands above. /data delete doesn't actually delete the term but prefixes it with xXx so that it won't be matched. That is so the index numbers don't change which might cause an error. Only when /data save is executed do the terms get deleted.

  */data save* saves the data in memory to the file data.json which is loaded into memory when the bot program starts (or also when /setup is executed - see above.) In the process, /data save also deletes terms flagged for deletion with the /data delete command. /data save also makes a daily backup of data.json as data_bu_yyyy-mm-dd.json. Caution: If for some reason the Jalendu bot program restarts, any changes not saved will be lost.

  */data revert* reads the data from the file into memory thereby erasing any changes you have made by /data add and /data delete that haven't been saved. This is the same as executing /setup.

  */data backups* lists the daily backups that exist. Backups are made by the /data save or /data restore command only if a backup for that day doesn't already exist.

  */data restore* [yyyy-mm-dd] replaces the data in memory with the data from the backup. Before doing that, it creates a backup of the data in memory to a daily backup file if that daily backup file doesn't already exist. /data restore only replaces the data in memory from the backup. You can execute /data save to write that data to the file that is loaded into memory when the bot restarts or /data revert to reload that data back into memory.

**/mods** Rewrites the content for the moderator guidance channel which for convenience of editing is in a text file.

**/qo help** Replies with a list of all the question-of-the-week commands.

__4. Functions.__

**Automoderation** Automoderation only applies to the messages of unverified newcomers in the #landing-zone channel. All messages by unverified newcomers as well as any auto-moderation action are logged into the #landing-zone-log channel. The messages are scanned and compared to a set of lists of key words and phrases that trigger an auto-moderation command. Messages that trigger an auto-moderation command are immediately deleted and then the command activates. The commands are:

  *verify* The message author is verified in the same way as when the /moderate verify application command is activated as described above.

  *homophobic*, *racist*, *profanity*, *URLs or file links*, *excessive length* (>1100 characters), *all upper case* (message longer than 50 characters and all upper case) result in the message author being warned in a direct message. If they write another message that triggers these commands, they are sent a final warning. If they write a third message, the @newcomer-muted role is assigned to them and they lose permission to write messages in the #landing-zone channel, which is the only channel they have access to.

  * This has been changed so that users are no longer warned in a direct message because that just tempted them to type odd spellings of words so avoid the automoderation functions.

  * Also, if a newcomer is muted, all their messages in the #landing-zone channel are deleted, not only the offending ones.

**Newcomer reminder and exclusion** Every 120 minutes, Jalendu scans through the list of unverified newcomers. If they joined more that 2 days ago, they are sent a direct message reminding them of the entry requirements. If they joined more than 7 days ago, they are kicked off the server. This reduces the exposure of legitimate members and their entry messages to potential abusers.

This code also cleans up the newcomer roles for verified members if they are still applied and adds the @member role that is used to tell us that they were previously a verified member if they leave and return.

**Landing zone channel message clean-up**. Every 120 minutes, Jalendu scans the messages in the landing zone channel. Messages in the landing zone more than three days old are deleted. Messages written by people who have left the server are immediately deleted. Messages by verified members or messages by moderators mentioning (to or replying to) verified members are immediately deleted. Messages by muted newcomers are deleted. Therefor after this action, the landing zone only contains the pinned welcome message plus messaged by unmuted newcomers or moderators that are less than three days old. This protects verified members and their landing zone messages from exposure to potential abusers.

* this action now also runs immediately when a newcomer is verified, muted or leaves the server.

**Extraneous reaction roles in #roles.** The #roles channel has a set of reaction roles questions that self-set roles and channel permissions. New discord users are easliy confused about how to properly respond to these questions and this confusioin is increased by members adding additonal reaction emojis to these questions. Therefor every 120 minutes, Jalendu checks the questions in #roles and removes any additional reaction emojis.

* this check now also occurs immediately when a reaction is added to any of the roles queston in #roles.

**DISBOARD bump reminders.** Jalendu keeps track of bumps to the Disboard bot and reminds users when it is time to bump again. He then sends a thankyou message when they do. (The Disboard bot ignores messages from other bots so Jalendu can't bump himself.) This will be expanded to other bump bots as they are added.

Since Disboard changed the format of its response to a bump so that it no longer includes the name of the bumper, Jalendu keeps track of who is doing the bumping and who did the most recent bump so he can thank them.

**Application commands permissions.** Jalendu sets permissions on application commands because this needs to be done programmatically. Discord has not yet completed the full functionality of application commands.

**Member join and leave** When a member joins the server, Jalendu sends a message to the #system-messages channel with an enlarged version of their avatar. The avatar can tell moderators a lot about a prospective member. Jalendu also logs a member leaving. Landing zone message cleanup (see above) runs when a member leaves to delete any messages they may have sent there.

**Voice channel usage logging**. Jalendu DOES NOT record the content of voice channels on the server however he does record who joined what channel, when, how long they were there and the percentage of the time that they had their camera on. I understand that this information is highly sensitive and so only server owner @marq_andrew has any access to it and would only be accessed in case there was a complaint about something that happened in a vc room that required investigation by moderators.

**Age lock maintenance**. Jalendu intercepts and reverses attempts to assign the Age 18+ role to a member who is age locked. 

**Jalendu chat bot**. This is some experimentation I am doing with the idea of a chat bot. It only relates to direct messages that users send to Jalendu as a user or to channel message that mention @Jalendu. The aim of this code is to program Jalendo to respond to your direct messages to him. This code uses a postgres sql database ElephantSQL (in AWS cloud) to store its data. Messages are not linked to a user identity in that database. 