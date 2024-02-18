module.exports = function() {
    let p = Spawn.prototype;
    p.initialize = function() {
        const room = this.room;
        if (room.currentWorkerAmount < room.targetedWorkerAmount) {
            if (this.spawnCreep([CARRY, WORK, MOVE], this.room.name + Game.time.toString(), {role: "worker"}) == OK) {
                this.room.currentWorkerAmount += 1;
            }
        }
    }
}