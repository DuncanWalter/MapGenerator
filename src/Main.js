
// TODO split Utils into separate definitions for modularity
// TODO utilize the require js optimizer
// TODO offload the main render call from the camera to Main + Map
// TODO implement camera input responsiveness
// TODO extend tile mesh and normalizing

require(["lib/TWGL.min", "src/Map", "src/Camera", "src/plainShaders", "src/paperShaders", "src/PoissonDistribution", "src/Tile", "src/Utils"],
    function(twgl, Map, Camera, plainShaders, paperShaders, PoissonDistribution, Tile, Utils) {

        var rt3 = Math.sqrt(3);


        // sets up a webgl context for the canvas
        var canvas = document.getElementById("map-canvas");
        var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        // plainSPI : ShaderProgramInfo
        var plainSPI = twgl.createProgramInfo(gl, [plainShaders.vertex, plainShaders.fragment]);
        // paperSPI : ShaderProgramInfo
        var paperSPI = twgl.createProgramInfo(gl, [paperShaders.vertex, paperShaders.fragment]);

        var map = new Map({
            elevationPerlin: {
                octaveSizes:   [3.5, 5.6, 12],
                octaveWeights: [7, 8, 10],
                centrality:    [1, 1, 1]
            },
            continentPoisson: {
                // TODO stop hardcoding map
            },
            size: {
                width: 67,
                height: 43
            }
        });

        var camera = new Camera(gl, plainSPI, paperSPI, map);

        var colors = new Float32Array(0);
        var normals = new Float32Array(0);
        var positions = new Float32Array(0);
        var uniforms = {};

        // TODO make colors Uint8s? figure out normals
        var buffers = {
            a_position: {numComponents: 3, drawType: gl.DYNAMIC_DRAW, data: new Float32Array(0)},
            a_normal:   {numComponents: 3, drawType: gl.DYNAMIC_DRAW, data: new Float32Array(0)},
            a_color:    {numComponents: 3, drawType: gl.DYNAMIC_DRAW, data: new Float32Array(0)}
        };
        var bufferInfo = twgl.createBufferInfoFromArrays(gl, buffers);

        var delta = 0; // delta : (Seconds :: float)
        var now = Date.now(); // now : (POSIXTime :: int)
        function render(time){ // render :: (time : POSIXTime) -> void
            delta = (time - now) / 1000;
            now = time;

            // make sure the canvas is in the correct location
            twgl.resizeCanvasToDisplaySize(gl.canvas);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            // sets the background color for blending
            gl.clearColor(0.48,0.53,0.67,1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            // enables a z test for the fragment shader
            gl.enable(gl.DEPTH_TEST);
            // gl.enable(gl.CULL_FACE);
            // enables the alpha channel
            // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            // gl.enable(gl.BLEND);

            camera.update(delta, uniforms);

            // compile a list of all tiles that need to be rendered along with their screen location
            var pnt, ind, queue = []; // queue: TileRenderInfo[]
            var lBound = camera.viewTL[0];
            var rBound = camera.viewTR[0];
            var tBound = camera.viewTL[1];
            var bBound = camera.viewBR[1];
            for(var h = Math.floor(bBound/1.5)*1.5; h < tBound + 1.5; h += 1.5){
                if(h > -1.5){
                    var l = (tBound - h)/(tBound - bBound) * -(camera.viewTL[0] - camera.viewBL[0]) + camera.viewTL[0];
                    var r = (tBound - h)/(tBound - bBound) * -(camera.viewTR[0] - camera.viewBR[0]) + camera.viewTR[0];
                    for(var w = (Math.floor(l/rt3) + 0.5*((h/1.5)%2))*rt3 - rt3; w < r + rt3; w += rt3){
                        pnt = {x: w, y: h};
                        ind = map.indexAt(pnt);
                        if (ind != undefined) {queue.push([pnt, map.tiles[ind]]);}
                    }
                }

            }
            // use the TileRenderInfo queue to calculate requisite memory resources
            var maxdex = 0;
            queue.forEach(function(tri){
                maxdex += tri[1].indices.length;
            });
            // only create new buffers if they are too small. Otherwise slice them up
            if(positions.buffer.byteLength < maxdex * 8){
                positions = new Float32Array(maxdex * 8);
                normals = new Float32Array(maxdex * 8);
                colors = new Float32Array(maxdex * 12);
            }
            var x, y, z, t, index = 0;
            queue.forEach(function(tri){
                x = tri[0].x;
                y = tri[0].y;
                z = tri[1].elevation;
                t = tri[1];
                t.indices.forEach(function(meshIndex, normalIndex){
                    var n = t.normals[normalIndex];
                    colors[index] = t.color[0];
                    normals[index] = n[0];
                    positions[index++] = Tile.mesh[meshIndex][0] + x;
                    colors[index] = t.color[1];
                    normals[index] = n[1];
                    positions[index++] = Tile.mesh[meshIndex][1] + y;
                    colors[index] = t.color[2];
                    normals[index] = n[2];
                    positions[index++] = Tile.mesh[meshIndex][2] + z;
                });
            });

            // twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.indices, buffers.indices.data);
            bufferInfo.numElements = index / 3;
            twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.a_color, colors);
            twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.a_normal, normals);
            twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.a_position, positions);

            gl.useProgram(paperSPI.program);
            twgl.setBuffersAndAttributes(gl, paperSPI, bufferInfo);
            twgl.setUniforms(paperSPI, uniforms);
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