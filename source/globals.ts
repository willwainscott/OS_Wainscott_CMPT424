/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in our text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
const APP_NAME: string    = "NASOS";   // Not a Simulation Operating System? Note: I hope changing this doesn't break everything that uses TSOS
const APP_VERSION: string = "0.4";   // I assume this will be always updated and completely accurate

const CPU_CLOCK_INTERVAL: number = 100;   // This is in ms (milliseconds) so 1000 = 1 second.

const TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                              // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ: number = 1;
const SYSTEM_CALL_IRQ: number = 2;
const PROCESS_BREAK_IRQ: number = 3;
const CONTEXT_SWITCH_IRQ: number = 4;


//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _Memory: TSOS.Memory;
var _MemoryAccessor: TSOS.MemoryAccessor;
var _Disk: TSOS.Disk;
var _DiskFormatted: boolean = false;

var _MemoryManager: any = null;
var _Scheduler: any = null;
var _SchedulingAlgorithm: string = "Round Robin"; // Scheduling algorithm, defaulted to RoundRobin
var _RRQuantum: number = 6;     // Default Round Robin Scheduling Quantum
var _TempQuantum: number = null; // Used to store the quantum if the algorithm is changed to fcfs

var _PCBList: TSOS.PCB[] = [];
var _CurrentPCB: TSOS.PCB = null;
var _ReadyPCBList: TSOS.PCB[] = [];
var _PIDCounter: number = 0;

var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

var _Canvas: HTMLCanvasElement;          // Initialized in Control.hostInit().
var _DrawingContext: any;                // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily: string = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize: number = 13;
var _FontHeightMargin: number = 4;       // Additional space added to font size when advancing a line.

var _Trace: boolean = true;              // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue: TSOS.Queue = null;
var _KernelInputQueue: TSOS.Queue = null; 
var _KernelBuffers = null; 

// Standard input and output
var _StdIn:  TSOS.Console = null; 
var _StdOut: TSOS.Console = null;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver: TSOS.DeviceDriverKeyboard = null;
var _krnDiskDriver: TSOS.DeviceDriverDisk = null;

var _hardwareClockID: number = null;

var _UserCodeTextArea: HTMLTextAreaElement; // Used to store user code entered into the text area

var _SingleStep: boolean = false;       // Based on whether or not the user wants to go step by step
var _GoNextStep: boolean = false;       // Is false until the user clicks the step next button, then which it turns true and allows one cycle

// For testing (and enrichment)...
var Glados: any = null;  // This is the function Glados() in glados-ip*.js http://alanclasses.github.io/TSOS/test/ .
var _GLaDOS: any = null; // If the above is linked in, this is the instantiated instance of Glados.

var onDocumentLoad = function() {
	TSOS.Control.hostInit();
};
