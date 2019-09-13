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

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
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
                    // TODO: make tabing with arguments not go back to just the command
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
            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            // TODO: Handle scrolling. (iProject 1)

            if (this.currentYPosition > _Canvas.height) {

                console.log("too far");

                //Take image of canvas, shift it up some amount specified by the margins and stuff

            }
        }
    }
 }
