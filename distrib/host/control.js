/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    var Control = /** @class */ (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get global reference to the user code input
            _UserCodeTextArea = document.getElementById('taProgramInput');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        };
        // Updates the time, called on a CPU clock pulse
        Control.updateTime = function () {
            var dateTime = new Date();
            document.getElementById("pDateTime").innerHTML = dateTime.toLocaleString('en-US');
        };
        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            // ... Create some memory because...uh...i forgot why ...
            _Memory = new TSOS.Memory();
            _Memory.init();
            // ... oh yeah cause its part of the hardware ...
            // ... throw an Accessor in there while you're at it so we can access our new memory ...
            _MemoryAccessor = new TSOS.MemoryAccessor();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
            // Make Status and Time visible
            document.getElementById("pDateTime").style.visibility = "visible";
            document.getElementById("pStatus").style.visibility = "visible";
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };
        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        Control.hostStatusChange = function (status) {
            document.getElementById("pStatus").innerHTML = "Status: " + status;
        };
        // Update Processes table
        Control.processTableUpdate = function () {
            this.processTableClear();
            var processTable = document.getElementById("ProcessTable");
            for (var i = 0; i < _PCBList.length; i++) {
                // Insert a row with the appropriate data for each PCB
                var row = processTable.insertRow(i + 1);
                // PID Entry
                var cellPID = row.insertCell(0);
                cellPID.innerHTML = _PCBList[i].PID.toString();
                // PC Entry
                var cellPC = row.insertCell(1);
                cellPC.innerHTML = _PCBList[i].PC.toString();
                // IR Entry
                var cellIR = row.insertCell(2);
                cellIR.innerHTML = _PCBList[i].IR;
                // ACC Entry
                var cellACC = row.insertCell(3);
                cellACC.innerHTML = _PCBList[i].ACC.toString();
                // Xreg Entry
                var cellXreg = row.insertCell(4);
                cellXreg.innerHTML = _PCBList[i].Xreg.toString();
                // Yreg Entry
                var cellYreg = row.insertCell(5);
                cellYreg.innerHTML = _PCBList[i].Yreg.toString();
                // Zflag Entry
                var cellZflag = row.insertCell(6);
                cellZflag.innerHTML = _PCBList[i].Zflag.toString();
                // State Entry
                var cellState = row.insertCell(7);
                cellState.innerHTML = _PCBList[i].state;
                // Location Entry
                var cellLocation = row.insertCell(8);
                cellLocation.innerHTML = _PCBList[i].location;
            }
        };
        // Clear Process Table
        Control.processTableClear = function () {
            var processTable = document.getElementById("ProcessTable");
            // delete each row
            for (var i = processTable.rows.length; i > 1; i--) {
                processTable.deleteRow(i - 1);
            }
        };
        // Update CPU table
        Control.CPUTableUpdate = function () {
        };
        Control.CPUTableClear = function () {
        };
        // Update Memory Table
        Control.memoryTableUpdate = function () {
            this.memoryTableClear();
            // each cell in table has an id based on the memory index
            for (var i = 0; i < _Memory.memoryArray.length; i++) {
                var entry = document.getElementById("memory" + i);
                entry.innerHTML = _Memory.memoryArray[i];
            }
        };
        // Clear Memory Table
        Control.memoryTableClear = function () {
            // set everything to 00
            for (var i = 0; i < _Memory.memoryArray.length; i++) {
                var entry = document.getElementById("memory" + i);
                entry.innerHTML = "00";
            }
        };
        // Updates all GUI Tables
        Control.updateAllTables = function () {
            this.processTableClear();
            this.memoryTableClear();
            this.CPUTableClear();
            this.processTableUpdate();
            this.memoryTableUpdate();
            this.CPUTableClear();
        };
        return Control;
    }());
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
