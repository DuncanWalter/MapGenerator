define(["lib/TWGL.min", "src/PerlinGenerator", "src/PoissonGenerator", "src/Tile"],
    function(twgl, PerlinGenerator, PoissonGenerator, Tile) {
        /*
         Camera :: (gl: WebGLContext, plainSPI: ShaderProgramInfo, paperSPI: ShaderProgramInfo, map: Map) -> {
             render: (delta: Seconds) -> void,

         }
         */
        // TODO redefine this to take a map and some camera settings. get rendering out of here
        return function Camera(gl, plainSPI, paperSPI, map) {



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


            // var
            // var acc = {};
            // var vel = {};
            // var pos = {x: , y: , z: , zoom: };


            // var pan = twgl.Vec3.create(0, 0, 0);
            // var panSettings = {};

            var zim = 1;

            // var zoom = {
            //     speed: 1,
            //     friction: 1,
            //     acceleration: 1,
            //
            // };
            //
            this.update  = function(delta){
            //
            //     // TODO fetch input
            //
            //     var frictionMagntude = delta * friction;
            //     var manualMagnitude = delta * acc*(1 - vel/maxspd) + frictionMagnitude; // this use of friction magnitude is strange in R3
            //
            //
            };

            this.destroy = function(){

            }
        }
    }
);