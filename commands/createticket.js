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
    const ticketCategoryId = '1320181489530441788'; // Your category ID

    // Create the ticket channel
    const guild = interaction.guild;
    const ticketCategory = guild.channels.cache.get(ticketCategoryId);

    // Ensure the category exists
    if (!ticketCategory) {
      return interaction.reply('Error: Ticket Category not found');
    }

    try {
      // Create the ticket channel with the user’s name
      const ticketChannel = await guild.channels.create(`ticket-${user.username}`, {
        type: 'GUILD_TEXT',
        parent: ticketCategory.id,
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
            id: guild.id,
            deny: ['VIEW_CHANNEL'],
          },
        ],
      });

      // Create the embed with a ping to the role and user
      const embed = new MessageEmbed()
        .setColor('#9e1de1')
        .setTitle('Ticket Created')
        .setDescription(`**Reason:** ${reason}`)
        .setFooter(`Ticket created by ${user.username}`, user.displayAvatarURL());

      // Send the embed and ping the role and user
      await ticketChannel.send({
        content: `<@&${roleId}> <@${user.id}>`, // Pings the role and the user
        embeds: [embed],
      });

      // Reply to the user who created the ticket
      await interaction.reply(`Your ticket has been created! Check out ${ticketChannel} for further assistance.`);
    } catch (error) {
      console.error(error);
      return interaction.reply('There was an error while creating the ticket.');
    }
  },
};
