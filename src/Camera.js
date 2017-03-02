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

            var input = new Input();
            var focus = [map.width/2*rt3, map.height*0.75 - 15, 0];
            var zoom = 1;


            // this.x = map.width/2*rt3;
            // this.y = map.height*0.75 - 15;
            // this.z = 14;

            // var
            // var acc = {};
            // var vel = {};
            // var pos = {x: , y: , z: , zoom: };

            // var pan = twgl.Vec3.create(0, 0, 0);
            // var panSettings = {};

            // var zim = 1;

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

                var cursor = input.pollCursor();
                if (input.stateOf(69)) zoom *= 1.03;
                if (cursor.dw > 0)     zoom *= 1.13;
                if (input.stateOf(81)) zoom /= 1.03;
                if (cursor.dw < 0)     zoom /= 1.13;
                if (input.stateOf(39) || input.stateOf(68)) focus[0] += delta * 100;
                if (input.stateOf(37) || input.stateOf(65)) focus[0] -= delta * 100;
                if (input.stateOf(38) || input.stateOf(87)) focus[1] += delta * 100;
                if (input.stateOf(40) || input.stateOf(83)) focus[1] -= delta * 100;
                focus[0] %= map.width * rt3;

                // this.x += delta * 3;

                // this.z = Math.sin(elapsed/5) * 12 + 20;
                // this.y = map.height*0.75 + this.z / 2 - 16;


            //
            //     // TODO fetch input
            //
            //     var frictionMagntude = delta * friction;
            //     var manualMagnitude = delta * acc*(1 - vel/maxspd) + frictionMagnitude; // this use of friction magnitude is strange in R3
            //
            //

                // establish shader uniforms
                uniforms.u_lightAngle = v3.normalize([Math.cos(elapsed/3), 0, Math.sin(elapsed/3)]);
                uniforms.u_viewPosition = [focus[0], focus[1] - 4, 20 / zoom];
                uniforms.u_projection = twgl.m4.identity(); // actually calculated below

                var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;


                // vertical viewing angle, screen aspect ratio, near, far, memoryTarget
                m4.perspective(Math.PI * 0.29, aspect, 0.3, 3000, uniforms.u_projection);
                var view = m4.inverse(
                    twgl.m4.lookAt(
                        [focus[0], focus[1] - 4, 20 / zoom], // eye location
                        focus, // focus location
                        [0, 1, 0] // up vector
                    )
                );
                m4.multiply(uniforms.u_projection, view, uniforms.u_projection);

                // To clip our view and not exhaust computers, we clip the view
                var projInv =  m4.inverse(uniforms.u_projection);
                var thisVec = [focus[0], focus[1] - 4, 20 / zoom];
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