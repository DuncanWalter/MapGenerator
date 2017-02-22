define(["src/PerlinGenerator", "src/PoissonGenerator"],
    function(PerlinGenerator, PoissonGenerator) {
        /*
         Camera :: (gl: WebGLContext, plainSPI: ShaderProgramInfo, paperSPI: ShaderProgramInfo, map: Map) -> {
             render: (delta: Seconds) -> void,

         }
         */
        return function Camera(gl, plainSPI, paperSPI, map) {

            var proto = Camera.prototype;

            var buffers = {
                positions: {numComponents: 3, drawType: gl.DYNAMIC_DRAW, data: new Float32Array(0)},
                colors:    {numComponents: 3, drawType: gl.DYNAMIC_DRAW, data: new Float32Array(0)},
                indices:   {drawType: gl.DYNAMIC_DRAW, data: new Int32Array(0)}
            };
            var bufferInfo;

            var input = {
                cursor: {
                    x: 0,
                    dx: 0,
                    y: 0,
                    dy: 0,
                    scroll: 0,
                    down: {},
                    up: {}
                },
                keys: {
                    down: {},
                    up: {}
                }
            };

            // var acc = {};
            // var vel = {};
            // var pos = {x: , y: , z: , zoom: };

            function shiftCamera(delta){

            }


            this.render = function(delta){

                // make sure the canvas is in the correct location
                twgl.resizeCanvasToDisplaySize(gl.canvas);
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                // sets the background color for blending
                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.CULL_FACE);
                // enables the alpha channel- slightly diminishes the effect
                // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                // gl.enable(gl.BLEND);
                gl.clearColor(0.78,0.82,0.97,1);
                gl.clear(gl.COLOR_BUFFER_BIT);


                // positions = Float32Array.of(-0.9,0.9,0,0.9,0.9,0);
                // vertexColors = Float32Array.of(1,1,0,0,1,1);
                // buffers = {
                //     position: {data: positions, numComponents: 3, drawType: gl.DYNAMIC_DRAW},
                //     color: {data: vertexColors, numComponents: 3}
                // };

                var indexOffset = 0;
                map.tiles.forEach(function(tile){
                    // read in the tile meshes and colors
                });
                // TODO splice off the ends of the buffer arrays if needed
                bufferInfo = twgl.createBufferInfoFromArrays(gl, buffers);

                twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.color, vertexColors);
                twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.position, positions);
                // establish shader uniforms
                var uniforms = {
                    projection: twgl.m4.identity() // actually calculated below
                };
                var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
                twgl.m4.ortho(-aspect, aspect, 1, -1, -1, 1, uniforms.projection);
                // //3D. If you like that sort of thing
                // uniforms.projection = twgl.m4.perspective(15 * Math.PI / 180, gl.canvas.clientWidth / gl.c
                // var view = twgl.m4.inverse(twgl.m4.lookAt([0, 0, -12], [0, 0, 0], [0, 1, 0]));
                // uniforms.projection = twgl.m4.multiply(uniforms.projection, view);
                // var world = twgl.m4.rotationY(time/4000);
                // uniforms.projection = twgl.m4.multiply(uniforms.projection, world);
                gl.useProgram(plainSPI.program);
                twgl.setBuffersAndAttributes(gl, plainSPI, bufferInfo);
                twgl.setUniforms(plainSPI, uniforms);
                twgl.drawBufferInfo(gl, bufferInfo, gl.LINES); // actual drawing happens here
            };



            this.destroy = function(){

            }
        }
    }
);