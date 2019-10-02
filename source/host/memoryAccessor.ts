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

        public readMemoryToDecimal(section: string, PC: number) {
            // returns a decimal representation of the next hex pair yet to be run/read
            var hex: string = _Memory.memoryArray[this.sectionToIndex(section) + PC];
            return Utils.hexStringToDecimal(hex);
        }

        public readMemoryToHex(section: string, PC: number) {
            // return the actually hex string of the next hex pair yet to be run/read
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
