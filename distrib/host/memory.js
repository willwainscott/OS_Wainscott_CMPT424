var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            this.memoryArray = new Array(768);
            this.sectionOneBase = 0;
            this.sectionOneLimit = 255;
            this.sectionTwoBase = 256;
            this.sectionTwoLimit = 511;
            this.sectionThreeBase = 512;
            this.sectionThreeLimit = 767;
        }
        Memory.prototype.init = function () {
            // initialize the memory as all "00"
            for (var i = 0; i < this.memoryArray.length; i++) {
                this.memoryArray[i] = "00";
            }
        };
        Memory.prototype.getBaseBySection = function (section) {
            switch (section) {
                case "1":
                    return this.sectionOneBase;
                    break;
                case "2":
                    return this.sectionTwoBase;
                    break;
                case "3":
                    return this.sectionThreeBase;
                    break;
                case "all":
                    return this.sectionOneBase;
                    break;
                default:
                    console.log("Invalid section number when calling Memory.getBaseBySection()");
            }
        };
        Memory.prototype.getLimitBySection = function (section) {
            switch (section) {
                case "1":
                    return this.sectionOneLimit;
                    break;
                case "2":
                    return this.sectionTwoLimit;
                    break;
                case "3":
                    return this.sectionThreeLimit;
                    break;
                case "all":
                    return this.sectionThreeLimit;
                    break;
                default:
                    console.log(section);
                    console.log("Invalid section number when calling Memory.getLimitBySection()");
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
