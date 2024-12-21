module.exports = {
  name: 'guildMemberRemove',  // Add the event name
  execute(member, client) {
    console.log('Event fired for member:', member.user.tag);

    const leaveLogChannelId = '1319426298380025906';
    const channel = client.channels.cache.get(leaveLogChannelId);

    if (channel) {
      channel.send(`<:bpwave:1319437396873449583> Sad to see you go, <@${member.user.id}> has left the server.`);
    } else {
      console.error('Leave log channel not found!');
    }
  },
};
