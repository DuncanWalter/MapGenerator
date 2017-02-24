
// TODO split Utils into separate definitions for modularity
// TODO utilize the require js optimizer
// TODO use an indexed draw for better efficiency
// TODO attempt to reuse buffers and work off of buffer views for better efficiency
// TODO redo noise generator naming and class schemes to reflect new functional format
// TODO finish implementing the new functional format of the noise generators
// TODO implement the new Continent generator
// TODO offload the main render call from the camera to Main + Map
// TODO implement camera input responsiveness

require(["lib/TWGL.min", "src/Map", "src/Camera", "src/plainShaders", "src/PoissonGenerator"],
    function(twgl, Map, Camera, plainShaders, PoissonDistribution) {

        var PD = new PoissonDistribution({width: 10, height: 10}, {nodeDensity: 10});
        console.dir(PD);
        return;

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

        var delta = 0; // delta : (Seconds :: float)
        var now = Date.now(); // now : (POSIXTime : int)

        // render :: (time : POSIXTime) -> void
        function render(time){
            delta = (time - now) / 1000;
            now = time;

            // camera.reposition();
            // TODO the camera.render call should not exist...
            camera.render(delta);

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