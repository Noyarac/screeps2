import {ROLE_ENCODE, ROLE_DECODE } from "./constants";
module.exports = function() {
    let p = Creep.prototype;
    Object.defineProperty(p, 'role', {
        get: function() {
            if (!this._role) {
                this._role = this.memory.role;
            }
            return ROLE_DECODE[this._role];
        },
        set: function(value) {
            this.memory.role = ROLE_ENCODE[value];
            this._role = value;
        },
        enumerable: true,
        configurable: true
       });

}