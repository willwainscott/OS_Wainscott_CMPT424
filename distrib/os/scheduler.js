/*  -----------------------------

    This makes the CPU scheduling decisions whe there are one or more
    running processes. This also creates the software interrupts that cause
    the cpu to switch which process it is running

    ----------------------------- */
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler() {
        }
        // The function that decided which process gets run
        Scheduler.prototype.makeDecision = function () {
            if (_ReadyPCBList.length > 0) {
                // If there's only one ready process and its not running...
                if ((_ReadyPCBList.length == 1) && (_CurrentPCB == null)) {
                    // Make that one process the running one
                    console.log("hello");
                    var params = [_ReadyPCBList[0]];
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, params));
                }
                _CPU.isExecuting = true;
            }
            else {
                _CPU.isExecuting = false;
            }
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
