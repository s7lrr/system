module.exports.loadReactionRoles = async function(guild, db) {
  const reactionRoles = db.get(`reaction_roles_${guild.id}`) || {};
  // Remaining code to load roles
};

// main bot file
const { loadReactionRoles } = require('./reactionRoleHandler.js');