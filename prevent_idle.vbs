Set WshShell = CreateObject("WScript.Shell")
Set objShell = CreateObject("Shell.Application")

' Get a reference to the current window
WshShell.AppActivate "Electron"
WScript.Sleep 200

' Switch to next window using Windows+Tab (more controlled than Alt+Tab)
WshShell.SendKeys "^{ESC}"  ' Open Start Menu
WScript.Sleep 1000
WshShell.SendKeys "{ESC}"   ' Close Start Menu
WScript.Sleep 500

' Press Ctrl+Tab for tab switching
WshShell.SendKeys "^{TAB}"
WScript.Sleep 3000  ' Wait 3 seconds in the switched tab

' Press Ctrl+Tab again to return
WshShell.SendKeys "^{TAB}"
WScript.Sleep 1000  ' Wait 1 second after returning

' Press NumLock for good measure
WshShell.SendKeys "{NUMLOCK}"
WScript.Sleep 100
WshShell.SendKeys "{SCROLLLOCK}"
WScript.Sleep 100
WshShell.SendKeys "{NUMLOCK}"

' Ensure we're back to the original window
WshShell.AppActivate "Electron"
