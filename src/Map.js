define(["src/PerlinGenerator", "src/PoissonGenerator"],
    function(PerlinGenerator, PoissonGenerator) {
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
            width: int,
            getTileIndex//NAMING?//: (index: MapIndex, distance: int) -> MapIndex,
            getTileIndex//NAMING?//: (index: MapIndex, distance: int) -> MapIndex,
            getTileIndex//NAMING?//: (index: MapIndex, distance: int) -> MapIndex
        }
        */
        return function Map(settings) {

            var proto = Map.prototype;

            this.height = settings.size.height;
            this.width = settings.size.width;
            this.tiles = new Array(this.width * this.height);

            // var elevationPerlinNoise = PerlinGenerator.generate(settings.size, settings.elevationPerlin);
            // var continentPoissonNoise = PoissonGenerator.generate(settings.size, settings.continentPoisson);

            this.getTileIndexRightShift = function(index, distance){
                return (index - (index%this.width))  +  ((index+distance) % this.width);
            };
            this.getTileIndexUpShift = function(index, distance){
                // return (index - index % this.width) + ((index + distance) % this.width);
            };
            this.getTileIndexSlantShift = function(index, distance){
                // return (index - index % this.width) + ((index + distance) % this.width);
            };

        }
    }
);








function Map(settings) { // settings :: {[sizeStats],[perlinStats],[biomeStats],randomSeed}

    this.pathfinder = new Pathfinder(this);

    this.initialize = function() {

        /*World Constants*/
        this.width  = 98; //the number of tiles in a single row
        this.height = 55; //the number of rows in the world
        this.length = this.width * this.height;
        this.tileSize = 48; // number of pixels a tile is; initial size of a tile in grid coordinates; conversion factor from tiles to pixels

        this.pixelWidth = this.width * this.tileSize; //length of the board in pixels
        // this.pixelHeight = this.height * this.tileSize * 3/ 4 + (this.tileSize / 4); // height of the board in pixels

        /*Map Tiles and other world variables*/
        // THE ARRAY OF TILES
        this.tiles = [];
        for(var t = 0; t < this.width * this.height; t++){this.tiles[t] = new Tile(t, this);}

        // describes the elevation shifts
        this.perlinOpacity = 0.99; // 0 < perlinOpacity < 1; larger means that the smaller blooms matter more (tiles will be more dissimilar)
        this.perlinDepth = 2; // 0 <= integer <= 4
        this.perlinCentrality = 1; // 1 <= perlinCentrality; larger means more linear; smaller means more sinusoidal

        // describes the den and resource placement
        this.nodeSpacing = 4.5; // 6 / 7 / 8 is standard
        this.nodeDensity = 20; // should be bigger than 10 for sure, but slows things down
        this.nodeVarience = 1.0; // keep between 0 and 1

        this.biomeRadius    = 5.50; // 6 ish is cool
        this.oceanFrequency = 0.62; // from 0 to 1, describes precisely the amount of water that will appear
        this.continentCount = 3.30; // defines how island-ish the world tends to be... is not exact every time, but does describe the world well.
        this.continentChaos = 0.07; // the sprawl and invasion of continents and oceans

        this.perlinGenerator = new PerlinNoiseGenerator(this);
        this.nodeGenerator = new DiscNodeGenerator(this);
        this.biomeGenerator = new BiomeGenerator(this, this.perlinGenerator, this.nodeGenerator);
        this.biomeGenerator.generate(this.oceanFrequency, this.biomeRadius, this.continentCount, this.continentChaos);
        this.perlinGenerator.generate(this.perlinDepth, this.perlinOpacity, this.perlinCentrality);
        this.nodeGenerator.generate(this.nodeSpacing, this.nodeDensity, this.nodeVarience);

        for(t = 0; t < this.length; t++){
            this.tiles[t].setElevation(this.tiles[t].perlin, this.tiles[t].biome, this);
            this.tiles[t].defineTile(this.tiles[t], this.tiles[t].biome, this.tiles[t].elevation);
            // this.tiles[t].imageFile = this.tiles[t].selectImageFile(this.tiles[t].image);
        }
    };

    /*
     Index = the tile Index
     Coords  are in grid coords measured in tiles
     Pixels  are in grid coords measured in pixels
     Screens are in grid coords measured in pixels w/ reference to the UL point of
     the camera and factoring in scale (where things draw on the screen)
     */

    // coords translations to index
    this.getIndexAtCoords   = function(x, y, optWidth){

        var index;
        var width = optWidth;
        if(optWidth == null){
            width = this.width;
        }

        // origin of the upper point
        var xA;
        var yA = Math.floor(y);
        if (yA % 2 == 0) { //even row
            xA = Math.floor(x  + 0.5);
        } else { // odd row
            xA = Math.floor(x) + 0.5 ;
        }

        // origin of the lower point
        var xB;
        var yB = Math.ceil(y);
        if (yB % 2 == 0) { //even row
            xB = Math.floor(x  + 0.5);
        } else { // odd row
            xB = Math.floor(x) + 0.5 ;
        }

        // calculates the index
        if ((Math.pow(x - xA, 2) + Math.pow(y - yA, 2)) < (Math.pow(x - xB, 2) + Math.pow(y - yB, 2))){

            index = yA * width + (xA - yA * 0.5) % width;
            if((xA - yA * 0.5) % width <= -0.5){
                index += width;
            }
        } else{

            index = yB * width + (xB - yB * 0.5) % width;
            if((xB - yB * 0.5) % width <= -0.5){
                index += width;
            }
        }

        //won't return an index outside the world
        if (index < 0 || index >= (this.length)) {
            index = null;
        }

        return index;
    };
    this.getCoordsAtPixels  = function(x, y){

        var tempX = (x / this.tileSize);
        var tempY = (y / this.tileSize * 4 / 3);

        return {x: tempX, y: tempY};

    };
    this.getPixelsAtScreens = function(x, y, camera){

        var tempX = camera.ULX + x / camera.scale;
        var tempY = camera.ULY + y / camera.scale;
        return {x: tempX, y: tempY};

    };

    this.getIndexAtPixels   = function(x, y, optWidth){

        var tempCoords = this.getCoordsAtPixels(x, y);
        var tempX = tempCoords.x;
        var tempY = tempCoords.y;
        return this.getIndexAtCoords(tempX, tempY, optWidth);

    };
    this.getIndexAtScreens  = function(x, y, optWidth, camera){

        var tempPixels = this.getPixelsAtScreens(x, y, camera);
        var tempX = tempPixels.x;
        var tempY = tempPixels.y;
        var tempCoords = this.getCoordsAtPixels(tempX, tempY);
        tempX = tempCoords.x;
        tempY = tempCoords.y;
        return this.getIndexAtCoords(tempX, tempY, optWidth);

    };
    this.getCoordsAtScreens = function(x, y, camera){

        var tempPixels = this.getPixelsAtScreens(x, y, camera);
        var tempX = tempPixels.x;
        var tempY = tempPixels.y;
        return this.getCoordsAtPixels(tempX, tempY);

    };

    // coords translations from index
    this.getCoordsAtIndex   = function(i, optWidth){

        var width = optWidth;
        if(optWidth == null){
            width = this.width;
        }

        var tempY = Math.floor(i / width);
        var tempX = i % width + tempY / 2;

        return {x: tempX, y: tempY};

    };
    this.getPixelsAtCoords  = function(x, y){

        var tempX = x * this.tileSize;
        var tempY = y * this.tileSize * 3 / 4;

        return {x: tempX, y: tempY};

    };
    this.getScreensAtPixels = function(x, y, camera){

        var tempX = (x - camera.ULX) * camera.scale;
        var tempY = (y - camera.ULY) * camera.scale;
        return {x: tempX, y: tempY};

    };

    this.getPixelsAtIndex   = function(i, optWidth){

        var tempCoords = this.getCoordsAtIndex(i, optWidth);

        return this.getPixelsAtCoords(tempCoords.x, tempCoords.y);

    };
    this.getScreensAtCoords = function(x, y, camera){

        var tempPixels = this.getPixelsAtCoords(x, y);
        return this.getScreensAtPixels(tempPixels.x, tempPixels.y, camera);

    };
    this.getScreensAtIndex  = function(i, optWidth, camera){

        var tempCoords = this.getCoordsAtIndex(i, optWidth);

        return this.getScreensAtCoords(tempCoords.x, tempCoords.y, camera)

    };

    // automatically initializes
    this.initialize();
}