/* ------------------------------------

    disk.ts

    The hardware disk where files are stored.

   ------------------------------------  */
var TSOS;
(function (TSOS) {
    var Disk = /** @class */ (function () {
        function Disk() {
            this.tracks = 4;
            this.sectors = 8;
            this.blocks = 8;
            this.blockSize = 64;
        }
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
