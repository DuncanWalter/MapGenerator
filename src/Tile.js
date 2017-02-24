/**
 * Created by Duncan on 2/21/2017.
 */
define(function(){



    /*
    Tile :: (index: int, biome: (BiomeEnum :: int), terrain: (TerrainEnum :: int)) -> {
        static mesh: float[];
        indices: int[];

        index: int,
        color: float[] | float.length == 4
    }
    */
    function Tile(index, biome, terrain){

        this.index = index;

        // sets color based on biome
        switch(biome){
            case 0: // OCEAN
                this.color = [0, 0, 0, 1];
                break;
            case 1: // DESSERT
                this.color = [1, 0, 0, 1];
                break;
            case 2: // JUNGLE
                this.color = [0, 1, 0, 1];
                break;
            case 3: // PLAINS
                this.color = [1, 1, 0, 1];
                break;
            case 4: // DREARY
                this.color = [0, 1, 1, 1];
                break;
            case 5: // CRISP
                this.color = [1, 0, 1, 1];
                break;
            case 6: // TUNDRA
                this.color = [0, 0, 1, 1];
                break;
            case 7: // ICE_CAP
                this.color = [1, 1, 1, 1];
                break;
            default: // UNDEFINED
                throw "PANIC during tile instantiation- given biome is not defined";
                break;
        }

        // sets indices based on terrain
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

    // tiles have a uniform mesh available for rendering
    var rt3 = Math.pow(3, 0.5);
    Tile.mesh = Tile.prototype.mesh = [
        [0, 1, 0],
        [rt3/2, 0.5, 0],
        [rt3/2, -0.5, 0],
        [0, -1, 0],
        [-rt3/2, -0.5, 0],
        [-rt3/2, 0.5, 0],
        [0, 0, 0.6]
    ];

    return Tile;
});