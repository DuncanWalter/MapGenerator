/**
 * Created by Eli on 23-Feb-17.
 */

define(function (){

    /*
     Utils :: () -> {
        binarySearch
     }
     */

    return  {

        /*
         binarySearch :: (array: Array,
                          element: ArrayElement,
                          Sorter: ( (element1: ArrayElement, element2: ArrayElement) -> int/float )
         ) -> int

         Takes an array, an element, and a sorting function and returns the index where the element should fit in the
         array or where it is in the array.
         */
        binarySearch: function(array, element, Sorter){

            console.log("Entering a binary search");
            var left = 0; // left index of the search
            var right = array.length; // right index of the search
            var mid = 0; // average of left and right
            var equivalence; // whether element is less than (<0), equal (==0), or greater than (>0) another element
            while (left < right) {
                mid = Math.floor((left + right) / 2);
                equivalence = Sorter(element, array[mid]);
                if (equivalence == 0) {
                    break; // the points are equivalent, so mid is already correct
                } else if (equivalence < 0) {
                    right = mid - 1; // if point is less than the checking point, set right = mid - 1
                } else {
                    left = mid + 1; // if point is more than the checking point, set left = mid + 1
                }
            }

            console.log("Exiting a binary search");
            return mid; // return the index the element is at (or should go)
        }



    }

});