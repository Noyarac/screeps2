module.exports = function() {
    let p = StructureSpawn.prototype;
    Object.defineProperty(p, "ttl", {
        get: function() {
            return this.memory.ttl;
        },
        set: function(value) {
            this.memory.ttl = value;
        },
        enumerable: true,
        configurable: true
    });
    p.TTL_DELAY = 100;

    p.reactToTick = function() {
        try{
            if (this.spawning) {
                const creep = Game.creeps[this.spawning.name];
                creep.mySource[creep.type] = creep;
                Memory.creepsNames = Memory.creepsNames || new Object;
                Memory.creepsNames[creep.id] = creep.name;
            }
            if (Game.time > this.ttl || this.room.energyAvailable == this.room.energyCapacityAvailable) {
                for (const source of this.room.sources) {
                    if (!source.harvester) {
                        if (this.spawnHarvester(source) == OK) {
                            break;
                        }
                    }
                    if (!this.room.blueprint.link0 && !source.mover) {
                        if (this.spawnMover(source) == OK) {
                            break;
                        }
                    }
                    if (!source.upgrader) {
                        if (this.spawnUpgrader(source) == OK) {
                            break;
                        }
                    }
                    if (!source.transferer) {
                        if (this.spawnTransferer(source) == OK) {
                            break;
                        }
                    }
                }
            }
        }catch(err){
            console.log("spawnAi reactToTick " + err);
        }
    }

    p.spawnHarvester = function(source) {
        let dir;
        const roomOrientation = this.room.orientation;
        switch(roomOrientation) {
            case TOP:
                dir = BOTTOM;
                if (new RoomPosition(this.pos.x, this.pos.y+1, this.pos.roomName).lookFor(LOOK_CREEPS).length) {
                    return ERR_NO_PATH;
                }
                break;
            case RIGHT:
                dir = LEFT;
                if (new RoomPosition(this.pos.x-1, this.pos.y, this.pos.roomName).lookFor(LOOK_CREEPS).length) {
                    return ERR_NO_PATH;
                }
                break;
            case BOTTOM:
                dir = TOP;
                if (new RoomPosition(this.pos.x, this.pos.y-1, this.pos.roomName).lookFor(LOOK_CREEPS).length) {
                    return ERR_NO_PATH;
                }
                break;
            case LEFT:
                dir = RIGHT;
                if (new RoomPosition(this.pos.x+1, this.pos.y, this.pos.roomName).lookFor(LOOK_CREEPS).length) {
                    return ERR_NO_PATH;
                }
                break;
            }
        
        if (typeof source == "string") {
            source = Game.getObjectById(source);
        }
        const creepName = this.room.name + Game.time.toString();
        const carryPartsQty = (source.hasLink || (this.room.blueprint.currentConstructionSite && this.room.blueprint.currentConstructionSite.pos.isNearTo(new RoomPosition(source.pathToSpawn[0].x, source.pathToSpawn[0].y, this.room.name)))) ? 1 : 0;
        const testedWorkPartsQty = ~~((this.room.energyAvailable - carryPartsQty * BODYPART_COST[CARRY]) / BODYPART_COST[WORK]);
        if (!testedWorkPartsQty) {
            return ERR_NOT_ENOUGH_ENERGY;
        }
        const workPartsQty = Math.min(5, testedWorkPartsQty);
        const status = this.spawnCreep([...new Array(workPartsQty).fill(WORK), ...new Array(carryPartsQty).fill(CARRY)], creepName, {directions: [dir], memory: {type: "harvester", mySource: source.id, myLink: (source.link) ? source.link.id : undefined}});
        if (status == OK) {
            this.ttl = Game.time + this.TTL_DELAY;
            source.needsHarvesterMoving = true;
        }
        return status;
    }
    p.spawnMover = function(source) {
        if (typeof source == "string") {
            source = Game.getObjectById(source);
        }
        const creepName = this.room.name + Game.time.toString();
        let targetedCarryPartsQty;
        let targetedMovePartsQty;
        if (source.hasLink && this.room.blueprint.link0) {
            targetedCarryPartsQty = 0;
            targetedMovePartsQty = Math.min(5, ~~(this.room.energyAvailable / BODYPART_COST[MOVE]));            
        } else {
            targetedCarryPartsQty = Math.min(9, Math.ceil(source.pathToSpawn.length * 2 / 5));
            targetedCarryPartsQty = Math.min(~~(this.room.energyAvailable / 2 / BODYPART_COST[CARRY]), targetedCarryPartsQty)
            targetedMovePartsQty = targetedCarryPartsQty;
        }
        const sourceIndex = this.room.sources.indexOf(source);
        const dir = [
            this.pos.getDirectionTo(this.room.blueprint.getPos((sourceIndex) ? 46 : 44))
        ];
        const status = this.spawnCreep([...new Array(targetedCarryPartsQty).fill(CARRY), ...new Array(targetedMovePartsQty).fill(MOVE)], creepName, {directions: dir, memory: {type: "mover", mySource: source.id}});
        if (status == OK) {
            this.ttl = Game.time + this.TTL_DELAY;
        }
        return status;
    }
    p.spawnUpgrader = function(source) {
        let targetedWorkPartsQty = Math.min(9, ~~((this.room.energyAvailable - BODYPART_COST[CARRY]) / BODYPART_COST[WORK]));
        if (targetedWorkPartsQty < 1) {
            return ERR_NOT_ENOUGH_ENERGY;
        }
        if (this.room.blueprint.getPos(31).look().length > 1) {
            return ERR_NO_PATH;
        }
        const creepName = this.room.name + Game.time.toString();
        let targetedCarryPartsQty = 1;
        
        const dir = [
            this.pos.getDirectionTo(this.room.blueprint.getPos(31))
        ];
        const status = this.spawnCreep([...new Array(targetedCarryPartsQty).fill(CARRY), ...new Array(targetedWorkPartsQty).fill(WORK)], creepName, {directions: dir, memory: {type: "upgrader", mySource: source.id}});
        if (status == OK) {
            this.ttl = this.ttl + this.TTL_DELAY;
            source.needsUpgraderMoving = true;
        }
        return status;
    }
    p.spawnTransferer = function(source) {
        if (this.room.energyAvailable < BODYPART_COST[CARRY]) {
            return ERR_NOT_ENOUGH_ENERGY;
        }
        if (this.room.blueprint.getPos(31).look().length > 1) {
            return ERR_NO_PATH;
        }
        const sourceIndex = this.room.sources.indexOf(source);
        const creepName = this.room.name + Game.time.toString();
        
        const dir = [
            this.pos.getDirectionTo(this.room.blueprint.getPos(30 + 2*sourceIndex))
        ];
        const status = this.spawnCreep([CARRY], creepName, {directions: dir, memory: {type: "transferer", mySource: source.id}});
        if (status == OK) {
            this.ttl = Game.time + this.TTL_DELAY;
        }
        return status;
    }
    p.spawnBuilder = function(roomTarget, sourceIndex) {
        if (this.room.energyAvailable < 200) {
            return ERR_NOT_ENOUGH_ENERGY;
        }
        if (this.room.blueprint.getPos(31).look().length > 1) {
            return ERR_NO_PATH;
        }
        const targetedWorkPartsQty = ~~(this.room.energyAvailable / 2 / BODYPART_COST[WORK]);
        const targetedCarryPartsQty = targetedWorkPartsQty;
        const targetedMovePartsQty = targetedCarryPartsQty;
        const creepName = this.room.name + Game.time.toString();
        
        const dir = [
            this.pos.getDirectionTo(this.room.blueprint.getPos(31))
        ];
        const status = this.spawnCreep([...new Array(targetedCarryPartsQty).fill(CARRY), ...new Array(targetedWorkPartsQty).fill(WORK), ...new Array(targetedMovePartsQty).fill(MOVE)], creepName, {directions: dir, memory: {type: "builder", roomTarget: roomTarget, sourceIndex: sourceIndex, mySource: this.room.sources[sourceIndex].id}});
        if (status == OK) {
            this.ttl = Game.time + this.TTL_DELAY;
        }
        return status;
    }
    p.spawnConqueror = function(roomTarget) {
        if (this.room.energyAvailable < 650) {
            return ERR_NOT_ENOUGH_ENERGY;
        }
        if (this.room.blueprint.getPos(31).look().length > 1) {
            return ERR_NO_PATH;
        }
        const creepName = this.room.name + Game.time.toString();
        
        const dir = [
            this.pos.getDirectionTo(this.room.blueprint.getPos(31))
        ];
        const status = this.spawnCreep([CLAIM, MOVE], creepName, {directions: dir, memory: {type: "conqueror", roomTarget: roomTarget, mySource: this.room.sources[0].id}});
        if (status == OK) {
            this.ttl = Game.time + this.TTL_DELAY;
        }
        return status;
    }
}