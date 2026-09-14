import "base";

// test

@material {
	var<uniform> albedo: vec4f;
	var<uniform> roughness: vec4f;
	var<uniform> metallic: vec4f;
}

@pass(Shadow) {
    @vertex
    fn vertexMain(input: VertexInput) -> VertexOutput {
        var output: VertexOutput;
        var worldPosition = object.model * vec4f(input.position, 1.0);
        output.position = camera.projection * camera.view * worldPosition;
        output.normal = normalize((object.model * vec4f(input.normal, 0.0)).xyz);
        return output;
    }

    struct FragOut {
		@resource("shadow")
        shadow: f32
    }

    @fragment
    fn fragmentMain(input: VertexOutput) -> FragOut {
        var out: FragOut;
        out = albedo;
        return out;
    }
}

@pass(Forward) {
    @resource {
    	var depthTexture: texture_depth_2d;
    	var shadowMap: texture_depth_2d;
	}

    @vertex
    fn vertexMain(input: VertexInput) -> VertexOutput {
		switch(1) {
			case 2: {

			}
			case 1, 3: {

			}
			case 5 + 6: {

			}
			default: {
				
			}
		}

		for (var i = 0; ; ) { }
		for (i = 0; ; ) { }
		for (; i < 10;) { }
		for (;; i = i + 1) { }
		for (;; i = i + 1) { }

		loop {
		    // if (x >= 10) {
		        break;
		    // }

		    x += 1;
		}

		loop {
		    x += 1;

		    continuing {
		        // if (x >= 10) {
		            // break;
		        // }
		    }
		}
		
        var output: VertexOutput;
        var worldPosition = object.model * vec4f(input.position, 1.0);
        output.position = camera.projection * camera.view * worldPosition;
        output.normal = normalize((object.model * vec4f(input.normal, 0.0)).xyz);
        return output;
    }

    struct FragOut {
        @resource("back_buffer")
        color: vec4f
    }

    @fragment
    fn fragmentMain(input: VertexOutput) -> FragOut {
        var out: FragOut;
        out.color = albedo;
        return out;
    }
}
