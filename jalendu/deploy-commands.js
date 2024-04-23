const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = process.env['JALENDU_TOKEN'];
const clientId = process.env['clientID'];
const guildId = process.env['guildID'];

const commands = [
  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Displays an enlarged user avatar')
    .addUserOption(option =>
      option.setName('username')
        .setDescription('The username to show')
        .setRequired(false))
    .setDefaultPermission(true),

  new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Gets a random (dad) joke')
    .addStringOption(option =>
      option.setName('term')
        .setDescription('An optional search term')
        .setRequired(false))
    .setDefaultPermission(true),

  new SlashCommandBuilder()
    .setName('define')
    .setDescription('Gets the urban dictionary definition')
    .addStringOption(option =>
      option.setName('result')
        .setDescription('The result to show')
        .setRequired(true)
        .addChoice('first', 'first')
        .addChoice('all', 'all')
        .addChoice('random', 'random'))
    .addStringOption(option =>
      option.setName('term')
        .setDescription('The search term')
        .setRequired(true))
    .setDefaultPermission(true),

  new SlashCommandBuilder()
    .setName('moderate')
    .setDescription('Select a moderation command')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The moderation command')
        .setRequired(true)
        .addChoice('verify', 'verify')
        .addChoice('unverify', 'unverify')
        .addChoice('mute newcomer', 'mute')
        .addChoice('unmute newcomer', 'unmute')
        .addChoice('kick', 'kick')
        .addChoice('ban', 'ban')
        .addChoice('age lock', 'agelock')
        .addChoice('age unlock', 'ageunlock'))
    .addUserOption(option =>
      option.setName('username')
        .setDescription('The username to apply')
        .setRequired(true))
    .setDefaultPermission(false),

  new SlashCommandBuilder()
    .setName('readme')
    .setDescription('Sends you a direct message with instructions and information about the Jalendu bot.')
    .setDefaultPermission(true)
]
  .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    await rest.put(
      //Routes.applicationGuildCommands(clientId, guildId),
      //{ body: commands },
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error(error);
  }
})();