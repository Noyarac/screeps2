//const room = flag.room;
//const dx = flag.pos.x - room.controller.pos.x;
//const dy = flag.pos.y - room.controller.pos.y;
//let orientation;
//if (Math.abs(dy) > Math.abs(dx)) {
//	orientation = (dy > 0) ? TOP : BOTTOM;
//} else {
//	orientation = (dx > 0) ? LEFT : RIGHT;
//}
//const terrain = new Room.Terrain(room.name);
//isWalkable = [8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30, 31, 32, 33, 36, 37, 38, 39, 40, 44, 45, 46].map(pos => room.blueprint.getPos(pos)).every(pos => terrain.get(pos.x, pos.y) != 1);
//console.log(isWalkable);

for (const toImport of ["Room", "Source", "StructureSpawn", "Creep", "StructureLink", "StructureTower"]) {
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
    debugger;
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

    if (typeof SEASON === undefined) Game.cpu.generatePixel();
}