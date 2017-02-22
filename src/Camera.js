define(["src/PerlinGenerator", "src/PoissonGenerator"],
    function(PerlinGenerator, PoissonGenerator) {
        /*
         Camera :: (gl: WebGLContext, plainSPI: ShaderProgramInfo, paperSPI: ShaderProgramInfo, map: Map) -> {
             render: (delta: Seconds) -> void,

         }
         */
        return function Camera(gl, plainSPI, paperSPI, map) {

            var proto = Camera.prototype;

            proto.render = (proto.render || function(delta){
                map.getTileIndexEShift(32, 1);
            });
        }
    }
);