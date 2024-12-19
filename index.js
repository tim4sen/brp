const { Client, Intents, REST, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const express = require('express');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Discord bot client
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.MESSAGE_CONTENT,
  ]
});

// Log to console when the bot is online
client.on('ready', () => {
  console.log(`${client.user.tag} is now online!`);
});

// Start the Express server to handle web requests
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Log in to Discord
client.login(process.env.BOT_TOKEN);
