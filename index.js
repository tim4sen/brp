const { Client, IntentsBitField, REST } = require("discord.js");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const port = process.env.PORT || 3000;

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

// Read all command files from the "commands" folder
const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data);
}

// Register slash commands with Discord
(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

// Dynamically load and handle events
const eventFiles = fs.readdirSync(path.join(__dirname, "events")).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.name && event.execute) {
    // Register the event handler with the client
    client.on(event.name, (...args) => event.execute(...args, client));
  } else {
    console.warn(`Event file ${file} is missing a name or execute function.`);
  }
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  // Dynamically execute the command from the "commands" folder
  const command = require(`./commands/${commandName}.js`);
  if (command) {
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.on("ready", () => {
  console.log(`${client.user.tag} is now online!`);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

client.login(process.env.BOT_TOKEN);
