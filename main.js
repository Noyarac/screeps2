for (const req of ["Memory", "Source", "Room", "Spawn", "Link"]) {
    require("./" + req)();
}

module.exports.loop = function () {
    require("./Game")();
    Game.update();
    for(const roomName in Game.rooms) {
        Game.rooms[roomName].spawn.initialize();
        Game.rooms[roomName].update();
    }

}