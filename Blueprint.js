class Blueprint {
    /** @param {Room} room */
    constructor(room) {
        this.room = room;
    }
    /**
    * @param {number} cellRef
    * @returns {RoomPosition}
    * */
    getPos(cellRef) {
        const controllerX = this.room.controller.pos.x;
        const controllerY = this.room.controller.pos.y;
        const roomName = this.room.name;
        switch (this.room.orientation){
            case TOP:
                return new RoomPosition(controllerX - 3 + cellRef % 7, controllerY + 1 + ~~(cellRef / 7), roomName)
            case BOTTOM:
                return new RoomPosition(controllerX + 3 - cellRef % 7, controllerY - 1 - ~~(cellRef / 7), roomName)
            case RIGHT:
                return new RoomPosition(controllerX - 1 - ~~(cellRef / 7), controllerY - 3 + cellRef % 7, roomName)
            case LEFT:
                return new RoomPosition(controllerX + 1 + ~~(cellRef / 7), controllerY + 3 - cellRef % 7, roomName)                
        }
    }
    reactToTick() {
        if (this.room.controller.level == 8 && this.room.storage && this.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 500000) {
            this.isBeingRebooted = true;
        }
        if (this.isBeingRebooted) {
            if (this.ext13 && this.room.memory.cell25IsOccupied) {
                this.ext13.destroy();
            }
            if (this.link0) {
                this.link0.destroy();
            }
            if (this.container0 && this.room.spawn.smartSpawn("claimer", 0)) {
                if (this.room.controller.unclaim()) {
                    this.isBeingRebooted = undefined;
                }
            }
        }
        if (this.container0 && this.room.controller.level >= 6 && this.link1 && this.link2 && !this.isBeingRebooted) {
            this.container0.destroy();
        }
        if (this.ext13) {
            if (
                (this.room.controller.level < 7 && this.room.memory.cell25IsOccupied) ||
                (this.room.controller.level >= 7 && !this.room.memory.cell25IsOccupied)
            ) {
                this.ext13.destroy();
            }
        }
        if (this.spawn2 && this.room.controller.level in [4, 5, 6]) {
            this.spawn2.destroy();
        }
        if (this.link0 && this.room.controller.level in [2, 3, 4, 5] && this.link0.store.isEmpty) {
            this.link0.destroy();
        }
        if (!this.currentConstructionSite && this.room.spawn) {
            loop1: for (let i = 0; i <= this.room.controller.level; i++) {
                for (const [building, position, structType] of this["buildingsPerLevel"][i]) {
                    if (!building && position && structType) {
                        this.room.createConstructionSite(position, structType);
                        const newConstructionSite = position.lookFor(LOOK_CONSTRUCTION_SITES);
                        if (newConstructionSite.length) {
                            this.currentConstructionSite = newConstructionSite[0];
                        }
                        break loop1;
                    }
                }
            }
        }
    }
}
Object.defineProperty(Blueprint.prototype, "memory", {
    get: function() {
        Game.rooms[this.room.name].memory;
        Memory.rooms[this.room.name].blueprint = Memory.rooms[this.room.name].blueprint || new Object;
        return Memory.rooms[this.room.name].blueprint
    },
    set: function(value) {
        Memory.rooms[this.room.name].blueprint = value;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Blueprint.prototype, "isBeingRebooted", {
    get: function() {
        return this.memory["isBeingRebooted"] || false;
    },
    set: function(value) {
        this.memory["isBeingRebooted"] = value;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Blueprint.prototype, "currentConstructionSite", {
    get: function() {
        if (!this._currentConstructionSite) {
            const tested = Game.getObjectById(this.memory["currentConstructionSite"]);
            if (!tested) {
                this.memory["currentConstructionSite"] = undefined;
            }
            this._currentConstructionSite = tested;
        }
        return this._currentConstructionSite
    },
    set: function(value) {
        this.memory["currentConstructionSite"] = value.id;
        this._currentConstructionSite = value;
    },
    enumerable: true,
    configurable: true
});
for (const ref of [1, 2]) {
    const name = "link" + ref.toString() + "Pos";
    const sourceIndex = ref - 1;
    Object.defineProperty(Blueprint.prototype, name, {
        get: function() {
            if (!this.memory[name]) {
                const harvesterPosition = [this.room.sources[sourceIndex].pathToSpawn[0].x, this.room.sources[sourceIndex].pathToSpawn[0].y];
                const AROUND = [-1, 0, 1];
                loop1: for (const dx of AROUND) {
                    for (const dy of AROUND) {
                        const testedPosition = new RoomPosition(harvesterPosition[0] + dx, harvesterPosition[1] + dy, this.room.name);
                        const testedLinks = testedPosition.lookFor(LOOK_STRUCTURES).filter(struct => struct.structureType == STRUCTURE_LINK);
                        if (testedLinks.length == 1 && !this.room.sources[sourceIndex].pathToSpawn.some(step => testedPosition.x == step.x && testedPosition.y == step.y)) {
                            this.memory[name] = [testedPosition.x, testedPosition.y];
                            break loop1;
                        }
                    }
                }
                loop2: for (const dx of AROUND) {
                    for (const dy of AROUND) {
                        const testedPosition = new RoomPosition(harvesterPosition[0] + dx, harvesterPosition[1] + dy, this.room.name);
                        if (testedPosition.look().length == 1 && testedPosition.terrain != "wall" && !this.room.sources[sourceIndex].pathToSpawn.some(step => testedPosition.x == step.x && testedPosition.y == step.y)) {
                            this.memory[name] = [testedPosition.x, testedPosition.y];
                            break loop2;
                        }
                    }
                }
            }
            return new RoomPosition(this.memory[name][0], this.memory[name][1], this.room.name)
        },
        set: function(value) {
            this.memory[name] = [value.x, value.y];
        },
        enumerable: true,
        configurable: true
    });
}
Object.defineProperty(Blueprint.prototype, "tower", {
    get: function() {
        const tested = Game.getObjectById(this.memory["tower"]);
        if (!tested) {
            this.memory["tower"] = undefined;
        }
        return tested
    },
    set: function(value) {
        this.memory["tower"] = value.id;
    },
    enumerable: true,
    configurable: true
});

Object.defineProperty(Blueprint.prototype, "energyDrop", {
    get: function() {
        if (!Game.getObjectById(this.memory["energyDrop"])) {
            const testedEnergyDrops = this.getPos(24).lookFor(LOOK_RESOURCES);
            if (testedEnergyDrops.length) {
                this.memory["energyDrop"] = testedEnergyDrops[0].id;
            }
        }
        return Game.getObjectById(this.memory["energyDrop"])
    },
    set: function(value) {
        this.memory["energyDrop"] = value.id;
    },
    enumerable: true,
    configurable: true
});
for (i = 1; i <= 13; i++) {
    const name = "ext" + i.toString();
    Object.defineProperty(Blueprint.prototype, name, {
        get: function() {
            const tested = Game.getObjectById(this.memory[name]);
            if (!tested) {
                this.memory[name] = undefined;
            }
            return tested
            },
        set: function(value) {
            this.memory[name] = value.id;
        },
        enumerable: true,
        configurable: true
    });
}
for (i = 0; i < 3; i++) {
    const name = "link" + i.toString();
    Object.defineProperty(Blueprint.prototype, name, {
        get: function() {
            const tested = Game.getObjectById(this.memory[name]);
            if (!tested) {
                this.memory[name] = undefined;
            }
            return tested
            },
        set: function(value) {
            this.memory[name] = value.id;
        },
        enumerable: true,
        configurable: true
    });
}
Object.defineProperty(Blueprint.prototype, "container0", {
    get: function() {
        const tested = Game.getObjectById(this.memory["container0"]);
        if (!tested) {
            this.memory["container0"] = undefined;
        }
        return tested
    },
    set: function(value) {
        this.memory["container0"] = value.id;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Blueprint.prototype, "spawn2", {
    get: function() {
        const tested = Game.getObjectById(this.memory["spawn2"]);
        if (!tested) {
            this.memory["spawn2"] = undefined;
        }
        return tested
    },
    set: function(value) {
        this.memory["spawn2"] = value.id;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Blueprint.prototype, "storage", {
    get: function() {
        const tested = Game.getObjectById(this.memory["storage"]);
        if (!tested) {
            this.memory["storage"] = undefined;
        }
        return tested
    },
    set: function(value) {
        this.memory["storage"] = value.id;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(Blueprint.prototype, "buildingsPerLevel", {
    get: function() {
        let answer = [
            [],
            [],
            [[this.ext1, this.getPos(8), STRUCTURE_EXTENSION, "ext1"], [this.ext2, this.getPos(12), STRUCTURE_EXTENSION, "ext2"], [this.ext3, this.getPos(36), STRUCTURE_EXTENSION, "ext3"], [this.ext4, this.getPos(40), STRUCTURE_EXTENSION, "ext4"], [this.ext5, this.getPos(9), STRUCTURE_EXTENSION, "ext5"]],
            [[this.tower, this.getPos(10), STRUCTURE_TOWER, "tower"], [this.ext6, this.getPos(11), STRUCTURE_EXTENSION, "ext6"], [this.ext7, this.getPos(37), STRUCTURE_EXTENSION, "ext7"], [this.ext8, this.getPos(39), STRUCTURE_EXTENSION, "ext8"], [this.ext9, this.getPos(15), STRUCTURE_EXTENSION, "ext9"], [this.ext10, this.getPos(19), STRUCTURE_EXTENSION, "ext10"]],
            [[this.ext11, this.getPos(29), STRUCTURE_EXTENSION, "ext11"], [this.ext12, this.getPos(33), STRUCTURE_EXTENSION, "ext12"]],
            [[this.storage, this.getPos(31), STRUCTURE_STORAGE, "storage"], [this.link1, this.link1Pos, STRUCTURE_LINK, "link1"], [this.link2, this.link2Pos, STRUCTURE_LINK, "link2"]],
            [],
            [[this.spawn2, this.getPos(17), STRUCTURE_SPAWN, "spawn2"]],
            []
        ];
        if (this.room.controller.level < 6 || this.isBeingRebooted) {
            answer[2].push([this.container0, this.getPos(24), STRUCTURE_CONTAINER, "container0"]);
        } else {
            answer[6].push([this.link0, this.getPos(24), STRUCTURE_LINK, "link0"]);
        }
        if (this.room.controller.level >= 7 && !this.isBeingRebooted) {
            answer[7].push([this.ext13, this.getPos(25), STRUCTURE_EXTENSION, "ext13"]);
        } else {
            answer[4].push([this.ext13, this.getPos(17), STRUCTURE_EXTENSION, "ext13"]);
        }
        return answer;
    },
    enumerable: true,
    configurable: true
});
module.exports = Blueprint;