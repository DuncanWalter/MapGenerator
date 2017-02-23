
require(["src/Map", "src/Camera", "src/plainShaders"],
    function(Map, Camera, plainShaders) {
        // sets up a webgl context for the canvas
        var canvas = document.getElementById("map-canvas");
        var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        // plainSPI : ShaderProgramInfo
        var plainSPI = twgl.createProgramInfo(gl, [plainShaders.vertex, plainShaders.fragment]);
        // paperSPI : ShaderProgramInfo
        var paperSPI = null;

        console.dir(document.getElementById("plain-vertex"));

        setTimeout(function(){
            twgl.createProgramInfo(gl, ["plain-vertex","plain-fragment"]);
        }, 5000);

        var map = new Map({
            elevationPerlin: {

            },
            continentPoisson: {

            },
            size: {
                width: 78,
                height: 32
            }
        });

        var camera = new Camera(gl, plainSPI, paperSPI, map);

        var delta = 0; // delta : (Seconds :: float)
        var now = Date.now(); // now : (POSIXTime : int)

        // render :: (time : POSIXTime) -> void
        function render(time){
            delta = (time - now) / 1000;
            now = time;

            //
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