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
        MemoryManager.prototype.clearMemory = function (section) {
            // resets the memory within a given section to all "00"
            var firstIndex = _Memory.getBaseBySection(section);
            var lastIndex = _Memory.getLimitBySection(section);
            for (var i = firstIndex; i <= lastIndex; i++) {
                _Memory.memoryArray[i] = "00";
            }
        };
        MemoryManager.prototype.loadMemory = function (userInput, section) {
            // make array of the entered commands
            var userInputArray = userInput.split(" ");
            // load them into memory
            for (var i = 0; i < userInputArray.length; i++) {
                _Memory.memoryArray[i + _Memory.getBaseBySection(section)] = userInputArray[i];
            }
        };
        MemoryManager.prototype.memoryAvailabilityCheck = function () {
            return (_PCBList.length < 3);
        };
        MemoryManager.prototype.assignMemorySection = function () {
            // This is where we would check to see if there is something in memory in specific sections
            var sectionOneOpen = true;
            var sectionTwoOpen = true;
            var sectionThreeOpen = true;
            // Loop through each resident PCB looking for a section to load it into
            for (var _i = 0, _PCBList_1 = _PCBList; _i < _PCBList_1.length; _i++) {
                var PCB = _PCBList_1[_i];
                switch (PCB.section) {
                    case "1":
                        sectionOneOpen = false;
                        break;
                    case "2":
                        sectionTwoOpen = false;
                        break;
                    case "3":
                        sectionThreeOpen = false;
                        break;
                    default: console.log("Invalid section when trying to check available memory sections");
                }
            }
            // return a section based on the ones available
            if (sectionOneOpen) {
                return "1";
            }
            else if (sectionTwoOpen) {
                return "2";
            }
            else if (sectionThreeOpen) {
                return "3";
            }
            else {
                console.log("Something broke when trying to assign memory section");
            }
        };
        MemoryManager.prototype.getPCBByPID = function (givenPID) {
            for (var _i = 0, _PCBList_2 = _PCBList; _i < _PCBList_2.length; _i++) {
                var PCB = _PCBList_2[_i];
                if (PCB.PID == givenPID) {
                    return PCB;
                }
            }
        };
        MemoryManager.prototype.PCBisResident = function (givenPID) {
            for (var _i = 0, _PCBList_3 = _PCBList; _i < _PCBList_3.length; _i++) {
                var PCB = _PCBList_3[_i];
                if (PCB.PID == givenPID) {
                    return true;
                }
            }
        };
        MemoryManager.prototype.getIndexByPID = function (list, givenPID) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].PID == givenPID) {
                    return i;
                }
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
