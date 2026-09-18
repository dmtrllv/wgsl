import { createConnection, MarkupKind, ProposedFeatures, TextDocuments, } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Compiler } from "@wgsl/compiler";
import { isValid } from "@wgsl/ast";

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

const error = (message: string, kind: MarkupKind = "plaintext") => {
	return msg(`Error: ${message}`, kind);
};

const msg = (message: string, kind: MarkupKind = "plaintext") => {
	return {
		contents: {
			kind,
			value: message,
		},
	};
};

connection.onHover(async (event) => {
	connection.console.log(`SERVER HOVER ${event.position.line}:${event.position.character}`);

	const compiler = getCompiler(event.textDocument.uri);
	if (!compiler)
		return error("Could not get compiler!");

	const document = documents.get(event.textDocument.uri);
	if (!document)
		return error("Could not get document!");

	const module = await compiler?.getModule(event.textDocument.uri, document.getText());

	const [ast, parents] = compiler.getAst(module, document.offsetAt(event.position));

	if (ast?.type === "Identifier") {
		if (parents[0]?.type === "StructProperty" && parents[1]?.type === "Struct") {
			let name = "???";
			let typeName = "???";
			if (parents[1].name.type === "Identifier")
				name = parents[1].name.value;
			if(isValid(parents[0]?.typeName) && isValid(parents[0]?.typeName.name))
				typeName = parents[0]?.typeName.name.value;

			return msg(`${name}.${ast.value}: ${typeName}`);
		}
		return msg(`${parents[0]?.type} ${ast.value}`);
	}

	return msg(ast?.type || "?");
});

documents.onDidOpen(event => {
	const compiler = getCompiler(event.document.uri);
	if (compiler)
		compiler.compile(event.document.uri, event.document.getText());
});


documents.listen(connection);
connection.listen();