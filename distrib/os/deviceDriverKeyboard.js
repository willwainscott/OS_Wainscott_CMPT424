/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = /** @class */ (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            _super.call(this) || this;
            _this.driverEntry = _this.krnKbdDriverEntry;
            _this.isr = _this.krnKbdDispatchKeyPress;
            return _this;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                }
                else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 32) || // space
                (keyCode == 13)) { // enter
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 48) && (keyCode <= 57)) { //numbers and their shifted characters
                if (isShifted) {
                    switch (keyCode) {
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
                }
                else {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 186) && (keyCode <= 192)) || //special characters and stuff
                ((keyCode >= 219) && (keyCode <= 222))) { //more special stuff
                switch (keyCode) {
                    case 186:
                        if (isShifted) {
                            chr = ":";
                        }
                        else {
                            chr = ";";
                        }
                        break;
                    case 187:
                        if (isShifted) {
                            chr = "+";
                        }
                        else {
                            chr = "=";
                        }
                        break;
                    case 188:
                        if (isShifted) {
                            chr = "<";
                        }
                        else {
                            chr = ",";
                        }
                        break;
                    case 189:
                        if (isShifted) {
                            chr = "_";
                        }
                        else {
                            chr = "-";
                        }
                        break;
                    case 190:
                        if (isShifted) {
                            chr = ">";
                        }
                        else {
                            chr = ".";
                        }
                        break;
                    case 191:
                        if (isShifted) {
                            chr = "?";
                        }
                        else {
                            chr = "/";
                        }
                        break;
                    case 192:
                        if (isShifted) {
                            chr = "~";
                        }
                        else {
                            chr = "`";
                        }
                        break;
                    case 219:
                        if (isShifted) {
                            chr = "{";
                        }
                        else {
                            chr = "[";
                        }
                        break;
                    case 220:
                        if (isShifted) {
                            chr = "|";
                        }
                        else {
                            chr = "\\";
                        }
                        break;
                    case 221:
                        if (isShifted) {
                            chr = "}";
                        }
                        else {
                            chr = "]";
                        }
                        break;
                    case 222:
                        if (isShifted) {
                            chr = "\"";
                        }
                        else {
                            chr = "'";
                        }
                        break;
                }
                _KernelInputQueue.enqueue(chr);
            }
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
