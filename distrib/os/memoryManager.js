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
            TSOS.Control.updateAllTables();
        };
        MemoryManager.prototype.loadMemory = function (userInputArray, section, PID) {
            // make array of the entered commands
            if (!(section == "disk")) {
                // load them into memory
                for (var i = 0; i < userInputArray.length; i++) {
                    _Memory.memoryArray[i + _Memory.getBaseBySection(section)] = userInputArray[i];
                }
            }
            else {
                _krnDiskDriver.createSwapFile(PID, userInputArray);
            }
            TSOS.Control.updateAllTables();
        };
        MemoryManager.prototype.memoryAvailabilityCheck = function () {
            return (_PCBList.length < 3);
        };
        // checks to see if there are any processes on the disk
        MemoryManager.prototype.processOnDisk = function () {
            for (var i = 0; i < _PCBList.length; i++) {
                if (_PCBList[i].location == "Disk") {
                    return true;
                }
            }
            return false;
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
                    case "disk": break;
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
        MemoryManager.prototype.PCBisReady = function (givenPID) {
            for (var _i = 0, _ReadyPCBList_1 = _ReadyPCBList; _i < _ReadyPCBList_1.length; _i++) {
                var PCB = _ReadyPCBList_1[_i];
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
        MemoryManager.prototype.rollInProcess = function (PID) {
            var rollInDataArray = [];
            var PCB = this.getPCBByPID(PID);
            var memoryPCBs = [];
            for (var i = 0; i < _PCBList.length; i++) {
                if (_PCBList[i].location == "Memory") {
                    memoryPCBs[memoryPCBs.length] = _PCBList[i];
                }
            }
            if (memoryPCBs.length < 3) {
                // get the data
                rollInDataArray = _krnDiskDriver.getRollInData(PID);
                // change the section
                PCB.section = this.assignMemorySection();
                // change the location
                PCB.location = "Memory";
                this.loadMemory(rollInDataArray, PCB.section, PID);
            }
            else {
                this.rollOutProcess();
                // get the data
                rollInDataArray = _krnDiskDriver.getRollInData(PID);
                // change the section
                PCB.section = this.assignMemorySection();
                // change the location
                PCB.location = "Memory";
                this.loadMemory(rollInDataArray, PCB.section, PID);
            }
        };
        MemoryManager.prototype.rollOutProcess = function () {
            // decide which one gets rolled out
            var rollOutPCB = _Scheduler.rollOutPCBDecision();
            _PCBList[this.getIndexByPID(_PCBList, rollOutPCB.PID)].timesSwapped++;
            // write the data from memory to the disk
            var rollOutDataArray = [];
            for (var i = _Memory.getBaseBySection(rollOutPCB.section); i < _Memory.getLimitBySection(rollOutPCB.section); i++) {
                rollOutDataArray[rollOutDataArray.length] = _Memory.memoryArray[i];
            }
            _krnDiskDriver.createSwapFile(rollOutPCB.PID, rollOutDataArray);
            // clear the memory where the last process was
            this.clearMemory(rollOutPCB.section);
            //change the location and section of the rolled out process
            _PCBList[this.getIndexByPID(_PCBList, rollOutPCB.PID)].location = "Disk";
            _PCBList[this.getIndexByPID(_PCBList, rollOutPCB.PID)].section = "disk";
        };
        // loads a process on the disk of there is free space in memory
        MemoryManager.prototype.loadDiskProcess = function () {
            if (this.processOnDisk()) {
                var PCB;
                for (var i = 0; i < _PCBList.length; i++) {
                    if (_PCBList[i].location == "Disk") {
                        PCB = _PCBList[i];
                    }
                }
                this.rollInProcess(PCB.PID);
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
