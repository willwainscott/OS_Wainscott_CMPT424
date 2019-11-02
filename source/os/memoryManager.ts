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
        }

        public loadMemory(userInput,section) {  //Start index may change to the start of the section of the memory
            // make array of the entered commands
            var userInputArray = userInput.split(" ");
            // load them into memory
            for (var i = _Memory.getBaseBySection(section); i < _Memory.getBaseBySection(section) + userInputArray.length; i++){
                _Memory.memoryArray[i] = userInputArray[i];
            }
        }

        public assignMemorySection() {
            var section = "";

            // This is where we would check to see if there is something in memory in specfic sections
            // Probably by checking the list of active PCBs for ones with the section strings of 1,2,3, and disk
            // But thats a problem for iP3

            var section = "1";



            return section;

        }

        public schedulingDecision() {
            // Make a PCB the current PCB based on what is running or waiting
            // Also account for a process ending and there being no more processes to be run
        }

    }


}