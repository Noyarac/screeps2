import {ROLE, ROLE_READER } from "./constants";
module.exports = function() {
    let p = Creep.prototype;
    Object.defineProperty(p, 'role', {
        get: function() {
            if (!this._role) {
                this._role = this.memory.role;
            }
            return ROLE_READER[this._role];
        },
        set: function(value) {
            this.memory.role = ROLE[value];
            this._role = value;
        },
        enumerable: true,
        configurable: true
       });

}