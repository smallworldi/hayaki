
const whitelistedUsers = new Set();

function isWhitelisted(userId, guild) {
  if (!guild) return false;
  return userId === guild.ownerId || whitelistedUsers.has(userId);
}

function addToWhitelist(userId) {
  whitelistedUsers.add(userId);
}

function removeFromWhitelist(userId) {
  whitelistedUsers.delete(userId);
}

module.exports = { isWhitelisted, addToWhitelist, removeFromWhitelist };
