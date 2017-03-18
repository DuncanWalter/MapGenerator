
define(["src/PerlinAt", "src/PoissonDistribution", "src/Tile"],
    function(PerlinAt, PoissonDistribution, Tile) {
        var rt3 = Math.sqrt(3);

        /*
        Map :: ({
            size: (SizeSettings :: {
                height: int,
                width: int
            }),
            elevationPerlin: PerlinSettings,
            continentPoisson: PoissonSettings,
        }) -> {
            tiles: Tile[],
            height: int,
            width: int
        }
        */
        return function Map(settings) {

            var h = this.height = settings.size.height + 2;
            var w = this.width  = settings.size.width;
            var tiles = new Array(this.width * this.height);
            for(var i = 0; i < tiles.length; i++){
                tiles[i] = {index: i};
            }

            /*
            // pointAt returns the Point at the canonical center of the tile with the given index.
            pointAt :: (index: int) -> Point
            */
            function pointAt(index) {
                var y = Math.floor(index/w) * 1.5;
                var x = ((index + y/3) % w) * rt3;
                return {x: x, y: y};
            }
            this.pointAt = pointAt;

            /*
            // indexAt returns the index of the tile under a given point.
            indexAt :: (point: Point) -> MapIndex
            */
            function indexAt(point) {
                var row = Math.ceil(Math.floor(point.y/0.75)/2);
                var col = Math.ceil(Math.floor(2*point.x/rt3 - row)/2);
                col = (col % w + w) % w;
                if(row < 0 || row >= h){return undefined}
                return w * row + col;
            }
            this.indexAt = indexAt;

            // shifts to the right along rows
            function rowShift(index, distance) {
                var temp = (index - (index % w)) + ((index + distance) % w);
                return (0 <= temp && temp < w * h) ? temp : undefined;
            }

            // shifts down and right along columns
            function colShift(index, distance) {
                var temp = (Math.floor(index / w) + distance) * w + index % w;
                return (0 <= temp && temp < w * h) ? temp : undefined;
            }

            // shifts down and left "diagonally"
            function altShift(index, distance) {
                var temp = (Math.floor(index / w) + distance) * w + index % w;
                temp = (temp - (temp % w)) + ((temp - distance) % w);
                return (0 <= temp && temp < w * h) ? temp : undefined;
            }

            function adjacentTo(tile){
                var index;
                var adjacent = [];

                index = rowShift(tile.index, +1);
                if(index != undefined)adjacent.push(tiles[index]);
                index = rowShift(tile.index, -1);
                if(index != undefined)adjacent.push(tiles[index]);
                index = colShift(tile.index, +1);
                if(index != undefined)adjacent.push(tiles[index]);
                index = colShift(tile.index, -1);
                if(index != undefined)adjacent.push(tiles[index]);
                index = altShift(tile.index, +1);
                if(index != undefined)adjacent.push(tiles[index]);
                index = altShift(tile.index, -1);
                if(index != undefined)adjacent.push(tiles[index]);

                return adjacent;
            }

            var noiseSize = {
                width: w*rt3,
                height: 2 + (h - 1)*1.5
            };
            var dormant = [];
            var active  = [];

            // spin up the continent shapes
            (new PoissonDistribution(noiseSize, { // poisson info
                minRadius: Math.sqrt(3*h*w / 2.2/*continentCount*/),
                maxRadius: this.minRadius * 1.2,
                nodeDensity: 12
            })).forEach(function(point){
                // spores land at each continent
                var index = indexAt(point);
                if(index != undefined){
                    sporeLand(tiles[index]);
                }
            });
            function sporeLand(tile){
                if (tile.isLand) return;
                if (active.indexOf(tile) != active.lastIndexOf(tile)) return;
                tile.isLand = true;
                dormant.push(tile);
                adjacentTo(tile).forEach(function(tile){
                    if(!tile.isLand){
                        active.push(tile);
                    }
                });
            }
            while(active.length > 0 && dormant.length < w*h*0.55/*landMass ratio*/){
                sporeLand(active.splice(Math.floor(active.length*Math.random()), 1)[0]);
            }
            // set up the tile elevations
            dormant = [];
            active  = [];
            (new PoissonDistribution(noiseSize, {
                minRadius: 8,
                nodeDensity: 12
            })).forEach(function(point){
                var index = indexAt(point);
                if(index != undefined)sporeBiome(tiles[index]);
            });
            function sporeBiome(tile){
                var options = adjacentTo(tile).reduce(function(accum, c){
                    if(c.biome != undefined){
                        accum.push(c.biome);
                    } else {
                        active.push(c); // sneak this in here...
                    }
                    return accum;
                }, []);
                if(options.length == 0){
                    if(Math.random() > ((tile.isLand) ? 0.98 : 0.05 /*chaos variables*/)){
                        // TODO select biome based on elevation

                        tile.biome = [
                            [1, 1, 2, 3],
                            [5, 4, 2, 3],
                            [6, 6, 4, 5]
                        ][Math.floor((Math.abs(0.5-Math.floor(tile.index/w)/h)*5.9999999))][Math.floor(Math.random()*4)];
                    } else {
                        tile.biome = 0;
                    }
                } else {
                    tile.biome = options[Math.floor(Math.random()*options.length)];
                }
            }
            while(active.length > 0){
                sporeBiome(active.splice(Math.floor(active.length*Math.random()), 1)[0]);
            }

            var perlinAt = new PerlinAt(noiseSize, settings.elevationPerlin);




            this.tiles = tiles.map(function(tile, index){
                return (index >= w && index < w*h-w) ?
                    new Tile(index, tile.biome, perlinAt(pointAt(index))):
                    new Tile(index, 7, perlinAt(pointAt(index)));
            });





            // function BiomeGenerator(world) { // creates regions of biome and oceans
            //
            //     this.world = world;
            //     this.dormantTiles = [];
            //     this.activeTiles = [];
            //     this.perlinGenerator = perlinGenerator;
            //     this.discGenerator = discGenerator;
            //
            //     this.generate = function(oceanFrequency, regionRadius, continentCount, continentChaos){
            //
            //         var tempRandom;
            //         var temp;
            //
            //         //uses the disc generator to place roughly the right number of continents about the same distance form one another
            //         this.discGenerator.generate(Math.pow(world.length / (continentCount + 1 - (1 / continentCount)) * 1.1, 0.5), 20, 0.35);
            //
            //         for(var s = 0; s < world.length; s++){
            //             if(world.tiles[s].noded == true){
            //                 this.seedLand(this.world.tiles[s])
            //             }
            //         }
            //
            //         //while the world still needs more land, the continents randomly expand at their borders
            //         while(this.dormantTiles.length <= (this.world.length * (1.0 - oceanFrequency)) && this.activeTiles.length > 0){ // grows the land as long as there needs to be more
            //             tempRandom = Math.floor(Math.random() * this.activeTiles.length); // gets the random index needed
            //             temp = this.activeTiles[tempRandom]; // selects the random tile
            //             if(this.activeTiles.indexOf(temp) == this.activeTiles.lastIndexOf(temp)){ // if it's the only active one
            //                 this.growLand(temp); // the tile grows the land
            //             }
            //             this.activeTiles.splice(tempRandom, 1);
            //         }
            //
            //         // Resets after growing land in order to generate biomes
            //         this.activeTiles = []; // needs to be reset to deal with biomes
            //         perlinAt = new PerlinAt();
            //         (new PoissonDistribution(regionRadius, 20, 1)).forEach(function(point){
            //             this.tiles[indexAt(point)] = perlinAt(point);
            //         });
            //         // this.perlinGenerator.generate(0, 0.95, 5); // creates a humidity map for biome choices
            //
            //         //set the world's nodes up as the seeds for biomes. Biomes on continents get land iomes etc.
            //         for(var t = 0; t < world.tiles.length; t++){
            //             var tempTile = world.tiles[t];
            //             if(tempTile.noded == true){
            //                 this.seedBiome(tempTile, oceanFrequency, continentChaos);
            //             }
            //         }
            //
            //         //master loop: randomly picks tiles adjacent to a seeded biome and grows it
            //         while(this.activeTiles.length > 0){
            //             tempRandom = Math.floor(Math.random() * this.activeTiles.length); // gets the random index needed
            //             temp = this.activeTiles[tempRandom]; // selects the random tile
            //             this.growBiome(temp); // the tile picks a biome
            //             this.activeTiles.splice(tempRandom, 1);
            //         }
            //
            //         /*Biomes = {
            //          0: "Not Defined",
            //          1: "tundra",
            //          2: "(cold dry)",
            //          3: "temperate (cold wet)",
            //          4: "tropical (hot wet)",
            //          5: "arid (hot dry)",
            //          6: "desert",
            //          7: "neutral",
            //          8: "oceanic",
            //          9: "coastal"
            //          };*/
            //     };
            //
            //     this.seedBiome = function(tile, oceanFrequency, continentChaos) { // assigns a biome to a node, eventually bool should be a cutoff number instead
            //
            //         // if the tile isn't on land, make it a water tile
            //         var tempFactor = oceanFrequency / (1 - oceanFrequency);
            //         if((tile.land == false && Math.random() >= continentChaos / tempFactor) || Math.random() <= continentChaos){
            //             tile.biome = 8;
            //             if(Math.random() < continentChaos){
            //                 // tile.biome = 9;
            //             }
            //             tile.noded = true;
            //             this.sporeGrowth(tile);
            //             return;
            //         }
            //
            //         var polarity = (Math.floor(tile.index / world.width + 0.5)) / this.world.height; //gets halfway through calculating latitude
            //         polarity = 2 * Math.abs(polarity - 0.5); // sets latitude to between 0 and one, where 0 lies on the equator
            //
            //         var random = Math.random() * 80 + polarity * 280;
            //         random = Math.floor(random / 20) + 1; // sets random to an int from 1 to 18 inclusive
            //
            //         // Using the random variable to select a biome
            //         switch (random) {
            //             case (1 ): tile.biome = 1; break;
            //             case (2 ): tile.biome = 1; break;
            //             case (3 ): tile.biome = 1; break;
            //             case (4 ): tile.biome = 1; break;
            //             case (5 ): if(tile.perlin >= 0){tile.biome = 2;}else{tile.biome = 3;} break;
            //             case (6 ): if(tile.perlin >= 0){tile.biome = 2;}else{tile.biome = 3;} break;
            //             case (7 ): if(tile.perlin >= 0){tile.biome = 2;}else{tile.biome = 3;} break;
            //             case (8 ): if(tile.perlin >= 0){tile.biome = 2;}else{tile.biome = 3;} break;
            //             case (9 ): if(tile.perlin >= 0){tile.biome = 2;}else{tile.biome = 3;} break;
            //             case (10): if(tile.perlin >= 0){tile.biome = 4;}else{tile.biome = 5;} break;
            //             case (11): if(tile.perlin >= 0){tile.biome = 4;}else{tile.biome = 5;} break;
            //             case (12): if(tile.perlin >= 0){tile.biome = 4;}else{tile.biome = 5;} break;
            //             case (13): if(tile.perlin >= 0){tile.biome = 4;}else{tile.biome = 5;} break;
            //             case (14): if(tile.perlin >= 0){tile.biome = 4;}else{tile.biome = 5;} break;
            //             case (15): tile.biome = 6; break;
            //             case (16): tile.biome = 6; break;
            //             case (17): tile.biome = 6; break;
            //             case (18): tile.biome = 6; break;
            //         }
            //
            //         //keep the spread going
            //         tile.noded = true;
            //         this.sporeGrowth(tile);
            //     };
            //
            //     this.seedLand = function(tile){
            //         tile.land = true;
            //         tile.noded = true;
            //         this.dormantTiles.push(tile);
            //         this.sporeGrowth(tile);
            //     };
            //
            //     this.sporeGrowth = function(tile){
            //         var temp;
            //         //console.log("tracker 1");
            //         if(tile.getIndexRR(1) != null){
            //             temp = this.world.tiles[tile.getIndexRR(1)];
            //             if(temp.noded == false){this.activeTiles.push(temp);}
            //         }
            //         //console.log("tracker 2");
            //         if(tile.getIndexLL(1) != null){
            //             temp = this.world.tiles[tile.getIndexLL(1)];
            //             if(temp.noded == false){this.activeTiles.push(temp);}
            //         }
            //         //console.log("tracker 3");
            //         if(tile.getIndexUL(1) != null){
            //             temp = this.world.tiles[tile.getIndexUL(1)];
            //             if(temp.noded == false){this.activeTiles.push(temp);}
            //         }
            //         //console.log("tracker 4");
            //         if(tile.getIndexDR(1) != null){
            //             temp = this.world.tiles[tile.getIndexDR(1)];
            //             if(temp.noded == false){this.activeTiles.push(temp);}
            //         }
            //         //console.log("tracker 5");
            //         if(tile.getIndexUR(1) != null){
            //             temp = this.world.tiles[tile.getIndexUR(1)];
            //             if(temp.noded == false){this.activeTiles.push(temp);}
            //         }
            //         //console.log("tracker 6");
            //         if(tile.getIndexDL(1) != null){
            //             temp = this.world.tiles[tile.getIndexDL(1)];
            //             if(temp.noded == false){this.activeTiles.push(temp);}
            //         }
            //         //console.log("tracker 7");
            //     };
            //
            //     this.growBiome = function(tile){
            //         //checks to see if it needs a biome
            //         if(tile.noded == true){return;}
            //         //console.log("check1");
            //         //sets up a little array of nearby biomes
            //         var nearBiomes = [null, null, null, null, null, null];
            //
            //         if(tile.getIndexRR(1) != null){
            //             nearBiomes[0] = this.world.tiles[tile.getIndexRR(1)].biome;}
            //         if(tile.getIndexLL(1) != null){
            //             nearBiomes[1] = this.world.tiles[tile.getIndexLL(1)].biome;}
            //         if(tile.getIndexUL(1) != null){
            //             nearBiomes[2] = this.world.tiles[tile.getIndexUL(1)].biome;}
            //         if(tile.getIndexDR(1) != null){
            //             nearBiomes[3] = this.world.tiles[tile.getIndexDR(1)].biome;}
            //         if(tile.getIndexUR(1) != null){
            //             nearBiomes[4] = this.world.tiles[tile.getIndexUR(1)].biome;}
            //         if(tile.getIndexDL(1) != null){
            //             nearBiomes[5] = this.world.tiles[tile.getIndexDL(1)].biome;}
            //
            //         //console.log("check2");
            //         //cuts the null biomes out of the array
            //         for(var i = 0; i < nearBiomes.length;){
            //             if(nearBiomes[i] == null || nearBiomes[i] == 7){nearBiomes.splice(i,1); i -= 1}
            //             i += 1;
            //         }
            //         //console.log("check3");
            //         // if there are in fact nearby biomes...
            //         if(nearBiomes.length == 0){
            //             tile.biome = 7;
            //         }
            //         if(nearBiomes.length == 1){
            //             tile.biome = nearBiomes[0];
            //         }
            //         if(nearBiomes.length >1){
            //             //in the case that all surrounding biomes are same, set that as the biome
            //             tile.biome = nearBiomes[Math.floor(nearBiomes.length * Math.random())];
            //
            //             nearBiomes.sort(function(a,b){return a - b});
            //             if(nearBiomes[0] == nearBiomes[nearBiomes.length - 1]){
            //                 tile.biome = nearBiomes[0];
            //             }else{ // if it's caught between multiple biomes
            //                 if(nearBiomes.indexOf(8.0, 0) > -1){
            //                     tile.biome = 9; // sets shallow seas if on a coast
            //                 }
            //                 //else{tile.biome = 7;} // sets neutral biomes between regions
            //             }
            //         }
            //         //keep the spread going
            //         tile.noded = true;
            //         this.sporeGrowth(tile);
            //     };
            //
            //     this.growLand = function(tile){
            //         if(tile.noded == true || tile.land == true){return;}
            //
            //         //var tempBool = Math.random() >= continentChaos;
            //         tile.noded = true;
            //         this.dormantTiles.push(tile);
            //         //if(tempBool){
            //         this.sporeGrowth(tile);
            //         tile.land = true;
            //         //}
            //     };
            // }

        }
    }
);








// function Map(settings) { // settings :: {[sizeStats],[perlinStats],[biomeStats],randomSeed}
//
//     this.pathfinder = new Pathfinder(this);
//
//     this.initialize = function() {
//
//         /*World Constants*/
//         this.width  = 98; //the number of tiles in a single row
//         this.height = 55; //the number of rows in the world
//         this.length = this.width * this.height;
//         this.tileSize = 48; // number of pixels a tile is; initial size of a tile in grid coordinates; conversion factor from tiles to pixels
//
//         this.pixelWidth = this.width * this.tileSize; //length of the board in pixels
//         // this.pixelHeight = this.height * this.tileSize * 3/ 4 + (this.tileSize / 4); // height of the board in pixels
//
//         /*Map Tiles and other world variables*/
//         // THE ARRAY OF TILES
//         this.tiles = [];
//         for(var t = 0; t < this.width * this.height; t++){this.tiles[t] = new Tile(t, this);}
//
//         // describes the elevation shifts
//         this.perlinOpacity = 0.99; // 0 < perlinOpacity < 1; larger means that the smaller blooms matter more (tiles will be more dissimilar)
//         this.perlinDepth = 2; // 0 <= integer <= 4
//         this.perlinCentrality = 1; // 1 <= perlinCentrality; larger means more linear; smaller means more sinusoidal
//
//         // describes the den and resource placement
//         this.nodeSpacing = 4.5; // 6 / 7 / 8 is standard
//         this.nodeDensity = 20; // should be bigger than 10 for sure, but slows things down
//         this.nodeVarience = 1.0; // keep between 0 and 1
//
//         this.biomeRadius    = 5.50; // 6 ish is cool
//         this.oceanFrequency = 0.62; // from 0 to 1, describes precisely the amount of water that will appear
//         this.continentCount = 3.30; // defines how island-ish the world tends to be... is not exact every time, but does describe the world well.
//         this.continentChaos = 0.07; // the sprawl and invasion of continents and oceans
//
//         this.perlinGenerator = new PerlinNoiseGenerator(this);
//         this.nodeGenerator = new DiscNodeGenerator(this);
//         this.biomeGenerator = new BiomeGenerator(this, this.perlinGenerator, this.nodeGenerator);
//         this.biomeGenerator.generate(this.oceanFrequency, this.biomeRadius, this.continentCount, this.continentChaos);
//         this.perlinGenerator.generate(this.perlinDepth, this.perlinOpacity, this.perlinCentrality);
//         this.nodeGenerator.generate(this.nodeSpacing, this.nodeDensity, this.nodeVarience);
//
//         for(t = 0; t < this.length; t++){
//             this.tiles[t].setElevation(this.tiles[t].perlin, this.tiles[t].biome, this);
//             this.tiles[t].defineTile(this.tiles[t], this.tiles[t].biome, this.tiles[t].elevation);
//             // this.tiles[t].imageFile = this.tiles[t].selectImageFile(this.tiles[t].image);
//         }
//     };
//
//     /*
//      Index = the tile Index
//      Coords  are in grid coords measured in tiles
//      Pixels  are in grid coords measured in pixels
//      Screens are in grid coords measured in pixels w/ reference to the UL point of
//      the camera and factoring in scale (where things draw on the screen)
//      */
//
//     // coords translations to index
//     this.getIndexAtCoords   = function(x, y, optWidth){
//
//         var index;
//         var width = optWidth;
//         if(optWidth == null){
//             width = this.width;
//         }
//
//         // origin of the upper point
//         var xA;
//         var yA = Math.floor(y);
//         if (yA % 2 == 0) { //even row
//             xA = Math.floor(x  + 0.5);
//         } else { // odd row
//             xA = Math.floor(x) + 0.5 ;
//         }
//
//         // origin of the lower point
//         var xB;
//         var yB = Math.ceil(y);
//         if (yB % 2 == 0) { //even row
//             xB = Math.floor(x  + 0.5);
//         } else { // odd row
//             xB = Math.floor(x) + 0.5 ;
//         }
//
//         // calculates the index
//         if ((Math.pow(x - xA, 2) + Math.pow(y - yA, 2)) < (Math.pow(x - xB, 2) + Math.pow(y - yB, 2))){
//
//             index = yA * width + (xA - yA * 0.5) % width;
//             if((xA - yA * 0.5) % width <= -0.5){
//                 index += width;
//             }
//         } else{
//
//             index = yB * width + (xB - yB * 0.5) % width;
//             if((xB - yB * 0.5) % width <= -0.5){
//                 index += width;
//             }
//         }
//
//         //won't return an index outside the world
//         if (index < 0 || index >= (this.length)) {
//             index = null;
//         }
//
//         return index;
//     };
//     this.getCoordsAtPixels  = function(x, y){
//
//         var tempX = (x / this.tileSize);
//         var tempY = (y / this.tileSize * 4 / 3);
//
//         return {x: tempX, y: tempY};
//
//     };
//     this.getPixelsAtScreens = function(x, y, camera){
//
//         var tempX = camera.ULX + x / camera.scale;
//         var tempY = camera.ULY + y / camera.scale;
//         return {x: tempX, y: tempY};
//
//     };
//
//     this.getIndexAtPixels   = function(x, y, optWidth){
//
//         var tempCoords = this.getCoordsAtPixels(x, y);
//         var tempX = tempCoords.x;
//         var tempY = tempCoords.y;
//         return this.getIndexAtCoords(tempX, tempY, optWidth);
//
//     };
//     this.getIndexAtScreens  = function(x, y, optWidth, camera){
//
//         var tempPixels = this.getPixelsAtScreens(x, y, camera);
//         var tempX = tempPixels.x;
//         var tempY = tempPixels.y;
//         var tempCoords = this.getCoordsAtPixels(tempX, tempY);
//         tempX = tempCoords.x;
//         tempY = tempCoords.y;
//         return this.getIndexAtCoords(tempX, tempY, optWidth);
//
//     };
//     this.getCoordsAtScreens = function(x, y, camera){
//
//         var tempPixels = this.getPixelsAtScreens(x, y, camera);
//         var tempX = tempPixels.x;
//         var tempY = tempPixels.y;
//         return this.getCoordsAtPixels(tempX, tempY);
//
//     };
//
//     // coords translations from index
//     this.getCoordsAtIndex   = function(i, optWidth){
//
//         var width = optWidth;
//         if(optWidth == null){
//             width = this.width;
//         }
//
//         var tempY = Math.floor(i / width);
//         var tempX = i % width + tempY / 2;
//
//         return {x: tempX, y: tempY};
//
//     };
//     this.getPixelsAtCoords  = function(x, y){
//
//         var tempX = x * this.tileSize;
//         var tempY = y * this.tileSize * 3 / 4;
//
//         return {x: tempX, y: tempY};
//
//     };
//     this.getScreensAtPixels = function(x, y, camera){
//
//         var tempX = (x - camera.ULX) * camera.scale;
//         var tempY = (y - camera.ULY) * camera.scale;
//         return {x: tempX, y: tempY};
//
//     };
//
//     this.getPixelsAtIndex   = function(i, optWidth){
//
//         var tempCoords = this.getCoordsAtIndex(i, optWidth);
//
//         return this.getPixelsAtCoords(tempCoords.x, tempCoords.y);
//
//     };
//     this.getScreensAtCoords = function(x, y, camera){
//
//         var tempPixels = this.getPixelsAtCoords(x, y);
//         return this.getScreensAtPixels(tempPixels.x, tempPixels.y, camera);
//
//     };
//     this.getScreensAtIndex  = function(i, optWidth, camera){
//
//         var tempCoords = this.getCoordsAtIndex(i, optWidth);
//
//         return this.getScreensAtCoords(tempCoords.x, tempCoords.y, camera)
//
//     };
//
//     // automatically initializes
//     this.initialize();
// }