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
            if (_SchedulingAlgorithm == "Round Robin" || _SchedulingAlgorithm == "First Come First Serve") {
                if (_ReadyPCBList.length > 0) {
                    if ((_ReadyPCBList.length == 1) && (_CurrentPCB == null)) {
                        // If there's only one ready process and its not running...
                        // Make that one process the running one
                        var params = [_ReadyPCBList[0]];
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, params));
                    }
                    else if ((_ReadyPCBList.length >= 2) && (_CurrentPCB == null)) {
                        // There are two or more ready processes but none currently running
                        this.findNextProcessRR();
                    }
                    else if (_ReadyPCBList.length >= 2) {
                        // if the current PCB's quantum is up ...
                        if (!(_CurrentPCB.quantaRun < _RRQuantum)) {
                            _CurrentPCB.state = "Waiting";
                            this.findNextProcessRR();
                        }
                    }
                    _CPU.isExecuting = true;
                }
                else {
                    // There is nothing in _ReadyPCBList
                    _CPU.isExecuting = false;
                }
            }
            else if (_SchedulingAlgorithm == "Priority") {
                if (_ReadyPCBList.length > 0) {
                    if ((_ReadyPCBList.length == 1) && (_CurrentPCB == null)) {
                        // If there's only one ready process and its not running...
                        // Make that one process the running one
                        var params = [_ReadyPCBList[0]];
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, params));
                    }
                    else if ((_ReadyPCBList.length >= 2) && (_CurrentPCB == null)) {
                        // There are two or more ready processes but none currently running (or if one just finished)
                        this.findNextProcessPR();
                    }
                    _CPU.isExecuting = true;
                }
                else {
                    // There is nothing in _ReadyPCBList
                    _CPU.isExecuting = false;
                }
            }
        };
        Scheduler.prototype.findNextProcessRR = function () {
            var nextFound = false;
            for (var i = 0; i < _ReadyPCBList.length; i++) {
                // check the quantum of each process to find next one to run
                if (_ReadyPCBList[i].quantaRun < _RRQuantum) {
                    // Make that one process the running one
                    var params = [_ReadyPCBList[i]];
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, params));
                    nextFound = true;
                    break;
                }
            }
            // If all of the PCBs have used their quanta up...
            if (!nextFound) {
                // reset all of their quanta
                for (var i = 0; i < _ReadyPCBList.length; i++) {
                    _ReadyPCBList[i].quantaRun = 0;
                }
                // run the first one in the ready queue
                var params = [_ReadyPCBList[0]];
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, params));
            }
        };
        Scheduler.prototype.findNextProcessPR = function () {
            var tempPCB = _ReadyPCBList[0];
            for (var i = 1; i < _ReadyPCBList.length; i++) {
                //compare priority to find the highest (well technically lowest numerical) one
                if (tempPCB.priority > _ReadyPCBList[i].priority) { //lower number means higher priority
                    tempPCB = _ReadyPCBList[i];
                }
                // context switch to the next process
                var params = [tempPCB];
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, params));
            }
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
