import { DiagnosticsContext } from "@wgsl/core";
import { AstType, isValid } from "./ast.js";
import { Iter } from "./iter.js";
import { parseType, TypeAst } from "./type.js";
import { Keyword, Op, Sep } from "@wgsl/lexer";
import { parseWithSpan } from "./parser.js";
import { IdentAst, parseIdent } from "./ident.js";
import { AttributeAst } from "./attr.js";

export const parseBindingVar = (iter: Iter, attributes: AttributeAst[], ctx: DiagnosticsContext) => parseWithSpan<BindingVarDeclAst>(iter, () => {
	iter.expect(Keyword.Var);
	let addressSpace: BindingAddressSpace = "handle";
	let readWrite: BindingAccessMode | null = null;
	if (iter.nextIf(Op.Lt)) {
		const s = parseIdent(iter, ctx);
		if (!isValid(s))
			return s;

		if (!isBindingAddressSpace(s.value))
			throw new Error("Invalid address space");
		if (s.value === "storage") {
			iter.expect(Sep.Comma);
			const rw = parseIdent(iter, ctx);

			if (!isValid(rw))
				return rw;

			if (!isReadWriteMode(rw.value)) {
				throw new Error("Invalid read write mode");
			}
			readWrite = rw.value;
		} else {
			addressSpace = s.value;
		}
		iter.expect(Op.Gt);
	}

	const name = parseIdent(iter, ctx);
	if (!isValid(name))
		return name;
	iter.expect(Sep.Colon);

	const resourceType = parseType(iter, ctx);

	iter.expect(Sep.Semicolon);

	return {
		type: "BindingVar",
		attributes,
		addressSpace,
		accessMode: readWrite,
		name,
		resourceType
	}
});

export type BindingVarDeclAst = AstType<"BindingVar", {
	attributes: AttributeAst[],
	addressSpace: BindingAddressSpace;
	accessMode: BindingAccessMode | null;
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

export type BindingAccessMode = (typeof READ_WRITE_MODES)[number];

export const isReadWriteMode = (value: string): value is BindingAccessMode => READ_WRITE_MODES.includes(value as BindingAccessMode);

export type BindingAddressSpace = (typeof BINDING_ADDRESS_SPACES)[number];

export const isBindingAddressSpace = (value: string): value is BindingAddressSpace => BINDING_ADDRESS_SPACES.includes(value as BindingAddressSpace);
