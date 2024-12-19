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

// Serve the HTML page with the button
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Push Verify</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>Bot Verification</h1>
        <p>Click the button to push verify and send a message to Discord.</p>
        <button style="padding: 10px 20px; font-size: 18px; cursor: pointer;" id="pushVerifyButton">Push Verify</button>

        <script>
          document.getElementById('pushVerifyButton').onclick = function() {
            fetch('/verify', {
              method: 'POST',
            })
            .then(response => response.json())
            .then(data => {
              alert(data.message);
            });
          };
        </script>
      </body>
    </html>
  `);
});

app.post('/verify', async (req, res) => {
  try {
    const channel = await client.channels.fetch(process.env.VERIFY_CHANNEL_ID); // Channel ID where to send the message

    const verificationMessage = await channel.send({
      content: 'React with ✅ to create a private channel! This action is only available to users without the restricted role.',
    });

    // Add the reaction emoji to the message
    await verificationMessage.react('✅');

    res.json({ message: 'Verification message sent to Discord!' });
  } catch (error) {
    console.error('Error sending verification message:', error);
    res.status(500).json({ message: 'Failed to send verification message.' });
  }
});

// Listen for reaction events and handle the creation of the private channel
client.on('messageReactionAdd', async (reaction, user) => {
  try {
    // Check if the reaction is the one we want (✅) and the user is not a bot
    if (reaction.emoji.name === '✅' && !user.bot) {
      console.log(`Reaction received from ${user.tag}`);

      // Ensure we are reacting on the correct message (you can match it by message ID if needed)
      const verificationMessage = reaction.message;
      console.log(`Verification message ID: ${verificationMessage.id}`);

      // Fetch the member (user) who reacted
      const member = await reaction.message.guild.members.fetch(user.id);

      // Role IDs
      const restrictedRoleID = '1319439176218710181'; // Role that cannot react
      const allowedRoleID = '1319439175640023060'; // Role that should be added to the new private channel

      // Check if the user has the restricted role
      if (member.roles.cache.has(restrictedRoleID)) {
        console.log(`${user.tag} has the restricted role. Ignoring reaction.`);
        return reaction.message.channel.send(`${user.tag}, you cannot react with ✅ due to your role.`);
      }

      // Proceed with creating the private channel
      const guild = reaction.message.guild;
      const everyoneRole = guild.roles.cache.find(role => role.name === '@everyone');
      
      // Create the private channel
      const newChannel = await guild.channels.create({
        name: `private-channel-${member.user.username}`,
        type: 0, // text channel
        permissionOverwrites: [
          {
            id: everyoneRole.id,
            deny: ['VIEW_CHANNEL'], // Deny everyone the ability to view the channel
          },
          {
            id: member.id,
            allow: ['VIEW_CHANNEL'], // Allow the user to view the channel
          },
          {
            id: allowedRoleID,
            allow: ['VIEW_CHANNEL'], // Allow those with the allowed role to view the channel
          },
        ],
      });

      // Notify in the channel where the reaction was added
      await reaction.message.channel.send(`Private channel created for ${user.tag}! <#${newChannel.id}>`);
    }
  } catch (error) {
    console.error('Error handling reaction:', error);
  }
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
