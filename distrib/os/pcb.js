/* --------------

    pcb.ts

    Process Control Block used to store the information about the processes

   -------------- */
var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(PID, // Process ID
        PC, //Process Counter
        IR, //IR? Specific op code that is being run
        ACC, //Accumulator
        Xreg, //X Register
        Yreg, //Y Register
        Zflag, //Z Flag
        state, //State of the process
        location, //Location (in memory/on the disk)
        section, //The section of memory it is in (or on the hard drive)
        quantaRun, //The number of times the process is run relative to the quanta in Round Robin
        priority, //The priority used for priority scheduling
        timesSwapped) {
            if (PID === void 0) { PID = 0; }
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = ""; }
            if (ACC === void 0) { ACC = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (state === void 0) { state = "Resident"; }
            if (location === void 0) { location = ""; }
            if (section === void 0) { section = ""; }
            if (quantaRun === void 0) { quantaRun = 0; }
            if (priority === void 0) { priority = 10; }
            if (timesSwapped === void 0) { timesSwapped = 0; }
            this.PID = PID;
            this.PC = PC;
            this.IR = IR;
            this.ACC = ACC;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.state = state;
            this.location = location;
            this.section = section;
            this.quantaRun = quantaRun;
            this.priority = priority;
            this.timesSwapped = timesSwapped;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
