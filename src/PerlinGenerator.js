/**
 * Created by Duncan on 2/19/2017.
 */

define(["src/PoissonGenerator", "src/Map"],
    function(PoissonGenerator, Map){

    /*
     PerlinGenerator :: () -> {
        generate
     }
     */
    // TODO call this PerlinAt? Get rid of the generator call?
    // new syntax would be:
    // var perlinAt = new PerlinAt(size, settings);
    // var newPerlinVal = perlinAt(point);
    // TODO this new syntax would follow a much tighter naming and type structure
    return function PerlinGenerator() {

        /*
         generate :: (size: sizeSettings,
                      settings: (PerlinSettings :: {
                        octaveSizes: float[] | 0 < float,
                        octaveWeights: float[],
                        centrality: float
         })) -> determinePerlinForPoint
         */
        this.generate = function(size, settings) {

            if (settings.octaveSizes.length != settings.octaveWeights.length) {
                throw "PANIC: octaveSizes and octaveWeights have different sizes for PerlinGenerator";
            }

            // use the octaveSizes to calculate minRadius and maxRadius for the underlying PoissonGenerator
            var poissonOctaves = [];
            var minRadius;
            var maxRadius;
            var nodeDensity = 10; // hardcoded number
            var sumOfWeights = 0;
            for (var i = 0; i < settings.octaveSizes.length; i++) {
                minRadius = settings.octaveSizes[i];
                maxRadius = minRadius * 2; // mediumcoded number
                poissonOctaves[i] = PoissonGenerator.generate(size,
                    {minRadius: minRadius, maxRadius: maxRadius, nodeDensity: nodeDensity}); // call on the underlying PoissonGenerator to generate a random set of points
                // add a perlin value to each point in the poissonOctave
                poissonOctaves[i].forEach(function(point) {
                    point.perlin = Math.random();
                });

                sumOfWeights += Math.abs(settings.octaveWeights[i]); // the weights can be negative, so take their absolute value
            }
            // we now have the poisson points with perlin values for each of the octaves

            /*
              determinePerlinForPoint :: (point: Point) -> (PerlinValue :: float | -1 < float < 1)
             */
            // TODO call this perlinAt()? See above for full proposed spec
            return function determinePerlinForPoint(point) {

                var perlin = 0;
                var perlinForOctave;
                var neighborhoodOfPoint;
                // We need to take the weighted sum of the octaves
                for(var i = 0; i < settings.octaveSizes.length; i++) {

                    perlinForOctave = 0;

                    // get all points within 3 times the octaveSize (which was the minRadius between poisson points)
                    neighborhoodOfPoint = Map.getNeighborhoodOfPoint(point, settings.octaveSizes[i] * 3, poissonOctaves[i]);

                    // if the neighborhood contains 3 or fewer points, take the average of all points
                    if (neighborhoodOfPoint.length <= 3) {
                        for (var j = 0; j < neighborhoodOfPoint.length; j++) {
                            perlinForOctave += neighborhoodOfPoint[j].perlin; // sum of perlin values
                        }
                        perlinForOctave /= neighborhoodOfPoint.length; // find average
                    } else { // if there are more than 3 points, find the closest three

                        // calculate the distance between each point and point
                        neighborhoodOfPoint.forEach( function(currentPoint){
                            currentPoint.distance = Math.min( Math.pow(point.x - currentPoint.x, 2) , Math.pow(point.x + size.width - currentPoint.x, 2) ) // calculate distance between x coords (accounting for wrap
                                + Math.pow(point.y - currentPoint.y, 2); // calculate distance between y coords
                        });
                        // sort all points by distance
                        neighborhoodOfPoint.sort(function(point1, point2) {
                            return point1.distance - point2.distance;
                        });
                        // the points are now all sorted by distance
                        perlinForOctave = (neighborhoodOfPoint[0] + neighborhoodOfPoint[1] + neighborhoodOfPoint[2])/3; // take average

                    }
                    // determine perlin value from octave
                    perlin += perlinForOctave * (settings.octaveWeights[i] / sumOfWeights);
                }

                return perlin;
            };
        }
    };

});