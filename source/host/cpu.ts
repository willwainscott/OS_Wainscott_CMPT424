/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public IR: string = "",
                    public ACC: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.IR = "";
            this.ACC = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            //Change the PCB to state Running
            _CurrentPCB.state = "Running";
            // Change the current running OP code
            _CurrentPCB.IR = _MemoryAccessor.readMemoryToHex(_CurrentPCB.section, _CurrentPCB.PC);

            // Get the currentPCB and assign its values to corresponding cpu values
            this.updateCPUWithPCB();

            // W TODO: Update the GUI


            // Run the next code

            switch (_CurrentPCB.IR) {
                case "A9": this.loadAccConstant();          break;  //load accumulator with a constant
                case "AD": this.loadAccMemory();            break;  //load accumulator from memory
                case "8D": this.storeAcc();                 break;  //store accumulator in memory
                case "6D": this.addWithCarry();             break;  //add contents of memory to accumulator and store in accumulator
                case "A2": this.loadXregFromConstant();     break;  //load Xreg with a constant
                case "AE": this.loadXregFromMemory();       break;  //load Xreg from memory
                case "A0": this.loadYregFromConstant();     break;  //load Yreg with a constant
                case "AC": this.loadYregFromMemory();       break;  //load Yreg from memory
                case "EA":                                  break;  //no operation (we increment PC after the switch statement, so we don't get stuck here)
                case "00": this.breakProcess();             break;  //break
                case "EC": this.compareMemToXreg();         break;  //compare byte in memory to Xreg, set Zflag to zero if equal
                case "D0": this.branchBytes();              break;  //branch a given amount of bytes if Zflag is zero
                case "EE": this.incrementByte();            break;  //increment the value of a byte
                case "FF": this.systemCall();               break;  //system call (used for printing stuff)
                default:
                    // There was an invalid op code
                    console.log("Invalid Op Code");
                    // probably write some sort of notice to the user that something is broken
            }

            // Increment the PC so we know to go on the next command the next cpu cycle for this process
            this.PC++;

            // Copy the CPU to the CurrentPCB
            this.updatePCBWithCPU();

            //W TODO: Update the GUI again

        }

        public updateCPUWithPCB() {
            this.PC = _CurrentPCB.PC;
            this.IR = _CurrentPCB.IR;
            this.ACC = _CurrentPCB.ACC;
            this.Xreg = _CurrentPCB.Xreg;
            this.Yreg = _CurrentPCB.Yreg;
            this.Zflag = _CurrentPCB.Zflag;
        }

        public updatePCBWithCPU() {
            _CurrentPCB.PC = this.PC;
            _CurrentPCB.IR = this.IR;
            _CurrentPCB.ACC = this.ACC;
            _CurrentPCB.Xreg = this.Xreg;
            _CurrentPCB.Yreg = this.Yreg;
            _CurrentPCB.Zflag = this.Zflag;

        }

        //Op code functionality

        public loadAccConstant() {
            this.PC++;
            // Load accumulator with the decimal equivalent of a hex byte
            this.ACC = _MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 1);
        }

        public loadAccMemory() {
            this.PC++;
            // loads accumulator with a value that is stored in memory, with the two byte hex memory given by the next two bytes
            this.ACC = _Memory[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)];
            // We increment again because we are reading two bytes for the memory address
            this.PC++;
        }

        public storeAcc() {
            this.PC++;
            // stores the accumulator in a specific memory index, given by the next two bytes
            _Memory[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)] = this.ACC;
            // We increment again because we are reading two bytes for the memory address
            this.PC++;
        }

        public addWithCarry(){
            this.PC++;
            // We are adding a value stored at a certain place in the memory to the accumulator's value, and storing the result in the accumulator
            this.ACC += _Memory[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)];
            // Increment again because we are reading two bytes for the memory address
            this.PC++;
        }

        public loadXregFromConstant() {
            this.PC++;
            // Load accumulator with the decimal equivalent of a hex byte
            this.Xreg = _MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 1);
        }

        public loadXregFromMemory() {
            this.PC++;
            // loads accumulator with a value that is stored in memory, with the two byte hex memory given by the next two bytes
            this.Xreg = _Memory[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)];
            // We increment again because we are reading two bytes for the memory address
            this.PC++;
        }

        public loadYregFromConstant() {
            this.PC++;
            // Load accumulator with the decimal equivalent of a hex byte
            this.Yreg = _MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 1);
        }

        public loadYregFromMemory() {
            this.PC++;
            // loads accumulator with a value that is stored in memory, with the two byte hex memory given by the next two bytes
            this.Yreg = _Memory[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)];
            // We increment again because we are reading two bytes for the memory address
            this.PC++;

        }

        public breakProcess() {

        }

        public compareMemToXreg() {

        }

        public branchBytes() {

        }

        public incrementByte() {

        }

        public systemCall() {

        }


    }
}
