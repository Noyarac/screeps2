// Roles
const ROLE_DECODE = ["worker", "harvester", "mover", "upgrader", "claimer"];
module.exports.ROLE_DECODE = ROLE_DECODE;
module.exports.ROLE_ENCODE = Array.from(ROLE_DECODE.entries()).reduce((total, pair) => {total[pair[1]] = pair[0]; return total}, new Object);
module.exports.TTL_DELAY = 100;