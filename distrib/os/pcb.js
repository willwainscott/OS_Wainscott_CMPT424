/* --------------

    pcb.ts

    Process Control Block used to store the information about the processes

   -------------- */
var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(PID, // Process ID
        PC, //Process Counter
        IR, //IR? Specific command that is being run
        ACC, //Accumulator
        X, //X Register
        Y, //Y Register
        Z, //Z Flag
        state, //State of the process
        location) {
            if (PID === void 0) { PID = _PCBList.length; }
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = ""; }
            if (ACC === void 0) { ACC = 0; }
            if (X === void 0) { X = 0; }
            if (Y === void 0) { Y = 0; }
            if (Z === void 0) { Z = 0; }
            if (state === void 0) { state = "New"; }
            if (location === void 0) { location = "Memory"; }
            this.PID = PID;
            this.PC = PC;
            this.IR = IR;
            this.ACC = ACC;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.state = state;
            this.location = location;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
