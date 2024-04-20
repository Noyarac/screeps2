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
    
    Object.defineProperty(p, 'sourceIndex', {
        get: function() {
            if (!this.memory.sourceIndex) {
                this.memory.sourceIndex = this.room.sources.indexOf(this);
            }
            return this.memory.sourceIndex;
        },
        enumerable: false,
        configurable: true
    });
    
    Object.defineProperty(p, 'pathToSource', {
        get: function() {
            if (!this._pathToSource && this.room.spawn) {
                if (!this.memory.pathToSource) {
                    let reversed = this.pathToSpawn.slice();
                    reversed.reverse()
                    for (i = 1; i < reversed.length; i++) {
                        reversed[i].dx = reversed[i].x - reversed[i-1].x;
                        reversed[i].dy = reversed[i].y - reversed[i-1].y;
                        switch(true) {
                            case reversed[i].dx == 0 && reversed[i].dy == -1:
                                reversed[i].direction = TOP;
                                break;
                            case reversed[i].dx == 1 && reversed[i].dy == -1:
                                reversed[i].direction = TOP_RIGHT;
                                break;
                            case reversed[i].dx == 1 && reversed[i].dy == 0:
                                reversed[i].direction = RIGHT;
                                break;
                            case reversed[i].dx == 1 && reversed[i].dy == 1:
                                reversed[i].direction = BOTTOM_RIGHT;
                                break;
                            case reversed[i].dx == 0 && reversed[i].dy == 1:
                                reversed[i].direction = BOTTOM;
                                break;
                            case reversed[i].dx == -1 && reversed[i].dy == 1:
                                reversed[i].direction = BOTTOM_LEFT;
                                break;
                            case reversed[i].dx == -1 && reversed[i].dy == 0:
                                reversed[i].direction = LEFT;
                                break;
                            case reversed[i].dx == -1 && reversed[i].dy == -1:
                                reversed[i].direction = TOP_LEFT;
                                break;
                        }
                    }
                    // reversed.splice(0,1);
                    reversed[0].direction = (((reversed[0].direction - 1) + 4) % 8) + 1;
                    reversed[0].dx *= -1;
                    reversed[0].dy *= -1;
                    this.memory.pathToSource = Room.serializePath(reversed);
                }
                this._pathToSource = Room.deserializePath(this.memory.pathToSource);
            }
            return this._pathToSource;
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(p, 'pathToSpawn', {
        get: function() {
            if (!this._pathToSpawn && this.room.spawn) {
                if (!this.memory.pathToSpawn) {
                    const blueprint = this.room.blueprint;
                    const dest = blueprint.getPos((this.sourceIndex) ? 25 : 23);
                    const thisRoomName = this.room.name;
                    const source0 = this.room.sources[0];
                    let costCallbackFunction = (roomName, costMatrix) => {
                        if (roomName == thisRoomName) {
                            if (this.sourceIndex) {
                                for (const step of source0.pathToSpawn) {
                                    costMatrix.set(step.x, step.y, 6);
                                }
                                for (const x of [-1, 0, 1]) {
                                    for (const y of [-1, 0, 1]) {
                                        costMatrix.set(source0.x + x, source0.y + y, 255);
                                    }
                                }
                            }
                            for (const i of [8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 24, 29, 30, 31, 32, 33, 36, 37, 38, 39, 40, 44, 45, 46]) {
                                costMatrix.set(blueprint.getPos(i).x, blueprint.getPos(i).y, 255);
                            }
                        }
                    }
                    this.memory.pathToSpawn = this.pos.findPathTo(dest, {ignoreCreeps: true, ignoreRoads: true, serialize: true, costCallback: costCallbackFunction});
                }
                this._pathToSpawn = Room.deserializePath(this.memory.pathToSpawn);
            }
            return this._pathToSpawn;
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(p, 'mover', {
        get: function() {
            return Game.getObjectById(this.memory.mover);
        },
        set: function(value) {
            this.memory.mover = value.id;
        },
        enumerable: false,
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

    Object.defineProperty(p, 'upgrader', {
        get: function() {
            if (!this._upgrader) {
                this._upgrader = Game.getObjectById(this.memory.upgrader);
            }
            return this._upgrader;
        },
        set: function(value) {
            this._upgrader = value;
            this.memory.upgrader = value.id;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'transferer', {
        get: function() {
            if (!this._transferer) {
                this._transferer = Game.getObjectById(this.memory.transferer);
            }
            return this._transferer;
        },
        set: function(value) {
            this._transferer = value;
            this.memory.transferer = value.id;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'builder', {
        get: function() {
            if (!this._builder) {
                this._builder = Game.getObjectById(this.memory.builder);
            }
            return this._builder;
        },
        set: function(value) {
            this._builder = value;
            this.memory.builder = value.id;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'recycleEnergyDrop', {
        get: function() {
            if (!this._recycleEnergyDrop) {
                if (!Game.getObjectById(this.memory.recycleEnergyDrop)) {
                    let testedDrops = this.room.blueprint.getPos(30 + this.sourceIndex * 2).lookFor(LOOK_RESOURCES);
                    if (testedDrops.length) {
                        this.memory.recycleEnergyDrop = testedDrops[0].id;
                    }
                }
                this._recycleEnergyDrop = Game.getObjectById(this.memory.recycleEnergyDrop);
            }
            return this._recycleEnergyDrop;
        },
        set: function(value) {
            this._recycleEnergyDrop = value;
            this.memory.recycleEnergyDrop = value.id;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'sourceEnergyDrop', {
        get: function() {
            if (!this._sourceEnergyDrop) {
                if (!Game.getObjectById(this.memory.sourceEnergyDrop)) {
                    const testedDrops = this.pos.findInRange(FIND_DROPPED_RESOURCES, 1).filter(struct => struct.resourceType == RESOURCE_ENERGY);
                    if (testedDrops.length) {
                        this.memory.sourceEnergyDrop = testedDrops[0].id;
                    }
                }
                this._sourceEnergyDrop = Game.getObjectById(this.memory.sourceEnergyDrop);
            }
            return this._sourceEnergyDrop;
        },
        set: function(value) {
            this._sourceEnergyDrop = value;
            this.memory.sourceEnergyDrop = value.id;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'spawnEnergyDrop', {
        get: function() {
            if (!this._spawnEnergyDrop) {
                if (!Game.getObjectById(this.memory.spawnEnergyDrop)) {
                    for (const position of [24, 23 + this.sourceIndex * 2]) {
                        let testedDrops = this.room.blueprint.getPos(position).lookFor(LOOK_RESOURCES);
                        if (testedDrops.length) {
                            this.memory.spawnEnergyDrop = testedDrops[0].id;
                            break;
                        }
                    }
                }
                this._spawnEnergyDrop = Game.getObjectById(this.memory.spawnEnergyDrop);
            }
            return this._spawnEnergyDrop;
        },
        set: function(value) {
            this._spawnEnergyDrop = value;
            this.memory.spawnEnergyDrop = value.id;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'link', {
        get: function() {
            return this.room.blueprint["link" + (this.sourceIndex + 1).toString()];
        },
        set: function(value) {
            this.room.blueprint["link" + (this.sourceIndex + 1).toString()] = value;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'needsHarvesterMoving', {
        get: function() {
            return this.memory.needsHarvesterMoving;
        },
        set: function(value) {
            this.memory.needsHarvesterMoving = value;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'needsUpgraderMoving', {
        get: function() {
            return this.memory.needsUpgraderMoving;
        },
        set: function(value) {
            this.memory.needsUpgraderMoving = value;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'hasLink', {
        get: function() {
            return this.link instanceof StructureLink;
        },
        enumerable: false,
        configurable: true
    });

}