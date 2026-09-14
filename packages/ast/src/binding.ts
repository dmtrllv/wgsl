import { DiagnosticsContext } from "@wgsl/core";
import { AstType } from "./ast.js";
import { Iter } from "./iter.js";
import { parseType, TypeAst } from "./type.js";
import { Keyword, Op, Sep } from "@wgsl/lexer";
import { parseWithSpan } from "./parser.js";
import { IdentAst, parseIdent } from "./ident.js";
import { AttributeAst } from "./attr.js";

export const parseBindingVar = (iter: Iter, attributes: AttributeAst[], ctx: DiagnosticsContext) => parseWithSpan<BindingVarDeclAst>(iter, () => {
	iter.expect(Keyword.Var);
	let addressSpace: BindingAddressSpace = "handle";
	let readWrite: ReadWriteMode | null = null;
	if (iter.nextIf(Op.Lt)) {
		const s = parseIdent(iter);
		if (!isBindingAddressSpace(s.value))
			throw new Error("Invalid address space");
		if (s.value === "storage") {
			iter.expect(Sep.Comma);
			const rw = parseIdent(iter);
			if (!isReadWriteMode(rw.value)) {
				throw new Error("Invalid read write mode");
			}
			readWrite = rw.value;
		} else {
			addressSpace = s.value;
		}
		iter.expect(Op.Gt);
	}

	const name = parseIdent(iter);

	iter.expect(Sep.Colon);

	const resourceType = parseType(iter, ctx);

	iter.expect(Sep.Semicolon);

	return {
		type: "BindingVar",
		attributes,
		addressSpace,
		readWrite,
		name,
		resourceType
	}
});


//export const parseResourceType = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<ResourceTypeAst>(iter, () => {

//});

export type BindingVarDeclAst = AstType<"BindingVar", {
	attributes: AttributeAst[],
	addressSpace: BindingAddressSpace;
	readWrite: ReadWriteMode | null;
	name: IdentAst,
	resourceType: TypeAst;
}>;

const BINDING_ADDRESS_SPACES = [
	"handle",
	"function",
	"private",
	"workgroup",
	"uniform",
	"storage",
] as const;

const READ_WRITE_MODES = [
	"read",
	"write",
	"read_write"
] as const;

export type ReadWriteMode = (typeof READ_WRITE_MODES)[number];

export const isReadWriteMode = (value: string): value is ReadWriteMode => READ_WRITE_MODES.includes(value as ReadWriteMode);

export type BindingAddressSpace = (typeof BINDING_ADDRESS_SPACES)[number];

export const isBindingAddressSpace = (value: string): value is BindingAddressSpace => BINDING_ADDRESS_SPACES.includes(value as BindingAddressSpace);