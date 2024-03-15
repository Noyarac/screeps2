module.exports = function() {
    let p = Creep.prototype;

    Object.defineProperty(p, "type", {
        get: function() {
            return this.memory.type;
        },
        set: function(value) {
            this.memory.type = value;
            this.type = value;
        },
        configurable: true
    });

    Object.defineProperty(p, "mySource", {
        get: function() {
            return Game.getObjectById(this.memory.mySource);
        },
        set: function(value) {
            if (value) {
                this.memory.mySource = value.id;
            }
        },
        enumerable: true,
        configurable: true
    });
  
    Object.defineProperty(p, "myLink", {
        get: function() {
            return Game.getObjectById(this.memory.myLink);
        },
        set: function(value) {
            if (value) {
                this.memory.myLink = value.id;
            }
        },
        enumerable: true,
        configurable: true
    });
  
    Object.defineProperty(p, 'mission', {
        get: function() {
            if (this.memory.mission) {
                this.mission = Mission.decode(this.memory.mission);
            }
            return this.mission;
        },
        set: function(value) {
            this.memory.mission = Mission.encode(value);
            this.mission = value;
        },
        enumerable: false,
        configurable: true
    });

    p.doAction = function() {
        switch(this.type) {
            case "transferer":
                if (this.store.getUsedCapacity() == 0) {
                    if (this.room.blueprint.link0) {
                        this.withdraw(this.room.blueprint.link0, RESOURCE_ENERGY);
                    } else if (this.room.blueprint.container0) {
                        this.withdraw(this.room.blueprint.container0, RESOURCE_ENERGY);
                    } else {
                        this.pickup(this.room.blueprint.getEnergyDrop((this.room.blueprint.currentConstructionSite && this.room.blueprint.currentConstructionSite.pos.isEqualTo(this.room.blueprint.getPos(24)) && this.room.blueprint.currentConstructionSite.structureType == STRUCTURE_LINK) ? this.mySource : undefined));
                    }
                } else {
                    const sourceIndex = this.room.sources.indexOf(this.mySource) + 1;
                    for (const building of [this.room.blueprint["ext" + (2 + sourceIndex).toString()], this.room.blueprint["ext" + (6 + sourceIndex).toString()], this.room.blueprint["ext" + (10 + sourceIndex).toString()], this.room.spawn]) {
                        if (building && building.store.getFreeCapacity(RESOURCE_ENERGY) && building.structureType != STRUCTURE_CONTAINER) {
                            this.transfer(building, RESOURCE_ENERGY);
                        }
                    }
                }
                break;
            case "harvester":
                if (this.mySource.needsHarvesterMoving && !this.mySource.mover) {
                    this.room.spawn.spawnMover(this.mySource);
                }
                if (!this.store.getFreeCapacity()) {
                    this.build(this.room.blueprint.currentConstructionSite);
                    if (this.myLink) {
                        this.transfer(this.myLink, RESOURCE_ENERGY);
                    }
                }
                this.harvest(this.mySource);
                if (this.room.blueprint.currentConstructionSite && this.room.blueprint.currentConstructionSite.pos.inRangeTo(this.mySource, 2) && !this.store.getCapacity()) {
                    this.suicide();
                }
                break;

            case "upgrader":
                if ([31, 24, 44, 45, 46, 30, 32].some(ref => this.pos.isEqualTo(this.room.blueprint.getPos(ref)))) {
                    this.mySource.needsUpgraderMoving = true;
                }
                if (this.mySource.needsUpgraderMoving && !this.mySource.mover) {
                    this.room.spawn.spawnMover(this.mySource);
                }
                if (this.store.getUsedCapacity() == 0) {
                    if (this.room.blueprint.link0) {
                        this.withdraw(this.room.blueprint.link0, RESOURCE_ENERGY);
                    } else if (this.room.blueprint.container0) {
                        this.withdraw(this.room.blueprint.container0, RESOURCE_ENERGY);
                    } else {
                        this.pickup((this.room.blueprint.getEnergyDrop((this.room.blueprint.currentConstructionSite && this.room.blueprint.currentConstructionSite.pos.isEqualTo(this.room.blueprint.getPos(24)) && this.room.blueprint.currentConstructionSite.structureType == STRUCTURE_LINK) ? this.mySource : undefined)));
                    }
                } else {
                    const sourceIndex = this.room.sources.indexOf(this.mySource) + 1;
                    for (const building of [this.room.blueprint["ext" + sourceIndex.toString()], this.room.blueprint["ext" + (4 + sourceIndex).toString()], this.room.blueprint["ext" + (8 + sourceIndex).toString()], (sourceIndex == 1) ? this.room.blueprint.tower : this.room.blueprint.ext13]) {
                        if (building && building.store.getFreeCapacity(RESOURCE_ENERGY) && building.structureType != STRUCTURE_CONTAINER) {
                            this.transfer(building, RESOURCE_ENERGY);
                        }
                    }
                    if (this.room.energyAvailable == this.room.energyCapacityAvailable || (this.room.blueprint.link1 && this.room.blueprint.link2)) {
                        this.upgradeController(this.room.controller);
                        if (this.room.blueprint.currentConstructionSite && this.pos.inRangeTo(this.room.blueprint.currentConstructionSite, 3)) {
                            this.build(this.room.blueprint.currentConstructionSite);
                        }
                    }
                }
                break;
            case "builder":
                if (this.room.name != this.memory.roomTarget) {
                    this.moveTo(new RoomPosition(25, 25, this.memory.roomTarget), {reusePath:50});
                    break;
                }
                if (!this.store.getUsedCapacity(RESOURCE_ENERGY)) {
                    this.memory.needsEnergy = true;
                } else
                if (!this.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    this.memory.needsEnergy = undefined;
                }
                if (this.memory.needsEnergy) {
                    if (this.harvest(this.room.sources[this.memory.sourceIndex]) == ERR_NOT_IN_RANGE) {
                        this.moveTo(this.room.sources[this.memory.sourceIndex], {reusePath: 7});
                    }
                } else {
                    if (this.room.blueprint.currentConstructionSite && this.build(this.room.blueprint.currentConstructionSite) == ERR_NOT_IN_RANGE) {
                        this.moveTo(this.room.blueprint.currentConstructionSite);
                    }
                }
                break;
            case "conqueror":
                if (this.room.name != this.memory.roomTarget) {
                    this.moveTo(new RoomPosition(25, 25, this.memory.roomTarget), {reusePath:50});
                    break;
                }
                if (this.claimController(this.room.controller) == ERR_NOT_IN_RANGE) {
                    this.moveTo(this.room.controller, {reusePath: 7});
                }
                break;

            case "mover":
            if (this.fatigue == 0) {
                const sourceIndex = this.room.sources.indexOf(this.mySource);
                if (this.mySource.needsHarvesterMoving && !this.store.getUsedCapacity(RESOURCE_ENERGY)) {
                    const harvester = this.mySource.harvester;
                    if (this.pos.isNearTo(harvester)) {
                        if (this.pos.isNearTo(this.mySource)) {
                            this.mySource.needsHarvesterMoving = undefined;
                            this.move(this.pos.getDirectionTo(harvester));
                            this.pull(harvester);
                            harvester.move(this);
                        } else {
                            if (this.moveByPath(this.mySource.pathToSource) == ERR_NOT_FOUND) {
                                this.moveTo(this.room.blueprint.getPos(23 + 2 * sourceIndex));
                            }
                            this.pull(harvester);
                            harvester.move(this);
                        }
                    } else {
                        this.moveTo(harvester, {reusePath: 5});
                    }
                } else if (this.mySource.needsUpgraderMoving && !this.store.getUsedCapacity(RESOURCE_ENERGY)) {
                    const upgrader = this.mySource.upgrader;
                    if (this.pos.isNearTo(upgrader)) {
                        if (this.pos.isEqualTo(this.room.blueprint.getPos(23 + 2 * sourceIndex))) {
                            this.moveTo(this.room.blueprint.getPos(16 + 2 * sourceIndex));
                            this.pull(upgrader);
                            upgrader.move(this);
                        } else {
                            this.mySource.needsUpgraderMoving = undefined;
                            this.moveTo(this.room.blueprint.getPos(23 + 2 * sourceIndex));
                            this.pull(upgrader);
                            upgrader.move(this);
                        }
                    } else {
                        if (this.moveByPath(this.mySource.pathToSpawn) == ERR_NOT_FOUND) {
                            this.moveTo(this.room.blueprint.getPos(23 + 2 * sourceIndex));
                        }
                    }
                } else {
                    if (this.store.getUsedCapacity() == 0) {
                        if (this.moveByPath(this.mySource.pathToSource) == ERR_NOT_FOUND) {
                            this.moveTo(this.room.blueprint.getPos(23 + 2 * sourceIndex));
                        }
                        this.pickup(this.mySource.energyDrop)
                    } else {
                        if (this.moveByPath(this.mySource.pathToSpawn) == ERR_NOT_FOUND) {
                            this.moveTo(new RoomPosition(this.mySource.pathToSpawn[0].x, this.mySource.pathToSpawn[0].y, this.room.name), {reusePath: 5});
                        }
                        if (this.room.blueprint.container0) {
                            this.transfer(this.room.blueprint.container0, RESOURCE_ENERGY)
                        } else {
                            if (this.room.blueprint.currentConstructionSite && this.room.blueprint.currentConstructionSite.pos.isEqualTo(this.room.blueprint.getPos(24)) && this.room.blueprint.currentConstructionSite.structureType == STRUCTURE_LINK) {
                                if (this.pos.isEqualTo(this.room.blueprint.getPos(23 + 2 * sourceIndex))) {
                                    this.drop(RESOURCE_ENERGY);
                                }
                            } else {
                                if (this.pos.isEqualTo(this.room.blueprint.getPos(23 + 2 * sourceIndex))) {
                                    this.moveTo(this.room.blueprint.getPos(24));
                                }
                                if (this.pos.isEqualTo(this.room.blueprint.getPos(24))) {
                                    this.drop(RESOURCE_ENERGY);
                                }
                            }
                        }
                    }
                }
            }
        }
    };
};