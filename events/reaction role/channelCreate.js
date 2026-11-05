client.on('channelCreate', async (channel) => {
  if (channel.isText()) {
    await loadReactionRoles();  // Optionally load reaction roles when a new text channel is created
  }
});