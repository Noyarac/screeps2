// Roles
export const ROLE_READER = ["worker", "harvester", "mover", "upgrader", "claimer"];
export const ROLE = Array.from(ROLE_READER.entries()).reduce((total, pair) => {total[pair[1]] = pair[0]; return total}, new Object);