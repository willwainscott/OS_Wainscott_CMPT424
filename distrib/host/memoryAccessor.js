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
        // We give this the section of the memory that the program is stored in, the process PC, and the amount of bytes we want to read
        // It is probably better to make two different functions that read either one or two bytes, will probably change later
        MemoryAccessor.prototype.readMemoryToDecimal = function (section, PC, bytes) {
            // returns a decimal representation of the next hex pair yet to be run/read
            var hex = "";
            // we are reading two bytes (used to find places in memory entered as two bytes)
            if (bytes == 2) {
                // we read the second code first, because they get flipped around
                hex = _Memory.memoryArray[this.sectionToIndex(section) + PC + 1];
                hex += _Memory.memoryArray[this.sectionToIndex(section) + PC];
            }
            else {
                hex = _Memory.memoryArray[this.sectionToIndex(section) + PC];
            }
            // We really only will be reading two or one bytes with our op codes, but we could expand this to include more
            // Also there is no user interaction with this so there is really no chance that there could be another value
            // for bytes, unless we wanted changed the cpu so this will work for what we want to do
            return TSOS.Utils.hexStringToDecimal(hex);
        };
        MemoryAccessor.prototype.readMemoryToHex = function (section, PC) {
            // return the actual hex string of the next hex pair yet to be run/read
            var hex = _Memory.memoryArray[this.sectionToIndex(section) + PC];
            return hex;
        };
        MemoryAccessor.prototype.sectionToIndex = function (section) {
            var i;
            switch (section) {
                case "1":
                    i = 0;
                    break;
                case "2":
                    i = 256;
                    break;
                case "3":
                    i = 512;
                    break;
                case "disk":
                    // oh boy
                    break;
                default:
                    // IF we get here, something broke
                    console.log("Invalid section. Something broke.");
            }
            return i;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
