/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";
        public pillConsumed = false; //Is this the right spot? Should it be in global.ts? Who knows? Not me.

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            //whereami
            sc = new ShellCommand(this.shellLocation,
                                  "whereami",
                                  "- Displays the user's current location.");
            this.commandList[this.commandList.length] = sc;

            //pill
            sc = new ShellCommand(this.shellPill,
                                  "pill",
                                  "<red | blue> - Take the red or blue pill.");
            this.commandList[this.commandList.length] = sc;

            //status
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "<string> - Changes the current status.");
            this.commandList[this.commandList.length] = sc;

            //error
            sc = new ShellCommand(this.shellError,
                                  "error",
                                  "- Simulates an OS error.");
            this.commandList[this.commandList.length] = sc;

            //load
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "- Loads entered user code.");
            this.commandList[this.commandList.length] = sc;

            //run
            sc = new ShellCommand(this.shellRun,
                                  "run",
                                  "<PID> - Runs a process based on a given Process ID.");
            this.commandList[this.commandList.length] = sc;

            //runall
            sc = new ShellCommand(this.shellRunAll,
                                  "runall",
                                  "- Runs all processes loaded into memory at once.");
            this.commandList[this.commandList.length] = sc;

            //clearmem
            sc = new ShellCommand(this.shellClearMem,
                                  "clearmem",
                                  "- Clears all of the memory partitions.");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            sc = new ShellCommand(this.shellPS,
                                  "ps",
                                  "- Lists the PID and state of running processes.");
            this.commandList[this.commandList.length] = sc;

            // kill <id> - kills the specified process id.
            sc = new ShellCommand(this.shellKill,
                                  "kill",
                                  "<PID> - Kills a specified process.");
            this.commandList[this.commandList.length] = sc;

            // killall
            sc = new ShellCommand(this.shellKillAll,
                                  "killall",
                                  "- Kills all running processes.");
            this.commandList[this.commandList.length] = sc;

            //quantum
            sc = new ShellCommand(this.shellQuantum,
                                  "quantum",
                                  "- Changes the round robin quantum.");
            this.commandList[this.commandList.length] = sc;

            //setschedule
            sc = new ShellCommand(this.shellSetSchedule,
                                  "setschedule",
                                  "<rr|fcfs|priority> - Changes the current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            //getschedule
            sc = new ShellCommand(this.shellGetSchedule,
                                  "getschedule",
                                  "- Returns the current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. check the command after you trim, then make sure you want the args upper or lower
            var checkList = buffer.split(" ");

            switch (checkList[0].toLowerCase()) {
                case "status":
                    break;
                case "rot13":
                    break;
                case "prompt":
                    break;
                default:
                    buffer = buffer.toLowerCase();
            }
            // This wont lower case the command however, something we want, so we fix that in 4.3

            // 3. Split up the buffer
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.3 Lower case it (in the case that it hasn't been)
            cmd = cmd.toLowerCase();
            // 4.3 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
            _StdOut.resetBufferHistory();
        }

        public shellMan(args: string[]) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "ver":
                        _StdOut.putText("Ver displays the current version of the " + APP_NAME + ".");
                        break;
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown turns only the OS off, but leaves the virtual hardware on.");
                        break;
                    case "cls":
                        _StdOut.putText("Clears the screen and resets the cursor position.");
                        break;
                    case "man":
                        _StdOut.putText("Displays the Manual page for a given topic."); // Insert joke about googling Google here
                        break;
                    case "trace":
                        _StdOut.putText("Turns on and off the OS tracing based on input.");
                        break;
                    case "rot13":
                        _StdOut.putText("Does rot13 obfuscation on a given string.");
                        break;
                    case "prompt":
                        _StdOut.putText("Changes the prompt to a given input.");
                        break;
                    case "date":
                        _StdOut.putText("Displays the current date and time. Like clockwork.");
                        break;
                    case "whereami":
                        _StdOut.putText("Tells the user where they physically are.");
                        break;
                    case "pill":
                        _StdOut.putText("Take the red or blue pill to decide your fate.");
                        break;
                    case "status":
                        _StdOut.putText("Changes the displayed status.")
                        break;
                    case "error":
                        _StdOut.putText("Simulates an OS error and violently dies.");
                        break;
                    case "load":
                        _StdOut.putText("Loads user code entered in the text area into memory.");
                        break;
                    case "run":
                        _StdOut.putText("Runs a loaded program based on the Process ID.");
                        break;
                    case "runall":
                        _StdOut.putText("Runs all loaded programs in the \"Resident\" state.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clears all of the memory partitions.");
                        break;
                    case "ps":
                        _StdOut.putText("Displays the PID of every process and their state.");
                        break;
                    case "kill":
                        _StdOut.putText("Kills a specified process, changing its state to \"Terminated\".");
                        break;
                    case "killall":
                        _StdOut.putText("Kills all running processes (if any), chaing their state to \"Terminated\".");
                        break;
                    case "quantum":
                        _StdOut.putText("Changes the round robin quantum for process scheduling.");
                        break;
                    case "setschedule":
                        _StdOut.putText("Changes the current scheduling algorithm to Round Robin, First Come First Serve, or Priority.");
                        break;
                    case "getschedule":
                        _StdOut.putText("Returns the current scheduling algorithm.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args: string[]) {
            var currDate = new Date();
            _StdOut.putText(currDate.toLocaleString('en-US'));
        }

        public shellLocation(args: string[]) {
            _StdOut.putText("You are in a vat, while your brain \"reads\" a simulated computer screen.");
        }

        public shellPill(args: string[]) {
            if (args.length > 0){
                var pill = args[0];
                if (!this.pillConsumed) {
                    switch (pill) {
                        case "blue":
                            _StdOut.putText("Hey, blissful ignorance is not that bad, right?");
                            this.pillConsumed = true;
                            break;
                        case "red":
                            _StdOut.putText("Time to see how deep the rabbit hole goes...");
                            this.pillConsumed = true;
                            break;
                        default:
                            _StdOut.putText("Sorry fresh out of " + pill + " colored pills.");
                            _StdOut.advanceLine();
                            _StdOut.putText("Maybe try a red or blue pill?");
                    }
                } else {
                    _StdOut.putText("There are no more pills. Your decision has been made.");
                }
            } else {
                _StdOut.putText("All I'm offering is the truth");
                _StdOut.advanceLine();
                _StdOut.putText("Once one chooses the red or blue pill, the choice is irreversible.");
            }
        }

        public shellStatus(args: string[]){
            if (args.length > 0){
                let status = "";
                for (var word of args){
                    status = status + word + " ";
                }
                Control.hostStatusChange(status);
            } else {
                _StdOut.putText("Please enter a status message.");
            }
        }

        public shellError(args: string[]){
            _Kernel.krnTrapError("Test Error");
        }

        public shellLoad(args: string[]) {
            var userCode = _UserCodeTextArea.value;
            // remove and leading or trailing spaces
            userCode = Utils.trim(userCode);
            var valid = true;
            var charArray = userCode.split(''); //makes array of every char the user entered
            var stringArray = userCode.split(' '); // makes array of every space separated string
            for (var char of charArray) {
                switch (char){      //checks to make sure only hex digits were entered
                    case " ": break;
                    case "0": break;
                    case "1": break;
                    case "2": break;
                    case "3": break;
                    case "4": break;
                    case "5": break;
                    case "6": break;
                    case "7": break;
                    case "8": break;
                    case "9": break;
                    case "A": break;
                    case "B": break;
                    case "C": break;
                    case "D": break;
                    case "E": break;
                    case "F": break;
                    case "a": break;
                    case "b": break;
                    case "c": break;
                    case "d": break;
                    case "e": break;
                    case "f": break;
                    default: console.log("invalid hex digits"); valid = false;
                }
            }
            for (var hexNumberString of stringArray) {  //checks to make sure that the entered hex digits are valid codes
                if (!valid) {   // if its already invalid due to prior loop, break out so we dont loop through
                    break;
                } else if (hexNumberString.length != 2) { // valid right now means just of length two
                    console.log("invalid hex commands");
                    valid = false;
                    break;
                }
            }
            if (valid) {
                _StdOut.putText("Entered user code is valid.");
                _StdOut.advanceLine();

                if (_MemoryManager.memoryAvailabilityCheck()) {
                    //Make every character in the codes uppercase
                    userCode = userCode.toUpperCase();
                    //load it into memory ...

                    // create a PCB
                    var PCB = new TSOS.PCB();

                    // give it a PID
                    PCB.PID = _PIDCounter;
                    _PIDCounter++;  // Increment to prevent duplicate PIDs

                    // Assign it a section in memory
                    PCB.section = _MemoryManager.assignMemorySection();

                    //Add it to global list of Resident PCBs
                    _PCBList[_PCBList.length] = PCB;

                    console.log(_PCBList);

                    //clear memory before loading
                    // NOTE: Will probably change it such that when a program is completed or terminated the memory is cleared
                    // instead of keeping the old program in memory and only removing it when a new one is loaded
                    _MemoryManager.clearMemory(PCB.section);

                    //use memory manager to load
                    _MemoryManager.loadMemory(userCode, PCB.section);

                    // Update the PCB's IR
                    PCB.IR = _MemoryAccessor.readMemoryToHex(PCB.section, PCB.PC);

                    // Update Memory GUI
                    Control.memoryTableUpdate();

                    // Update PCB GUI
                    Control.processTableUpdate();

                    // print out response
                    _StdOut.putText("User code loaded successfully");
                    _StdOut.advanceLine();
                    if (_SarcasticMode){
                        _StdOut.putText("Congrats, you're not completely useless.");
                        _StdOut.advanceLine();
                    }
                    _StdOut.putText("Process ID Number: " + PCB.PID);
                } else {
                    _StdOut.putText("Memory is full. Please run a process or clear the memory to load.");
                }
            } else {
                _StdOut.putText("Please ensure user code is valid hexadecimal");
            }
        }

        public shellRun(args: string[]) {
            // Check to see if the entered PID is valid
            if ((args.length = 1) && !(isNaN(Number(args[0])))) { //Checks to see if the arg is there and is actually a number
                var enteredPID = Number(args[0]);
                // Checks to see if the PID is loaded into memory
                if(_MemoryManager.PCBisResident(enteredPID)) {
                    // change the PCB status to waiting
                    _PCBList[_MemoryManager.getIndexByPID(_PCBList,enteredPID)].state = "Waiting";
                    // add the process to the ready queue
                    _ReadyPCBList[_ReadyPCBList.length] = _MemoryManager.getPCBByPID(enteredPID);
                    // Make GoNextStep false in case they hit the next step button while there was no process running
                    _GoNextStep = false;
                    // Make scheduling decision
                    _Scheduler.makeDecision();
                } else {
                    _StdOut.putText("Ensure the entered PID number is valid.")
                }
            } else {
                _StdOut.putText("Please enter a PID number.")
            }
        }

        public shellRunAll(args: string[]) {
            _GoNextStep = false;
            for (var i = 0; i < _PCBList.length; i++) {
                // if the process is resident (and not running or waiting) ...
                if (_PCBList[i].state = "Resident") {
                    // Make the process Waiting
                    _PCBList[i].state = "Waiting";
                    // Add it to the ready queue
                    _ReadyPCBList[_ReadyPCBList.length] = _PCBList[i];
                }
            }
            _Scheduler.makeDecision();
        }

        public shellClearMem(args: string[]) {
            // Clears all section in memory. Could potentially have it such that it only clears certain sections
            if (_CPU.isExecuting) {
                _StdOut.putText("Memory can only be cleared when programs are not running.");
            } else {
                // clear the PCB lists
                _PCBList = [];
                _ReadyPCBList = [];
                _MemoryManager.clearMemory("all");
            }
        }

        public shellPS(args: string[]) {
            // Prints out the PID and state for each PCB
            if (_PCBList.length > 0) {
                for (var i = 0; i < _PCBList.length; i++){
                    _StdOut.putText("Process ID: " + _PCBList[i].PID + " State: " + _PCBList[i].state);
                    _StdOut.advanceLine();
                }
            } else {
                _StdOut.putText("There are no loaded processes.");
            }
        }

        public shellKill(args: string[]) {
            // Check to see if the entered PID is valid
            if ((args.length = 1) && !(isNaN(Number(args[0])))) { //Checks to see if the arg is there and is actually a number
                var enteredPID = Number(args[0]);
                // Check to make sure the process is a resident or is running
                if (_MemoryManager.PCBisResident(enteredPID)) {
                    _StdOut.putText("Process " + enteredPID + " terminated through user kill command.");
                    // if it was the _CurrentPCB, remove it
                    if (_CurrentPCB != null){
                        if (_CurrentPCB.PID == enteredPID) {
                            _CurrentPCB = null;
                        }
                    }
                    // Clear that section in memory
                    _MemoryManager.clearMemory(_MemoryManager.getPCBByPID(enteredPID).section);
                    // remove it from the _PCBList(s)
                    _PCBList.splice(_MemoryManager.getIndexByPID(_PCBList,enteredPID), 1);
                    if (_MemoryManager.PCBisReady(enteredPID)){
                        _ReadyPCBList.splice(_MemoryManager.getIndexByPID(_ReadyPCBList,enteredPID), 1);
                    }
                    // update GUI
                    Control.updateAllTables();
                    // and finally schedule something (if anything)
                    _Scheduler.makeDecision();
                } else {
                    _StdOut.putText("Ensure the entered PID number is valid.")
                }
            } else {
                _StdOut.putText("Please enter a PID number.")
            }
        }

        public shellKillAll(args: string[]) {
            // Stop the CPU from executing, because all the processes have been killed
            _CPU.isExecuting = false;
            _StdOut.putText("Processes ");
            for (var i = 0; i < _PCBList.length; i++){
                _StdOut.putText(_PCBList[i].PID + " ");
            }
            _StdOut.putText("terminated through user killall command.");
            _CurrentPCB = null;
            _PCBList = [];
            _ReadyPCBList = [];
            _MemoryManager.clearMemory("all");
            Control.updateAllTables();
        }

        public shellQuantum(args: string[]) {
            // Check to see if the entered Quantum is valid
            if ((args.length = 1) && !(isNaN(Number(args[0])))) { //Checks to see if the arg is there and is actually a number
                _RRQuantum = parseInt(args[0]);
            } else {
                _StdOut.putText("Please enter a valid quantum");
            }
        }

        public shellSetSchedule(args: string[]) {
            var enteredAlgorithm = args[0];
            switch (enteredAlgorithm) {
                case "rr":
                    _SchedulingAlgorithm = "Round Robin";
                    _StdOut.putText("Scheduling Algorithm set to Round Robin.");
                    break;
                case "fcfs":
                    _SchedulingAlgorithm = "First Come First Serve";
                    _StdOut.putText("Scheduling Algorithm set to First Come First Serve.");
                    break;
                case "priority":
                    _SchedulingAlgorithm = "Priority";
                    _StdOut.putText("Scheduling Algorithm set to Priority.");
                    break;
                default:
                    _StdOut.putText("Please enter a valid Scheduling Algorithm.");
            }
        }

        public shellGetSchedule(args: string[]) {

            _StdOut.putText("The current Scheduling Algorithm is " + _SchedulingAlgorithm + ".");

        }
    }
}
