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

        public readOneMemoryByteToDecimal(section: string, PC: number) {
            // returns a decimal representation of the next hex pair yet to be run/read
            var hex: string = "";
            // Reads the next byte in memory
            hex = _Memory.memoryArray[_Memory.getBaseBySection(section) + PC];

            return Utils.hexStringToDecimal(hex);
        }

        public readTwoMemoryBytesToDecimal(section: string, PC:number) {
            // returns a decimal representation of two hex bytes
            var hex: string = "";
            // we read the two bytes by reading the second code first
            hex = _Memory.memoryArray[_Memory.getBaseBySection(section) + PC + 1];
            hex += _Memory.memoryArray[_Memory.getBaseBySection(section) + PC];

            var index = Utils.hexStringToDecimal(hex);
            if (index > _Memory.getLimitBySection(section)) {
                console.log("Memory out of bounds error");
                throw (Error);
            } else {
                return (Utils.hexStringToDecimal(hex) + _Memory.getBaseBySection(section));
            }
        }


        public readMemoryToHex(section: string, PC: number) {
            // return the actual hex string of the next hex pair yet to be run/read
            var hex: string = _Memory.memoryArray[_Memory.getBaseBySection(section) + PC];
            return hex;
        }

        /* This has been replaced by the Base and Limit registers in the Memory class itself
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

        } */

    }

}
