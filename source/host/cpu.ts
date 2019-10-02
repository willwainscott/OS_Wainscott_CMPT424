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
                    public IR: String = "",
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

            //Update the GUI


            // Run the next code

            switch (_CurrentPCB.IR) {
                case "A9": this.loadAccConstant();          break;
                case "AD": this.loadAccMemory();            break;
                case "8D": this.storeAcc();                 break;
                case "6D": this.addWithCarry();             break;
                case "A2": this.loadXregFromConstant();     break;
                case "AE": this.loadXregFromMemory();       break;
                case "A0": this.loadYregFromConstant();     break;
                case "AC": this.loadYregFromMemory();       break;
                case "EA":                                  break;
                case "00": this.breakProcess();             break;
                case "EC": this.compareMemToXreg();         break;
                case "D0": this.branchBytes();              break;
                case "EE": this.incrementByte();            break;
                case "FF": this.systemCall();               break;
                default:
                    // There was an invalid op code
                    console.log("Invalid Op Code");
                    // probably write some sort of notice to the user that something is broken
            }

            // Increment the PC
            _CurrentPCB.PC++;

            //Update the GUI again

        }

        public updateCPUWithPCB() {
            this.PC = _CurrentPCB.PC;
            this.IR = _CurrentPCB.IR;
            this.ACC = _CurrentPCB.ACC;
            this.Xreg = _CurrentPCB.Xreg;
            this.Yreg = _CurrentPCB.Yreg;
            this.Zflag = _CurrentPCB.Zflag;
        }

        //Op code functionality

        public loadAccConstant() {
            this.PC++;
            this.ACC = _MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC);
        }

        public loadAccMemory() {

        }

        public storeAcc() {

        }

        public addWithCarry(){

        }

        public loadXregFromConstant() {

        }

        public loadXregFromMemory() {

        }

        public loadYregFromConstant() {

        }

        public loadYregFromMemory() {


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
