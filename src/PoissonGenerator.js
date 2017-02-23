/**
 * Created by Duncan on 2/20/2017.
 */

define(["src/Utils"],
    function (Utils){

     /*
      PoissonGenerator :: () -> {
         generate
      }
     */
     function PoissonGenerator() {

        /*
         generate :: (size: SizeSettings,
                      settings: (PoissonSettings :: {
                        minRadius: float
                        maxRadius: float | minRadius < maxRadius
                        nodeDensity: int
         })) -> (Point[] :: {x: float, y: float}[])

         Takes in several settings <TODO: define later!>
         and produces a list of random points which have float x and y coordinates with approximately equal spacing
         */
        this.generate = function (size, settings) {

            // ensure that the nodeSpacing is set (default to 4.5)
            var minRadius = settings.minRadius || 4.5;
            // ensure that the nodeVariance is set (default to minRadius + 1.0)
            var maxRadius = settings.maxRadius || (minRadius + 1.0);
            // ensure that the nodeDensity is set (default to 20)
            var nodeDensity = settings.nodeDensity || 20;
            // ensure that the maxCount is set (default to 1000000)
            //var maxCount = settings.maxCount || 1000000;

            var dormantNodes = []; // list of nodes that have already been placed
            var activeNodes = [
                // pick a random x and y in the world width and height
                {x: size.width * Math.random(), y: size.height * Math.random()}
            ]; // list of nodes to be placed (start with one)


            // Loop through the process of verifying and moving active nodes to dormant ones
            var point;
            while (activeNodes.length > 0) {
                // splice out a random point (and grab the element, not the array)
                point = activeNodes.splice(Math.floor(Math.random() * activeNodes.length), 1)[0];

                if (checkZone(point, minRadius)) { // ensure no dormant nodes exist in the zone
                    cleanZone(point, minRadius); // clear out any active nodes in the zone
                    populateZone(point, minRadius, maxRadius, nodeDensity); // add new active nodes to the list
                    dormantNodes.push(point); // add the active node to the dormant nodes
                    // addPointToSortedArray(point, dormantNodes);
                }
            }

            return dormantNodes;

            /*
             checkZone :: (point: Point) -> boolean

             checks to see if there are any dormant points near point
             returns true if no points are nearby
             */
            function checkZone(point) {
                // scans the dormant list to see if there is already a point in this region

                // var neighborhoodOfDormantNodes = this.getNeighborhoodOfPoint(point, minRadius, dormantNodes);
                // for (var i = 0; i < neighborhoodOfDormantNodes.length; i++) {
                for (var i = 0; i < dormantNodes; i++) { // cycle over the whole array
                    // check to see if the points are close


                    // if (checkDistance(neighborhoodOfDormantNodes[i], point)) {
                    if (checkDistance(dormantNodes[i], point)) {
                        return false;
                    }

                }
                return true; // no dormant point was nearby

                // NEW VERSION:
                // var neighborhoodOfDormantNodes = this.getNeighborhoodOfPoint(point, minRadius, dormantNodes);
                // return (neighborhoodOfDormantNodes.length == 0); // return true if there are no points in the neighborhood
            }

            /*
             cleanZone :: (point: Point) -> void

             removes all active points which are within minRadius of point
             */
            function cleanZone(point) {
                // scans the entire active array

                // var neighborhoodOfActiveNodes = this.getNeighborhoodOfPoint(point, minRadius, activeNodes);
                // for (var i = 0; i < neighborhoodOfActiveNodes.length; i++) {
                for (var i = 0; i < activeNodes.length; i++) {
                    // check to see if the points are close


                    // if (checkDistance(neighborhoodOfActiveNodes[i], point)) {
                    if (checkDistance(activeNodes[i], point)) {
                        activeNodes.splice(i, 1); // remove the offending point
                        i--; // decrement, since the activeNode length just decremented
                    }
                }


                // NEW VERSION:
                // /*
                //  sortByXValue :: (point1: Point, point2: Point) -> float
                //
                //  returns whether point1 has a x coord greater than (>0), equal to (==0), or less than (<0) point2 does
                //  */
                // function sortByXValue(point1, point2) {
                //     return point1.x - point2.x;
                // }
                // // do a binary search to find the minimum and maximum x values
                // var minX = Utils.binarySearch(activeNodes, {x: point.x - minRadius}, sortByXValue);
                // var maxX = Utils.binarySearch(activeNodes, {x: point.x + minRadius}, sortByXValue);
                // var nearbyNodes = activeNodes.slice(minX -1, maxX); // make a copy of all nodes nearby to point
                // var maxDistance = Math.pow(minRadius, 2);
                // var notTooClose = nearbyNodes.filter(function(currentPoint) { // filter out all the points that are not close
                //     if ( (point.y - radius >= currentPoint.y) && (point.y + radius <= currentPoint.y)) { // check to see if the y value is close
                //         return Math.pow(currentPoint.x - point.x, 2) + Math.pow(currentPoint.y - point.y, 2) > maxDistance; // check to see if distance is not within radius
                //     }
                //     return true; // if the y value is not close, the point is fine
                // });
                // // concat the array of all points with x values smaller than minX with the notTooClose points with the points with x values larger than maxX
                // activeNodes = (activeNodes.slice(0, minX).concat(notTooClose)).concat(activeNodes.slice(maxX - 1, activeNodes.length));
            }

            /*
             checkDistance :: (point1: Point, point2: Point) -> boolean

             checks to see whether two points are within a distance of minRadius
             returns true if they are close
             */
            function checkDistance(point1, point2) {

                if (Math.abs(point1.y - point2.y) <= minRadius) { // check to see if the y coords are close
                    // check for x without wrap
                    if (Math.abs(point1.x - point2.x) <= minRadius) {
                        // actually check with a circle
                        return (Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2) <= minRadius);

                    }
                    // check for x with wrap
                    if (Math.abs(point1.x - (point2.x + size.width)) <= minRadius) {
                        // actually check with a circle
                        return (Math.pow(point1.x - (point2.x + size.width), 2) + Math.pow(point1.y - point2.y, 2) <= minRadius);
                    }

                }

                return false; // the points are not close
            }

            /*
             populateZone :: (point: Point) -> void

             Adds nodeDensity number of new points to the activeNodes list which are between minRadius and maxRadius
             distance from this point
             */
            function populateZone(point) {
                var randomAngle, randomDistance, newX, newY;
                for (var i = 0; i < nodeDensity; i++) {
                    randomAngle = Math.random() * 2 * Math.PI; // pick a random angle (0, 2pi)
                    randomDistance = minRadius + Math.random() * (maxRadius - minRadius); // pick a random distance between max and min
                    // TODO fix the randomDistance to unbias toward small radii
                    // randomDistance = minRadius + (Math.abs(Math.random() - Math.random()) * (maxRadius - minRadius);
                    newX = (point.x + Math.cos(randomAngle) * randomDistance) % size.width;
                    newY = point.y + Math.sin(randomAngle) * randomDistance;
                    // ensure the new point's y coordinate is on the world
                    if (newY >= 0 && newY <= size.height) {
                        activeNodes.push({x: newX, y: newY}); // add it to the list of activeNodes
                        // addPointToSortedArray({x: newX, y: newY}, activeNodes);
                    }
                }
            }

            /*
             sortPoints :: (point1: Point, point2: Point) -> float

             sorts two points by x coordinate, then y coordinate
             returns (<0) if point1 is "less" than point2
             returns (==0) if the points have the same x and y coordinates
             returns (>0) if point1 is "more" than point2
             */
            function sortPoints(point1, point2) {
                var xDistance = point1.x - point2.x;
                var yDistance = point1.y - point2.y;

                if (xDistance == 0) {
                    return yDistance; // yDistance is signed value for whether y value is greater (and 0 if equal!)
                } else {
                    return xDistance; // xDistance is signed value for whether x value is greater
                }
            }

            /*
             addPointToSortedArray :: (point: Point, array: Point[]) -> void

             performs a binary search to figure out where to put point and inserts point in array
             */
            function addPointToSortedArray(point, array) {
                // perform a binary search to find the spot to add the point
                var index = Utils.binarySearch(array, point, sortPoints);
                // index now corresponds to the place to put the point
                array.splice(index, 0, point); // add the new point to the correct spot
            }
        };

    }

    /*
     getNeighborhoodOfPoint :: (point: Point, array: Point[]) -> Point[]

     returns a sorted array of all points in the circular region within radius around point
     this does not affect the original array

     // TODO redo this to consider the wrapping of x values!

     */
    PoissonGenerator.prototype.getNeighborhoodOfPoint = function(point, radius, array) {

        /*
         sortByXValue :: (point1: Point, point2: Point) -> float

         returns whether point1 has a x coord greater than (>0), equal to (==0), or less than (<0) point2 does
         */
        function sortByXValue(point1, point2) {
            return point1.x - point2.x;
        }


        // perform a binary search to find the minimum x value (point.x - radius)
        var index = Utils.binarySearch(array, {x: point.x - radius}, sortByXValue);
        // OLD CODE:
        // var tempArray = array.slice(0, array.length); // make a copy of array to modify
        // var left = 0;
        // var right = array.length;
        // var mid = 0; // just to ensure that nothing goes wrong if the tempArray is empty
        // while (left < right) {
        //     mid = Math.floor((left + right) / 2);
        //     if ((point.x - radius) == array[mid].x) {
        //         break; // the x values match
        //     } else if ((point.x - radius) < array[mid].x) {
        //         right = mid; // desired minimum x is to the left of mid
        //     } else {
        //         left = mid; // desired minimum x is to the right of mid
        //     }
        // }
        // index now corresponds to the minimum x value
        var tempArray = array.slice(index - 1, array.length); // copy all points with x value larger than or equal to the minimum into tempArray
        // do the binary search again to find the maximum x value (point.x + radius)
        index = Utils.binarySearch(array, {x: point.x + radius}, sortByXValue);
        // OLD CODE:
        // left = 0;
        // right = tempArray.length;
        // mid = 0; // just to ensure that nothing goes wrong if the tempArray is empty
        // while (left < right) {
        //     mid = Math.floor((left + right) / 2);
        //     if ((point.x + radius) == array[mid].x) {
        //         break; // the x values match
        //     } else if ((point.x + radius) < array[mid].x) {
        //         right = mid; // desired maximum x is to the left of mid
        //     } else {
        //         left = mid; // desired minimum x is to the right of mid
        //     }
        // }
        // index now corresponds to the maximum x value
        tempArray.splice(index, tempArray.length - index); // remove all elements after mid
        // tempArray now is an array of all points with x values near point
        // Now we do a linear evaluation of all points. First we check the y value to see if it is close. Is so, then we check the actual distance
        var tempArrayLength = tempArray.length;
        var currentPoint;
        var maxDistance = Math.pow(radius, 2);
        var neighborhood = [];
        for (var i = 0; i < tempArrayLength; i++) {
            currentPoint = tempArray[i];
            if ( (point.y - radius >= currentPoint.y) && (point.y + radius <= currentPoint.y)) { // check to see if the y value is close

                if ( Math.pow(currentPoint.x - point.x, 2) + Math.pow(currentPoint.y - point.y, 2) <= maxDistance) { // check to see if the distance is small enough
                    neighborhood.push(currentPoint);
                }
            }
        }

        // neighborhood is now a sorted array (by x value, then y value) of all points with x and y values within radius from point
        return neighborhood;
    };

    return PoissonGenerator;


});

