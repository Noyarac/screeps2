module.exports = function() {
    let p = StructureLink.prototype;

    p.reactToTick = function() {
        if (this.store.getUsedCapacity(RESOURCE_ENERGY) > 200) {
            this.transferEnergy(this.room.blueprint.link0);
        }
    }
}