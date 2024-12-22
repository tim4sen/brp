const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

// Create slash command for /createticket
module.exports = {
  data: new SlashCommandBuilder()
    .setName('createticket')
    .setDescription('Create a support ticket')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ticket')
        .setRequired(true)),

  async execute(interaction) {
    const reason = interaction.options.getString('reason');
    const user = interaction.user;
    const roleId = '1319439174528667668'; // Your role ID

    try {
      // Ensure the channel name is set correctly (ticket-${user.username})
      const ticketChannelName = `ticket-${user.username}`;

      // Create the ticket channel
      const ticketChannel = await interaction.guild.channels.create(ticketChannelName, {
        type: 'GUILD_TEXT',
        permissionOverwrites: [
          {
            id: user.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
          },
          {
            id: roleId, // Your role ID
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
          },
          {
            id: interaction.guild.id, // Deny access to everyone else
            deny: ['VIEW_CHANNEL'],
          },
        ],
      });

      // Create the embed with a description and reason
      const embed = new MessageEmbed()
        .setColor('#9e1de1')
        .setTitle('Ticket Created')
        .setDescription(`**Reason:** ${reason}`)
        .setFooter(`Ticket created by ${user.username}`, user.displayAvatarURL());

      // Send the embed to the new ticket channel
      await ticketChannel.send({
        content: `<@${user.id}>`, // Ping the user who created the ticket
        embeds: [embed],
      });

      // Reply to the user who created the ticket
      if (!interaction.replied) {
        await interaction.reply(`Your ticket has been created! Check out ${ticketChannel} for further assistance.`);
      } else {
        await interaction.followUp(`Your ticket has been created! Check out ${ticketChannel} for further assistance.`);
      }
    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.reply('There was an error while creating the ticket.');
      } else {
        await interaction.followUp('There was an error while creating the ticket.');
      }
    }
  },
};
