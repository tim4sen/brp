const { PermissionsBitField, ChannelType } = require("discord.js");

module.exports = {
  data: {
    name: "createticket",
    description: "Create a private support ticket",
    options: [
      {
        name: "reason",
        type: "STRING",
        description: "Reason for the ticket",
        required: true,
      },
    ],
  },

  async execute(interaction) {
    const reason = interaction.options.getString("reason");
    const member = interaction.guild.members.cache.get(interaction.user.id);

    // Role IDs for permission overwrites
    const roleToCheck = "1319439176218710181"; // User role ID
    const roleWithPermission = "1319439175640023060"; // Special role ID

    // Check if the user already has a ticket open (private channel)
    const existingChannel = interaction.guild.channels.cache.find(
      (channel) =>
        channel.name === `ticket-${interaction.user.username}` &&
        channel.type === ChannelType.GuildText
    );

    if (existingChannel) {
      return interaction.reply({
        content: "You already have an open ticket.",
        ephemeral: true,
      });
    }

    try {
      // Respond to the user immediately to avoid the "application did not respond" error
      await interaction.reply({
        content: "Creating your support ticket...",
        ephemeral: true,
      });

      // Create a new private channel with proper permission overwrites
      const newChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`, // Properly set the name
        type: ChannelType.GuildText, // Text channel
        topic: reason, // Set the reason as the topic
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel], // Deny view for everyone
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow the user to view and send messages
          },
          {
            id: roleWithPermission,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow special role to view and send messages
          },
        ],
      });

      // Send a confirmation message to the user
      await interaction.followUp({
        content: `Your support ticket has been created: ${newChannel}.`,
        ephemeral: true,
      });

    } catch (error) {
      console.error("Error creating the channel:", error);
      await interaction.followUp({
        content:
          "There was an error creating the ticket. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
