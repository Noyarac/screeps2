module.exports = function() {
    let p = Source.prototype;
    Object.defineProperty(p, 'memory', {
        get: function() {
            Memory.sources[this.id] = Memory.sources[this.id] || new Object;
            return Memory.sources[this.id];
        },
        enumerable: false,
        configurable: true
    });

       Object.defineProperty(p, 'pathToSpawn', {
        get: function() {
            if (!this._pathToSpawn) {
                if (!this.memory.pathToSpawn) {
                    this.memory.pathToSpawn = this.pos.findPathTo(this.room.spawn, {ignoreCreeps: true, ignoreRoads: true, serialize: true, range: 1})
                }
                this._pathToSpawn = Room.deserializePath(this.memory.pathToSpawn);
            }
            return this._pathToSpawn;
        },
        enumerable: true,
        configurable: true
       });

       Object.defineProperty(p, 'harvester', {
        get: function() {
            if (!this._harvester) {
                this._harvester = Game.getObjectById(this.memory.harvester);
            }
            return this._harvester;
        },
        set: function(value) {
            this._harvester = value;
            this.memory.harvester = value.id;
        },
        enumerable: false,
        configurable: true
       });

}