import {
	createConnection,
	ProposedFeatures,
	TextDocuments,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

const connection = createConnection(ProposedFeatures.all);

const documents = new TextDocuments(TextDocument);

connection.onInitialize(() => {
	connection.console.log("SERVER INITIALIZE");

	return {
		capabilities: {
			hoverProvider: true,
		},
	};
});

connection.onInitialized(() => {
	connection.console.log("SERVER INITIALIZED");
});

connection.onHover(() => {
	connection.console.log("SERVER HOVER");

	return {
		contents: {
			kind: "markdown",
			value: "Hello from WGSL!",
		},
	};
});

documents.listen(connection);
connection.listen();