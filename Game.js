module.exports = function() {
    Object.defineProperty(Game, 'memory', {
        get: function() {
            Memory.game = Memory.game || new Object;
            return Memory.game;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Game, 'creepsToIdentify', {
        get: function() {
            this.memory.creepsToIdentify = this.memory.creepsToIdentify || new Array;
            return this.memory.creepsToIdentify;
        },
        set: function(value) {
            this.memory.creepsToIdentify = value; 
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Game, 'identifiedCreeps', {
        get: function() {
            this.memory.identifiedCreeps = this.memory.identifiedCreeps || new Object;
            return this.memory.identifiedCreeps;
        },
        set: function(value) {
            this.memory.identifiedCreeps = value; 
        },
        enumerable: false,
        configurable: true
    });

    Game.identifyCreeps = function() {
        while (this.creepsToIdentify.length) {
            const creep = Game.creeps[this.creepsToIdentify.pop()];
            this.identifiedCreeps[creep.id] = creep.name;
        }
    };

    Game.update = function() {
        this.identifyCreeps();
    }

}