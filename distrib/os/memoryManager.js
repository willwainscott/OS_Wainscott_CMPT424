/* -----------------------

    Checks to see if there is available space of the user code to be entered into memory,
    also frees up space in the memory after the program is completed
    Used to load codes into other memory

   ------------------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.clearMemory = function (firstIndex, lastIndex) {
            // resets the memory within a given section to all "00"
            for (var i = firstIndex; i <= lastIndex; i++) {
                _Memory.memoryArray[i] = "00";
            }
        };
        MemoryManager.prototype.loadMemory = function (userInput, section) {
            // make array of the entered commands
            var userInputArray = userInput.split(" ");
            // load them into memory
            for (var i = _MemoryAccessor.sectionToIndex(section); i < userInputArray.length; i++) {
                _Memory.memoryArray[i] = userInputArray[i];
            }
        };
        MemoryManager.prototype.assignMemorySection = function () {
            var section = "";
            // This is where we would check to see if there is something in memory in specfic sections
            // Probably by checking the list of active PCBs for ones with the section strings of 1,2,3, and disk
            // But thats a problem for iP3
            var section = "1";
            return section;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
