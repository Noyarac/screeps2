module.exports = function() {
    let p = Creep.prototype;

    Object.defineProperty(p, "type", {
        get: function() {
            return this.memory.type;
        },
        set: function(value) {
            this.memory.type = value;
        },
        configurable: true
    });

    Object.defineProperty(p, "mySource", {
        get: function() {
            return this.room.sources[this.sourceIndex];
        },
        set: function(value) {
            this.memory.sourceIndex = this.room.sources.indexOf(value);
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(p, "sourceIndex", {
        get: function() {
            return this.memory.sourceIndex;
        },
        set: function(value) {
            this.memory.sourceIndex = value;
        },
        enumerable: true,
        configurable: true
    });
    
    p.doAction = function() {
        try{
        switch(this.type) {
            case "transferer":
                if (this.store.getFreeCapacity() != 0) {
                    if (this.mySource.recycleEnergyDrop) {
                        return this.pickup(this.mySource.recycleEnergyDrop);
                    } 
                    if (this.mySource.spawnEnergyDrop) {
                        return this.pickup(this.mySource.spawnEnergyDrop);
                    } 
                    if (this.room.blueprint.link0) {
                        return this.withdraw(this.room.blueprint.link0, RESOURCE_ENERGY);
                    }
                    if (this.room.blueprint.container0) {
                        return this.withdraw(this.room.blueprint.container0, RESOURCE_ENERGY);
                    }
                } else {
                    for (const building of [this.room.spawn, this.room.blueprint["ext" + (3 + this.sourceIndex).toString()], this.room.blueprint["ext" + (7 + this.sourceIndex).toString()], this.room.blueprint["ext" + (11 + this.sourceIndex).toString()]]) {
                        if (building && building.store.getFreeCapacity(RESOURCE_ENERGY)) {
                            return this.transfer(building, RESOURCE_ENERGY);
                        }
                    }
                }
                break;
            case "harvester":
                if (this.mySource.needsHarvesterMoving && !this.mySource.mover) {
                    return this.room.spawn.smartSpawn("mover", this.sourceIndex);
                }
                if (!this.getActiveBodyparts(CARRY) && this.room.blueprint.currentConstructionSite && this.room.blueprint.currentConstructionSite.pos.isEqualTo(this.room.blueprint["link" + (this.sourceIndex + 1).toString() + "Pos"])) {
                    return this.suicide();
                }

                if (!this.store.getFreeCapacity()) {
                    if (this.build(this.room.blueprint.currentConstructionSite) == OK) {
                        return OK;
                    }
                }
                this.harvest(this.mySource);
                if (this.mySource.link) {
                    return this.transfer(this.mySource.link, RESOURCE_ENERGY);
                }
                break;

            case "upgrader":
                if (this.pos.isEqualTo(this.room.blueprint.getPos(16 + this.sourceIndex * 2))) {
                    this.mySource.needsUpgraderMoving = undefined;
                } else {
                    this.mySource.needsUpgraderMoving = true;
                }
                if (this.mySource.needsUpgraderMoving && !this.mySource.mover) {
                    this.room.spawn.smartSpawn("mover", this.sourceIndex);
                }
                if (this.mySource.needsUpgraderMoving) {
                    return;
                }
                if (this.store.getUsedCapacity() < 20) {
                    if (this.mySource.spawnEnergyDrop) {
                        this.pickup(this.mySource.spawnEnergyDrop);
                    } else 
                    if (this.room.blueprint.link0) {
                        this.withdraw(this.room.blueprint.link0, RESOURCE_ENERGY);
                    } else
                    if (this.room.blueprint.container0) {
                        this.withdraw(this.room.blueprint.container0, RESOURCE_ENERGY);
                    }
                } 
                for (const building of [this.room.blueprint["ext" + (this.sourceIndex + 1).toString()], this.room.blueprint["ext" + (5 + this.sourceIndex).toString()], this.room.blueprint["ext" + (9 + this.sourceIndex).toString()], (this.sourceIndex == 0) ? this.room.blueprint.tower : this.room.blueprint.ext13]) {
                    if(building && building.store.getUsedCapacity(RESOURCE_ENERGY) > building.store.getCapacity(RESOURCE_ENERGY)) {
                        this.drop(RESOURCE_ENERGY, this.store.getUsedCapacity(RESOURCE_ENERGY));
                        this.withdraw(building, RESOURCE_ENERGY);
                    }
                    if (building && building.store.getFreeCapacity(RESOURCE_ENERGY)) {
                        return this.transfer(building, RESOURCE_ENERGY);
                    }
                }
                if (this.room.energyAvailable == this.room.energyCapacityAvailable) {
                    this.build(this.room.blueprint.currentConstructionSite);
                    return this.upgradeController(this.room.controller);
                }
                break;
            case "builder":
                if (this.room.name != this.memory.roomTarget) {
                    return this.moveTo(new RoomPosition(25, 25, this.memory.roomTarget), {reusePath:50});
                }
                if (!this.store.getUsedCapacity(RESOURCE_ENERGY)) {
                    this.memory.needsEnergy = true;
                } else
                if (!this.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    this.memory.needsEnergy = undefined;
                }
                if (this.memory.needsEnergy) {
                    if (this.harvest(this.room.sources[this.sourceIndex]) == ERR_NOT_IN_RANGE) {
                        this.moveTo(this.room.sources[this.sourceIndex], {reusePath: 7});
                    }
                } else {
                    if (this.room.blueprint.currentConstructionSite && this.build(this.room.blueprint.currentConstructionSite) == ERR_NOT_IN_RANGE) {
                        this.moveTo(this.room.blueprint.currentConstructionSite, {reusePath: 7});
                    }
                }
                break;
            case "conqueror":
                if (this.room.name != this.memory.roomTarget) {
                    return this.moveTo(new RoomPosition(25, 25, this.memory.roomTarget), {reusePath: 50});
                }
                if (this.room.controller.my) {
                    return this.suicide();
                }
                if (this.claimController(this.room.controller) == ERR_NOT_IN_RANGE) {
                    this.moveTo(this.room.controller, {reusePath: 7});
                }
                break;

            case "mover":
            if (this.fatigue == 0) {
                if (this.mySource.needsHarvesterMoving && !this.store.getUsedCapacity(RESOURCE_ENERGY)) {
                    const harvester = this.mySource.harvester;
                    if (this.pos.isNearTo(harvester)) {
                        if (this.pos.isNearTo(this.mySource)) {
                            this.mySource.needsHarvesterMoving = undefined;
                            this.move(this.pos.getDirectionTo(harvester));
                            this.pull(harvester);
                            return harvester.move(this);
                        } else {
                            if (this.moveByPath(this.mySource.pathToSource) == ERR_NOT_FOUND) {
                                this.moveTo(this.room.blueprint.getPos(23 + 2 * this.sourceIndex), {reusePath: 7});
                            }
                            this.pull(harvester);
                            return harvester.move(this);
                        }
                    } else {
                        this.moveTo(harvester, {reusePath: 7});
                    }
                } else if (this.mySource.needsUpgraderMoving && !this.store.getUsedCapacity(RESOURCE_ENERGY)) {
                    const upgrader = this.mySource.upgrader;
                    if (this.pos.isNearTo(upgrader) && !upgrader.pos.isEqualTo(this.room.blueprint.getPos(16 + 2 * this.sourceIndex))) {
                        if (this.pos.isEqualTo(this.room.blueprint.getPos(23 + 2 * this.sourceIndex))) {
                            this.moveTo(this.room.blueprint.getPos(16 + 2 * this.sourceIndex));
                            this.pull(upgrader);
                            return upgrader.move(this);
                        } else {
                            this.moveTo(this.room.blueprint.getPos(23 + 2 * this.sourceIndex), {reusePath: 7});
                            this.pull(upgrader);
                            return upgrader.move(this);
                        }
                    } else {
                        if (this.moveByPath(this.mySource.pathToSpawn) == ERR_NOT_FOUND) {
                            this.moveTo(new RoomPosition(this.mySource.pathToSpawn[5].x, this.mySource.pathToSpawn[5].y, this.room.name), {reusePath: 7});
                        }
                    }
                } else {
                    if (this.room.blueprint.link0) {
                        if (this.pos.isEqualTo(this.room.blueprint.getPos(31))) {
                            return this.room.spawn.recycleCreep(this);
                        }
                        return this.moveTo(this.room.blueprint.getPos(31), {reusePath: 7})
                    }
                    if (this.store.getUsedCapacity() == 0) {
                        if (this.pickup(this.mySource.sourceEnergyDrop) == ERR_NOT_IN_RANGE) {
                            if (this.moveByPath(this.mySource.pathToSource) == ERR_NOT_FOUND) {
                                this.moveTo(this.room.blueprint.getPos(23 + 2 * this.sourceIndex), {reusePath: 7});
                            }
                            return;
                        }
                        if (this.moveByPath(this.mySource.pathToSpawn) == ERR_NOT_FOUND) {
                            this.moveTo(new RoomPosition(this.mySource.pathToSpawn[1].x, this.mySource.pathToSpawn[1].y, this.room.name), {reusePath: 7});
                        }
                    } else {
                        if (this.room.blueprint.container0) {
                            if (this.transfer(this.room.blueprint.container0, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                if (this.moveByPath(this.mySource.pathToSpawn) == ERR_NOT_FOUND) {
                                    this.moveTo(new RoomPosition(this.mySource.pathToSpawn[1].x, this.mySource.pathToSpawn[1].y, this.room.name), {reusePath: 7});
                                }
                                return
                            }
                            if (this.moveByPath(this.mySource.pathToSource) == ERR_NOT_FOUND) {
                                this.moveTo(this.room.blueprint.getPos(23 + 2 * this.sourceIndex), {reusePath: 7});
                            }
                        } else {
                            if (this.room.blueprint.currentConstructionSite && this.room.blueprint.currentConstructionSite.pos.isEqualTo(this.room.blueprint.getPos(24)) && this.room.blueprint.currentConstructionSite.structureType == STRUCTURE_LINK) {
                                if (this.pos.isEqualTo(this.room.blueprint.getPos(23 + 2 * this.sourceIndex))) {
                                    this.drop(RESOURCE_ENERGY);
                                }
                            } else {
                                if (this.pos.isEqualTo(this.room.blueprint.getPos(23 + 2 * this.sourceIndex))) {
                                    return this.moveTo(this.room.blueprint.getPos(24));
                                }
                                if (this.pos.isEqualTo(this.room.blueprint.getPos(24))) {
                                    this.drop(RESOURCE_ENERGY);
                                    return this.moveTo(this.room.blueprint.getPos(23 + this.sourceIndex  * 2));
                                }
                            }
                            if (this.moveByPath(this.mySource.pathToSpawn) == ERR_NOT_IN_RANGE) {
                                this.moveTo(this.room.blueprint.getPos(23 + 2 * this.sourceIndex), {reusePath: 7})
                            }
                        }
                    }
                }
            }
        }
        } catch(err) {
            console.log("Error Creep doAction: " + err, this.name)
        }
    };
};