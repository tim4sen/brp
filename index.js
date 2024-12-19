const { Client, Intents, REST, SlashCommandBuilder, Permissions, Routes } = require('discord.js');
const express = require('express');
const fs = require('fs');
require('dotenv').config();

const app = express();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.MESSAGE_CONTENT,
  ]
});

// Register slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify and create a private channel with special role members'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Event listener for command interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'verify') {
    const member = interaction.guild.members.cache.get(interaction.user.id);

    // Check if the user already has the 1319439176218710181 role
    const roleToCheck = '1319439176218710181';
    const roleWithPermission = '1319439175640023060';
    if (member.roles.cache.has(roleToCheck)) {
      return interaction.reply({ content: 'You already have the verified role.', ephemeral: true });
    }

    // Create a new private channel
    try {
      const newChannel = await interaction.guild.channels.create({
        name: `verification-${interaction.user.username}`,
        type: 'GUILD_TEXT',
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
          },
          {
            id: interaction.user.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
          },
          {
            id: roleWithPermission,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
          },
        ],
      });

      return interaction.reply({ content: `A private channel has been created for verification: ${newChannel}.`, ephemeral: true });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'There was an error creating the channel.', ephemeral: true });
    }
  }
});

client.on('ready', () => {
  console.log(`${client.user.tag} is now online!`);
});

client.login(process.env.BOT_TOKEN);
