const { Client, Intents, REST, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
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

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    const eventName = file.split('.')[0];
    client.on(eventName, (...args) => event.execute(...args, client));
}

client.on('ready', () => {
  console.log(`${client.user.tag} is now online!`);
});

client.login(process.env.BOT_TOKEN);
