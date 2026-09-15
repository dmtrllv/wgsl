import { existsSync } from "fs";
import * as vscode from "vscode";
import { LanguageClient, TransportKind } from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	const output = vscode.window.createOutputChannel("WGSL");
	context.subscriptions.push(output);

	output.appendLine("Extension activated");
	output.appendLine(context.extensionUri.fsPath);

	const serverModule = vscode.Uri.joinPath(context.extensionUri, "../language-server/dist/main.js").fsPath;

	if(!existsSync(serverModule)) {
		output.appendLine(serverModule + " does not exists!");
		return;
	}
	
	const serverOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.stdio,
		},
		debug: {
			module: serverModule,
			transport: TransportKind.stdio,
		},
	};

	const clientOptions = {
		documentSelector: [
			{
				scheme: "file",
				language: "wgsl",
			},
		],
	};

	client = new LanguageClient("wgslLanguageServer", "WGSL Language Server", serverOptions, clientOptions);

	context.subscriptions.push(client);
	client.start();
}

export function deactivate() {
	return client?.stop();
}