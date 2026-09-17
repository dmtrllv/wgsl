export type Mutable<T extends {}> = {
	-readonly [K in keyof T]: T[K];
};