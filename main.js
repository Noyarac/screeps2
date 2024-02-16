require("./Memory")();
require("./Source")();
require("./Room")();
require("./Spawn")();

module.exports.loop = function () {
    for(const roomName in Game.rooms) {
        Game.rooms[roomName].spawn.initialize();
    }

}