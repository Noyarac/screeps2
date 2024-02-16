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
            return Memory.sources[this.id].harvester;
        },
        set: function(value) {
            Memory.sources[this.id].harvester = value;
        },
        enumerable: false,
        configurable: true
       });

}