define(["lib/TWGL.min", "src/PerlinAt", "src/PoissonDistribution", "src/Tile"],
    function(twgl, PerlinGenerator, PoissonGenerator, Tile) {
        /*
         Camera :: (gl: WebGLContext, plainSPI: ShaderProgramInfo, paperSPI: ShaderProgramInfo, map: Map) -> {
             render: (delta: Seconds) -> void,

         }
         */
        // TODO redefine this to take a map and some camera settings. get rendering out of here
        return function Camera(gl, plainSPI, paperSPI, map) {
            var rt3 = Math.sqrt(3);
            this.x = map.width/2*rt3;
            this.y = map.height*0.75;


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

            var elapsed = 0;
            this.update = function(delta, uniforms){
                elapsed += delta;
                this.x += delta * 3;
                this.x %= map.width * rt3;


            //
            //     // TODO fetch input
            //
            //     var frictionMagntude = delta * friction;
            //     var manualMagnitude = delta * acc*(1 - vel/maxspd) + frictionMagnitude; // this use of friction magnitude is strange in R3
            //
            //

                // establish shader uniforms
                uniforms.projection = twgl.m4.identity(); // actually calculated below
                // camera: [map.width / 2 * Math.sqrt(3), map.height * 3 / 4, -1] // for the eventual paper shader

                var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
                twgl.m4.ortho(-aspect*map.height, aspect*map.height, map.height, -map.height, -1, 1, uniforms.projection);

                this.viewTL = {x: -aspect*map.height + this.x, y: -map.height + this.y};
                this.viewTR = {x: +aspect*map.height + this.x, y: -map.height + this.y};
                this.viewBL = {x: -aspect*map.height + this.x, y: +map.height + this.y};
                this.viewBR = {x: +aspect*map.height + this.x, y: +map.height + this.y};

                // //3D. If you like that sort of thing
                // uniforms.projection = twgl.m4.perspective(30 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 30);
                var view = twgl.m4.inverse(
                    twgl.m4.lookAt(
                        [this.x, this.y, 1], // eye location
                        [this.x, this.y, 0], // focus location
                        [0, 1, 0] // up vector
                    )
                );
                uniforms.projection = twgl.m4.multiply(uniforms.projection, view);
                // var world = twgl.m4.rotationY(elapsed / 4);
                // uniforms.projection = twgl.m4.multiply(uniforms.projection, world);
            };

            this.destroy = function(){

            }
        }
    }
);