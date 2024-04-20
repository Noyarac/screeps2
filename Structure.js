module.exports = function() {
    let p = Structure.prototype;

    p.isActiveF = function() {
        if (this.structureType === STRUCTURE_CONTAINER || this.structureType === STRUCTURE_ROAD) {
            return true;
        }
        if (this.room.controller.level >= 6) {
            return true;
        }
        return this.isActive();
    };
}