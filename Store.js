module.exports = function() {
    let p = Store.prototype;

    Object.defineProperty(p, "isEmpty", {
        get: function() {
            return this.getUsedCapacity(RESOURCE_ENERGY) == 0
        },
        configurable: true
    });
    Object.defineProperty(p, "isFull", {
        get: function() {
            return this.getFreeCapacity(RESOURCE_ENERGY) == 0
        },
        configurable: true
    });
}