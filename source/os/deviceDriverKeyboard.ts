/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) { 
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                } else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode == 32)  ||   // space
                       (keyCode == 13)  ||   // enter
                       (keyCode == 8)   ||   // backspace
                       (keyCode == 9)   ||   // tab
                       // W TODO: move up and down to their own else if statments to fix error
                       (keyCode == 38)  ||   // up arrow
                       (keyCode == 40)) {    // down arrow
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode >= 48) && (keyCode <= 57)) { //numbers and their shifted characters
                if (isShifted){
                    switch(keyCode){
                        case 48:
                            chr = ")";
                            break;
                        case 49:
                            chr = "!";
                            break;
                        case 50:
                            chr = "@";
                            break;
                        case 51:
                            chr = "#";
                            break;
                        case 52:
                            chr = "$";
                            break;
                        case 53:
                            chr = "%";
                            break;
                        case 54:
                            chr = "^";
                            break;
                        case 55:
                            chr = "&";
                            break;
                        case 56:
                            chr = "*";
                            break;
                        case 57:
                            chr = "(";
                            break;
                    }
                } else {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            } else if ( ((keyCode >= 186) && (keyCode <= 192)) ||  //special characters and stuff
                        ((keyCode >= 219) && (keyCode <= 222)) ) {    //more special stuff
                switch (keyCode) {
                    case 186:
                        if (isShifted) {
                            chr = ":";
                        } else {
                            chr = ";";
                        }
                        break;
                    case 187:
                        if (isShifted) {
                            chr = "+";
                        } else {
                            chr = "=";
                        }
                        break;
                    case 188:
                        if (isShifted) {
                            chr = "<";
                        } else {
                            chr = ",";
                        }
                        break;
                    case 189:
                        if (isShifted) {
                            chr = "_";
                        } else {
                            chr = "-";
                        }
                        break;
                    case 190:
                        if (isShifted) {
                            chr = ">";
                        } else {
                            chr = ".";
                        }
                        break;
                    case 191:
                        if (isShifted) {
                            chr = "?";
                        } else {
                            chr = "/";
                        }
                        break;
                    case 192:
                        if (isShifted) {
                            chr = "~";
                        } else {
                            chr = "`";
                        }
                        break;
                    case 219:
                        if (isShifted) {
                            chr = "{";
                        } else {
                            chr = "[";
                        }
                        break;
                    case 220:
                        if (isShifted) {
                            chr = "|";
                        } else {
                            chr = "\\";
                        }
                        break;
                    case 221:
                        if (isShifted) {
                            chr = "}";
                        } else {
                            chr = "]";
                        }
                        break;
                    case 222:
                        if (isShifted) {
                            chr = "\"";
                        } else {
                            chr = "'";
                        }
                        break;
                }
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
}
