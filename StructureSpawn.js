module.exports = function() {
    let p = StructureSpawn.prototype;

    p.TTL_DELAY = 100;

    Object.defineProperty(p, "ttl", {
        get: function() {
            if (!this.memory.ttl) {
                this.memory.ttl = 1;
            }
            return this.memory.ttl;
        },
        set: function(value) {
            this.memory.ttl = value;
        },
        enumerable: true,
        configurable: true
    });

    p.reactToTick = function() {
        try{
            if (this.spawning) {
                const creep = Game.creeps[this.spawning.name];
                if (!(creep.id in Memory.creepsNames)) {
                    creep.mySource[creep.type] = creep;
                    Memory.creepsNames[creep.id] = creep.name;
                }
            }
            if (Game.time > this.ttl || this.room.energyAvailable == this.room.energyCapacityAvailable) {
                loop1: for (const [sourceIndex, source] of this.room.sources.entries()) {
                    for (const [type, condition] of [["harvester", true], ["mover", !this.room.blueprint.link0], ["upgrader", true], ["transferer", (sourceIndex == 0 || this.room.blueprint.ext4 || this.room.blueprint.ext8 || this.room.blueprint.ext12)]]) {
                        if (!source[type] && condition) {
                            if (this.smartSpawn(type, sourceIndex) == OK) {
                                break loop1;
                            }
                        }
                    }
                }
            }
        }catch(err){
            console.log("StructureSpawn reactToTick " + err);
        }
    }
    
    p.getSpawningPosition = function(positionRef) {
        return this.room.blueprint.getPos(positionRef);
    };

    p.isDirectionOccupied = function(spawningPosition) {
        return spawningPosition.lookFor(LOOK_CREEPS).length > 0;
    };

    p.doTheSpawn = function(type, sourceIndex, targetedRoomName, spawningPosition, carryPartsQty, workPartsQty, movePartsQty, claimPartsQty) {
        const creepName = this.room.name + Game.time.toString();
        const dir = [this.pos.getDirectionTo(spawningPosition)];
        const status = this.spawnCreep([...new Array(carryPartsQty).fill(CARRY), ...new Array(workPartsQty).fill(WORK), ...new Array(movePartsQty).fill(MOVE), ...new Array(claimPartsQty).fill(CLAIM)], creepName, {directions: dir, memory: {type, sourceIndex, targetRoomName: targetedRoomName}});
        if (status == OK) {
            this.ttl = Game.time + this.TTL_DELAY;
        }
        return status;
    };
    p.smartSpawn = function(type, sourceIndex, targetRoomName = undefined) {
        let positionRef, spawningPosition, status;
        let [carryPartsQty, workPartsQty, movePartsQty, claimPartsQty] = [0, 0, 0, 0];
        

        switch(type) {
            case "upgrader":
                positionRef = 31;
                spawningPosition = this.getSpawningPosition(positionRef);
                if (this.isDirectionOccupied(spawningPosition)) return ERR_NO_PATH;

                workPartsQty = Math.min(9, ~~((this.room.energyAvailable - BODYPART_COST[CARRY]) / BODYPART_COST[WORK]));
                if (workPartsQty < 1) return ERR_NOT_ENOUGH_ENERGY;

                carryPartsQty = 1;

                status = this.doTheSpawn(type, sourceIndex, targetRoomName, spawningPosition, carryPartsQty, workPartsQty, movePartsQty, claimPartsQty);
                if (status == OK) {
                    this.room.sources[sourceIndex].needsUpgraderMoving = true;
                }
                return status;

            case "harvester":
                positionRef = 45;
                spawningPosition = this.getSpawningPosition(positionRef);
                if (this.isDirectionOccupied(spawningPosition)) return ERR_NO_PATH;
                
                carryPartsQty = (this.room.blueprint.link0 || (this.room.blueprint.currentConstructionSite && this.room.blueprint.currentConstructionSite.pos.isEqualTo(this.room.blueprint["link" + (sourceIndex + 1).toString() + "Pos"]))) ? 1 : 0;

                workPartsQty = Math.min(5, ~~((this.room.energyAvailable - carryPartsQty * BODYPART_COST[CARRY]) / BODYPART_COST[WORK]));
                if (workPartsQty < 1) return ERR_NOT_ENOUGH_ENERGY;

                status = this.doTheSpawn(type, sourceIndex, targetRoomName, spawningPosition, carryPartsQty, workPartsQty, movePartsQty, claimPartsQty);
                if (status == OK) {
                    this.room.sources[sourceIndex].needsHarvesterMoving = true;
                }
                return status;

            case "mover":
                positionRef = 44 + sourceIndex * 2;
                spawningPosition = this.getSpawningPosition(positionRef);
                if (this.isDirectionOccupied(spawningPosition)) return ERR_NO_PATH;
                
                // Aimed
                carryPartsQty = (this.room.blueprint.link0) ? 0 : Math.min(9, Math.ceil(this.room.sources[sourceIndex].pathToSpawn.length * 2 / 5));
                // Real
                carryPartsQty = Math.min(~~(this.room.energyAvailable / 2 / BODYPART_COST[CARRY]), carryPartsQty)
                
                movePartsQty = (this.room.blueprint.link0) ? Math.min(5, ~~(this.room.energyAvailable / BODYPART_COST[MOVE])) : carryPartsQty;
                if (movePartsQty < 1) return ERR_NOT_ENOUGH_ENERGY;
                return this.doTheSpawn(type, sourceIndex, targetRoomName, spawningPosition, carryPartsQty, workPartsQty, movePartsQty, claimPartsQty);

            case "transferer":
                positionRef = 30 + sourceIndex * 2;
                spawningPosition = this.getSpawningPosition(positionRef);
                if (this.isDirectionOccupied(spawningPosition)) return ERR_NO_PATH;

                if (this.room.energyAvailable < BODYPART_COST[CARRY]) return ERR_NOT_ENOUGH_ENERGY;
                carryPartsQty = 1;
                return this.doTheSpawn(type, sourceIndex, targetRoomName, spawningPosition, carryPartsQty, workPartsQty, movePartsQty, claimPartsQty);

            case "builder":
                positionRef = 44 + sourceIndex * 2;
                spawningPosition = this.getSpawningPosition(positionRef);
                if (this.isDirectionOccupied(spawningPosition)) return ERR_NO_PATH;

                workPartsQty = ~~(this.room.energyAvailable / 2 / BODYPART_COST[WORK]);
                if (workPartsQty < 1) return ERR_NOT_ENOUGH_ENERGY;
                carryPartsQty = workPartsQty;
                movePartsQty = workPartsQty;
                return this.doTheSpawn(type, sourceIndex, targetRoomName, spawningPosition, carryPartsQty, workPartsQty, movePartsQty, claimPartsQty);

            case "claimer":
                positionRef = 45;
                spawningPosition = this.getSpawningPosition(positionRef);
                if (this.isDirectionOccupied(spawningPosition)) return ERR_NO_PATH;

                if (this.room.energyAvailable < BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]) return ERR_NOT_ENOUGH_ENERGY;
                movePartsQty = 1;
                claimPartsQty = 1;
                return this.doTheSpawn(type, sourceIndex, targetRoomName, spawningPosition, carryPartsQty, workPartsQty, movePartsQty, claimPartsQty);

            default:
                return ERR_INVALID_ARGS;
        }
    }
}