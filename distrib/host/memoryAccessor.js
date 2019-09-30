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
