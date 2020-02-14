
# OSWainscott_CMPT424

This is all of my work for my Fall 2019 Operating Systems class at Marist College.

The starting code was provided to us from https://github.com/AlanClasses/TSOS-2019

You can see a working version of the operating system at http://www.labouseur.com/commondocs/operating-systems/NASOS/index.html

I used TypeScript to create a working operating system that runs in the web browser. Each of the physical components are simulated through the browser session storage for memory.


The list of commands for my OS are:

ver - shows the current cersion of the OS.

help - shows the full list of commands (Note: hard to use because no way to scroll back up on the cli. Maybe a future feature?).

shutdown - shuts down the virtual OS.

cls - clears the screen and resets cursor position.

man <topic> - Displays the MANual page for a specific command, giving the user more information on how it is used and what it does.

trace <on|off> - Turns the OS trace on or off.

rot13 <string> - Does rot13 on a given string (replaces the letter with the one 13 places away from it).

prompt <string> - changes the CLI prompt.

date - displays the current date and time.

whereami - tells the user where they are.

pill <red|blue> - allows the user to take the red or blue pill, the choice is yours.

status <string> - changes the status message on the OS.

error - simulates an OS error, blows up.

load <priority> - load a program into memory with an optional priority used for priority scheduling.

run <PID> - runs a specific loaded program.

runall - runs all of the loaded progrmas at the same time!

clearmem - clears all of the memory.

ps - displays the PID and state of the running processes.

kill <id> - kills a specifc running process.

killall - kills all running processes.

quantum - changes the round robin quantum for round robin scheduling.

setschedule <rr|fcfs|priority> - changes the scheduling algorithm to round robin, first come first serve, or priority.

getschedule - returns the current scheduling algorithm.

format - formats the disk for virtual memeory swapping. 

create <filename> - creates a file with a given filename.

read <filename> - reads the contents of a given file.

write <filename> "data" - writes the data in double quotes to a given file.

delete <filename> - deletes a given file. 

ls - lists all of the files on the disk. 
