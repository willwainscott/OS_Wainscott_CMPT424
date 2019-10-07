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
            // Get the currentPCB and assign its values to corresponding cpu values
            this.updateCPUWithPCB();
            // Update the GUI
            TSOS.Control.processTableUpdate();
            TSOS.Control.CPUTableUpdate();
            // Run the next code
            switch (_CurrentPCB.IR) {
                case "A9":
                    this.loadAccConstant();
                    break; //load accumulator with a constant
                case "AD":
                    this.loadAccMemory();
                    break; //load accumulator from memory
                case "8D":
                    this.storeAcc();
                    break; //store accumulator in memory
                case "6D":
                    this.addWithCarry();
                    break; //add contents of memory to accumulator and store in accumulator
                case "A2":
                    this.loadXregFromConstant();
                    break; //load Xreg with a constant
                case "AE":
                    this.loadXregFromMemory();
                    break; //load Xreg from memory
                case "A0":
                    this.loadYregFromConstant();
                    break; //load Yreg with a constant
                case "AC":
                    this.loadYregFromMemory();
                    break; //load Yreg from memory
                case "EA": break; //no operation (we increment PC after the switch statement, so we don't get stuck here)
                case "00":
                    this.breakProcess();
                    break; //break
                case "EC":
                    this.compareMemToXreg();
                    break; //compare byte in memory to Xreg, set Zflag to one if equal
                case "D0":
                    this.branchBytes();
                    break; //branch a given amount of bytes if Zflag is zero
                case "EE":
                    this.incrementByte();
                    break; //increment the value of a byte
                case "FF":
                    this.systemCall();
                    break; //system call (used for printing stuff)
                default:
                    // There was an invalid op code
                    console.log("Invalid Op Code");
                // probably write some sort of notice to the user that something is broken
            }
            // Increment the PC so we know to go on the next command the next cpu cycle for this process
            this.PC++;
            // Update the IR
            this.IR = _MemoryAccessor.readMemoryToHex(_CurrentPCB.section, this.PC);
            // Copy the CPU to the CurrentPCB
            this.updatePCBWithCPU();
            // Copy Current PCB to the _PCBList
            this.updatePCBList();
            // Update the GUI again
            TSOS.Control.updateAllTables();
        };
        Cpu.prototype.updateCPUWithPCB = function () {
            this.PC = _CurrentPCB.PC;
            this.IR = _CurrentPCB.IR;
            this.ACC = _CurrentPCB.ACC;
            this.Xreg = _CurrentPCB.Xreg;
            this.Yreg = _CurrentPCB.Yreg;
            this.Zflag = _CurrentPCB.Zflag;
        };
        Cpu.prototype.updatePCBWithCPU = function () {
            _CurrentPCB.PC = this.PC;
            _CurrentPCB.IR = this.IR;
            _CurrentPCB.ACC = this.ACC;
            _CurrentPCB.Xreg = this.Xreg;
            _CurrentPCB.Yreg = this.Yreg;
            _CurrentPCB.Zflag = this.Zflag;
        };
        Cpu.prototype.updatePCBList = function () {
            _PCBList[_CurrentPCB.PID] = _CurrentPCB;
        };
        //Op code functionality
        Cpu.prototype.loadAccConstant = function () {
            this.PC++;
            // Load accumulator with the decimal equivalent of a hex byte
            this.ACC = _MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 1);
        };
        Cpu.prototype.loadAccMemory = function () {
            this.PC++;
            // loads accumulator with a value that is stored in memory, with the two byte hex memory given by the next two bytes
            this.ACC = TSOS.Utils.hexStringToDecimal(_Memory.memoryArray[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)]);
            // We increment again because we are reading two bytes for the memory address
            this.PC++;
        };
        Cpu.prototype.storeAcc = function () {
            this.PC++;
            // stores the accumulator in a specific memory index, given by the next two bytes
            _Memory.memoryArray[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)] = TSOS.Utils.decimalToHexString(this.ACC);
            // We increment again because we are reading two bytes for the memory address
            this.PC++;
        };
        Cpu.prototype.addWithCarry = function () {
            this.PC++;
            // We are adding a value stored at a certain place in the memory to the accumulator's value, and storing the result in the accumulator
            this.ACC += TSOS.Utils.hexStringToDecimal(_Memory.memoryArray[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)]);
            // Increment again because we are reading two bytes for the memory address
            this.PC++;
        };
        Cpu.prototype.loadXregFromConstant = function () {
            this.PC++;
            // Load accumulator with the decimal equivalent of a hex byte
            this.Xreg = _MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 1);
        };
        Cpu.prototype.loadXregFromMemory = function () {
            this.PC++;
            // loads accumulator with a value that is stored in memory, with the two byte hex memory given by the next two bytes
            this.Xreg = TSOS.Utils.hexStringToDecimal(_Memory.memoryArray[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)]);
            // We increment again because we are reading two bytes for the memory address
            this.PC++;
        };
        Cpu.prototype.loadYregFromConstant = function () {
            this.PC++;
            // Load accumulator with the decimal equivalent of a hex byte
            this.Yreg = _MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 1);
        };
        Cpu.prototype.loadYregFromMemory = function () {
            this.PC++;
            // loads accumulator with a value that is stored in memory, with the two byte hex memory given by the next two bytes
            this.Yreg = TSOS.Utils.hexStringToDecimal(_Memory.memoryArray[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)]);
            // We increment again because we are reading two bytes for the memory address
            this.PC++;
        };
        Cpu.prototype.breakProcess = function () {
            // stops the program from running
            _CPU.isExecuting = false;
            _CurrentPCB.state = "Complete";
            // I don't know if  I shouldn't be doing this OS stuff in the cpu. May need to change for better host/OS separation
            _StdOut.advanceLine();
            _StdOut.putText("Process " + _CurrentPCB.PID + " Complete!");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };
        Cpu.prototype.compareMemToXreg = function () {
            this.PC++;
            var byteInMemory = TSOS.Utils.hexStringToDecimal(_Memory.memoryArray[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)]);
            if (byteInMemory == this.Xreg) {
                this.Zflag = 1;
            }
            else {
                this.Zflag = 0;
            }
            this.PC++;
        };
        Cpu.prototype.branchBytes = function () {
            this.PC++;
            // If the Zflag is zero jump a number of bytes forward, if its more than the section of memory, start back at the beginning again
            if (this.Zflag == 0) {
                var bytes = _MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 1);
                if (bytes + this.PC > 256) {
                    this.PC = (this.PC + bytes) % 256;
                }
                else {
                    this.PC += bytes;
                }
            }
        };
        Cpu.prototype.incrementByte = function () {
            this.PC++;
            // increment the value of a byte in memory
            _Memory.memoryArray[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)] =
                TSOS.Utils.incrementHexString(_Memory.memoryArray[_MemoryAccessor.readMemoryToDecimal(_CurrentPCB.section, this.PC, 2)]);
            this.PC++;
        };
        Cpu.prototype.systemCall = function () {
            // does something specific based on the Xreg
            var params = [];
            if (this.Xreg == 1) {
                // Print out the integer stored in the Yreg
                console.log('System call print Yreg');
                params[0] = this.Yreg.toString();
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, params));
            }
            else if (this.Xreg == 2) {
                console.log("System call print string");
                // Print out the 00 terminated string stored at the address in the Y register
                // This means the letters associated with the code in memory
                var location = this.Yreg;
                var output = "";
                var byteString;
                for (var i = 0; i + location < _Memory.memoryArray.length; i++) {
                    byteString = _Memory.memoryArray[location + i];
                    if (byteString == "00") {
                        break;
                    }
                    else {
                        output += String.fromCharCode(TSOS.Utils.hexStringToDecimal(byteString));
                    }
                }
                params[0] = output;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, params));
            }
            else {
                console.log("System call with Xreg != 1 or 2");
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
