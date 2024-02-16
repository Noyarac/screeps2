module.exports = function() {
    let p = Room.prototype;

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