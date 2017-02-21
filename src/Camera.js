define(["src/PerlinGenerator", "src/PoissonGenerator"],
    function(PerlinGenerator, PoissonGenerator) {
        /*
         Camera :: (gl: WebGLContext, plainSPI: ShaderProgramInfo, paperSPI: ShaderProgramInfo, map: Map) -> {
             render: (delta: Seconds) -> void,

         }
         */
        return function Camera(gl, plainSPI, paperSPI, map) {

            var proto = this.prototype;

            this.height = settings.size.height;
            this.width = settings.size.width;
            this.tiles = [];
            for(var i = 0; i < this.height; i++){
                this.tiles[i] = [];
                for(var j = 0; j < this.width; j++){
                    this.tiles[i][j] = null;
                }
            }

            var elevationPerlinNoise = PerlinGenerator.generate(settings.size, settings.elevationPerlin);
            var continentPoissonNoise = PoissonGenerator.generate(settings.size, settings.continentPoisson);



            proto.getTileIndexEShift = (proto.getTileIndexEShift || function(index, distance){

            });
        }
    }
);