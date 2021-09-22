!macro customInstall
    CreateShortCut "$SMSTARTUP\policy-banner-ecu.lnk" "$INSTDIR\policy-banner-ecu.exe"
!macroend
!macro customUnInstall
    Delete "$SMSTARTUP\policy-banner-ecu.lnk"
!macroend