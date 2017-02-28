/**
 * Created by Duncan on 2/21/2017.
 */
define(["lib/TWGL.min"],
    function(twgl){


        // tiles have a uniform mesh available for rendering
        var rt3 = Math.pow(3, 0.5);

        // Defining a single mesh containing all the points used by tiles
        Tile.mesh = (function(mesh){ // To simplify mesh creation, we process a human-friendly version
            return mesh.reduce(function(accumulator, point, index){
                var j = index * 6;
                accumulator[j++] = point;
                var temp = point;
                for(var i = 0; i < 5; i++){
                    temp = [
                        temp[0]*0.5 - temp[1]*0.5*rt3,
                        temp[0]*0.5*rt3 + temp[1]*0.5,
                        temp[2]
                    ];
                    accumulator[j++] = temp;
                }
                return accumulator;
            }, new Array(mesh.length * 6));
        })([ // The raw mesh to be processed by the function above
            [0, 1, 0],          // outer lip
            [0, 1, -1],
            [0, 0.85, 0],       // inner lip
            [0, 0.85, 0.07],    // raised inner lip
            [0, 0.85, -0.07],   // lowered inner lip
            [0, 0.5, 0],        // filler neutral
            [0, 0.5, 0.07],     // filler raised
            [0, 0.5, -0.07],    // filler lowered
            [0, 0.08, 0.6],     // cone
            [0, 0, 0.6],        // peak
            [0, 0, 0]           // center
        ]);

        var indexSets = (function(indexSets){
            function cycle(indexCluster){
                indexCluster.forEach(function(index, iterator){
                    indexCluster[iterator] = index-index%6+(index+1)%6;
                })
            }
            var a = [];
            function process(indexSet){
                if(typeof a != typeof indexSet){
                    a.push(indexSet);
                } else if(indexSet.length == 3) {
                    for(var i = 0; i < 6; i++){
                        a.push.apply(a, indexSet);
                        cycle(indexSet);
                    }
                }
            }
            function shatter(ic){
                return [ic.splice]
            }
            indexSets.forEach(function(indexSet){
                process(indexSet);
            });
            return a;
        })([
            [1, 0, 36],
            [1, 36, 37],
            [37, 36, 60],
            [0, 1, 7],
            [1, 8, 7]
        ]);


        // TODO calculate ALL the face normals once when the program loads...
        // TODO get arrays of arrays of indices by terrain type and of color by biome type
        function FaceNormals(mesh, indices){
            var pnt0, pnt1, pnt2;
            var vec1, vec2, vec3;
            var normals = new Array(indices.length);
            for(var i = 0; i < indices.length;){
                // grab the points described by the indices and the mesh
                pnt0 = mesh[indices[i++]];
                pnt1 = mesh[indices[i++]];
                pnt2 = mesh[indices[i++]];
                // calculate two of the vectors between the 3 points ...
                vec1 = [pnt1[0]-pnt0[0], pnt1[1]-pnt0[1], pnt1[2]-pnt0[2]];
                vec2 = [pnt2[0]-pnt0[0], pnt2[1]-pnt0[1], pnt2[2]-pnt0[2]];
                // ... and cross them to find an orthogonal vector
                vec3 = twgl.v3.normalize(twgl.v3.cross(vec2, vec1));
                normals[i - 3] = [vec3[0], vec3[1], vec3[2]];
                normals[i - 2] = normals[i - 3];
                normals[i - 1] = normals[i - 3];
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
                    this.indices = indexSets;
                    this.normals = FaceNormals(Tile.mesh, this.indices);
                    break;
                case 1: // VALLEYS
                    this.indices = indexSets;
                    this.normals = FaceNormals(Tile.mesh, this.indices);
                    break;
                case 2: // LOWLANDS
                    this.indices = indexSets;
                    this.normals = FaceNormals(Tile.mesh, this.indices);
                    break;
                case 3: // FLATS
                    this.indices = indexSets;
                    this.normals = FaceNormals(Tile.mesh, this.indices);
                    break;
                case 4: // HILLS
                    this.indices = indexSets;
                    this.normals = FaceNormals(Tile.mesh, this.indices);
                    break;
                case 5: // MOUNTAINS
                    this.indices = indexSets;
                    this.normals = FaceNormals(Tile.mesh, this.indices);
                    break;
                default: // UNDEFINED
                    throw "PANIC during tile instantiation- given terrain is not defined";
                    break;
            }
        }



        return Tile;
    }
);