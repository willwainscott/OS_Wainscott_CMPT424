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
            var emptyBlock: String[] = new Array(64);
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
            Control.diskTableUpdate();

        }

        // Track 1(technically track 0) is used for file names only, and tracks 2-4(technically tracks 1-3) are used for file data, hence the two find functions

        // returns the array for the next available name TSB
        public firstAvailableNameTSB() {
            var dataArray: string[];
            for (var j = 0; j < _Disk.sectors; j++) {
                for (var k = 1; k < _Disk.blocks; k++) {    // We start at one to not override the Master Boot Record, which doesnt do anything in out OS but good practice to not override it
                    dataArray = sessionStorage.getItem("0:" + j + ":" + k).split(",");
                    if (dataArray[0] == "0") {
                        return "0:" + j + ":" + k;
                        break;
                    }
                }
            }
        }

        // returns the array for the next available data TSB
        public firstAvailableDataTSB() {
            var dataArray: string[];
            for (var i = 1; i < _Disk.tracks; i++) {
                for (var j = 0; j < _Disk.sectors; j++) {
                    for (var k = 0; k < _Disk.sectors; k++) {
                        dataArray = sessionStorage.getItem(i + ":" + j + ":" + k).split(",");
                        if (dataArray[0] == "0") {
                            return i + ":" + j + ":" + k;
                            break;
                        }
                    }
                }
            }
        }

        public createFile(fileName: String) {
            // W TODO Check for duplicate file names by using findFile function

            // Get the Name and Data TSBs
            var nameTSB:string = this.firstAvailableNameTSB();
            var dataTSB:string = this.firstAvailableDataTSB();
            var nameTSBArray: string[] = sessionStorage.getItem(nameTSB).split(",");
            var dataTSBArray: string[] = sessionStorage.getItem(dataTSB).split(",");

            // Assign their used bits to 1 to show they are being used
            nameTSBArray[0] = "1";
            dataTSBArray[0] = "1";

            // Make the data the next TSB in the name
            nameTSBArray[1] = dataTSB[0];
            nameTSBArray[2] = dataTSB[2];
            nameTSBArray[3] = dataTSB[4];

            // Enter the file name into the nameTSB Data section
            for (var i = 0; i < fileName.length; i++) {
                nameTSBArray[i + 4] = Utils.decimalToHexString(fileName.charCodeAt(i));
            }

            // Save the arrays back into the session storage
            console.log(nameTSBArray);
            sessionStorage.setItem(nameTSB, nameTSBArray.join());
            sessionStorage.setItem(dataTSB, dataTSBArray.join());

            Control.diskTableUpdate();
        }

    }

}