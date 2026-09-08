// test
struct Camera {
	view: mat4x4f,
	projection: mat4x4f,
}

struct Object {
	model: mat4x4f,
}

struct VertexInput {
	position: vec3f,
	uv0: vec3f,
	normal: vec3f,
}

struct VertexOutput {
	@builtin(position) position: vec4f,
}

@global
var<uniform> camera: Camera;

@object
var<uniform> object: Object;