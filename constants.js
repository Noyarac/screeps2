// Roles
export const ROLE_DECODE = ["worker", "harvester", "mover", "upgrader", "claimer"];
export const ROLE_ENCODE = Array.from(ROLE_DECODE.entries()).reduce((total, pair) => {total[pair[1]] = pair[0]; return total}, new Object);