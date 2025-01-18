!include "MUI2.nsh"
!include "FileFunc.nsh"

Name "Bancx Mouse"
OutFile "BancxMouseInstaller.exe"
InstallDir "$PROGRAMFILES\Bancx Mouse"
RequestExecutionLevel admin

!define MUI_ICON "assets\icon.ico"
!define MUI_UNICON "assets\icon.ico"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "MainSection" SEC01
    SetOutPath "$INSTDIR"
    SetOverwrite on
    File /r "dist\win-unpacked\*.*"
    
    CreateDirectory "$SMPROGRAMS\Bancx Mouse"
    CreateShortCut "$SMPROGRAMS\Bancx Mouse\Bancx Mouse.lnk" "$INSTDIR\Bancx Mouse.exe"
    CreateShortCut "$DESKTOP\Bancx Mouse.lnk" "$INSTDIR\Bancx Mouse.exe"
    
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BancxMouse" \
                     "DisplayName" "Bancx Mouse"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BancxMouse" \
                     "UninstallString" "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Uninstall"
    Delete "$INSTDIR\*.*"
    Delete "$SMPROGRAMS\Bancx Mouse\*.*"
    Delete "$DESKTOP\Bancx Mouse.lnk"
    
    RMDir "$SMPROGRAMS\Bancx Mouse"
    RMDir "$INSTDIR"
    
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\BancxMouse"
SectionEnd

Function .onInstSuccess
    Exec '"$INSTDIR\Bancx Mouse.exe"'
    Delete "$EXEPATH"
FunctionEnd
