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

    Object.defineProperty(p, "myBuildings", {
        get: function() {
            if (this.type == "transferer") {
                return [this.room.blueprint["ext" + (3 + this.sourceIndex).toString()], this.room.blueprint["ext" + (7 + this.sourceIndex).toString()], this.room.blueprint["ext" + (11 + this.sourceIndex).toString()], this.room.spawn]
            } else if (this.type == "upgrader") {
                return [this.room.blueprint["ext" + (1 + this.sourceIndex).toString()], this.room.blueprint["ext" + (5 + this.sourceIndex).toString()], this.room.blueprint["ext" + (9 + this.sourceIndex).toString()], (this.sourceIndex == 0) ? this.room.blueprint.tower : this.room.blueprint.ext13, (this.sourceIndex == 0) ? this.room.blueprint.spawn2 : undefined]
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(p, "myBuildingsAreFull", {
        get: function() {
            if (this._myBuildingsAreFull == undefined) {
                let isFull = true;
                for (const building of this.myBuildings) {
                    if (building && building.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && building.isActive()) {
                        isFull = false;
                        break;
                    }
                }
                this._myBuildingsAreFull = isFull;
            }
            return this._myBuildingsAreFull;
        },
        enumerable: true,
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
            if (this.spawning) return;
            if (this.hits < this.hitsMax && !this.room.find(FIND_HOSTILE_CREEPS).length && this.room.blueprint.tower) {
                this.room.blueprint.tower.heal(this);
            }
        switch(this.type) {
            case "transferer":
                if (this.mySource.recycleEnergyDrop && this.store.getFreeCapacity(RESOURCE_ENERGY) != 0) {
                    return this.pickup(this.mySource.recycleEnergyDrop);
                } 
                if (this.room.controller.level > 5 && this.room.blueprint.storage && this.room.blueprint.link0 && this.room.isFullEnergy) {
                    if (this.room.blueprint.link0.store.getUsedCapacity(RESOURCE_ENERGY) > 700) {
                        if (this.store.getUsedCapacity(RESOURCE_ENERGY)) {
                            return this.transfer(this.room.blueprint.storage, RESOURCE_ENERGY);
                        }
                        return this.withdraw(this.room.blueprint.link0, RESOURCE_ENERGY);
                    } else if (this.room.blueprint.link0.store.getUsedCapacity(RESOURCE_ENERGY) < 100) {
                        if (this.store.getUsedCapacity(RESOURCE_ENERGY)) {
                            return this.transfer(this.room.blueprint.link0, RESOURCE_ENERGY);
                        }
                        return this.withdraw(this.room.blueprint.storage, RESOURCE_ENERGY);
                    }
                }
                if (this.myBuildingsAreFull) {
                    if (this.room.blueprint.storage && this.room.blueprint.container0 && this.room.blueprint.container0.store.getUsedCapacity(RESOURCE_ENERGY) < 100) {
                        if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                            return this.withdraw(this.room.blueprint.storage, RESOURCE_ENERGY);
                        } else {
                            return this.transfer(this.room.blueprint.container0, RESOURCE_ENERGY);
                        }
                    }
                    if (this.room.blueprint.storage) {
                        return this.transfer(this.room.blueprint.storage, RESOURCE_ENERGY);
                    }
                    return OK;
                }
                if (this.store.getFreeCapacity(RESOURCE_ENERGY) != 0) {
                    if (this.room.blueprint.storage && this.room.blueprint.storage.store.getUsedCapacity(RESOURCE_ENERGY)) {
                        return this.withdraw(this.room.blueprint.storage, RESOURCE_ENERGY);
                    }
                    if (this.room.blueprint.link0) {
                        return this.withdraw(this.room.blueprint.link0, RESOURCE_ENERGY);
                    }
                    if (this.room.blueprint.container0) {
                        return this.withdraw(this.room.blueprint.container0, RESOURCE_ENERGY);
                    }
                    if (this.mySource.spawnEnergyDrop) {
                        return this.pickup(this.mySource.spawnEnergyDrop);
                    }
                }
                for (const building of this.myBuildings) {
                    if (building && building.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        return this.transfer(building, RESOURCE_ENERGY);
                    }
                }
                if (this.room.blueprint.storage && this.store.getUsedCapacity(RESOURCE_ENERGY)) {
                return this.transfer(this.room.blueprint.storage, RESOURCE_ENERGY);
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
                if (this.mySource.link && this.store.getFreeCapacity(RESOURCE_ENERGY) < 10) {
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
                if (this.store.getUsedCapacity(RESOURCE_ENERGY) < (this.getActiveBodyparts(WORK) + 1)) {
                    if (this.room.blueprint.link0) {
                        this.withdraw(this.room.blueprint.link0, RESOURCE_ENERGY);
                    } else
                    if (this.room.blueprint.container0) {
                        this.withdraw(this.room.blueprint.container0, RESOURCE_ENERGY);
                    } else
                    if (this.mySource.spawnEnergyDrop) {
                        this.pickup(this.mySource.spawnEnergyDrop);
                    } 
                } 
                for (const building of this.myBuildings) {
                    if (building && building.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && building.isActive()) {
                        return this.transfer(building, RESOURCE_ENERGY);
                    }
                }
                if (this.room.isFullEnergy) {
                    if (this.room.blueprint.container0 && this.room.blueprint.container0.hits < 20000) {
                        return this.repair(this.room.blueprint.container0);
                    }
                    this.build(this.room.blueprint.currentConstructionSite);
                    return this.upgradeController(this.room.controller);
                }
                break;
            case "builder":
                if (this.room.name != this.memory.targetRoomName) {
                    return this.moveTo(new RoomPosition(9, 27, this.memory.targetRoomName), {reusePath:50});
                }
                if (!this.store.getUsedCapacity(RESOURCE_ENERGY)) {
                    this.memory.needsEnergy = true;
                } else
                if (!this.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    this.memory.needsEnergy = undefined;
                }
                if (this.memory.needsEnergy) {
                    if (this.room.storage) {
                        if (this.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            this.moveTo(this.room.storage, {reusePath: 7});
                        }
                    } else {
                        if (this.harvest(this.mySource) == ERR_NOT_IN_RANGE) {
                            this.moveTo(this.mySource, {reusePath: 7});
                        }
                    }
                } else {
                    if (this.room.blueprint.currentConstructionSite) {
                        if (this.build(this.room.blueprint.currentConstructionSite) == ERR_NOT_IN_RANGE) {
                            this.moveTo(this.room.blueprint.currentConstructionSite, {reusePath: 7});
                        }
                    } else {
                        if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
                            this.moveTo(this.room.controller, {reusePath: 7});
                        }
                    }
                }
                break;
                case "claimer":
                    //if (this.room.name != "W50S0" && !this.memory.wentToCheckPoint) {return this.moveTo(new RoomPosition(25, 25, "W50S0"), {reusePath:100})}
                    //if (this.room.name == "W50S0" && !this.memory.wentToCheckPoint) {this.memory.wentToCheckPoint = true}
                    if (this.room.name != this.memory.targetRoomName) {
                        return this.moveTo(new RoomPosition(25, 25, this.memory.targetRoomName), {reusePath: 50});
                    }
                    if (this.room.controller.my) {
                        return this.suicide();
                    }
                    if (this.claimController(this.room.controller) == ERR_NOT_IN_RANGE) {
                        this.moveTo(this.room.controller, {reusePath: 7});
                    } else {
                        this.signController("Who's been wearing Miranda's clothes?")
                    }
                    break;
                case "carrier":
                    let myResource;
                    if (this.store.getUsedCapacity()) {
                        const arrivalTerminal = Game.getObjectById("66007d5a2e5d6b17cae12cca");
                        for (const resource of ["energy"]) {
                            if (this.store.getUsedCapacity(resource)) {
                                myResource = resource;
                                break;
                            }
                        }
                        if (this.transfer(arrivalTerminal, myResource) == ERR_NOT_IN_RANGE) {
                            return this.moveTo(arrivalTerminal, {reusePath: 25});
                        }
                    } else {
                        const departureStorage = Game.getObjectById("65c46ae9b9ef42aaff711d30");
                        for (const resource of ["energy"]) {
                            if (departureStorage.store.getUsedCapacity(resource)) {
                                myResource = resource;
                                break;
                            }
                        }
                        if (this.withdraw(departureStorage, myResource) == ERR_NOT_IN_RANGE) {
                            return this.moveTo(departureStorage, {reusePath: 25});
                        }
                    }
                    break;
            
            case "mover":
            if (this.fatigue == 0) {
                if (this.mySource.needsHarvesterMoving && this.mySource.harvester && !this.mySource.harvester.spawning) {
                    const harvester = this.mySource.harvester;
                    if (this.pos.isNearTo(harvester)) {
                        if (this.pos.isNearTo(this.mySource)) {
                            this.mySource.needsHarvesterMoving = undefined;
                            this.move(this.pos.getDirectionTo(harvester));
                            this.pull(harvester);
                            return harvester.move(this);
                        } else {
                            if (this.moveByPath(this.mySource.pathToSource) == ERR_NOT_FOUND) {
                                this.moveTo(this.room.blueprint.getPos(22 + 4 * this.sourceIndex), {reusePath: 7});
                            }
                            this.pull(harvester);
                            return harvester.move(this);
                        }
                    } else {
                        this.moveTo(harvester, {reusePath: 7});
                    }
                } else if (this.mySource.needsUpgraderMoving && !this.mySource.needsHarvesterMoving && this.mySource.upgrader && !this.mySource.upgrader.spawning) {
                    const upgrader = this.mySource.upgrader;
                    if (this.pos.isNearTo(upgrader) && !upgrader.pos.isEqualTo(this.room.blueprint.getPos(16 + 2 * this.sourceIndex))) {
                        if (this.pos.isEqualTo(this.room.blueprint.getPos(22 + 4 * this.sourceIndex))) {
                            this.moveTo(this.room.blueprint.getPos(16 + 2 * this.sourceIndex));
                            this.pull(upgrader);
                            return upgrader.move(this);
                        } else {
                            this.moveTo(this.room.blueprint.getPos(22 + 4 * this.sourceIndex), {reusePath: 7});
                            this.pull(upgrader);
                            return upgrader.move(this);
                        }
                    } else {
                        this.moveTo(upgrader, {reusePath: 7});
                    }
                } else {
                    if (this.getActiveBodyparts(CARRY) == 0) {
                        if (this.pos.isEqualTo(this.room.blueprint.getPos(22 + this.sourceIndex * 4))) {
                            this.room.spawn.recycleCreep(this.mySource.transferer);
                            return this.moveTo(this.room.blueprint.getPos(30 + this.sourceIndex * 2));
                        }
                        if (this.pos.isEqualTo(this.room.blueprint.getPos(30 + this.sourceIndex * 2))) {
                            return this.room.spawn.recycleCreep(this);
                        }
                        if (this.moveByPath(this.mySource.pathToSpawn) == ERR_NOT_FOUND) {
                            return this.moveTo(this.room.blueprint.getPos(22 + this.sourceIndex * 4));
                        }
                    }
                    if (this.store.getUsedCapacity() == 0) {
                        if (this.mySource.sourceEnergyDrop && this.pickup(this.mySource.sourceEnergyDrop) == ERR_NOT_IN_RANGE) {
                            if (this.moveByPath(this.mySource.pathToSource) == ERR_NOT_FOUND) {
                                this.moveTo(this.room.blueprint.getPos(22 + 4 * this.sourceIndex), {reusePath: 7});
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