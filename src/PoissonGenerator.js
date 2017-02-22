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
            for (var i = 0; i < dormantNodes; i++) { // cycle over the whole array
                // check to see if the points are close
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
            for (var i = 0; i < activeNodes.length; i++) {
                // check to see if the points are close
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
                newX = (point.x + Math.cos(randomAngle) * randomDistance) % size.width;
                newY = point.y + Math.sin(randomAngle) * randomDistance;
                // ensure the new point's y coordinate is on the world
                if (newY >= 0 && newY <= size.height) {
                    activeNodes.push({x: newX, y: newY}); // add it to the list of activeNodes
                }
            }
        }

    };


});

