/* --------------

    pcb.ts

    Process Control Block used to store the information about the processes

   -------------- */

module TSOS {

    export class PCB {

        constructor(public PID: Number      = _PCBList.length,  // Process ID
                    public PC: Number       = 0,                //Process Counter
                    public IR: String       = "",               //IR? Specific command that is being run
                    public ACC: Number      = 0,                //Accumulator
                    public X: Number        = 0,                //X Register
                    public Y: Number        = 0,                //Y Register
                    public Z: Number        = 0,                //Z Flag
                    public state: String    = "New",            //State of the process
                    public location: String = "Memory") {       //Location (in memory/on the disk)
        }

    }
}