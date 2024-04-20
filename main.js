const profiler = require('screeps-profiler');
const Blueprint = require('./Blueprint');
profiler.enable();

for (const toImport of ["Room", "Source", "StructureSpawn", "Creep", "StructureLink", "StructureTower", "Store", "Structure"]) {
    require("./" + toImport)();
}
for (const cat of ["sources", "creepsNames"]) {
    Memory[cat] = Memory[cat] || new Object;
}

for (const room of Object.values(Game.rooms)) {
    room.memory;
    // room.scanExistingBuildings();
}

module.exports.loop = function () {
    profiler.wrap(function () {

        for (const roomName in Memory.rooms) {
            const room = Game.rooms[roomName];
            if (room == undefined) {
                Memory.rooms[roomName] = undefined;
                continue;
            }
            room.reactToTick();
        }
        for (const creep of Object.values(Game.creeps)) {
            creep.doAction();
        }
        if (!Game.rooms.sim) Game.cpu.generatePixel();
    });
}