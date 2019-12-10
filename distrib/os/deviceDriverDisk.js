/*  ----------------------------------
    deviceDriverDisk.ts

    The driver for our disk file system

    ----------------------------------  */
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
    var DeviceDriverDisk = /** @class */ (function (_super) {
        __extends(DeviceDriverDisk, _super);
        function DeviceDriverDisk() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            _super.call(this) || this;
            _this.driverEntry = _this.krnDiskDriverEntry;
            return _this;
        }
        DeviceDriverDisk.prototype.krnDiskDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverDisk.prototype.formatDisk = function () {
            // Create an empty block array
            var emptyBlock = new Array(64);
            for (var i = 0; i < emptyBlock.length; i++) {
                if (i < 4) {
                    emptyBlock[i] = "0";
                }
                else {
                    emptyBlock[i] = "00";
                }
            }
            // Assign each TSB with the empty block
            for (var i = 0; i < _Disk.tracks; i++) {
                for (var j = 0; j < _Disk.sectors; j++) {
                    for (var k = 0; k < _Disk.blocks; k++) {
                        sessionStorage.setItem(i + ":" + j + ":" + k, emptyBlock.join());
                    }
                }
            }
            TSOS.Control.diskTableUpdate();
        };
        return DeviceDriverDisk;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
