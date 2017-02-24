define(["lib/TWGL.min", "src/PerlinGenerator", "src/PoissonGenerator", "src/Tile"],
    function(twgl, PerlinGenerator, PoissonGenerator, Tile) {
        /*
         Camera :: (gl: WebGLContext, plainSPI: ShaderProgramInfo, paperSPI: ShaderProgramInfo, map: Map) -> {
             render: (delta: Seconds) -> void,

         }
         */
        // TODO redefine this to take a map, and some camera settings. get rendering out of here
        return function Camera(gl, plainSPI, paperSPI, map) {

            // var proto = Camera.prototype;

            var indices = new Uint8Array(0);
            var colors = new Float32Array(0);
            var positions = new Float32Array(0);

            console.dir(Tile.mesh);

            // TODO use indices for a formally efficient draw
            var buffers = {
                positions: {numComponents: 3, drawType: gl.DYNAMIC_DRAW, data: new Float32Array(0)},
                colors:    {numComponents: 3, drawType: gl.DYNAMIC_DRAW, data: new Float32Array(0)}
                // indices:   {drawType: gl.DYNAMIC_DRAW, data: new Uint8Array(0)}
            };
            var bufferInfo;
            bufferInfo = twgl.createBufferInfoFromArrays(gl, buffers);

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

            var elapsed = 0;
            this.render = function(delta){
                elapsed += delta;

                // make sure the canvas is in the correct location
                twgl.resizeCanvasToDisplaySize(gl.canvas);
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                // sets the background color for blending
                gl.enable(gl.DEPTH_TEST);
                // enables the alpha channel
                // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                // gl.enable(gl.BLEND);
                gl.clearColor(0.48,0.53,0.67,1);
                gl.clear(gl.COLOR_BUFFER_BIT);

                var maxdex = 0;
                map.tiles.forEach(function(tile){
                    maxdex += tile.indices.length;
                });


                // only create new buffers if they are too small. Otherwise slice them up
                if(positions.buffer.byteLength < maxdex*8){
                    // indices = new Uint8Array(maxdex);
                    positions = new Float32Array(maxdex * 8);
                    colors = new Float32Array(maxdex * 12);
                }

                var index = 0;
                map.tiles.forEach(function(tile){
                    var yOffset = Math.floor(tile.index/map.width) * 1.5;
                    var xOffset = (((tile.index%map.width) + yOffset/3) * Math.sqrt(3)) % (map.width * 2 * Math.sqrt(3));
                    tile.indices.forEach(function(i){

                        colors[index] = tile.color[0];
                        positions[index++] = Tile.mesh[i][0] + xOffset;
                        colors[index] = tile.color[1];
                        positions[index++] = Tile.mesh[i][1] + yOffset;
                        colors[index] = tile.color[2];
                        positions[index++] = Tile.mesh[i][2];

                    });
                });
                // console.log(indices.buffer.byteLength);
                // TODO splice off the ends of the buffer arrays if needed
                // So I'm attempting to do this by taking sliced views of the buffers
                // buffers.indices.data = indices;
                // buffers.positions.data = positions;
                // buffers.colors.data  = colors;
                // // console.log(indices.buffer.byteLength);


                // console.log(indices.buffer.byteLength);
                // twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.indices, buffers.indices.data);
                bufferInfo.numElements = index / 3;
                twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.colors, colors);
                twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.positions, positions);

                // establish shader uniforms
                var uniforms = {
                    projection: twgl.m4.identity() // actually calculated below
                    // camera: [map.width / 2 * Math.sqrt(3), map.height * 3 / 4, -1] // for the eventual paper shader
                };
                var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
                twgl.m4.ortho(-aspect*map.height, aspect*map.height, map.height, -map.height, -1, 1, uniforms.projection);
                // //3D. If you like that sort of thing
                // uniforms.projection = twgl.m4.perspective(30 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 30);
                var view = twgl.m4.inverse(twgl.m4.lookAt([map.width / 2 * Math.sqrt(3), map.height * 3 / 4, 1], [map.width / 2 * Math.sqrt(3), map.height * 3 / 4, 0], [0, 1, 0]));
                uniforms.projection = twgl.m4.multiply(uniforms.projection, view);
                // var world = twgl.m4.rotationY(elapsed / 4);
                // uniforms.projection = twgl.m4.multiply(uniforms.projection, world);


                gl.useProgram(plainSPI.program);
                twgl.setBuffersAndAttributes(gl, plainSPI, bufferInfo);
                twgl.setUniforms(plainSPI, uniforms);
                twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES); // actual drawing happens here
                // gl.drawElements(gl.LINE_LOOP, bufferInfo.numElements, gl.UNSIGNED_BYTE, 0);
            };



            this.destroy = function(){

            }
        }
    }
);