define(["lib/TWGL.min", "src/Input"],
    function(twgl, Input) {
        /*
         Camera :: (gl: WebGLContext, plainSPI: ShaderProgramInfo, paperSPI: ShaderProgramInfo, map: Map) -> {
             render: (delta: Seconds) -> void,

         }
         */
        // TODO redefine this to take a map and some camera settings. get rendering out of here
        return function Camera(gl, plainSPI, paperSPI, map) {
            var rt3 = Math.sqrt(3);
            var v3 = twgl.v3;
            var m4 = twgl.m4;
            this.x = map.width/2*rt3;
            this.y = map.height*0.75 - 12.5;
            this.z = 13;

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

                // var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
                // twgl.m4.ortho(-aspect*map.height*0.5, aspect*map.height*0.5, map.height*0.5, -map.height*0.5, -10, 100, uniforms.projection);
                //
                // this.viewTL = {x: -aspect*map.height*0.5 + this.x, y: -map.height*0.5 + this.y};
                // this.viewTR = {x: +aspect*map.height*0.5 + this.x, y: -map.height*0.5 + this.y};
                // this.viewBL = {x: -aspect*map.height*0.5 + this.x, y: +map.height*0.5 + this.y};
                // this.viewBR = {x: +aspect*map.height*0.5 + this.x, y: +map.height*0.5 + this.y};

                var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
                // twgl.m4.ortho(-aspect*map.height*0.5, aspect*map.height*0.5, map.height*0.5, -map.height*0.5, -10, 100, uniforms.projection);
                //
                // this.viewTL = {x: -aspect*map.height*0.5 + this.x, y: +map.height*0.5 + this.y};
                // this.viewTR = {x: +aspect*map.height*0.5 + this.x, y: +map.height*0.5 + this.y};
                // this.viewBL = {x: -aspect*map.height*0.5 + this.x, y: -map.height*0.5 + this.y};
                // this.viewBR = {x: +aspect*map.height*0.5 + this.x, y: -map.height*0.5 + this.y};

                // vertical viewing angle, screen aspect ratio, near, far, memoryTarget
                m4.perspective(Math.PI * 0.25, aspect, 0.3, 300, uniforms.projection);
                var view = m4.inverse(
                    twgl.m4.lookAt(
                        [this.x, this.y, this.z], // eye location
                        [this.x, this.y+25, 0.0 ], // focus location
                        [0, 1, 0] // up vector
                    )
                );
                m4.multiply(uniforms.projection, view, uniforms.projection);

                // To clip our view and not exhaust computers, we clip the view
                var projInv =  m4.inverse(uniforms.projection);
                var thisVec = [this.x, this.y, this.z];
                var viewBox = [   // Calculating the world coordinates at the corners of the canvas
                    [+1, -1, -1], // BR post-projection frustum vertex
                    [+1, +1, -1], // TR post-projection frustum vertex
                    [-1, -1, -1], // BL post-projection frustum vertex
                    [-1, +1, -1]  // TL post-projection frustum vertex
                ].map(function(vec){
                    m4.transformPoint(projInv, vec, vec);
                    v3.subtract  (vec, thisVec, vec);
                    v3.divScalar (vec, -vec[2]/thisVec[2], vec);
                    return v3.add(vec, thisVec);
                });
                this.viewBR = viewBox[0]; // world coordinate vectors of the viewBox
                this.viewTR = viewBox[1]; // world coordinate vectors of the viewBox
                this.viewBL = viewBox[2]; // world coordinate vectors of the viewBox
                this.viewTL = viewBox[3]; // world coordinate vectors of the viewBox

            };

            this.destroy = function(){

            }
        }
    }
);