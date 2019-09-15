/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, bufferHistory, // oldest entries are at the front, "" is used to signify the buffer the user hasn't entered yet
        historyIndex, buffer) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (bufferHistory === void 0) { bufferHistory = [""]; }
            if (historyIndex === void 0) { historyIndex = 0; }
            if (buffer === void 0) { buffer = ""; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.bufferHistory = bufferHistory;
            this.historyIndex = historyIndex;
            this.buffer = buffer;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.resetBufferHistory = function () {
            this.bufferHistory = [""];
            this.historyIndex = 0;
        };
        Console.prototype.handleInput = function () {
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
                }
                else if (chr === String.fromCharCode(8)) { // backspace
                    if (this.buffer.length > 0) { //if there is something in the buffer
                        //get the last character typed and erase it from the canvas
                        var lastChar = this.buffer[this.buffer.length - 1];
                        this.removeChar(lastChar);
                        //remove the last letter in the buffer
                        this.buffer = this.buffer.slice(0, -1);
                    }
                }
                else if (chr === String.fromCharCode(9)) { // Tab
                    if (this.buffer.length > 0) { //if there is something in the buffer
                        // get list of possible commands
                        var completionOptions = _OsShell.commandList;
                        // check each letter of buffer against an updated potential command list
                        for (var i = 0; i < this.buffer.length; i++) {
                            /* this updates the list of potential commands based on the letters,
                            moving to the next letter each time there is more than two possible commands */
                            completionOptions = this.completionCheck(this.buffer, completionOptions, i);
                            if (completionOptions.length == 0) { // stop loop if there are no matches
                                break;
                            }
                            else if (completionOptions.length == 1) { // put the matching command into the buffer
                                //removes old buffer from canvas
                                this.removeString(this.buffer);
                                //changes new buffer to full command
                                this.buffer = completionOptions[0].command;
                                this.putText(this.buffer);
                                break;
                            }
                        }
                        // TODO: make tabing with arguments not go back to just the command
                    }
                }
                else if (chr === String.fromCharCode(38)) { // up arrow
                    if ((this.historyIndex <= (this.bufferHistory.length - 1)) && // the index is not the last
                        (this.bufferHistory.length > 1) && // there is a history
                        (this.historyIndex != 0)) { // the index is not the first
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
                }
                else if (chr === String.fromCharCode(40)) { //down arrow
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
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        };
        Console.prototype.putText = function (text) {
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
        };
        Console.prototype.removeChar = function (char) {
            // Used when removing a character from the canvas after the backspace button has been hit
            //move the cursor back
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
            this.currentXPosition = this.currentXPosition - offset;
            // remove char function
            _DrawingContext.eraseText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, char);
        };
        Console.prototype.removeString = function (string) {
            // removes a string from the canvas letter by letter
            // probably a much better way of doing this
            while (string.length > 0) {
                this.removeChar(string[string.length - 1]);
                string = string.slice(0, -1);
            }
        };
        Console.prototype.completionCheck = function (buffer, commandArray, index) {
            // returns an array of the commands with matching letter as the buffer in a given index
            var matchingCommands = [];
            for (var _i = 0, commandArray_1 = commandArray; _i < commandArray_1.length; _i++) {
                var sc = commandArray_1[_i];
                if (sc.command[index] == buffer[index]) {
                    matchingCommands[matchingCommands.length] = sc;
                }
            }
            return matchingCommands;
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            var lineHeight = _DefaultFontSize +
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
        };
        Console.prototype.RSOD = function () {
            //clear screen
            this.clearScreen();
            // make the screen red
            _DrawingContext.fillStyle = 'red';
            _DrawingContext.fillRect(0, 0, 500, 500); // Hard coding is not the best, but is DOM stuff in the OS any better?
            // _DrawingContext.fillRect(0, 0, document.getElementById("display").width, document.getElementById("display").height);
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
            }
            else {
                this.putText("Well this is embarrassing.");
                this.advanceLine();
                this.putText("We apologize for this inconvenience.");
            }
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
