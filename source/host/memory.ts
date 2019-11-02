

module TSOS {

    export class Memory {

        public memoryArray: string[] = new Array(768);

        private sectionOneBase     = 0;
        private sectionOneLimit    = 255;
        private sectionTwoBase     = 256;
        private sectionTwoLimit    = 511;
        private sectionThreeBase   = 512;
        private sectionThreeLimit  = 767;

        constructor(){
        }

        public init(): void {
            // initialize the memory as all "00"
            for (var i = 0; i < this.memoryArray.length; i++) {
                this.memoryArray[i] = "00";
            }
        }

        public getBaseBySection(section: string) {
            switch (section) {
                case "1":
                    return this.sectionOneBase;
                    break;
                case "2":
                    return this.sectionTwoBase;
                    break;
                case "3":
                    return this.sectionThreeBase;
                    break;
                case "all":
                    return this.sectionOneBase;
                    break;
                default:
                    console.log("Invalid section number when calling Memory.getBaseBySection()");
            }
        }

        public getLimitBySection(section: string) {
            switch (section) {
                case "1":
                    return this.sectionOneLimit;
                    break;
                case "2":
                    return this.sectionTwoLimit;
                    break;
                case "3":
                    return this.sectionThreeLimit;
                    break;
                case "all":
                    return this.sectionThreeLimit;
                    break;
                default:
                    console.log("Invalid section number when calling Memory.getLimitBySection()");
            }
        }



    }
}
