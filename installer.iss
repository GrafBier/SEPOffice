#define MyAppName "SEPOffice"
#define MyAppVersion "1.0.1"
#define MyAppPublisher "Simon Erich Plath"
#define MyAppURL "https://github.com/simonplath/sepoffice"
#define MyAppExeName "SEPOffice.exe"
#define MyAppIcon "release\.icon-ico\icon.ico"
#define SourceDir "release\win-unpacked"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
; Installer-Icon
SetupIconFile={#MyAppIcon}
; Wizard-Bilder (optional - 164x314 und 55x58 px bmp)
; WizardImageFile=installer_wizard.bmp
; WizardSmallImageFile=installer_wizard_small.bmp
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
OutputDir=release
OutputBaseFilename=SEPOffice-Setup-{#MyAppVersion}
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}
VersionInfoVersion={#MyAppVersion}
VersionInfoCompany={#MyAppPublisher}
VersionInfoDescription={#MyAppName} Installer

[Languages]
Name: "german";    MessagesFile: "compiler:Languages\German.isl"
Name: "english";   MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon";    Description: "{cm:CreateDesktopIcon}";    GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startmenuicon";  Description: "Startmenü-Verknüpfung erstellen"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce

[Files]
; Alle Dateien aus win-unpacked rekursiv kopieren
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}";          Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"; Tasks: startmenuicon
Name: "{group}\{#MyAppName} deinstallieren"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}";    Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
