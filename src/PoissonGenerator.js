/**
 * Created by Duncan on 2/20/2017.
 */

define(function PoissonGenerator(){

    /*
    generate :: (size: SizeSettings, settings: (PoissonSettings :: {

    <nodeSpacing>
    <density>
    <variance>
    <maxCount>


    })) -> (Point[] :: {x: float, y: float}[])
    */
    this.generate = function(size, settings){

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

            // var neighborhoodOfDormantNodes = getNeighborhoodOfPoint(point, dormantNodes);
            // for (var i = 0; i < neighborhoodOfDormantNodes.length; i++) {
            for (var i = 0; i < dormantNodes; i++) { // cycle over the whole array
                // check to see if the points are close


                // if (checkDistance(neighborhoodOfDormantNodes[i], point)) {
                if (checkDistance(dormantNodes[i], point)) {
                    return false;
                }

            }
            return true; // no dormant point was nearby
        }

        /*
         cleanZone :: (point: Point) -> void

         removes all active points which are within minRadius of point
         */
        function cleanZone(point) {
            // scans the entire active array

            // var neighborhoodOfActiveNodes = getNeighborhoodOfPoint(point, activeNodes);
            // for (var i = 0; i < neighborhoodOfActiveNodes.length; i++) {
            for (var i = 0; i < activeNodes.length; i++) {
                // check to see if the points are close


                // if (checkDistance(neighborhoodOfActiveNodes[i], point)) {
                if (checkDistance(activeNodes[i], point)) {
                    activeNodes.splice(i, 1); // remove the offending point
                    i--; // decrement, since the activeNode length just decremented
                }
            }
        }

        /*
         checkDistance :: (point1: Point, point2: Point) -> boolean

         checks to see whether two points are within a distance of minRadius
         returns true if they are close
         */
        function checkDistance(point1, point2) {

            if (Math.abs(point1.y - point2.y) <= minRadius) { // check to see if the y coords are close
                // check for x without wrap
                if(Math.abs(point1.x - point2.x) <= minRadius) {
                    // actually check with a circle
                    return (Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2) <= minRadius);

                }
                // check for x with wrap
                if(Math.abs(point1.x - (point2.x + size.width)) <= minRadius) {
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
            for(var i = 0; i < nodeDensity; i++) {
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
         sortPoints :: (point1: Point, point2: Point) -> boolean

         sorts two points by x coordinate, then y coordinate
         returns true if point1 is "less" than (or equal to) point2
         */
        function sortPoints(point1, point2) {
            if (point1.x == point2.x) { // if x coords match
                return (point1.y <= point2); // return true if y coord is less
            } else { // if x coords do not match
                return (point1.x < point2.x); // return true if x coord is less
            }
        }

        /*
         addPointToSortedArray :: (point: Point, array: Point[]) -> void

         performs a binary search to figure out where to put point and inserts point in array
         */
        function addPointToSortedArray(point, array) {

            // perform a binary search to find the spot to add the point
            var left = 0;
            var right = array.length;
            var mid;
            while (left < right) {
                mid = Math.floor( (left + right) / 2);
                if (sortPoints(point, array[mid])) {
                    right = mid; // if point is less than the checking point, set right = mid
                } else {
                    left = mid; // if point is not less than the checking point, set left = mid
                }
            }
            // mid now corresponds to the place to put the point
            array.splice(mid, 0, point); // add the new point to the correct spot

        }

        /*
         getNeighborhoodOfPoint :: (point: Point, array: Point[]) -> Point[]

         returns a sorted array of all points in the square region with "radius" minRadius around point
         this does not affect the original array

         // TODO redo this to consider the wrapping of x values!
         */
        function getNeighborhoodOfPoint(point, array) {
            // perform a binary search to find the minimum x value (point.x - minRadius)
            var tempArray = array.slice(0, array.length); // make a copy of array to modify
            var left = 0;
            var right = array.length;
            var mid;
            while (left < right) {
                mid = Math.floor( (left + right) / 2);
                if ( (point.x - minRadius) <= array[mid].x) {
                    right = mid; // desired minimum x is to the left of mid
                } else {
                    left = mid; // desired minimum x is to the right of mid
                }
            }
            // mid now corresponds to the minimum x value
            tempArray.splice(0, mid); // remove the first mid values from the tempArray
            // do the binary search again to find the maximum x value (point.x + minRadius)
            left = 0;
            right = tempArray.length;
            while (left < right) {
                mid = Math.floor( (left + right) / 2);
                if ( (point.x + minRadius) <= array[mid].x) {
                    right = mid; // desired maximum x is to the left of mid
                } else {
                    left = mid; // desired minimum x is to the right of mid
                }
            }
            // mid now corresponds to the maximum x value
            tempArray.splice(mid, tempArray.length - mid); // remove all elements after mid

            // tempArray now is an array of all points with x values near point
            // sadly, we cannot do a binary search on y, since we aren't guaranteed any ordering of y-values
            for(var i = 0; i < tempArray.length; i++) {
                if ( (point.y - minRadius <= tempArray[i].y) || (point.y + minRadius >= tempArray[i].y) ) {
                    tempArray.splice(i, 1); // if the y value is not close, remove it from the list
                    i--; // decrement i, so as to not skip any elements
                }
            }

            // tempArray is now a sorted array of all points with x and y values within minRadius from point
            return tempArray;
        }

    };


});

