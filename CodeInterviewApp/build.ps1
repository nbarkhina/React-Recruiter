# ren .\bin\Debug\netcoreapp2.2\publish\app_offline.html app_offline.htm
# dotnet publish
# ren .\bin\Debug\netcoreapp2.2\publish\app_offline.htm app_offline.html

Rename-Item -Path ".\bin\Debug\netcoreapp2.2\publish\app_offline.html" -NewName "app_offline.htm"

Start-Sleep -Seconds 1.5

dotnet publish

Rename-Item -Path ".\bin\Debug\netcoreapp2.2\publish\app_offline.htm" -NewName "app_offline.html"
