/* --------------

    pcb.ts

    Process Control Block used to store the information about the processes

   -------------- */

module TSOS {

    export class PCB {

        constructor(public PID: Number,  // Process ID
                    public PC: Number,  //Process Counter
                    public IR: Number,  //IR? Specific command that is being run
                    public ACC: Number, //Accumulator
                    public X: Number,   //X Register
                    public Y: Number,   //Y Register
                    public Z: Number,   //Z Flag
                    public state: String,   //State of the process
                    public location: String) {  //Location (in memory/on the disk)
        }

    }
}