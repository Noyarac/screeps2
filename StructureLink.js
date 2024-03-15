module.exports = function() {
    let p = StructureLink.prototype;
    Object.defineProperty(p, "ttl", {
        get: function() {
            return this.memory.ttl;
        },
        set: function(value) {
            this.memory.ttl = value;
        },
        enumerable: true,
        configurable: true
    });

    p.reactToTick = function() {
        if (this.store.getUsedCapacity(RESOURCE_ENERGY) > 100) {
            this.transferEnergy(this.room.blueprint.link0);
        }
    }
}