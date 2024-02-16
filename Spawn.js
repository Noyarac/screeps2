module.exports = function() {
    let p = Spawn.prototype;
    p.initialize = function() {
        const room = this.room;
        if (room.currentWorkerAmount < room.targetedWorkerAmount) {
            this.spawnCreep([CARRY, WORK, MOVE], this.room.name + Game.time.toString(), {role: "worker"})
        }
    }
}