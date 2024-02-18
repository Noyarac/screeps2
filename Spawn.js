module.exports = function() {
    let p = Spawn.prototype;
    p.initialize = function() {
        const room = this.room;
        if (room.currentWorkerAmount < room.targetedWorkerAmount) {
            const creepName = this.room.name + Game.time.toString();
            if (this.spawnCreep([CARRY, WORK, MOVE], creepName, {role: "worker"}) == OK) {
                this.room.currentWorkerAmount += 1;
                Game.creepsToIdentify.push(creepName);
            }
        }
    }
}