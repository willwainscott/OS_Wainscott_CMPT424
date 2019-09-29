/* -----------------------

    Checks to see if there is available space of the user code to be entered into memory,
    also frees up space in the memory after the program is completed
    Used to load codes int other memory

   ------------------------ */

module TSOS {

    export class MemoryManager {

        constructor() {}

        public clearMemory(firstIndex: number, lastIndex: number) {
            // resets the memory within a given section to all "00"
            for (var i = firstIndex; i <= lastIndex; i++) {
                _Memory.memoryArray[i] = "00";
            }
        }

        public loadMemory(userInput, startIndex) {  //Start index may change to the start of the section of the memory
            // make array of the entered commands
            var userInputArray = userInput.split(" ");
            // load them into memory
            for (var i = startIndex; i < userInputArray.length; i++){
                _Memory.memoryArray[i] = userInputArray[i];
            }
        }

    }


}