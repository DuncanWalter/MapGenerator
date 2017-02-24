
require(["lib/TWGL.min", "src/Map", "src/Camera", "src/plainShaders"],
    function(twgl, Map, Camera, plainShaders) {
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