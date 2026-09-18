import { createConnection, ProposedFeatures, TextDocuments, } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Compiler } from "@wgsl/compiler";
import { isDiagnosticError } from "@wgsl/core";

const compilers = new Map<string, Compiler>();

const getCompiler = (path: string): Compiler | null => {
	for (const [key, c] of compilers) {
		if (path.startsWith(key))
			return c;
	}
	return null;
};

const connection = createConnection(ProposedFeatures.all);

const documents = new TextDocuments(TextDocument);

connection.onInitialize((params) => {
	connection.console.log("SERVER INITIALIZE");

	params.workspaceFolders?.forEach(s => {
		connection.console.log(`Creating workspace compiler for ${s.name} at ${s.uri}`);
		compilers.set(s.uri, new Compiler(s.uri));
	});

	return {
		capabilities: {
			hoverProvider: true,
		},
	};
});

connection.onInitialized(() => {
	connection.console.log("SERVER INITIALIZED");
});

connection.onHover(async (event) => {
	connection.console.log(`SERVER HOVER ${event.position.line}:${event.position.character}`);

	const compiler = getCompiler(event.textDocument.uri);
	const source = documents.get(event.textDocument.uri)?.getText();

	if (compiler && source) {
		const s = await compiler.getModule(event.textDocument.uri, source);

		if (!s.tokens || isDiagnosticError(s.tokens)) {
			return {
				contents: {
					kind: "markdown",
					value: "WGSL ERROR!",
				},
			};
		}

		const token = s.tokens.find(t => {
			const c = event.position.character + 2;
			if (t.position.line === event.position.line + 1) {
				const cEnd = t.position.columnOffset + (t.span.end - t.span.start);
				return t.position.columnOffset <= c && cEnd >= c;
			}
			return false;
		});


		return {
			contents: {
				kind: "markdown",
				value: `${token?.type.kind || "???"}`
			}
		}
	}

	return {
		contents: {
			kind: "markdown",
			value: "Hello from WGSL!",
		},
	};
});

documents.onDidOpen(event => {
	const compiler = getCompiler(event.document.uri);
	if (compiler)
		compiler.compile(event.document.uri, event.document.getText());
});


documents.listen(connection);
connection.listen();