# Code Interview App React

A web app for conducting code interviews. This is a React version of my code interview app. Allows everyone to watch the candidate as they type on the left pane and see the UX in the right pane. Adds support for TypeScript and React intellisense. App was written in TypeScript and .NET Core for the backend.

See demo here: https://www.neilb.net/codeinterviewreact/

# Debug Locally

- make sure you have .NET Core SDK 2.2 installed
- open a powershell terminal
- if haven't previously trust the .net core dev cert
- `cd .\CodeInterviewApp\`
- `dotnet run`
- open a second powershell terminal
- `cd .\CodeInterviewApp\wwwroot\`
- `npm install`
- `npm install -g typescript` (if you don't have typescript installed globally)
- `tsc -w`
- view the app at https://localhost:5001/index.html
 
# Publish

- run `build_first_time.bat`
- then run `build.ps1` each time after

# Unit Tests
- cd into the CodeInterviewApp.Tests folder
- run `dotnet test`
- to run the ux unit tests cd into CodeInterviewApp\wwwroot
- run `node .\node_modules\cypress\bin\cypress open`

# Dotnet Core Commands Reference

- dotnet run
- dotnet watch run (for hot reload)
- dotnet build
- dotnet --version
