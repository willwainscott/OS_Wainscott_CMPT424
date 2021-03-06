/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public bufferHistory = [""], // oldest entries are at the front, "" is used to signify the buffer the user hasn't entered yet
                    public historyIndex = 0,
                    public buffer = "") {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public resetBufferHistory(): void {
            this.bufferHistory = [""];
            this.historyIndex = 0;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... add it to the buffer history ...
                    this.bufferHistory.splice(this.bufferHistory.length - 1, 0, this.buffer);
                    // ... reset buffer history to start back at the most recent buffer
                    this.historyIndex = this.bufferHistory.length - 1;
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === "ctrl-C") {
                    if (_CPU.isExecuting) {
                        _CPU.isExecuting = false;
                        _CurrentPCB.state = "Terminated";
                        _PCBList[_CurrentPCB.PID] = _CurrentPCB;
                        Control.updateAllTables();
                        this.advanceLine();
                        this.putText("Process " + _CurrentPCB.PID + " Terminated with Ctrl-C.");
                        this.advanceLine();
                        _OsShell.putPrompt();
                    }
                } else if (chr === String.fromCharCode(8)) { // backspace
                    if (this.buffer.length > 0) { //if there is something in the buffer
                        //get the last character typed and erase it from the canvas
                        let lastChar = this.buffer[this.buffer.length - 1];
                        this.removeChar(lastChar);
                        //remove the last letter in the buffer
                        this.buffer = this.buffer.slice(0,-1);
                    }
                } else if (chr === String.fromCharCode(9)) { // Tab
                    if (this.buffer.length > 0) { //if there is something in the buffer
                        // get list of possible commands
                        var completionOptions = _OsShell.commandList
                        // check each letter of buffer against an updated potential command list
                        for (var i = 0; i < this.buffer.length; i++){
                            /* this updates the list of potential commands based on the letters,
                            moving to the next letter each time there is more than two possible commands */
                            completionOptions = this.completionCheck(this.buffer, completionOptions, i);
                            if (completionOptions.length == 0) {        // stop loop if there are no matches
                                break;
                            } else if (completionOptions.length == 1) { // put the matching command into the buffer
                                //removes old buffer from canvas
                                this.removeString(this.buffer);
                                //changes new buffer to full command
                                this.buffer = completionOptions[0].command;
                                this.putText(this.buffer);
                                break;
                            }
                        }
                    // W TODO: make tabing with arguments not go back to just the command
                    }
                } else if (chr === "upArrow") {   // up arrow
                    if ((this.historyIndex <= (this.bufferHistory.length - 1))  && // the index is not the last
                               (this.bufferHistory.length > 1)  &&                        // there is a history
                               (this.historyIndex != 0))  {                               // the index is not the first
                        //clear the buffer
                        this.removeString(this.buffer);
                        this.buffer = "";
                        // move back one entry
                        this.historyIndex--;
                        // write out old buffer
                        this.putText(this.bufferHistory[this.historyIndex]);
                        // actually put it into the new buffer
                        this.buffer = this.bufferHistory[this.historyIndex];

                    }
                } else if (chr === "downArrow") { //down arrow
                    if (this.historyIndex != this.bufferHistory.length - 1) {
                        // if its not the last index ("")
                        //clear the buffer
                        this.removeString(this.buffer);
                        this.buffer = "";
                        // move up one entry
                        this.historyIndex++;
                        // write out old buffer
                        this.putText(this.bufferHistory[this.historyIndex]);
                        // actually put it into the new buffer
                        this.buffer = this.bufferHistory[this.historyIndex];
                    }
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
         }

        public removeChar(char): void {
        // Used when removing a character from the canvas after the backspace button has been hit

            //move the cursor back
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
            this.currentXPosition = this.currentXPosition - offset;

            // remove char function
            _DrawingContext.eraseText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, char);

         }

        public removeString(string): void {
            // removes a string from the canvas letter by letter
            // probably a much better way of doing this
            while (string.length > 0) {
                this.removeChar(string[string.length - 1]);
                string = string.slice(0,-1);
            }


         }

        public completionCheck(buffer, commandArray, index): Array<ShellCommand> {
            // returns an array of the commands with matching letter as the buffer in a given index
            var matchingCommands = [];

            for (var sc of commandArray) {
                if (sc.command[index] == buffer[index]) {
                    matchingCommands[matchingCommands.length] = sc;
                }
            }
            return matchingCommands;
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */

            let lineHeight = _DefaultFontSize +
                             _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                             _FontHeightMargin;

            this.currentYPosition += lineHeight;

            // TODO: Handle scrolling. (iProject 1)

            if (this.currentYPosition > _Canvas.height) {
                //take image of canvas except for the top line, leaving room at the bottom
                var screenshot = _DrawingContext.getImageData(0, lineHeight, _Canvas.width, _Canvas.height);
                //clear that screen
                this.clearScreen();
                // put the image of the canvas back on the screen
                _DrawingContext.putImageData(screenshot, 0, 0);
                // move the y value to the correct spot
                this.currentYPosition = this.currentYPosition - lineHeight;

            }
        }

        public RSOD() : void { //displays a Red Screen Of Death (cause blue is too mainstream)
            //clear screen
            this.clearScreen();
            // make the screen red
            _DrawingContext.fillStyle = 'red';
            _DrawingContext.fillRect(0, 0, 500, 500); // Hard coding is not the best, but is DOM stuff in the OS any better?
            // _DrawingContext.fillRect(0, 0, document.getElementById("display").width, document.getElementById("display").height);
            // ... set the prompt to nothing so it doesn't print out
            _OsShell.promptStr = "";
            //reset Y position so you can see...
            this.currentYPosition = 100; // Just a random number, no real significance
            // ... some flavorful text!
            this.putText("Oh no...Something broke.");
            this.advanceLine();
            if (_SarcasticMode) {
                this.putText("What did you do???");
                this.advanceLine();
                this.putText("You've really done it now.");
                this.advanceLine();
                this.putText("You monster.");
            } else {
                this.putText("Well this is embarrassing.");
                this.advanceLine();
                this.putText("We apologize for this inconvenience.");
            }
        }
    }
 }
