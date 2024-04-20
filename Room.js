
const Blueprint = require("./Blueprint");

module.exports = function() {
    let p = Room.prototype;

    p.scanEventLog = function() {
        for (const event of this.getEventLog()) {
            switch(event.event) {
                case EVENT_BUILD:
                    if (event.data.incomplete) {
                        break;
                    }
                    const newStruct = new RoomPosition(event.data.x, event.data.y, this.name).lookFor(LOOK_STRUCTURES)[0];
                    loop1: for (const location of ["remote", "local"]) {
                        for (let i = 0; i < Math.min(7, this.controller.level + 1); i++) {
                            for (let j = 0; j < this.blueprint[location + "BuildingsPerLevel"][i].length; j++) {
                                // for (let [building, position, structType] of this.blueprint[location + "BuildingsPerLevel"][i]) {
                                const position = this.blueprint[location + "BuildingsPerLevel"][i][j][1];
                                const structType = this.blueprint[location + "BuildingsPerLevel"][i][j][2];
                                const ref = this.blueprint[location + "BuildingsPerLevel"][i][j][3]
                                if (newStruct.pos.isEqualTo(position) && newStruct.structureType == structType) {
                                    this.blueprint[ref] = newStruct;
                                    break loop1;
                                }
                            }
                        }
                    }            
                    break;
                case EVENT_OBJECT_DESTROYED:
                    if (event.data.type == "creep") {
                        Memory.creeps[Memory.creepsNames[event.objectId]] = undefined;
                        Memory.creepsNames[event.objectId] = undefined;
                    }
                    break;
            }
        }
    }

    p.reactToTick = function() {
        this.scanEventLog();
        for (const struct of [this.blueprint.tower, this.blueprint.link1, this.blueprint.link2, this.spawn, this.blueprint]) {
            if (struct) struct.reactToTick();
        }
    }

    p.scanExistingBuildings = function() {
        debugger;
        for (const location of ["remote", "local"]) {
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < this.blueprint[location + "BuildingsPerLevel"][i].length; j++) {
                    const position = this.blueprint[location + "BuildingsPerLevel"][i][j][1];
                    const structType = this.blueprint[location + "BuildingsPerLevel"][i][j][2];
                    const ref = this.blueprint[location + "BuildingsPerLevel"][i][j][3]

                    const testedBuildings = position.lookFor(LOOK_STRUCTURES).filter(struct => struct.structureType == structType);
                    if (testedBuildings.length) {
                        this.blueprint[ref] = testedBuildings[0];
                    }
                }
            }
        }            
    }

    Object.defineProperty(p, "sources", {
        get: function() {
            if (!this.memory.sources) {
                this.memory.sources = this.find(FIND_SOURCES).map(source => source.id);
                if (this.name == "sim") {
                    this.memory.sources.splice(2,2);
                }
            }
            return this.memory.sources.map(sourceId => Game.getObjectById(sourceId));
        },
        configurable: true
    });

    Object.defineProperty(p, "isFullEnergy", {
        get: function() {
            if (this._isFullEnergy == undefined) {
                let isFull = true;
                loop1: for (const source of this.sources) {
                    if (source) {
                        for (const creep of [source.transferer, source.upgrader]) {
                            if (creep && !creep.spawning && !creep.myBuildingsAreFull) {
                                isFull = false;
                                break loop1;
                            }
                        }
                    }
                }
                this._isFullEnergy = isFull;
            }
            return this._isFullEnergy;
        },
        configurable: true
    });



    Object.defineProperty(p, "spawn", {
        get: function() {
            if (!this._spawn) {
                if (!this.memory.spawn) {
                    const testedSpawns = this.find(FIND_MY_SPAWNS);
                    if (testedSpawns.length) {
                        this.memory.spawn = testedSpawns[0].id;
                    }
                }
                this._spawn = Game.getObjectById(this.memory.spawn);
            }
            return this._spawn;
        },
        configurable: true
    });
    Object.defineProperty(p, "orientation", {
        get: function() {
            if (!this.memory.orientation && this.spawn) {
                this.memory.orientation = this.spawn.pos.getDirectionTo(this.controller);
            }
            return this.memory.orientation;
        },
        configurable: true
    });
    Object.defineProperty(p, "blueprint", {
        get: function() {
            return new Blueprint(this);
        },
        configurable: true
    });
}