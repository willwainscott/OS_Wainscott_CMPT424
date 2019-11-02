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
        section) {
            if (PID === void 0) { PID = 0; }
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = ""; }
            if (ACC === void 0) { ACC = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (state === void 0) { state = "Resident"; }
            if (location === void 0) { location = "Memory"; }
            if (section === void 0) { section = ""; }
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
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
