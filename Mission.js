const SubMission = require("./SubMission");

class Mission {
    /**
     * 
     * @param {string} roomName 
     * @param {SubMission[]} listOfSubMissions 
     * @param {number} priority 
     * @param {function} triggerFunction 
     */
    constructor(roomName, listOfSubMissions, priority = 2, triggerFunction = (that) => {return true}, creep = undefined, hash = undefined) {
        Object.assign(this, {roomName, listOfSubMissions, priority, triggerFunction, creep, hash})
        this.hash = hash || this.listOfSubMissions.reduce((acc, subMission) => subMission.target.toString() + subMission.actionString + subMission.room ,"").split("").reduce(function(a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
    }
    beClaimed(creep) {
        this.creep = creep.id;
        this.save();
    }
    static encode(mission) {
        return [mission.roomName, mission.listOfSubMissions.map(subMission => SubMission.encode(subMission)), mission.priority, mission.triggerFunction.toString().match(/\{.+?\}/g)[0].trim(), mission.creep, mission.hash];
    }
    static decode([roomName, listOfSubMissions, priority, triggerFunctionBody, creep, hash]) {
        triggerFunctionBody = triggerFunctionBody.match(/\{.+?\}/g)[0].trim();
        const triggerFunction = new Function("that", triggerFunctionBody);
        return new Mission(roomName, listOfSubMissions.map(subMissionEncoded => SubMission.decode(subMissionEncoded)), priority, triggerFunction, creep, hash);
    }
}
let p = Mission.prototype;
Object.defineProperty(p, "shouldTrigger", {
    get: function() {
        return this.triggerFunction(this);
    },
    enumerable: false,
    configurable: true
});

p.save = function() {
    if (this.creep) {
        Game.getObjectById(this.creep).mission = this;
    }
    if (this.roomName) {
        Memory.rooms[this.roomName].missions[this.hash] = Mission.encode(this);
    }
}

p.finishSubMission = function() {
    this.listOfSubMissions.shift();
    this.save();
}
module.exports = Mission;