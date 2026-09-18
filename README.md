# WGSL compiler and language server

## Applications
For now there is a cli and a vscode extension. The vscode extension is splitted into 2 applications because it contains the vscode client extension and the language server.
The cli tool will for now only be used for testing and logging info about the wgsl sources.

## Packages
I split the compiler into multiple packages so that there will be a clear boundary between the dependencies.
The packages can be used in other projects and as a future goal the language/compiler should be extendible such as adding custom syntax and semantics, add custom passes etc.
