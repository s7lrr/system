client.on('guildCreate', async (guild) => {
  console.log(`Joined a new guild: ${guild.name}`);
  await loadReactionRoles();  // Load reaction roles for this guild
});