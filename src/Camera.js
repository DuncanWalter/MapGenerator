define(["lib/TWGL.min", "src/Input"],
    function(twgl, Input) {
        /*
         Camera :: (gl: WebGLContext, plainSPI: ShaderProgramInfo, paperSPI: ShaderProgramInfo, map: Map) -> {
             render: (delta: Seconds) -> void,

         }
         */
        return function Camera(gl, map) {
            var rt3 = Math.sqrt(3);
            var v3 = twgl.v3;
            var m4 = twgl.m4;

            var input = new Input();
            var focus = [map.width/2*rt3, map.height*0.75];
            var zoom = 1;

            var MIN_THETA = 0.2 * Math.PI;
            var MAX_THETA = 0.2 * Math.PI;
            var MAX_HEIGHT = (map.height - 1) * 0.75 / Math.tan(MIN_THETA / 2);
            var MED_HEIGHT = (map.height - 1) * 0.375 / Math.tan(MAX_THETA / 2);


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
            this.getZoom = function(){
                return zoom;
            };

            this.getTheta = function(){
                switch(true){
                    case zoom < 1.0:
                        throw "Invalid zoom value";
                    case zoom <= 2.0:
                        return MIN_THETA + (zoom - 1) * (MAX_THETA-MIN_THETA);
                        break;
                    default:
                        return MAX_THETA;
                }
            };

            this.getFocus = function(){
                return [focus[0], focus[1], 0];
            };
            this.getPosition = function(){
                switch(true){
                    case zoom <  1.0:
                        throw "Invalid zoom value";
                    case zoom <= 2.0:
                        return [focus[0], focus[1], MAX_HEIGHT - (zoom - 1) * (MAX_HEIGHT-MED_HEIGHT)];
                        break;
                    case zoom <= 4.0:
                        return [focus[0], focus[1] - 3 * (zoom - 2), 2 * MED_HEIGHT / zoom];
                        break;
                    default:
                        return [focus[0], focus[1] - 6, 2 * MED_HEIGHT / zoom];
                        break;
                }
            };

            var elapsed = 0;
            this.update = function(delta, uniforms){
                elapsed += delta;

                console.log(zoom);

                var cursor = input.pollCursor();
                if (input.stateOf(69)) zoom *= 1.03;
                if (cursor.dw > 0)     zoom *= 1.13;
                if (input.stateOf(81)) zoom /= 1.03;
                if (cursor.dw < 0)     zoom /= 1.13;
                if (input.stateOf(39) || input.stateOf(68)) focus[0] += delta * 30 / zoom;
                if (cursor.x > gl.canvas.clientWidth  - 10) focus[0] += delta * 30 / zoom;
                if (input.stateOf(37) || input.stateOf(65)) focus[0] -= delta * 30 / zoom;
                if (cursor.x < 10)                          focus[0] -= delta * 30 / zoom;
                if (input.stateOf(38) || input.stateOf(87)) focus[1] += delta * 30 / zoom;
                if (cursor.y < 10)                          focus[1] += delta * 30 / zoom;
                if (input.stateOf(40) || input.stateOf(83)) focus[1] -= delta * 30 / zoom;
                if (cursor.y > gl.canvas.clientHeight - 10) focus[1] -= delta * 30 / zoom;
                zoom = Math.min(Math.max(zoom, 1), MED_HEIGHT/2.5);
                focus[0] %= map.width * rt3;

                // this.x += delta * 3;

                // this.z = Math.sin(elapsed/5) * 12 + 20;
                // this.y = map.height*0.75 + this.z / 2 - 16;

                //
                // // TODO fetch input
                //
                // var frictionMagntude = delta * friction;
                // var manualMagnitude = delta * acc*(1 - vel/maxspd) + frictionMagnitude; // this use of friction magnitude is strange in R3
                //
                //

                // establish shader uniforms
                uniforms.u_lightAngle = v3.normalize([Math.cos(elapsed/3), 0, Math.sin(elapsed/3) + 0.15]);
                uniforms.u_projection = twgl.m4.identity(); // actually calculated below

                var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;



                function calculateViewBox(that){
                    // vertical viewing angle, screen aspect ratio, near, far, memoryTarget
                    m4.perspective(that.getTheta(), aspect, 0.3, 3000, uniforms.u_projection);
                    var view = m4.inverse(
                        twgl.m4.lookAt(
                            that.getPosition(), // eye location
                            that.getFocus(), // focus location
                            [0, 1, 0] // up vector
                        )
                    );
                    m4.multiply(uniforms.u_projection, view, uniforms.u_projection);
                    // To clip our view and not exhaust computers, we clip the view
                    var projInv =  m4.inverse(uniforms.u_projection);
                    var thisVec = that.getPosition();
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
                    that.viewBR = viewBox[0]; // world coordinate vectors of the viewBox
                    that.viewTR = viewBox[1]; // world coordinate vectors of the viewBox
                    that.viewBL = viewBox[2]; // world coordinate vectors of the viewBox
                    that.viewTL = viewBox[3]; // world coordinate vectors of the viewBox
                }
                calculateViewBox(this);

                if(this.viewTR[1] - this.viewBR[1] > (map.height-1)*1.5){
                    zoom *= (this.viewTR[1] - this.viewBR[1]) / ((map.height-1)*1.5);
                    calculateViewBox(this);
                }
                if(this.viewTR[1] > (map.height - 1)*1.5){
                    focus[1] =  (map.height - 1)*1.5 - (this.viewTR[1] - focus[1]);
                    calculateViewBox(this);
                }
                if(this.viewBR[1] < 0){
                    focus[1] = (focus[1] - this.viewBR[1]);
                    calculateViewBox(this);
                }


                uniforms.u_viewPosition = this.getPosition();

            };

            this.destroy = function(){


            }

        }
    }
);