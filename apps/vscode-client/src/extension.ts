import { existsSync } from "fs";
import * as vscode from "vscode";
import { LanguageClientOptions } from "vscode-languageclient";
import { LanguageClient, ServerOptions, TransportKind } from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	const output = vscode.window.createOutputChannel("WGSL");
	context.subscriptions.push(output);

	output.appendLine("Extension activated");
	output.appendLine(context.extensionUri.fsPath);

	process.on("uncaughtException", (err) => {
		output.appendLine(`UNCAUGHT EXCEPTION: ${err.stack ?? err}`);
	});

	process.on("unhandledRejection", (reason) => {
		output.appendLine(`UNHANDLED REJECTION: ${String(reason)}`);
	});

	const serverModule = vscode.Uri.joinPath(context.extensionUri, "../language-server/dist/main.js").fsPath;

	if (!existsSync(serverModule)) {
		output.appendLine(serverModule + " does not exists!");
		return;
	}

	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.stdio,
			options: {
				cwd: vscode.Uri.joinPath(context.extensionUri, "language-server").fsPath,
			}
		},
		debug: {
			module: serverModule,
			transport: TransportKind.stdio,
			options: {
				cwd: vscode.Uri.joinPath(context.extensionUri, "language-server").fsPath,
			}
		},
	};

	const clientOptions: LanguageClientOptions = {
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

	client.start()
		.then(() => {
			output.appendLine("Language server started");
		})
		.catch((err) => {
			output.appendLine(`Language server failed: ${err.stack ?? err}`);
		});
}

export function deactivate() {
	return client?.stop();
}