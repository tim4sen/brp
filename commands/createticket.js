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
    const roleWithPermission = "1319439175640023060"; // Special role ID (Support role)

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
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Allow support role to view and send messages
          },
        ],
      });

      // Create a webhook in the new channel
      const webhook = await newChannel.createWebhook({
        name: "Ticket Creation",
        avatar: "https://media.discordapp.net/attachments/1319437039917207635/1319458467953512519/Copy_of_Untitled_Design_1.png?ex=67680335&is=6766b1b5&hm=c8a132ef8bb3b73e7eea3b55f7f78e125ce2e171265356986b434cc6aefc15da&=&format=webp&quality=lossless", // Optional: Set an avatar for the webhook
      });

      // Send a message using the webhook with pings
      const content = {
        content: `<@${interaction.user.id}> <@&${roleWithPermission}>`, // Ping the user and the support role
        embeds: [
          {
            title: "Ticket Created",
            description: `A new support ticket has been created by <@${interaction.user.id}> for the reason: ${reason}. A support staff member will assist you shortly.`,
            color: 0x9e1de1, // Purple color
          },
        ],
      };

      // Send the webhook message
      await webhook.send(content);

      // Confirm the creation to the user
      await interaction.followUp({
        content: `Your support ticket has been created: ${newChannel}.`,
        ephemeral: true,
      });

    } catch (error) {
      console.error("Error creating the channel or webhook:", error);
      await interaction.followUp({
        content:
          "There was an error creating the ticket. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
