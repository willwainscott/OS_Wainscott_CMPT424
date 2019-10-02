/* --------------

    pcb.ts

    Process Control Block used to store the information about the processes

   -------------- */

module TSOS {

    export class PCB {

        constructor(public PID: number        = _PCBList.length,  // Process ID
                    public PC: number         = 0,                //Process Counter
                    public IR: string         = "",               //IR? Specific op code that is being run
                    public ACC: number        = 0,                //Accumulator
                    public Xreg: number       = 0,                //X Register
                    public Yreg: number       = 0,                //Y Register
                    public Zflag: number      = 0,                //Z Flag
                    public state: string      = "Resident",       //State of the process
                    public location: string   = "Memory",         //Location (in memory/on the disk)
                    public section: string    = null) {           //The section of memory it is in (or on the hard drive)
        }

    }
}