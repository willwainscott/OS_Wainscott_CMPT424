/* --------------------------

    Takes the hex code and returns the correct index in the memory.



 -------------------*/
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.hexToMemoryIndex = function (hex) {
            var memIndex;
            var memIndex = parseInt(hex, 16);
            return memIndex;
            // This will be much more useful when there is more than one section in memory
            // For now it looks pretty simple
        };
        MemoryAccessor.prototype.readOneMemoryByteToDecimal = function (section, PC) {
            // returns a decimal representation of the next hex pair yet to be run/read
            var hex = "";
            // Reads the next byte in memory
            hex = _Memory.memoryArray[_Memory.getBaseBySection(section) + PC];
            return TSOS.Utils.hexStringToDecimal(hex);
        };
        MemoryAccessor.prototype.readTwoMemoryBytesToDecimal = function (section, PC) {
            // returns a decimal representation of two hex bytes
            var hex = "";
            // we read the two bytes by reading the second code first
            hex = _Memory.memoryArray[_Memory.getBaseBySection(section) + PC + 1];
            hex += _Memory.memoryArray[_Memory.getBaseBySection(section) + PC];
            var index = TSOS.Utils.hexStringToDecimal(hex);
            if (index > _Memory.getLimitBySection(section)) {
                console.log("Memory out of bounds error");
                throw (Error);
            }
            else {
                return TSOS.Utils.hexStringToDecimal(hex);
            }
        };
        MemoryAccessor.prototype.readMemoryToHex = function (section, PC) {
            // return the actual hex string of the next hex pair yet to be run/read
            var hex = _Memory.memoryArray[_Memory.getBaseBySection(section) + PC];
            return hex;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
