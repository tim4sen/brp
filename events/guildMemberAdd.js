module.exports = {
  name: 'guildMemberAdd',  // Add the event name
  execute(member, client) {
    console.log("Event fired for member:", member.user.tag);

    const roleId = "1319439177359556671";
    const role = member.guild.roles.cache.get(roleId);

    if (role) {
      member.roles
        .add(role)
        .then(() => {
          console.log(`Assigned role to ${member.user.tag}`);
        })
        .catch((error) => {
          console.error("Error assigning role:", error);
        });
    } else {
      console.error("Role not found");
    }

    const joinLogChannelId = "1317969567011835948";
    const channel = client.channels.cache.get(joinLogChannelId);

    if (channel) {
      channel.send(
        `<:bpwave:1319437396873449583> Welcome, <@${member.user.id}> has joined the server!`
      );
    } else {
      console.error("Join log channel not found!");
    }
  },
};
