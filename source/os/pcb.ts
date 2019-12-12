/* --------------

    pcb.ts

    Process Control Block used to store the information about the processes

   -------------- */

module TSOS {

    export class PCB {

        constructor(public PID: number          = 0,                // Process ID
                    public PC: number           = 0,                //Process Counter
                    public IR: string           = "",               //IR? Specific op code that is being run
                    public ACC: number          = 0,                //Accumulator
                    public Xreg: number         = 0,                //X Register
                    public Yreg: number         = 0,                //Y Register
                    public Zflag: number        = 0,                //Z Flag
                    public state: string        = "Resident",       //State of the process
                    public location: string     = "",               //Location (in memory/on the disk)
                    public section: string      = "",               //The section of memory it is in (or on the hard drive)
                    public quantaRun: number    = 0,                //The number of times the process is run relative to the quanta in Round Robin
                    public priority: number     = 10,               //The priority used for priority scheduling
                    public timesSwapped: number = 0) {              //The number of times a process has bee swapped out (used for swapping)
        }

    }
}