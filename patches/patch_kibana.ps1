<#
This patch makes Kibana 8 compatible with Search Guard.

Usage:
  powershell -ExecutionPolicy Bypass -File .\patch_kibana.ps1                Path Kibana in the production mode.
  powershell -ExecutionPolicy Bypass -File .\patch_kibana.ps1 -mode "dev"    Path Kibana in the dev mode.
#>

param (
  [string]$MODE = "prod"
)

$EXT = "js"
if ($MODE -eq "dev") {
  $EXT = "ts"
}

$FILE_PATH = ".\..\..\src\core\server\plugins\plugin_context." + $EXT
$FILE_PATH_BAK = $FILE_PATH + ".bak"
$HAPI_DEPENDENCY = "hapiServer: deps.http.server,"

$WAS_PATCHED = $null -ne (Select-String -Path $FILE_PATH -Pattern $HAPI_DEPENDENCY)

if ($WAS_PATCHED) {
  Write-Output "Success! There is no need to patch!"
  Write-Output "The file $FILE_PATH was patched already. The original file backup is in $FILE_PATH_BAK."
} else {

  Remove-Item $FILE_PATH_BAK
  Move-Item -Path $FILE_PATH -Destination $FILE_PATH_BAK
  New-Item -Path $FILE_PATH -ItemType "file"

  $DO_INSERT=0

  foreach ($line in Get-Content $FILE_PATH_BAK) {
    Add-Content -Path $FILE_PATH -Value $line

    if ($line -match "(.*)?createPluginSetupContext(.*)?") {
      $DO_INSERT=1
    }

    if (($DO_INSERT -eq 1) -AND ($line -match "(.*)?return {(.*)?")) {
      Add-Content -Path $FILE_PATH -Value $HAPI_DEPENDENCY
      $DO_INSERT=0
    }
  }

  Write-Output "Success!"
  Write-Output "Patched file $FILE_PATH. The original file backup is in $FILE_PATH_BAK."
}
