import "base";

// Comments
// Single line comment

@material {
    var<uniform> albedo: vec4f;
    var<uniform> roughness: f32;
    var<uniform> metallic: f32;
    var<uniform> tiling: vec2f;
}

struct VertexInput {
    @location(0)
    position: vec3f,

    @location(1)
    normal: vec3f,

    @location(2)
    uv: vec2f,
}

struct VertexOutput {
    @builtin(position)
    position: vec4f,

    @location(0)
    normal: vec3f,

    @location(1)
    uv: vec2f,
}

const PI: f32 = 3.14159265;
const MAX_LIGHTS: u32 = 8u;
const ENABLE_SHADOWS: bool = true;

override MSAA_SAMPLES: u32 = 4u;

var<private> frameCount: u32;
var<private> globalValue: f32;

fn saturate(value: f32) -> f32 {
    return clamp(value, 0.0, 1.0);
}

fn multiply(a: f32, b: f32) -> f32 {
    return a * b;
}

fn calculateNormal(
    normal: vec3f,
    model: mat4x4f,
) -> vec3f {
    let transformed = model * vec4f(normal, 0.0);
    return normalize(transformed.xyz);
}

fn testExpressions(value: f32, index: i32) -> f32 {
    let a = value + 1.0;
    let b = value - 1.0;
    let c = value * 2.0;
    let d = value / 2.0;

    let comparison = value > 0.0;
    let equality = value == 1.0;
    let inequality = value != 2.0;

    let logical = comparison && !equality || inequality;

    let result = select(a, b, logical);

    let array: array<f32, 4>;
    let element = array[index];

    return result + element + c + d;
}

fn testTypes() {
    let i: i32 = -42;
    let u: u32 = 42u;
    let f: f32 = 42.0;
    let b: bool = true;

    let v2 = vec2f(1.0, 2.0);
    let v3 = vec3f(1.0, 2.0, 3.0);
    let v4 = vec4f(1.0, 2.0, 3.0, 4.0);

    let matrix = mat4x4f(1.0);

    let casted = f32(i);
    let bitValue = bitcast<u32>(f);

    _ = u;
    _ = b;
    _ = v2;
    _ = v3;
    _ = v4;
    _ = matrix;
    _ = casted;
    _ = bitValue;
}

fn testAssignments() {
    var value = 10;

    value = 20;
    value += 1;
    value -= 1;
    value *= 2;
    value /= 2;
    value %= 3;

    value &= 1;
    value |= 2;
    value ^= 3;
    value <<= 1;
    value >>= 1;
}

fn testIf(value: f32) -> f32 {
    if (value > 100.0) {
        return 100.0;
    } else if (value < 0.0) {
        return 0.0;
    } else {
        return value;
    }
}

fn testSwitch(value: i32) -> i32 {
    switch (value) {
        case 0: {
            return 10;
        }

        case 1, 2: {
            return 20;
        }

        case 3 + 4: {
            return 30;
        }

        default: {
            return -1;
        }
    }
}

fn testFor() {
    var i = 0;

    for (var a = 0; a < 10; a++) {
        i += a;
    }

    for (i = 0; i < 10; i += 1) {
        if (i == 5) {
            continue;
        }

        if (i == 8) {
            break;
        }
    }

    for (; i < 20;) {
        i += 1;
    }

    for (;;) {
        break;
    }
}

fn testLoop() {
    var value = 0;

    loop {
        value += 1;

        if (value == 5) {
            continue;
        }

        if (value >= 10) {
            break;
        }

        continuing {
            value += 1;
        }
    }

    loop {
        if (value > 100) {
            break;
        }

        continuing {
            value += 10;
        }
    }
}

@pass(Shadow) {
    @resource {
        var shadowMap: texture_depth_2d;
    }

    @vertex
    fn vertexMain(input: VertexInput) -> VertexOutput {
        var output: VertexOutput;

        let worldPosition =
            object.model * vec4f(input.position, 1.0);

        output.position =
            camera.projection *
            camera.view *
            worldPosition;

        output.normal =
            calculateNormal(input.normal, object.model);

        output.uv = input.uv * tiling;

        return output;
    }

    struct FragOut {
        @resource("shadow")
        shadow: f32
    }

    @fragment
    fn fragmentMain(input: VertexOutput) -> FragOut {
        var output: FragOut;

        let normal = normalize(input.normal);
        let lighting = max(dot(normal, vec3f(0.0, 1.0, 0.0)), 0.0);

        output.shadow = lighting;

        return output;
    }
}

@pass(Forward) {
    @resource {
        var depthTexture: texture_depth_2d;
        var shadowMap: texture_depth_2d;
    }

    @vertex
    fn vertexMain(input: VertexInput) -> VertexOutput {
        var output: VertexOutput;

        switch (1) {
            case 2: {
                output.position = vec4f(0.0);
            }

            case 1, 3: {
                output.position = vec4f(1.0);
            }

            case 5 + 6: {
                output.position = vec4f(2.0);
            }

            default: {
                output.position = vec4f(0.0);
            }
        }

        var i = 0;

        for (var j = 0; j < 10; j += 1) {
            i += j;
        }

        loop {
            if (i >= 20) {
                break;
            }

            i += 1;

            continuing {
                i += 1;

                if (i >= 20) {
                    break;
                }
            }
        }

        if (i > 10) {
            if (i > 20) {
                output.normal = vec3f(1.0, 0.0, 0.0);
            } else if (i > 15) {
                output.normal = vec3f(0.0, 1.0, 0.0);
            } else {
                output.normal = vec3f(0.0, 0.0, 1.0);
            }
        } else {
            output.normal = vec3f(1.0);
        }

        output.uv = input.uv;

        let worldPosition =
            object.model * vec4f(input.position, 1.0);

        output.position =
            camera.projection *
            camera.view *
            worldPosition;

        return output;
    }

    struct FragOut {
        @resource("back_buffer")
        color: vec4f
    }

    @fragment
    fn fragmentMain(input: VertexOutput) -> FragOut {
        var output: FragOut;

        let normal = normalize(input.normal);
        let lightDirection = normalize(vec3f(1.0, 2.0, 1.0));

        let diffuse =
            max(dot(normal, lightDirection), 0.0);

        let color =
            albedo *
            vec4f(diffuse, diffuse, diffuse, 1.0);

        if (diffuse <= 0.0) {
            discard;
        }

        output.color = color;

        return output;
    }
}