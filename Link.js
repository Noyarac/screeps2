module.exports = function() {
    let p = StructureLink.prototype;

    Object.defineProperty(p, 'memory', {
        get: function() {
            Memory.links[this.id] = Memory.links[this.id] || new Object;
            return Memory.links[this.id];
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(p, 'role', {
        get: function() {
            return this.memory.role;
        },
        set: function(value) {
            this.memory.role = value;
        },
        enumerable: false,
        configurable: true
    });


}