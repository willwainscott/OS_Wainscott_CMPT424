

module TSOS {

    export class Memory {

        public memoryArray: string[] = new Array(256);

        constructor(){
        }

        public init(): void {
            // initialize the memory as all "00"
            for (var i = 0; i < this.memoryArray.length; i++) {
                this.memoryArray[i] = "00";
            }
        }





    }
}
