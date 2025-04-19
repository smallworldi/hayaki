
const developerUsers = new Set(['1032510101753446421', '1217811542012198926']); // Add developer IDs here

function isDeveloper(userId) {
  return developerUsers.has(userId);
}

function addDeveloper(userId) {
  developerUsers.add(userId);
}

function removeDeveloper(userId) {
  developerUsers.delete(userId);
}

module.exports = { isDeveloper, addDeveloper, removeDeveloper };
