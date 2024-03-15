class SubMission{
    /** 
     * @param {string} actionString
     * @param {Source|Structure|Creep|ConstructionSite|RoomPosition|number} target Can be an object, a RoomPosition, an id or a FIND_ constant
     * @param {Object} options Can be resource, room or filterFunction
     */
    constructor(actionString, target, options = {}){
        this.target = target;
        this.actionString = actionString;
        Object.assign(this, options);
        switch (true) {
            case typeof this.target === "string":
                this.type = "id";
                const triedObject = Game.getObjectById(this.target);
                if (!triedObject) {
                    break;
                }
                this.target = triedObject;
            case [Source, Mineral, Structure, Creep, ConstructionSite, Tombstone, Ruin, Resource].some(item => this.target instanceof item):
                this.type = "target";
                this.room = this.target.pos.roomName;
                break;
            case this.target instanceof Array:
                this.target = new RoomPosition(...this.target)
            case this.target instanceof RoomPosition:
                this.type = "roomPosition";
                this.room = this.target.roomName;
                break;
            case typeof this.target == "number":
                this.type = "find";
                break;
        }
    }
    static encode(subMission) {
        return [subMission.actionString, (subMission.type == "target") ? subMission.target.id : (subMission.type == "roomPosition") ? [subMission.target.x, subMission.target.y, subMission.target.roomName] : subMission.target, subMission.room, subMission.resource];
    }
    static decode([actionString, target, room, resource]) {
        return new SubMission(target, actionString, {room: room, resource: resource})
    }
}
// Object.defineProperty(SubMission.prototype, "isStillRelevant", {
//     get: function() {
//         if (!["transfer", "build", "withdraw"].includes(this.actionString) || this.resource != RESOURCE_ENERGY) {
//             return true;
//         }
//         const target = (this.type === "id") ? Game.getObjectById(this.target) : this.target;
//         let energyComingSoon = Game.rooms[this.room].missions
//         .filter(mission => mission.subMissionsList.some(subMission => (subMission[0] === target.id) && (subMission[1] == this.actionString)) && (mission.creep != null))
//         .reduce((total, mission) => {
//             if (Game.creeps[mission.creep]) {
//                 total += Game.creeps[mission.creep].getActiveBodyparts(CARRY) * 50;
//             }
//             return total;
//         }, 0);
//         switch (this.actionString) {
//             case "transfer":
//                 return target.store.getFreeCapacity(RESOURCE_ENERGY) - energyComingSoon > 0;
//             case "build":
//                 return target.progressTotal - target.progress - energyComingSoon > 0;
//             case "withdraw":
//                 return target.store.getUsedCapacity(RESOURCE_ENERGY) - energyComingSoon > 0;
//         }
//         return true;
//     },
//     enumerable: false,
//     configurable: true
// });
Object.defineProperty(SubMission.prototype, "hash", {
    get: function() {
        this._hash = this._hash || (this.target.toString() + this.actionString + this.room).split("").reduce(function(a, b) {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        return this._hash;
    },
    enumerable: false,
    configurable: true
});
module.exports = SubMission