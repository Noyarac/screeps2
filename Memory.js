module.exports = function() {
    for (const cat of ["sources", "links", "game"]) {
        Memory[cat] = Memory[cat] || new Object;
    }
}