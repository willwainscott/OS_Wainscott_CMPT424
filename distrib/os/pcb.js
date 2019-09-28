/* --------------

    pcb.ts

    Process Control Block used to store the information about the processes

   -------------- */
var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(PID, // Process ID
        PC, //
        IR, ACC, X, Y, Z, state, location) {
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
