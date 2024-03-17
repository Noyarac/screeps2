module.exports = function() {
    let p = StructureTower.prototype;

    p.reactToTick = function() {
        const targets = this.room.find(FIND_HOSTILE_CREEPS);
        if (targets.length) {
            this.attack(targets[0]);
        }
    }
}