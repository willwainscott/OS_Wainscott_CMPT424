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
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get global reference to the user code input
            _UserCodeTextArea = <HTMLTextAreaElement>document.getElementById('taProgramInput');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }

        // Updates the time, called on a CPU clock pulse
        public static updateTime() {
            var dateTime = new Date();
            document.getElementById("pDateTime").innerHTML = dateTime.toLocaleString('en-US');
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt, Reset, and Single Step buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnSingleStepOn")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // ... Create some memory because...uh...i forgot why ...
            _Memory = new Memory();
            _Memory.init();
            // ... oh yeah cause its part of the hardware ...
            // ... throw an Accessor in there while you're at it so we can access our new memory ...
            _MemoryAccessor = new MemoryAccessor();

            // ... Create and initialize our sweet disk ...
            _Disk = new Disk();



            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.

            // Make Status and Time visible
            document.getElementById("pDateTime").style.visibility = "visible";
            document.getElementById("pStatus").style.visibility = "visible";
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnStepOn_click(btn): void{
            // change single step to on
            _SingleStep = true;
            // disable this button
            btn.disabled = true;
            // enable the single step off button
            (<HTMLButtonElement>document.getElementById("btnSingleStepOFF")).disabled = false;
            // enable the step button
            (<HTMLButtonElement>document.getElementById("btnStep")).disabled = false;
        }

        public static hostBtnStepOff_click(btn): void {
            // change single step to off
            _SingleStep = false;
            // disable this button
            btn.disabled = true;
            // disable the step button
            (<HTMLButtonElement>document.getElementById("btnStep")).disabled = true;
            // enable the single step on button
            (<HTMLButtonElement>document.getElementById("btnSingleStepOn")).disabled = false;
        }

        public static hostBtnStep_click(btn): void {
            // let the cpu do one cycle
            _GoNextStep = true;
        }

        public static hostStatusChange(status): void {
            document.getElementById("pStatus").innerHTML = "Status: " + status;
        }

        // Update Processes table
        public static processTableUpdate() {
            this.processTableClear();
            var processTable = <HTMLTableElement>document.getElementById("ProcessTable");
            for (var i = 0; i < _PCBList.length; i++) {
                // Insert a row with the appropriate data for each PCB
                var row = processTable.insertRow(i + 1);
                // PID Entry
                var cellPID = row.insertCell(0);
                cellPID.innerHTML = _PCBList[i].PID.toString(16).toUpperCase();
                // PC Entry
                var cellPC = row.insertCell(1);
                cellPC.innerHTML = _PCBList[i].PC.toString(16).toUpperCase();
                // IR Entry
                var cellIR = row.insertCell(2);
                cellIR.innerHTML = _PCBList[i].IR;
                // ACC Entry
                var cellACC = row.insertCell(3);
                cellACC.innerHTML = _PCBList[i].ACC.toString(16).toUpperCase();
                // Xreg Entry
                var cellXreg = row.insertCell(4);
                cellXreg.innerHTML = _PCBList[i].Xreg.toString(16).toUpperCase();
                // Yreg Entry
                var cellYreg = row.insertCell(5);
                cellYreg.innerHTML = _PCBList[i].Yreg.toString(16).toUpperCase();
                // Zflag Entry
                var cellZflag = row.insertCell(6);
                cellZflag.innerHTML = _PCBList[i].Zflag.toString(16).toUpperCase();
                // State Entry
                var cellState = row.insertCell(7);
                cellState.innerHTML = _PCBList[i].state;
                // Location Entry
                var cellLocation = row.insertCell(8);
                cellLocation.innerHTML = _PCBList[i].location;
            }
        }

        // Clear Process Table
        public static processTableClear() {
            var processTable = <HTMLTableElement>document.getElementById("ProcessTable");
                // delete each row
                for (var i = processTable.rows.length; i > 1; i--){
                    processTable.deleteRow(i-1);
                }
        }

        // Update CPU table
        public static CPUTableUpdate() {
            if (_CPU.isExecuting) {         // Only update the CPU if it is executing
                // PC Entry
                var cpuPC = document.getElementById("cpuPC");
                cpuPC.innerHTML = _CPU.PC.toString(16).toUpperCase();
                // IR Entry
                var cpuIR = document.getElementById("cpuIR");
                cpuIR.innerHTML = _CPU.IR;
                // Acc Entry
                var cpuACC = document.getElementById("cpuACC");
                cpuACC.innerHTML = _CPU.ACC.toString(16).toUpperCase();
                // X Entry
                var cpuX = document.getElementById("cpuX");
                cpuX.innerHTML = _CPU.Xreg.toString(16).toUpperCase();
                // Y Entry
                var cpuY = document.getElementById("cpuY");
                cpuY.innerHTML = _CPU.Yreg.toString(16).toUpperCase();
                // Z Entry
                var cpuZ = document.getElementById("cpuZ");
                cpuZ.innerHTML = _CPU.Zflag.toString(16).toUpperCase();
            } else {
                this.CPUTableClear();
            }
        }

        public static CPUTableClear() {
            // PC Entry
            var cpuPC = document.getElementById("cpuPC");
            cpuPC.innerHTML = "-";
            // IR Entry
            var cpuIR = document.getElementById("cpuIR");
            cpuIR.innerHTML = "-";
            // Acc Entry
            var cpuACC = document.getElementById("cpuACC");
            cpuACC.innerHTML = "-";
            // X Entry
            var cpuX = document.getElementById("cpuX");
            cpuX.innerHTML = "-";
            // Y Entry
            var cpuY = document.getElementById("cpuY");
            cpuY.innerHTML = "-";
            // Z Entry
            var cpuZ = document.getElementById("cpuZ");
            cpuZ.innerHTML = "-";
        }

        // Update Memory Table
        public static memoryTableUpdate() {
            this.memoryTableClear();
            // each cell in table has an id based on the memory index
            for (var i = 0; i < _Memory.memoryArray.length; i++) {
                var entry = document.getElementById("memory" + i);
                entry.innerHTML = _Memory.memoryArray[i];
            }
        }

        // Clear Memory Table
        public static memoryTableClear() {
            // set everything to 00
            for (var i = 0; i < _Memory.memoryArray.length; i++) {
                var entry = document.getElementById("memory" + i);
                entry.innerHTML = "00";
            }
        }

        public static diskTableUpdate() {
            //maybe clear the table??

            var diskTable = <HTMLTableElement>document.getElementById("diskTable");
            var dataArray: String[];
            var rowNumber = 1;      // Used to keep track of the rows in the html table, starts at 1 to not overwrite the first row
            // Add Header row
            var headerRow = diskTable.insertRow(0);
            headerRow.style.fontWeight = "bold"
            // TSB Cell
            var headerTSB = headerRow.insertCell(0);
            headerTSB.innerHTML = "T:S:B";
            // Used Cell
            var headerUsed = headerRow.insertCell(1);
            headerUsed.innerHTML = "Used";
            // Next Cell
            var headerNext = headerRow.insertCell(2);
            headerNext.innerHTML = "Next";
            // Data Cell
            var headerData = headerRow.insertCell(3);
            headerData.innerHTML = "Data";
            // Now add rows for each block on the disk
            for (var i = 0; i < _Disk.tracks; i++) {
                for (var j = 0; j < _Disk.sectors; j++) {
                    for (var k = 0; k < _Disk.blocks; k++) {
                        // We have to get disk data from session storage ...
                        dataArray = sessionStorage.getItem(i + ":" + j +":" + k).split(",");
                        // ... create the table row ...
                        var row = diskTable.insertRow(rowNumber);
                        rowNumber++;
                        // ... create the TSB Cell ...
                        var cellTSB = row.insertCell(0);
                        cellTSB.innerHTML = i + ":" + j +":" + k;
                        // ... create the Used Cell ...
                        var cellUsed = row.insertCell(1);
                        cellUsed.innerHTML = dataArray[0].valueOf();
                        // ... create the Next Cell ...
                        var cellNext = row.insertCell(2);
                        cellNext.innerHTML = dataArray[1] + ":" + dataArray[2] + ":" + dataArray[3];
                        // ... create the Data Cell
                        var cellData = row.insertCell(3);
                        var dataString = new String();
                        for (var w = 4; w < dataArray.length; w++) {  //Does someone know the commonly used letter in a 4th for loop? Ill use w cause its a pretty cool letter
                            dataString += dataArray[w].valueOf();
                        }
                        cellData.innerHTML = dataString.valueOf();
                    }
                }
            }
        }



        // Updates all GUI Tables
        public static updateAllTables() {
            this.processTableClear();
            this.memoryTableClear();
            this.CPUTableClear();

            this.processTableUpdate();
            this.memoryTableUpdate();
            this.CPUTableUpdate();
        }
    }
}
