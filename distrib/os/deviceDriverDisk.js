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
        // formats the disk to all 00s
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
        // Track 1(technically track 0) is used for file names only, and tracks 2-4(technically tracks 1-3) are used for file data, hence the two find functions
        // returns the array for the next available name TSB
        DeviceDriverDisk.prototype.firstAvailableNameTSB = function () {
            var dataArray;
            for (var j = 0; j < _Disk.sectors; j++) {
                for (var k = 1; k < _Disk.blocks; k++) { // We start at one to not override the Master Boot Record, which doesnt do anything in out OS but good practice to not override it
                    dataArray = sessionStorage.getItem("0:" + j + ":" + k).split(",");
                    if (dataArray[0] == "0") {
                        return "0:" + j + ":" + k;
                        break;
                    }
                }
            }
        };
        // returns the array for the next available data TSB
        DeviceDriverDisk.prototype.firstAvailableDataTSB = function () {
            var dataArray;
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
        };
        // Used to find the TSB of the name block of a given file
        DeviceDriverDisk.prototype.findFileTSB = function (fileName) {
            var dataArray;
            var dataName;
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
        };
        // returns the file name from the data blocks
        DeviceDriverDisk.prototype.getFileName = function (dataArray) {
            var fileName = "";
            for (var w = 4; w < dataArray.length; w++) {
                if (dataArray[w] == "00") {
                    return fileName;
                }
                else {
                    fileName += String.fromCharCode(TSOS.Utils.hexStringToDecimal(dataArray[w]));
                }
            }
            return fileName;
        };
        DeviceDriverDisk.prototype.getAllFileNames = function () {
            var fileNameArray = [];
            var tempBlockArray;
            var swapFile = false;
            for (var j = 0; j < _Disk.sectors; j++) {
                for (var k = 0; k < _Disk.blocks; k++) {
                    tempBlockArray = sessionStorage.getItem("0:" + j + ":" + k).split(",");
                    swapFile = (String.fromCharCode(TSOS.Utils.hexStringToDecimal(tempBlockArray[4])) == "~"); //If its a swap file
                    if (tempBlockArray[0] == "1" && !swapFile) {
                        fileNameArray[fileNameArray.length] = this.getFileName(tempBlockArray);
                    }
                }
            }
            return fileNameArray;
        };
        // returns true if the file was created successfully, returns false if there was a duplicate file
        DeviceDriverDisk.prototype.createFile = function (fileName) {
            // Check for duplicate file names by using findFileTSB function
            if (this.findFileTSB(fileName) == null) {
                // Get the Name and Data TSBs
                var nameTSB = this.firstAvailableNameTSB();
                var dataTSB = this.firstAvailableDataTSB();
                var nameTSBArray = sessionStorage.getItem(nameTSB).split(",");
                var dataTSBArray = sessionStorage.getItem(dataTSB).split(",");
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
                    nameTSBArray[i + 4] = TSOS.Utils.decimalToHexString(fileName.charCodeAt(i));
                }
                // Save the arrays back into the session storage
                console.log(nameTSBArray);
                sessionStorage.setItem(nameTSB, nameTSBArray.join());
                sessionStorage.setItem(dataTSB, dataTSBArray.join());
                TSOS.Control.diskTableUpdate();
                return true;
            }
            else {
                return false;
            }
        };
        DeviceDriverDisk.prototype.createSwapFile = function (PID, userDataArray) {
            // create a swap file name block
            if (this.createFile("~SwapFile " + PID)) {
                // Add 00s onto the end to take up the necessary space
                for (var i = userDataArray.length; i < 256; i++) {
                    userDataArray[userDataArray.length] = "00";
                }
                this.writeFile(this.findFileTSB("~SwapFile " + PID), userDataArray.join(), "swap");
            }
            else {
                console.log("Error, swap file already exists.");
            }
        };
        // returns the data of a process that is getting rolled in
        DeviceDriverDisk.prototype.getRollInData = function (PID) {
            // gets the data from the swap file
            var rollInNameTSB = this.findFileTSB("~SwapFile " + PID);
            var rollInData = this.readSwapFileData(rollInNameTSB);
            // deletes the swap file from the disk
            this.deleteFile(rollInNameTSB);
            return rollInData.slice(0, 256);
        };
        DeviceDriverDisk.prototype.readFile = function (fileNameTSB) {
            // Used the Name TSB to get the first data TSB
            var nameTSBArray = sessionStorage.getItem(fileNameTSB).split(",");
            var dataTSBArray = sessionStorage.getItem(nameTSBArray[1] + ":" + nameTSBArray[2] + ":" + nameTSBArray[3]).split(",");
            return this.readFileData(dataTSBArray);
        };
        DeviceDriverDisk.prototype.readSwapFileData = function (fileNameTSB) {
            var swapFileData = [];
            var nameTSBArray = sessionStorage.getItem(fileNameTSB).split(",");
            var dataTSB = nameTSBArray[1] + ":" + nameTSBArray[2] + ":" + nameTSBArray[3];
            var dataTSBArray = sessionStorage.getItem(dataTSB).split(",");
            // Add the data to the array
            for (var i = 4; i < dataTSBArray.length; i++) {
                swapFileData[swapFileData.length] = dataTSBArray[i];
            }
            // Check for another data block
            var nextBlockTSB = dataTSBArray[1] + ":" + dataTSBArray[2] + ":" + dataTSBArray[3];
            // if there is a next block, hit me up with that sweet recursion
            if (!(nextBlockTSB == "FF:FF:FF")) {
                swapFileData = swapFileData.concat(this.readSwapFileData(dataTSB));
                return swapFileData;
            }
            else {
                return swapFileData;
            }
        };
        // returns the string that contains the data in a file
        DeviceDriverDisk.prototype.readFileData = function (fileArray) {
            var fileData = "";
            for (var i = 4; i < fileArray.length; i++) {
                if (fileArray[i] == "00") {
                    return fileData;
                }
                else {
                    fileData += String.fromCharCode(TSOS.Utils.hexStringToDecimal(fileArray[i]));
                }
            }
            // Some fancy recursion
            var nextBlockTSB = fileArray[1] + ":" + fileArray[2] + ":" + fileArray[3];
            if (nextBlockTSB == "FF:FF:FF") {
                return fileData;
            }
            else {
                fileData += this.readFileData(sessionStorage.getItem(nextBlockTSB).split(","));
                return fileData;
            }
            // Note: if this works, this is something that I think is cool.
        };
        // write the data of a file based on what kind of file it is (swap file or other)
        DeviceDriverDisk.prototype.writeFile = function (fileNameTSB, userData, fileType) {
            // since write overwrites anything written in a file, we can just delete all the data blocks and start over so we don't have extra data blocks allocated
            this.deleteFileDataBlock(fileNameTSB);
            /* this way of doing it was Danny Grossman's idea (dgrossmann144 of GitHub), no code has been copied,
            and he gave me permission to use this method. What a cool guy.*/
            // get the block where the data will be stored
            var nameBlockArray = sessionStorage.getItem(fileNameTSB).split(",");
            var dataBlockTSB = nameBlockArray[1] + ":" + nameBlockArray[2] + ":" + nameBlockArray[3];
            // make the data block in use because we deleted all the previous blocks
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
            // and change used bit back to in use
            emptyBlock[0] = "1";
            sessionStorage.setItem(dataBlockTSB, emptyBlock.join());
            //if its a swap file, its already in hex so we dont need to convert it
            if (fileType == "swap") {
                // Write the hex to disk
                this.writeToDataBlocks(userData.split(","), dataBlockTSB);
            }
            else {
                // Create an array of hex pairs to add to the file
                var userDataArray = [];
                for (var i = 0; i < userData.length; i++) {
                    userDataArray[userDataArray.length] = TSOS.Utils.decimalToHexString(userData.charCodeAt(i));
                }
                // Write to the actual data blocks
                this.writeToDataBlocks(userDataArray, dataBlockTSB);
            }
            TSOS.Control.diskTableUpdate();
        };
        // writes the data given in an array to one or many data blocks depending on how much room is required
        DeviceDriverDisk.prototype.writeToDataBlocks = function (userDataArray, dataBlockTSB) {
            // if we need more than one block for the file do some fancy recursion!
            if (userDataArray.length > 60) {
                var nextBlockTSB = this.firstAvailableDataTSB();
                // claim that block so the other blocks know its being used
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
                // and change used bit back to in use
                emptyBlock[0] = "1";
                sessionStorage.setItem(nextBlockTSB, emptyBlock.join());
                var newUserDataArray = userDataArray.splice(0, 60);
                this.writeToDataBlocks(userDataArray, nextBlockTSB); // So much recursion! Very cool!
                // make the array of the data start with the used bit and the three digits of the next TSB
                var dataBlockArray = ["1", nextBlockTSB[0], nextBlockTSB[2], nextBlockTSB[4]];
                // then add the data from the userDataArray
                for (var i = 0; i < 60; i++) {
                    dataBlockArray[dataBlockArray.length] = newUserDataArray[i];
                }
                // and put it into session storage
                sessionStorage.setItem(dataBlockTSB, dataBlockArray.join());
            }
            else { //this happens if we dont need another data block
                // we add 00s to the end of the userDataArray to make sure it is the correct length
                for (var i = userDataArray.length; i < 60; i++) {
                    userDataArray[userDataArray.length] = "00";
                }
                // we then make the used bit and next TSB array
                var lastBlockArray = ["1", "FF", "FF", "FF"]; // Used to add to the front of the userData
                // and store it in session storage by adding it to the front of the userData
                sessionStorage.setItem(dataBlockTSB, lastBlockArray.concat(userDataArray).join());
            }
        };
        DeviceDriverDisk.prototype.deleteFile = function (fileNameTSB) {
            // deletes both the data blocks and the name block
            this.deleteFileDataBlock(fileNameTSB);
            this.deleteFileNameBlock(fileNameTSB);
            // update the GUI
            TSOS.Control.diskTableUpdate();
        };
        DeviceDriverDisk.prototype.deleteFileByName = function (fileName) {
            this.deleteFile(this.findFileTSB(fileName));
        };
        DeviceDriverDisk.prototype.deleteAllSwapFiles = function () {
            var tempBlockArray;
            var tempBlockName;
            for (var j = 0; j < _Disk.sectors; j++) {
                for (var k = 0; k < _Disk.blocks; k++) {
                    tempBlockArray = sessionStorage.getItem("0:" + j + ":" + k).split(",");
                    tempBlockName = this.getFileName(tempBlockArray);
                    if (tempBlockName[0] == "~") {
                        this.deleteFile(this.findFileTSB(tempBlockName));
                    }
                }
            }
        };
        // deletes the block that stores the file name
        DeviceDriverDisk.prototype.deleteFileNameBlock = function (fileNameTSB) {
            var emptyBlock = new Array(64);
            for (var i = 0; i < emptyBlock.length; i++) {
                if (i < 4) {
                    emptyBlock[i] = "0";
                }
                else {
                    emptyBlock[i] = "00";
                }
            }
            sessionStorage.setItem(fileNameTSB, emptyBlock.join());
        };
        // deletes the block(s) that hold the file data
        DeviceDriverDisk.prototype.deleteFileDataBlock = function (fileNameTSB) {
            var nameBlockArray = sessionStorage.getItem(fileNameTSB).split(",");
            var dataBlockTSB = nameBlockArray[1] + ":" + nameBlockArray[2] + ":" + nameBlockArray[3];
            var dataBlockArray = sessionStorage.getItem(dataBlockTSB).split(",");
            var nextBlockTSB = dataBlockArray[1] + ":" + dataBlockArray[2] + ":" + dataBlockArray[3];
            if (nextBlockTSB != "FF:FF:FF") {
                this.deleteFileDataBlock(dataBlockTSB); // More recursion??? Man this guys is on fire!
            }
            var emptyBlock = new Array(64);
            for (var i = 0; i < emptyBlock.length; i++) {
                if (i < 4) {
                    emptyBlock[i] = "0";
                }
                else {
                    emptyBlock[i] = "00";
                }
            }
            sessionStorage.setItem(dataBlockTSB, emptyBlock.join());
        };
        return DeviceDriverDisk;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
