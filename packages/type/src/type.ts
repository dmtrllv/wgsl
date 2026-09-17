export type Type = Primitives | StructType | ArrayType | VectorType | MatrixType;

export type StructType = {
	readonly kind: typeof STRUCT;
	readonly name: string;
	readonly properties: StructProperty[];
};

export type StructProperty = {
	readonly name: string;
	readonly offset: number;
	readonly type: Type;
};

export type VectorType = {
	readonly kind: typeof VECTOR;
	readonly name: VectorTypeName;
	readonly type: Primitives;
};

export type VectorTypeName =
	| "vec2"
	| "vec3"
	| "vec4";

export type MatrixType = {
	readonly kind: typeof MATRIX;
	readonly name: MatrixTypeName;
	readonly type: Primitives;
};

export type MatrixTypeName =
	| "mat2x2"
	| "mat2x3"
	| "mat2x4"
	| "mat3x2"
	| "mat3x3"
	| "mat3x4"
	| "mat4x2"
	| "mat4x3"
	| "mat4x4";

export type PrimitiveType<T extends string> = {
	readonly kind: typeof PRIMITIVE;
	readonly name: T;
	readonly size: number;
	readonly alignment: number;
};

export type ArrayType = {
	readonly kind: typeof PRIMITIVE;
	readonly length: number;
	readonly type: Type;
};

export const PRIMITIVE = "primitive" as const;
export const STRUCT = "struct" as const;
export const ARRAY = "array" as const;
export const VECTOR = "array" as const;
export const MATRIX = "array" as const;

const primitive = <const T extends string>(name: T, size: number, alignment: number): PrimitiveType<T> => ({
	kind: "primitive",
	name,
	size,
	alignment
});

export const bool = primitive("bool", 4, 4);
export const i32 = primitive("i32", 4, 4);
export const u32 = primitive("u32", 4, 4);
export const f32 = primitive("f32", 4, 4);
export const f16 = primitive("f16", 2, 2);

export type Primitives =
	| typeof bool
	| typeof i32
	| typeof u32
	| typeof f32
	| typeof f16;