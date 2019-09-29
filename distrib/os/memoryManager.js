/* -----------------------

    Checks to see if there is available space of the user code to be entered into memory,
    also frees up space in the memory after the program is completed
    Used to load codes int other memory

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
        MemoryManager.prototype.loadMemory = function (userInput, startIndex) {
            // make array of the entered commands
            var userInputArray = userInput.split(" ");
            // load them into memory
            for (var i = startIndex; i < userInputArray.length; i++) {
                _Memory.memoryArray[i] = userInputArray[i];
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
