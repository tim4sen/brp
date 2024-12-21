const { PermissionsBitField, ChannelType } = require("discord.js");

module.exports = {
  data: {
    name: "verify",
    description: "Verify and create a private channel with special role members",
  },

  async execute(interaction) {
    const member = interaction.guild.members.cache.get(interaction.user.id);

    // Check if the user already has the verified role
    const roleToCheck = "1319439176218710181";
    const roleWithPermission = "1319439175640023060";

    if (member.roles.cache.has(roleToCheck)) {
      return interaction.reply({
        content: "Silly! You're already verified 🤦‍♂️.",
        ephemeral: true,
      });
    }

    // Check if the user already has an open ticket (private channel)
    const existingChannel = interaction.guild.channels.cache.find(
      (channel) =>
        channel.name === `verification-${interaction.user.username}` &&
        channel.type === ChannelType.GuildText
    );

    if (existingChannel) {
      return interaction.reply({
        content: "You already have an open verification ticket.",
        ephemeral: true,
      });
    }

    try {
      // Respond to the user immediately to avoid the "application did not respond" error
      await interaction.reply({
        content: "Creating your verification channel...",
        ephemeral: true,
      });

      // Create a new private channel with proper permission overwrites
      const newChannel = await interaction.guild.channels.create({
        name: `verification-${interaction.user.username}`,
        type: ChannelType.GuildText, // Use the integer value for text channels
        topic: interaction.user.id,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel], // Deny view for everyone
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel], // Allow the user to view the channel
          },
          {
            id: roleWithPermission,
            allow: [PermissionsBitField.Flags.ViewChannel], // Allow the specified role to view the channel
          },
        ],
      });

      // Create a webhook in the new channel
      const webhook = await newChannel.createWebhook({
        name: "Verification Request",
        avatar:
          "https://media.discordapp.net/attachments/1319437039917207635/1319458467953512519/Copy_of_Untitled_Design_1.png?ex=676608f5&is=6764b775&hm=424bce720a7556a88afd21ace47a81186afc1f00dfc0a43d6990f0e3d34833cc&=&format=webp&quality=lossless", // Optional: Set an avatar for the webhook
      });

      // Send a message using the webhook with pings
      const content = {
        content: `<@${interaction.user.id}> <@&${roleWithPermission}>`, // Ping the user and the role
        embeds: [
          {
            title: "Verification Request",
            description:
              "Thank you for contacting our Verification Support team. Please wait until a Verification Staff Member responds to this ticket. We will try to get to this as fast as possible!",
            color: 0x9e1de1, // Purple color
          },
        ],
      };

      await webhook.send(content); // Send the message via the webhook

      // Confirm the creation to the user (optional, but good UX)
      await interaction.followUp({
        content: `A private channel has been created for verification: ${newChannel}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error creating channel or webhook:", error);
      await interaction.followUp({
        content:
          "There was an error creating the channel or webhook. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
