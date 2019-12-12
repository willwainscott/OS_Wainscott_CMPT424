/* -----------------------

    Checks to see if there is available space of the user code to be entered into memory,
    also frees up space in the memory after the program is completed
    Used to load codes into other memory

   ------------------------ */

module TSOS {

    export class MemoryManager {

        constructor() {}

        public clearMemory(section: string) {
            // resets the memory within a given section to all "00"
            var firstIndex = _Memory.getBaseBySection(section);
            var lastIndex = _Memory.getLimitBySection(section);

            for (var i = firstIndex; i <= lastIndex; i++) {
                _Memory.memoryArray[i] = "00";
            }
            Control.updateAllTables();
        }

        public loadMemory(userInputArray,section,PID) {  //Start index may change to the start of the section of the memory
            // make array of the entered commands
            if (!(section == "disk")) {
                // load them into memory
                for (var i = 0; i < userInputArray.length; i++){
                    _Memory.memoryArray[i + _Memory.getBaseBySection(section)] = userInputArray[i];
                }
            } else {
                _krnDiskDriver.createSwapFile(PID,userInputArray);
            }
        }

        public memoryAvailabilityCheck() {
            return (_PCBList.length < 3);
        }

        // checks to see if there are any processes on the disk
        public processOnDisk() {
        }

        public assignMemorySection() {
            // This is where we would check to see if there is something in memory in specific sections
            var sectionOneOpen = true;
            var sectionTwoOpen = true;
            var sectionThreeOpen = true;

            // Loop through each resident PCB looking for a section to load it into
            for (var PCB of _PCBList) {
                switch (PCB.section) {
                    case "1": sectionOneOpen   =  false; break;
                    case "2": sectionTwoOpen   =  false; break;
                    case "3": sectionThreeOpen =  false; break;
                    case "disk":                         break;
                    default: console.log("Invalid section when trying to check available memory sections")
                }
            }
            // return a section based on the ones available
            if (sectionOneOpen) {
                return "1";
            } else if (sectionTwoOpen) {
                return "2";
            } else if (sectionThreeOpen) {
                return "3";
            } else {
                console.log("Something broke when trying to assign memory section");
            }
        }

        public getPCBByPID(givenPID: number) {
            for (var PCB of _PCBList) {
                if (PCB.PID == givenPID){
                    return PCB;
                }
            }
        }

        public PCBisResident(givenPID: number) {
            for (var PCB of _PCBList) {
                if (PCB.PID == givenPID){
                    return true;
                }
            }
        }

        public PCBisReady(givenPID: number) {
            for (var PCB of _ReadyPCBList) {
                if (PCB.PID == givenPID){
                    return true;
                }
            }
        }

        public getIndexByPID(list: TSOS.PCB[], givenPID: number) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].PID == givenPID) {
                    return i;
                }
            }

        }

        public rollInProcess(PID: number) {
            var rollInDataArray: string[] = [];
            var PCB = this.getPCBByPID(PID);
            if (this.memoryAvailabilityCheck()) {
                // get the data
                rollInDataArray = _krnDiskDriver.getRollInData(PID);
                // change the section
                PCB.section = this.assignMemorySection();
                // change the location
                PCB.location = "Memory";
                this.loadMemory(rollInDataArray, PCB.section , PID);
            } else {
                this.rollOutProcess();
                // get the data
                rollInDataArray = _krnDiskDriver.getRollInData(PID);
                // change the section
                PCB.section = this.assignMemorySection();
                // change the location
                PCB.location = "Memory";
                this.loadMemory(rollInDataArray, PCB.section, PID);
            }
        }

        public rollOutProcess() {
            // decide which one gets rolled out
            var rollOutPCB: TSOS.PCB = _Scheduler.rollOutPCBDecision();
            _PCBList[this.getIndexByPID(_PCBList,rollOutPCB.PID)].timesSwapped++;

            // write the data from memory to the disk
            var rollOutDataArray: string[] = [];
            for (var i = _Memory.getBaseBySection(rollOutPCB.section); i < _Memory.getLimitBySection(rollOutPCB.section); i++){
                rollOutDataArray[rollOutDataArray.length] = _Memory.memoryArray[i];
            }
            _krnDiskDriver.createSwapFile(rollOutPCB.PID,rollOutDataArray);

            // clear the memory where the last process was
            this.clearMemory(rollOutPCB.section);

            //change the location and section of the rolled out process
            _PCBList[this.getIndexByPID(_PCBList,rollOutPCB.PID)].location = "Disk";
            _PCBList[this.getIndexByPID(_PCBList,rollOutPCB.PID)].section = "disk";
        }


    }


}