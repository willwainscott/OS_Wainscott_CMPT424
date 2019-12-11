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
        // Used to find the TSB of the name block of a given file
        public findFileTSB(fileName: String) {
            var dataArray: string[];
            var dataName: string;
            for (var j = 0; j < _Disk.sectors; j++) {
                for (var k = 0; k < _Disk.sectors; k++) {
                    dataArray = sessionStorage.getItem("0:" + j + ":" + k).split(",");
                    dataName = this.getFileName(dataArray);
                    if (dataName == fileName) {
                        return "0:" + j + ":" + k;
                    }
                }
            }
            // if we get here we didn't find the file, so ...
            return null;
        }

        public getFileName(dataArray: string[]) {
            var fileName: string = "";
            for(var w = 4; w < dataArray.length; w++) {
                if (dataArray[w] == "00"){
                    return fileName;
                } else {
                    fileName += String.fromCharCode(Utils.hexStringToDecimal(dataArray[w]));
                }
            }
            return fileName;
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

            // Make the next data File next bits FF:FF:FF to denote it is the last block for that file
            dataTSBArray[1] = "FF";
            dataTSBArray[2] = "FF";
            dataTSBArray[3] = "FF";

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

        public readFile(fileNameTSB: string) {
            // Used the Name TSB to get the first data TSB
            var nameTSBArray: string[] = sessionStorage.getItem(fileNameTSB).split(",");
            var dataTSBArray: string[] = sessionStorage.getItem(nameTSBArray[1] + ":" + nameTSBArray[2] + ":" + nameTSBArray[3]).split(",");

            return this.readFileData(dataTSBArray);

        }

        public readFileData(fileArray: string[]){
            var fileData: string = null;
            for (var i = 4; i < fileArray.length; i++) {
                if (fileArray[i] == "00"){
                    return fileData;
                } else {
                    fileData += String.fromCharCode(Utils.hexStringToDecimal(fileArray[i]));
                }
            }
            // Some fancy recursion
            var nextBlockTSB = fileArray[1] + ":" + fileArray[2] + ":" + fileArray[3];
            if (nextBlockTSB == "FF:FF:FF"){
                return fileData;
            } else {
                fileData += this.readFileData(sessionStorage.getItem(nextBlockTSB).split(","));
            }
            // Note: if this works, this is something that I think is cool.
        }

    }

}