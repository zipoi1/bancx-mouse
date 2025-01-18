#SingleInstance Force
#NoEnv
SetWorkingDir %A_ScriptDir%

if (A_Args.Length() < 1) {
    ExitApp
}

action := A_Args[1]

if (action = "mouse") {
    ; Get current mouse position
    MouseGetPos, xpos, ypos
    
    ; Calculate new position (random movement between -100 and 100 pixels)
    Random, move_x, -100, 100
    Random, move_y, -100, 100
    
    ; Move mouse
    MouseMove, % xpos + move_x, % ypos + move_y, 10
    
    FileAppend, Moved mouse from (%xpos%`,%ypos%) to (%xpos + move_x%`,%ypos + move_y%), *
}
else if (action = "key") {
    ; Press and release Ctrl key
    Send, {Ctrl down}
    Sleep 100
    Send, {Ctrl up}
    
    FileAppend, Pressed and released Control key, *
}
else if (action = "scroll") {
    ; Scroll up and down
    Send {WheelUp}
    Sleep 100
    Send {WheelDown}
    
    FileAppend, Performed scroll action, *
}

ExitApp
