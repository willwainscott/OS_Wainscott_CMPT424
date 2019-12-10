/*  ----------------------------------
    deviceDriverDisk.ts

    The driver for our disk file system

    ----------------------------------  */

module TSOS {

    export class DeviceDriverDisk extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnDiskDriverEntry;
        }

        public krnDiskDriverEntry() {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
            // More?
        }

        public formatDisk() {
            // Create an empty block array
            var emptyBlock: string[] = new Array(64);
            for (var i = 0; i < emptyBlock.length; i++) {
                if (i < 4) {
                    emptyBlock[i] = "0";
                } else {
                    emptyBlock[i] = "00"
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

        }

    }

}