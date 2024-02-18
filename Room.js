module.exports = function() {
    let p = Room.prototype;

    p.update = function() {
        const log = this.getEventLog();
        for (const event of log) {
            if (event.event == EVENT_OBJECT_DESTROYED) {
                if (event.data.type == "creep") debugger;
            }
        }
    }

    Object.defineProperty(p, 'storage', {
        get: function() {
            if (!this._storage) {
                if (!this.memory.storage) {
                    const storage = this.find(FIND_MY_STRUCTURES).filter(struct => struct.structureType == STRUCTURE_LINK && struct.role == "receiver")
                    this.memory.storage = this.find(FIND_MY_storageS)[0].id;
                }
                this._storage = Game.getObjectById(this.memory.storage);
            }
            return this._storage;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'spawn', {
        get: function() {
            if (!this._spawn) {
                if (!this.memory.spawn) {
                    this.memory.spawn = this.find(FIND_MY_SPAWNS)[0].id;
                }
                this._spawn = Game.getObjectById(this.memory.spawn);
            }
            return this._spawn;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'sources', {
        get: function() {
            if (!this._sources) {
                if (!this.memory.sources) {
                    this.memory.sources = this.find(FIND_SOURCES).map(source => source.id);
                }
                this._sources = this.memory.sources.map(sourceId => Game.getObjectById(sourceId));
            }
            return this._sources;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'targetedWorkerAmount', {
        get: function() {
            if (!this._targetedWorkerAmount) {
                if (!this.memory.targetedWorkerAmount) {
                    this.memory.targetedWorkerAmount = 1;
                }
                this._targetedWorkerAmount = this.memory.targetedWorkerAmount;
            }
            return this._targetedWorkerAmount;
        },
        set: function(value) {
            this.memory.targetedWorkerAmount = value;
            this._targetedWorkerAmount = value;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(p, 'currentWorkerAmount', {
        get: function() {
            if (!this._currentWorkerAmount) {
                if (!this.memory.currentWorkerAmount) {
                    this.memory.currentWorkerAmount = this.find(FIND_MY_CREEPS, {filter:{role: "worker"}}).length;
                }
                this._currentWorkerAmount = this.memory.currentWorkerAmount;
            }
            return this._currentWorkerAmount;
        },
        set: function(value) {
            this.memory.currentWorkerAmount = value;
            this._currentWorkerAmount = value;
        },
        enumerable: false,
        configurable: true
    });

}