/**
 * Created by Duncan on 2/20/2017.
 */

define(["src/Utils"],
    function (Utils){

     /*
      PoissonGenerator :: (size: SizeSettings,
                           settings: (PoissonSettings :: {
                            minRadius: float
                            maxRadius: float | minRadius < maxRadius
                            nodeDensity: int
      })) -> (Point[] :: {x: float, y: float}[])

      Takes in several settings <TODO: define later!>
      and produces a list of random points which have float x and y coordinates with approximately equal spacing
      }
     */
     return function PoissonDistribution(size, settings) {

         console.log("Entered the generate function of Poisson");

         // ensure that the nodeSpacing is set (default to 4.5) TODO scale defaults based on size for better default effect
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

         dormantNodes.getNeighborhood = getNeighborhood; // append the getNeighborhood function to both arrays
         activeNodes.getNeighborhood = getNeighborhood;

         // Loop through the process of verifying and moving active nodes to dormant ones
         var point;
         while (activeNodes.length > 0) {
             // splice out a random point (and grab the element, not the array)
             point = activeNodes.splice(Math.floor(Math.random() * activeNodes.length), 1)[0];

             console.log("ActiveNodes.length: " + activeNodes.length);
             console.log("DormantNodes.length: " + dormantNodes.length);

             if (checkZone(point, minRadius)) { // ensure no dormant nodes exist in the zone
                 cleanZone(point, minRadius); // clear out any active nodes in the zone
                 populateZone(point); // add new active nodes to the list
                 // dormantNodes.push(point); // add the active node to the dormant nodes
                 addPointToSortedArray(point, dormantNodes);
             }
         }

         return dormantNodes;

         /*
          checkZone :: (point: Point) -> boolean

          checks to see if there are any dormant points near point
          returns true if no points are nearby
          */
         function checkZone(point) {

             console.log("Entered the checkZone function");
             // scans the dormant list to see if there is already a point in this region

             // var neighborhoodOfDormantNodes = Utils.getNeighborhoodOfPoint(point, minRadius, dormantNodes);
             // for (var i = 0; i < neighborhoodOfDormantNodes.length; i++) {
             // for (var i = 0; i < dormantNodes.length; i++) { // cycle over the whole array
             //     // check to see if the points are close
             //
             //
             //     // if (checkDistance(neighborhoodOfDormantNodes[i], point)) {
             //     if (checkDistance(dormantNodes[i], point)) {
             //         return false;
             //     }
             //
             // }
             // return true; // no dormant point was nearby

             // NEW VERSION:
             var neighborhood = dormantNodes.getNeighborhood(point, minRadius);
             console.log(neighborhood);
             console.log("Number of points in checkzone: " + neighborhood.length);
             return (neighborhood.length == 0); // return true if there are no points in the neighborhood
         }

         /*
          cleanZone :: (point: Point) -> void

          removes all active points which are within minRadius of point
          */
         function cleanZone(point) {

             console.log("Entered the cleanZone function");
             // scans the entire active array

             // var neighborhoodOfActiveNodes = this.getNeighborhoodOfPoint(point, minRadius, activeNodes);
             // for (var i = 0; i < neighborhoodOfActiveNodes.length; i++) {
             // for (var i = 0; i < activeNodes.length; i++) {
             //     // check to see if the points are close
             //
             //
             //     // if (checkDistance(neighborhoodOfActiveNodes[i], point)) {
             //     if (checkDistance(activeNodes[i], point)) {
             //         activeNodes.splice(i, 1); // remove the offending point
             //         i--; // decrement, since the activeNode length just decremented
             //     }
             // }


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
             // var nearbyNodes = activeNodes.slice(minX, maxX + 1); // make a copy of all nodes nearby to point
             // var maxDistance = Math.pow(minRadius, 2);
             // var notTooClose = nearbyNodes.filter(function(currentPoint) { // filter out all the points that are not close
             //     if ( (point.y - radius >= currentPoint.y) && (point.y + radius <= currentPoint.y)) { // check to see if the y value is close
             //         return Math.pow(currentPoint.x - point.x, 2) + Math.pow(currentPoint.y - point.y, 2) > maxDistance; // check to see if distance is not within radius
             //     }
             //     return true; // if the y value is not close, the point is fine
             // });
             // // concat the array of all points with x values smaller than minX with the notTooClose points with the points with x values larger than maxX
             // activeNodes = activeNodes.slice(0, minX).concat(notTooClose, activeNodes.slice(maxX - 1, activeNodes.length) );


             // NEW NEW VERSION (Which uses Map.getNeighborhoodOfPoint)
             // // Add an index to each point in the activeNodes
             // var index = 0;
             // activeNodes.forEach(function(currentPoint) {
             //     currentPoint.index = index;
             //     index++;
             // });
             // var neighborhood = Map.getNeighborhoodOfPoint(point, minRadius, activeNodes); // get the neighborhood of the point
             // var neighborhoodLength = neighborhood.length;
             // for (var i = neighborhoodLength; i <= 0; i--) { // cycle backwards (backwards to ensure the indices don't change for lower values) through the neighborhood
             //     activeNodes.splice(neighborhood[i].index, 1); // remove each element of activeNodes which is in the neighborhood
             // }

             // ON THIRD THOUGHT VERSION
             /*
               sortByXValue :: (point1: Point, point2: Point) -> float

               returns whether point1 has a x coord greater than (>0), equal to (==0), or less than (<0) point2 does
               */
             function sortByXValue(point1, point2) {
                 return point1.x - point2.x;
             }
             var neighborhood = activeNodes.getNeighborhood(point, minRadius); // get the neighborhood of the point
             var neighborhoodLength = neighborhood.length;
             var index;
             for (var i = 0; i < neighborhoodLength; i++) {
                 index = Utils.binarySearch(activeNodes, neighborhood[i], sortByXValue); // find the index of the point which is in the neighborhood
                 activeNodes.splice(index, 1); // remove the point from the activeNodes
             }
         }

         /*
          checkDistance :: (point1: Point, point2: Point) -> boolean

          checks to see whether two points are within a distance of minRadius
          returns true if they are close
          */
         function checkDistance(point1, point2) {

             console.log("Entered the checkDistance function");

             // var a = Math.abs(point1.x-point2.x);
             // if(Math.min(size.width-a, a) < minRadius){
             //     a less verbose way of catching x wrapping
             // }

             if (point1.x  < 0|| point2.x < 0) {
                 console.log("WARNING: " + point1.x + " or " + point2.x);
             }


             if (Math.abs(point1.y - point2.y) <= minRadius) { // check to see if the y coords are close




                 var xDistance = Math.abs(point1.x - point2.x);
                 if(xDistance > size.width){
                     console.log("WARNING"+point1 + " " + point2);
                 }
                 if (Math.min(size.width - xDistance, xDistance) <= minRadius) { // check to see if the x coords are close
                     var distance = Math.min(Math.pow(point1.x - point2.x, 2), Math.pow(point1.x + size.width - point2.x, 2)) // calculate distance between x coords (accounting for wrap)
                     + Math.pow(point1.y - point2.y, 2); // calculate distance between y coords

                     return distance <= Math.pow(minRadius, 2);
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

             console.log("Entered the populateZone function");

             var randomAngle, randomDistance, newX, newY;
             for (var i = 0; i < nodeDensity; i++) {
                 randomAngle = Math.random() * 2 * Math.PI; // pick a random angle (0, 2pi)
                 randomDistance = minRadius + Math.random() * (maxRadius - minRadius); // pick a random distance between max and min
                 // TODO fix the randomDistance to unbias toward small radii (should use Math.pow(Math.random,1/(2 - min/max)) I think....)
                 newX = ((point.x + Math.cos(randomAngle) * randomDistance) + size.width) % size.width; // the adding of the size.width ensures that negative values get wrapped
                 newY = point.y + Math.sin(randomAngle) * randomDistance;
                 // ensure the new point's y coordinate is on the world
                 if (newY >= 0 && newY <= size.height) {
                     // activeNodes.push({x: newX, y: newY}); // add it to the list of activeNodes
                     addPointToSortedArray({x: newX, y: newY}, activeNodes);
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


         /*
          TODO so I was stupid earlier, and forgot that this can be completely defined with just size, which our
          generators have... so this should no longer be defined here. My bad -SL4M

          getNeighborhoodOfPoint :: (point: Point, radius: float, array: Point[]) -> Point[]

          returns a sorted array of all points in the circular region within radius around point
          this does not affect the original array

          */
         function getNeighborhood (point, radius) {

             console.log("We are in the getNeighborhood method of...");
             console.dir(this);

             /*
              sortByXValue :: (point1: Point, point2: Point) -> float

              returns whether point1 has a x coord greater than (>0), equal to (==0), or less than (<0) point2 does
              */
             function sortByXValue(point1, point2) {
                 return point1.x - point2.x;
             }

             var worldWidth = size.width; // grab the width of the world as a local variable so that it can be used in non-lexical calls here
             var index;
             var tempArray;
             // First, we must check to see if our neighborhood is affected by the wrapping of the world
             if (point.x < radius) {
                 // the point has a very low x coordinate, so there will be some fraction of the neighborhood on the right of the world

                 // perform a binary search to find the "maximum" x value (point.x + radius)
                 index = Utils.binarySearch(this, {x: point.x + radius}, sortByXValue);
                 tempArray = this.slice(0, index + 1);
                 // perform a binary search to find the "minimum" x value (point.x + worldWidth - radius)
                 index = Utils.binarySearch(this, {x: point.x + worldWidth - radius}, sortByXValue);
                 tempArray = tempArray.concat(this.slice(index, this.length)); // append the points which are separated by wrap
             } else if ((point.x + radius) > worldWidth) {
                 // the point has a very high x coordinate, so there will be some fraction of the neighborhood on the left of the world

                 // perform a binary search to find the "maximum" x value (point.x + radius - worldWidth)
                 index = Utils.binarySearch(this, {x: point.x + radius - worldWidth}, sortByXValue);
                 tempArray = this.slice(0, index + 1);
                 // perform a binary search to find the "minimum" x value (point.x - radius)
                 index = Utils.binarySearch(this, {x: point.x - radius}, sortByXValue);
                 tempArray = tempArray.concat(this.slice(index, this.length)); // append the points which are separated by wrap
             } else {
                 // we do not need to be concerned with wrapping, yay!

                 // perform a binary search to find the minimum x value (point.x - radius)
                 index = Utils.binarySearch(this, {x: point.x - radius}, sortByXValue);
                 // do the binary search again to find the maximum x value (point.x + radius)
                 var highIndex = Utils.binarySearch(this, {x: point.x + radius}, sortByXValue);
                 tempArray = this.slice(index, highIndex + 1); // copy all points with x value between the minimum and maximum into a new array
             }

             // tempArray now is an array of all points with x values near point
             // Now we do a linear evaluation of all points. First we check the y value to see if it is close. Is so, then we check the actual distance
             var distance;
             var maxDistance = Math.pow(radius, 2);

             console.log("Length of tempArray before filter: " + tempArray.length);

             return tempArray.filter(function (currentPoint) { // filter out all the points that are not close and return the sorted list of those that are close
                 if ((point.y - radius <= currentPoint.y) && (point.y + radius >= currentPoint.y)) { // check to see if the y value is close
                     distance = Math.min(Math.pow(point.x - currentPoint.x, 2), Math.pow(point.x + worldWidth - currentPoint.x, 2)) // calculate distance between x coords (accounting for wrap)
                         + Math.pow(point.y - currentPoint.y, 2); // calculate distance between y coords
                     return distance <= maxDistance; // check to see if distance is not within radius
                 }
                 return false; // if the y value is not close, the point is not close enough
             });
         }




    };


});


