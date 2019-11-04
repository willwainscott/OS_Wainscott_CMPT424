/*  -----------------------------

    This makes the CPU scheduling decisions whe there are one or more
    running processes. This also creates the software interrupts that cause
    the cpu to switch which process it is running

    ----------------------------- */

module TSOS {

    export class Scheduler {

        constructor() {}

        // The function that decided which process gets run
        public makeDecision() {

            if (_ReadyPCBList.length > 0) {
                if ((_ReadyPCBList.length == 1) && (_CurrentPCB == null)) {
                    // If there's only one ready process and its not running...
                    // Make that one process the running one
                    var params = [_ReadyPCBList[0]];
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, params));
                } else if ((_ReadyPCBList.length >= 2) && (_CurrentPCB == null)) {
                    // There are two or more ready processes but none currently running
                    this.findNextProcess();
                } else if (_ReadyPCBList.length >= 2) {
                    // if the current PCB's quantum is up ...
                    if (!(_CurrentPCB.quantaRun < _RRQuantum)) {
                        _CurrentPCB.state = "Waiting";
                        this.findNextProcess();
                    }
                }
                _CPU.isExecuting = true;
            } else {
                // There is nothing in _ReadyPCBList
                _CPU.isExecuting = false;
            }

        }

        public findNextProcess() {
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
                for (var i = 0; i < _ReadyPCBList.length; i++){
                    _ReadyPCBList[i].quantaRun = 0;
                }
                // run the first one in the ready queue
                var params = [_ReadyPCBList[0]];
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, params));
            }
        }

    }



}