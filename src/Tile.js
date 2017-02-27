/**
 * Created by Duncan on 2/21/2017.
 */
define(["lib/TWGL.min"],
    function(twgl){

        // TODO calculate ALL the face normals once when the program loads...

        // tiles have a uniform mesh available for rendering
        var rt3 = Math.pow(3, 0.5);
        Tile.mesh = [
            [0, 1, 0],
            [rt3/2, 0.5, 0],
            [rt3/2, -0.5, 0],
            [0, -1, 0],
            [-rt3/2, -0.5, 0],
            [-rt3/2, 0.5, 0],
            [0, 0, 0.6]
        ];

        // TODO get arrays of arrays of indices by terrain type and of color by biome type

        var pnt0, pnt1, pnt2;
        var vec1, vec2, vec3;
        function FaceNormals(mesh, indices){
            // TODO is this really the length I want?
            var normals = new Array(indices/3);
            for(var i = 0; i < indices.length;){
                // grab the points described by the indices and the mesh
                pnt0 = mesh[i++];
                pnt1 = mesh[i++];
                pnt2 = mesh[i++];
                // calculate two of the vectors between the 3 points
                vec1 = twgl.vec3.create([pnt1[0]-pnt0[0], pnt1[1]-pnt0[1], pnt1[2]-pnt0[2]]);
                vec2 = twgl.vec3.create([pnt0[0]-pnt2[0], pnt0[1]-pnt2[1], pnt0[2]-pnt2[2]]);
                // ... and cross them to find an orthogonal vector
                vec3 = twgl.vec3.normalize(twgl.vec3.cross(vec1, vec2));
                normals[i/3] = [vec3.x, vec3.y, vec3.z];
            }
            return normals;
        }


        /*
        Tile :: (index: int, biome: (BiomeEnum :: int), elevation: (PerlinValue :: float)) -> {
            static mesh: float[];
            indices: int[];

            index: int,
            color: float[] | float.length == 4
        }
        */
        function Tile(index, biome, elevation){

            this.index = index;
            this.elevation = (biome==0) ? elevation * 0.27 - 0.23 : elevation * 0.18 + 0.23;

            // sets color based on biome
            // switch(biome){
            //     case 0: // OCEAN // TODO remember to deal with coastal tiles
            //         this.color = [0, 0, 0, 1];
            //         break;
            //     case 1: // DESSERT
            //         this.color = [1, 0, 0, 1];
            //         break;
            //     case 2: // JUNGLE
            //         this.color = [0, 1, 0, 1];
            //         break;
            //     case 3: // PLAINS
            //         this.color = [1, 1, 0, 1];
            //         break;
            //     case 4: // DREARY
            //         this.color = [0, 1, 1, 1];
            //         break;
            //     case 5: // CRISP
            //         this.color = [1, 0, 1, 1];
            //         break;
            //     case 6: // TUNDRA
            //         this.color = [0, 0, 1, 1];
            //         break;
            //     case 7: // ICE_CAP
            //         this.color = [1, 1, 1, 1];
            //         break;
            //     default: // UNDEFINED
            //         throw "PANIC during tile instantiation- given biome is not defined";
            //         break;
            // }

            // uses a grayscale color by biome
            var color = Math.min((biome + (elevation)*0.35) / 7, 1);
            this.color = [color, color, color, 1];
            if(biome==0)this.color=[0.55, 0.75, 0.90, 1];
            // sets indices based on terrain
            var terrain = Math.floor((elevation + 1) * 3);
            switch(terrain){
                case 0: // OCEAN
                    this.indices = [
                        0, 1, 2,
                        0, 2, 3,
                        0, 3, 4,
                        0, 4, 5
                    ];
                    break;
                case 1: // VALLEYS
                    this.indices = [
                        0, 1, 2,
                        0, 2, 3,
                        0, 3, 4,
                        0, 4, 5
                    ];
                    break;
                case 2: // LOWLANDS
                    this.indices = [
                        0, 1, 2,
                        0, 2, 3,
                        0, 3, 4,
                        0, 4, 5
                    ];
                    break;
                case 3: // FLATS
                    this.indices = [
                        0, 1, 2,
                        0, 2, 3,
                        0, 3, 4,
                        0, 4, 5
                    ];
                    break;
                case 4: // HILLS
                    this.indices = [
                        0, 1, 2,
                        0, 2, 3,
                        0, 3, 4,
                        0, 4, 5
                    ];
                    break;
                case 5: // MOUNTAINS
                    this.indices = [
                        6, 0, 1,
                        6, 1, 2,
                        6, 2, 3,
                        6, 3, 4,
                        6, 4, 5,
                        6, 5, 0
                    ];
                    break;
                default: // UNDEFINED
                    throw "PANIC during tile instantiation- given terrain is not defined";
                    break;
            }
        }



        return Tile;
    }
);