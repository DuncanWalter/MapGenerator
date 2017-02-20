/**
 * Created by Duncan on 2/20/2017.
 */
define(["src/Map", "src/Camera"],
    function(Map, Camera) {

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

        var camera = new Camera(map);

        var delta = 0; // delta : (Seconds :: float)
        var now = Date.now(); // now : (POSIXTime : int)

        // render :: (time : POSIXTime) -> void
        function render(time){
            delta = (time - now) / 1000;
            now = time;

            //
            camera.draw(delta);

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