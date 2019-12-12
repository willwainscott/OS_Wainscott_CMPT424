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
            var isCompleted = false;

            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            //Change the PCB to state Running
            _CurrentPCB.state = "Running";

            // Get the currentPCB and assign its values to corresponding cpu values
            this.updateCPUWithPCB();

            // Update the GUI
            Control.processTableUpdate();
            Control.CPUTableUpdate();


            // Run the next code
            try {
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
                    case "00": isCompleted = true;              break;  //break function (the process is completed)
                    case "EC": this.compareMemToXreg();         break;  //compare byte in memory to Xreg, set Zflag to one if equal
                    case "D0": this.branchBytes();              break;  //branch a given amount of bytes if Zflag is zero
                    case "EE": this.incrementByte();            break;  //increment the value of a byte
                    case "FF": this.systemCall();               break;  //system call (used for printing stuff)
                    default:
                        // There was an invalid op code
                        console.log("Invalid Op Code" + _CurrentPCB.IR);
                        var params: string[] = [_CurrentPCB.PID.toString(), 'Running Process Invalid Op Code'];
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROCESS_BREAK_IRQ, params));
                }
            } catch (Error) {
                var params: string[] = [_CurrentPCB.PID.toString(), 'Running Process Memory Access Violation'];
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROCESS_BREAK_IRQ, params));
            }
            // Increment the PC so we know to go on the next command the next cpu cycle for this process
            this.PC++;
            _CurrentPCB.quantaRun++;

            // Update the IR
            this.IR = _MemoryAccessor.readMemoryToHex(_CurrentPCB.section, this.PC);

            // Copy the CPU to the CurrentPCB
            this.updatePCBWithCPU();

            // Update the GUI again
            Control.updateAllTables();

            if (isCompleted) {
                this.breakProcess();
            }

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
            this.ACC = _MemoryAccessor.readOneMemoryByteToDecimal(_CurrentPCB.section, this.PC);
        }

        public loadAccMemory() {
            this.PC++;
            // loads accumulator with a value that is stored in memory, with the two byte hex memory given by the next two bytes
            this.ACC = Utils.hexStringToDecimal(_Memory.memoryArray[_MemoryAccessor.readTwoMemoryBytesToDecimal(_CurrentPCB.section, this.PC)]);
            // We increment again because we are reading two bytes for the memory address
            this.PC++;
        }

        public storeAcc() {
            this.PC++;
            // stores the accumulator in a specific memory index, given by the next two bytes
            _Memory.memoryArray[_MemoryAccessor.readTwoMemoryBytesToDecimal(_CurrentPCB.section, this.PC)] = Utils.decimalToHexString(this.ACC);
            // We increment again because we are reading two bytes for the memory address
            this.PC++;
        }

        public addWithCarry(){
            this.PC++;
            // We are adding a value stored at a certain place in the memory to the accumulator's value, and storing the result in the accumulator
            this.ACC += Utils.hexStringToDecimal(_Memory.memoryArray[_MemoryAccessor.readTwoMemoryBytesToDecimal(_CurrentPCB.section, this.PC)]);
            // Increment again because we are reading two bytes for the memory address
            this.PC++;
        }

        public loadXregFromConstant() {
            this.PC++;
            // Load accumulator with the decimal equivalent of a hex byte
            this.Xreg = _MemoryAccessor.readOneMemoryByteToDecimal(_CurrentPCB.section, this.PC);
        }

        public loadXregFromMemory() {
            this.PC++;
            // loads accumulator with a value that is stored in memory, with the two byte hex memory given by the next two bytes
            this.Xreg = Utils.hexStringToDecimal(_Memory.memoryArray[_MemoryAccessor.readTwoMemoryBytesToDecimal(_CurrentPCB.section, this.PC)]);
            // We increment again because we are reading two bytes for the memory address
            this.PC++;
        }

        public loadYregFromConstant() {
            this.PC++;
            // Load accumulator with the decimal equivalent of a hex byte
            this.Yreg = _MemoryAccessor.readOneMemoryByteToDecimal(_CurrentPCB.section, this.PC);
        }

        public loadYregFromMemory() {
            this.PC++;
            // loads accumulator with a value that is stored in memory, with the two byte hex memory given by the next two bytes
            this.Yreg = Utils.hexStringToDecimal(_Memory.memoryArray[_MemoryAccessor.readTwoMemoryBytesToDecimal(_CurrentPCB.section, this.PC)]);
            // We increment again because we are reading two bytes for the memory address
            this.PC++;

        }

        public breakProcess() {
            // the program is completed...
            // I don't know if  I shouldn't be doing this OS stuff in the cpu. May need to change for better host/OS separation
            _StdOut.advanceLine();
            _StdOut.putText("Process " + _CurrentPCB.PID + " Complete!");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            // clear that section in memory
            _MemoryManager.clearMemory(_CurrentPCB.section);
            // remove PCB from _ReadyPCBList and _PCBList
            _ReadyPCBList.splice(_MemoryManager.getIndexByPID(_ReadyPCBList,_CurrentPCB.PID), 1); // the two parameters are the index and the number of PCBs removed
            _PCBList.splice(_MemoryManager.getIndexByPID(_PCBList,_CurrentPCB.PID), 1);
            // remove PCB from _CurrentPCB
            _CurrentPCB = null;
            Control.updateAllTables();
            Control.CPUTableClear();
            _MemoryManager.loadDiskProcess();
            _Scheduler.makeDecision();
        }

        public compareMemToXreg() {
            this.PC++
            var byteInMemory = Utils.hexStringToDecimal(_Memory.memoryArray[_MemoryAccessor.readTwoMemoryBytesToDecimal(_CurrentPCB.section, this.PC)]);
            if (byteInMemory == this.Xreg) {
                this.Zflag = 1;
            } else {
                this.Zflag = 0;
            }
            this.PC++;
        }

        public branchBytes() {
            this.PC++;
            // If the Zflag is zero jump a number of bytes forward, if its more than the section of memory, start back at the beginning again
            if (this.Zflag == 0){
                var bytes = _MemoryAccessor.readOneMemoryByteToDecimal(_CurrentPCB.section, this.PC);
                if (bytes + this.PC > 256) {
                    this.PC = (this.PC + bytes) % 256;
                } else {
                    this.PC += bytes;
                }
            }
        }

        public incrementByte() {
            this.PC++;
            // increment the value of a byte in memory
            _Memory.memoryArray[_MemoryAccessor.readTwoMemoryBytesToDecimal(_CurrentPCB.section, this.PC)] =
                    Utils.incrementHexString(_Memory.memoryArray[_MemoryAccessor.readTwoMemoryBytesToDecimal(_CurrentPCB.section, this.PC)]);
            this.PC++;
        }

        public systemCall() {
            // does something specific based on the Xreg
            var params: string[] = [];
            if (this.Xreg == 1){
                // Print out the integer stored in the Yreg
                console.log('System call print Yreg');
                params[0] = this.Yreg.toString();
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, params));
            } else if (this.Xreg == 2) {
                console.log("System call print string")
                // Print out the 00 terminated string stored at the address in the Y register
                // This means the letters associated with the code in memory
                var location = this.Yreg + _Memory.getBaseBySection(_CurrentPCB.section);
                var output: string = "";
                var byteString: string;
                for (var i = 0; i + location < _Memory.memoryArray.length; i++) {
                    byteString = _Memory.memoryArray[location + i];
                    if (byteString == "00") {
                        break;
                    } else {
                        output += String.fromCharCode(Utils.hexStringToDecimal(byteString));
                    }
                }
                params[0] = output;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_IRQ, params));
            } else {
                console.log("System call with Xreg != 1 or 2");
            }


        }


    }
}
