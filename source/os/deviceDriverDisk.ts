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

        // formats the disk to all 00s
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

        // returns the file name from the data blocks
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

        public getAllFileNames() {
            var fileNameArray: string[] = [];
            var tempBlockArray: string[];
            var swapFile: boolean = false;
            for (var j = 0; j < _Disk.sectors; j++) {
                for (var k = 0; k < _Disk.blocks; k++) {
                    tempBlockArray = sessionStorage.getItem("0:" + j + ":" + k).split(",");
                    swapFile = (String.fromCharCode(Utils.hexStringToDecimal(tempBlockArray[4])) == "~"); //If its a swap file
                    if (tempBlockArray[0] == "1" && !swapFile) {
                        fileNameArray[fileNameArray.length] = this.getFileName(tempBlockArray);
                    }
                }
            }
            return fileNameArray;

        }

        // returns true if the file was created successfully, returns false if there was a duplicate file
        public createFile(fileName: String) {
            // Check for duplicate file names by using findFileTSB function
            if (this.findFileTSB(fileName) == null) {

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

                return true;
            } else {
                return false;
            }
        }

        public createSwapFile(PID, userDataArray: string[]) {
            // create a swap file name block
            if (this.createFile("~SwapFile " + PID)) {
                // Add 00s onto the end to take up the necessary space
                for (var i = userDataArray.length; i < 256; i++) {
                    userDataArray[userDataArray.length] = "00";
                }
                this.writeFile(this.findFileTSB("~SwapFile " + PID),userDataArray.join(), "swap");
            } else {
                console.log("Error, swap file already exists.");
            }

        }

        // returns the data of a process that is getting rolled in
        public getRollInData(PID: number) {
            // gets the data from the swap file
            var rollInNameTSB = this.findFileTSB("~SwapFile " + PID);
            var rollInData = this.readSwapFileData(rollInNameTSB);

            // deletes the swap file from the disk
            this.deleteFile(rollInNameTSB);

            return rollInData.slice(0,256);

        }

        public readFile(fileNameTSB: string) {
            // Used the Name TSB to get the first data TSB
            var nameTSBArray: string[] = sessionStorage.getItem(fileNameTSB).split(",");
            var dataTSBArray: string[] = sessionStorage.getItem(nameTSBArray[1] + ":" + nameTSBArray[2] + ":" + nameTSBArray[3]).split(",");

            return this.readFileData(dataTSBArray);

        }

        public readSwapFileData(fileNameTSB:string) {
            var swapFileData: string[] = [];
            var nameTSBArray: string[] = sessionStorage.getItem(fileNameTSB).split(",");
            var dataTSB: string = nameTSBArray[1] + ":" + nameTSBArray[2] + ":" + nameTSBArray[3]
            var dataTSBArray: string[] = sessionStorage.getItem(dataTSB).split(",");
            // Add the data to the array
            for (var i = 4; i < dataTSBArray.length; i++) {
                swapFileData[swapFileData.length] = dataTSBArray[i];
            }
            // Check for another data block
            var nextBlockTSB: string = dataTSBArray[1] + ":" + dataTSBArray[2] + ":" + dataTSBArray[3];
            // if there is a next block, hit me up with that sweet recursion
            if (!(nextBlockTSB == "FF:FF:FF")) {
                swapFileData = swapFileData.concat(this.readSwapFileData(dataTSB));
                return swapFileData;
            } else {
                return swapFileData;
            }
        }

        // returns the string that contains the data in a file
        public readFileData(fileArray: string[]){
            var fileData: string = "";
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
                return fileData;
            }
            // Note: if this works, this is something that I think is cool.
        }

        // write the data of a file based on what kind of file it is (swap file or other)
        public writeFile(fileNameTSB: string, userData: string, fileType: string) {
            // since write overwrites anything written in a file, we can just delete all the data blocks and start over so we don't have extra data blocks allocated
            this.deleteFileDataBlock(fileNameTSB);
            /* this way of doing it was Danny Grossman's idea (dgrossmann144 of GitHub), no code has been copied,
            and he gave me permission to use this method. What a cool guy.*/

            // get the block where the data will be stored
            var nameBlockArray = sessionStorage.getItem(fileNameTSB).split(",");
            var dataBlockTSB = nameBlockArray[1] + ":" + nameBlockArray[2] + ":" + nameBlockArray[3];

            // make the data block in use because we deleted all the previous blocks
            // Create an empty block array
            var emptyBlock: String[] = new Array(64);
            for (var i = 0; i < emptyBlock.length; i++) {
                if (i < 4) {
                    emptyBlock[i] = "0";
                } else {
                    emptyBlock[i] = "00"
                }
            }
            // and change used bit back to in use
            emptyBlock[0] = "1";
            sessionStorage.setItem(dataBlockTSB,emptyBlock.join());
            //if its a swap file, its already in hex so we dont need to convert it
            if (fileType == "swap") {
                // Write the hex to disk
                this.writeToDataBlocks(userData.split(","), dataBlockTSB);
            } else {
                // Create an array of hex pairs to add to the file
                var userDataArray: string[] = [];
                for(var i = 0; i < userData.length; i++) {
                    userDataArray[userDataArray.length] = Utils.decimalToHexString(userData.charCodeAt(i));
                }
                // Write to the actual data blocks
                this.writeToDataBlocks(userDataArray,dataBlockTSB);
            }
            Control.diskTableUpdate();
        }

        // writes the data given in an array to one or many data blocks depending on how much room is required
        public writeToDataBlocks(userDataArray: string[], dataBlockTSB: string) {

            // if we need more than one block for the file do some fancy recursion!
            if (userDataArray.length > 60) {
                var nextBlockTSB: string = this.firstAvailableDataTSB();
                // claim that block so the other blocks know its being used
                // Create an empty block array
                var emptyBlock: String[] = new Array(64);
                for (var i = 0; i < emptyBlock.length; i++) {
                    if (i < 4) {
                        emptyBlock[i] = "0";
                    } else {
                        emptyBlock[i] = "00"
                    }
                }
                // and change used bit back to in use
                emptyBlock[0] = "1";
                sessionStorage.setItem(nextBlockTSB,emptyBlock.join());

                var newUserDataArray = userDataArray.splice(0,60);
                this.writeToDataBlocks(userDataArray,nextBlockTSB);  // So much recursion! Very cool!
                // make the array of the data start with the used bit and the three digits of the next TSB
                var dataBlockArray: string[] = ["1",nextBlockTSB[0],nextBlockTSB[2], nextBlockTSB[4]];
                // then add the data from the userDataArray
                for (var i = 0; i < 60; i++){
                    dataBlockArray[dataBlockArray.length] = newUserDataArray[i];
                }
                // and put it into session storage
                sessionStorage.setItem(dataBlockTSB,dataBlockArray.join());
            } else {    //this happens if we dont need another data block
                // we add 00s to the end of the userDataArray to make sure it is the correct length
                for (var i = userDataArray.length; i < 60; i++) {
                    userDataArray[userDataArray.length] = "00";
                }
                // we then make the used bit and next TSB array
                var lastBlockArray = ["1","FF","FF","FF"];  // Used to add to the front of the userData
                // and store it in session storage by adding it to the front of the userData
                sessionStorage.setItem(dataBlockTSB, lastBlockArray.concat(userDataArray).join());
            }
        }

        public deleteFile(fileNameTSB: string) {
            // deletes both the data blocks and the name block
            this.deleteFileDataBlock(fileNameTSB);
            this.deleteFileNameBlock(fileNameTSB);
            // update the GUI
            Control.diskTableUpdate();
        }

        public deleteFileByName(fileName: string) {
            this.deleteFile(this.findFileTSB(fileName));
        }

        public deleteAllSwapFiles() {
            var tempBlockArray: string[];
            var tempBlockName: string;
            for (var j = 0; j < _Disk.sectors; j++){
                for (var k = 0; k < _Disk.blocks; k++) {
                    tempBlockArray = sessionStorage.getItem("0:" + j + ":" + k).split(",");
                    tempBlockName = this.getFileName(tempBlockArray);
                    if (tempBlockName[0] == "~") {
                        this.deleteFile(this.findFileTSB(tempBlockName));
                    }
                }
            }
        }

        // deletes the block that stores the file name
        public deleteFileNameBlock(fileNameTSB: string){
            var emptyBlock: String[] = new Array(64);
            for (var i = 0; i < emptyBlock.length; i++) {
                if (i < 4) {
                    emptyBlock[i] = "0";
                } else {
                    emptyBlock[i] = "00"
                }
            }
            sessionStorage.setItem(fileNameTSB, emptyBlock.join());
        }

        // deletes the block(s) that hold the file data
        public deleteFileDataBlock(fileNameTSB: string) {
            var nameBlockArray = sessionStorage.getItem(fileNameTSB).split(",");
            var dataBlockTSB = nameBlockArray[1] + ":" + nameBlockArray[2] + ":" + nameBlockArray[3];
            var dataBlockArray = sessionStorage.getItem(dataBlockTSB).split(",");
            var nextBlockTSB = dataBlockArray[1] + ":" + dataBlockArray[2] + ":" + dataBlockArray[3];
            if (nextBlockTSB != "FF:FF:FF"){
                this.deleteFileDataBlock(dataBlockTSB);  // More recursion??? Man this guys is on fire!
            }
            var emptyBlock: String[] = new Array(64);
            for (var i = 0; i < emptyBlock.length; i++) {
                if (i < 4) {
                    emptyBlock[i] = "0";
                } else {
                    emptyBlock[i] = "00"
                }
            }
            sessionStorage.setItem(dataBlockTSB, emptyBlock.join());

        }

    }

}