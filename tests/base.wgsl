struct Camera {
	view: mat4x4f,
	projection: mat4x4f,
}

struct Object {
	model: mat4x4f,
}

struct VertexInput {
	position: vec3<f32>,
	uv0: vec3f,
	normal: vec3f,
}

struct VertexOutput {
	@builtin(position) position: vec3<f32>,
}

@global {
	var<uniform> camera: Camera;
}

@object {
	var<uniform> object: Object;
}
