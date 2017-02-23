define(["src/PerlinGenerator", "src/PoissonGenerator", "src/Tile"],
    function(PerlinGenerator, PoissonGenerator, Tile) {
        /*
         Camera :: (gl: WebGLContext, plainSPI: ShaderProgramInfo, paperSPI: ShaderProgramInfo, map: Map) -> {
             render: (delta: Seconds) -> void,

         }
         */
        return function Camera(gl, plainSPI, paperSPI, map) {

            var proto = Camera.prototype;

            var indices;
            var colors;
            var offsets;

            console.dir(Tile.mesh);

            var buffers = {
                positions: {numComponents: 3, data: Float32Array.of.apply(Float32Array, Tile.mesh)},
                colors:    {numComponents: 3},
                offsets:   {numComponents: 2},
                indices:   {}
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
                // gl.enable(gl.CULL_FACE);
                // enables the alpha channel- slightly diminishes the effect
                // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                // gl.enable(gl.BLEND);
                gl.clearColor(0.48,0.53,0.67,1);
                gl.clear(gl.COLOR_BUFFER_BIT);

                // positions = Float32Array.of(-0.9,0.9,0,0.9,0.9,0);
                // vertexColors = Float32Array.of(1,1,0,0,1,1);
                // buffers = {
                //     position: {data: positions, numComponents: 3, drawType: gl.DYNAMIC_DRAW},
                //     color: {data: vertexColors, numComponents: 3}
                // };

                var maxdex = 0;
                map.tiles.forEach(function(tile){
                    maxdex += tile.indices.length;
                });
                indices = new Uint8Array(maxdex);
                offsets = new Float32Array(maxdex * 8);
                colors = new Float32Array(maxdex * 12);
                var index = 0;
                map.tiles.forEach(function(tile){
                    var yOffset = Math.floor(tile.index/map.width) * 1.5;
                    var xOffset = (((tile.index%map.width) + yOffset/3) * Math.sqrt(3)) % (map.width * 2 * Math.sqrt(3));
                    tile.indices.forEach(function(i){

                        offsets[2*index] = xOffset;
                        offsets[2*index+1] = yOffset;

                        // TODO transfer colors as UInt8
                        colors[3*index] = tile.color[0];
                        colors[3*index+1] = tile.color[1];
                        colors[3*index+2] = tile.color[2];

                        indices[index++] = i;
                    });
                });
                // console.log(indices.buffer.byteLength);
                // TODO splice off the ends of the buffer arrays if needed
                // So I'm attempting to do this by taking sliced views of the buffers
                buffers.indices.data = indices;
                buffers.offsets.data = offsets;
                buffers.colors.data  = colors;
                // console.log(indices.buffer.byteLength);

                bufferInfo = twgl.createBufferInfoFromArrays(gl, buffers);
                // console.log(indices.buffer.byteLength);
                // twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.indices, buffers.indices.data);
                // twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.colors, buffers.colors.data);
                // twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.offsets, buffers.offsets.data);

                // establish shader uniforms
                var uniforms = {
                    projection: twgl.m4.identity() // actually calculated below
                };
                var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
                twgl.m4.ortho(-aspect*map.height, aspect*map.height, map.height, -map.height, -1, 1, uniforms.projection);
                // //3D. If you like that sort of thing
                // uniforms.projection = twgl.m4.perspective(15 * Math.PI / 180, gl.canvas.clientWidth / gl.c
                // var view = twgl.m4.inverse(twgl.m4.lookAt([0, 0, -12], [0, 0, 0], [0, 1, 0]));
                // uniforms.projection = twgl.m4.multiply(uniforms.projection, view);
                // var world = twgl.m4.rotationY(time/4000);
                // uniforms.projection = twgl.m4.multiply(uniforms.projection, world);
                gl.useProgram(plainSPI.program);
                twgl.setBuffersAndAttributes(gl, plainSPI, bufferInfo);
                twgl.setUniforms(plainSPI, uniforms);
                // twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES); // actual drawing happens here
                gl.drawElements(gl.LINE_LOOP, bufferInfo.numElements, gl.UNSIGNED_BYTE, 0);
            };



            this.destroy = function(){

            }
        }
    }
);