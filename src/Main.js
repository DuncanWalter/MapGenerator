
// TODO split Utils into separate definitions for modularity
// TODO utilize the require js optimizer
// TODO use an indexed draw for better efficiency
// TODO attempt to reuse buffers and work off of buffer views for better efficiency
// TODO redo noise generator naming and class schemes to reflect new functional format
// TODO finish implementing the new functional format of the noise generators
// TODO implement the new Continent generator
// TODO offload the main render call from the camera to Main + Map
// TODO implement camera input responsiveness

require(["lib/TWGL.min", "src/Map", "src/Camera", "src/Tile", "src/plainShaders"],
    function(twgl, Map, Camera, Tile, plainShaders) {

        // sets up a webgl context for the canvas
        var canvas = document.getElementById("map-canvas");
        var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        // plainSPI : ShaderProgramInfo
        var plainSPI = twgl.createProgramInfo(gl, [plainShaders.vertex, plainShaders.fragment]);
        // paperSPI : ShaderProgramInfo
        var paperSPI = null;

        var map = new Map({
            elevationPerlin: {

            },
            continentPoisson: {

            },
            size: {
                width: 50,
                height: 25
            }
        });

        var camera = new Camera(gl, plainSPI, paperSPI, map);

        var colors = new Float32Array(0);
        var positions = new Float32Array(0);

        console.dir(Tile.mesh);

        // TODO use indices for a formally efficient draw (normals may conflict with indices...)
        var buffers = {
            positions: {numComponents: 3, drawType: gl.DYNAMIC_DRAW, data: new Float32Array(0)},
            colors:    {numComponents: 3, drawType: gl.DYNAMIC_DRAW, data: new Float32Array(0)}
        };
        var bufferInfo = twgl.createBufferInfoFromArrays(gl, buffers);

        var delta = 0; // delta : (Seconds :: float)
        var now = Date.now(); // now : (POSIXTime :: int)
        function render(time){ // render :: (time : POSIXTime) -> void
            delta = (time - now) / 1000;
            now = time;

            camera.update(delta);

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

            // use recursion to continue rendering
            // by piggybacking on the DOM render loop
            requestAnimationFrame(render);
        }

        // TODO hook up any html buttons / elements here

        // kicks off the rendering loop
        requestAnimationFrame(render);

        return true;
    }
);