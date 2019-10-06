/* --------------------------

    Takes the hex code and returns the correct index in the memory.



 -------------------*/


module TSOS {

    export class MemoryAccessor {

        constructor() {}

        public hexToMemoryIndex(hex: string) {

            var memIndex: number;

            var memIndex = parseInt(hex, 16);

            return memIndex;

            // This will be much more useful when there is more than one section in memory
            // For now it looks pretty simple


        }

        // We give this the section of the memory that the program is stored in, the process PC, and the amount of bytes we want to read
        // It is probably better to make two different functions that read either one or two bytes, will probably change later
        public readMemoryToDecimal(section: string, PC: number, bytes: number) {
            // returns a decimal representation of the next hex pair yet to be run/read
            var hex: string = "";
            // we are reading two bytes (used to find places in memory entered as two bytes)
            if (bytes == 2) {
                // we read the second code first, because they get flipped around
                hex = _Memory.memoryArray[this.sectionToIndex(section) + PC + 1];
                hex += _Memory.memoryArray[this.sectionToIndex(section) + PC];
            } else {
                hex = _Memory.memoryArray[this.sectionToIndex(section) + PC];
            }
            // We really only will be reading two or one bytes with our op codes, but we could expand this to include more
            // Also there is no user interaction with this so there is really no chance that there could be another value
            // for bytes, unless we wanted changed the cpu so this will work for what we want to do

            //console.log(hex);

            return Utils.hexStringToDecimal(hex);
        }


        public readMemoryToHex(section: string, PC: number) {
            // return the actual hex string of the next hex pair yet to be run/read
            var hex: string = _Memory.memoryArray[this.sectionToIndex(section) + PC];
            return hex;
        }

        public sectionToIndex(section) {
            var i: number;
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

        }

    }

}
