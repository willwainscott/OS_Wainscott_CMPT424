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
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, IR, ACC, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = ""; }
            if (ACC === void 0) { ACC = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.IR = IR;
            this.ACC = ACC;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.IR = "";
            this.ACC = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
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
                case "A9":
                    this.loadAccConstant();
                    break;
                case "AD":
                    this.loadAccMemory();
                    break;
                case "8D":
                    this.storeAcc();
                    break;
                case "6D":
                    this.addWithCarry();
                    break;
                case "A2":
                    this.loadXregFromConstant();
                    break;
                case "AE":
                    this.loadXregFromMemory();
                    break;
                case "A0":
                    this.loadYregFromConstant();
                    break;
                case "AC":
                    this.loadYregFromMemory();
                    break;
                case "EA": break;
                case "00":
                    this.breakProcess();
                    break;
                case "EC":
                    this.compareMemToXreg();
                    break;
                case "D0":
                    this.branchBytes();
                    break;
                case "EE":
                    this.incrementByte();
                    break;
                case "FF":
                    this.systemCall();
                    break;
                default:
                    // There was an invalid op code
                    console.log("Invalid Op Code");
                // probably write some sort of notice to the user that something is broken
            }
            // Increment the PC
            _CurrentPCB.PC++;
            //Update the GUI again
        };
        Cpu.prototype.updateCPUWithPCB = function () {
            this.PC = _CurrentPCB.PC;
            this.IR = _CurrentPCB.IR;
            this.ACC = _CurrentPCB.ACC;
            this.Xreg = _CurrentPCB.Xreg;
            this.Yreg = _CurrentPCB.Yreg;
            this.Zflag = _CurrentPCB.Zflag;
        };
        //Op code functionality
        Cpu.prototype.loadAccConstant = function () {
            this.PC++;
            this.ACC = _MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC);
        };
        Cpu.prototype.loadAccMemory = function () {
        };
        Cpu.prototype.storeAcc = function () {
        };
        Cpu.prototype.addWithCarry = function () {
        };
        Cpu.prototype.loadXregFromConstant = function () {
        };
        Cpu.prototype.loadXregFromMemory = function () {
        };
        Cpu.prototype.loadYregFromConstant = function () {
        };
        Cpu.prototype.loadYregFromMemory = function () {
        };
        Cpu.prototype.breakProcess = function () {
        };
        Cpu.prototype.compareMemToXreg = function () {
        };
        Cpu.prototype.branchBytes = function () {
        };
        Cpu.prototype.incrementByte = function () {
        };
        Cpu.prototype.systemCall = function () {
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
