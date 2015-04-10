// Filter fixedLengthNumber
// Source: http://stackoverflow.com/questions/17648014/how-can-i-use-an-angularjs-filter-to-format-a-number-to-have-leading-zeros
// Usage:
//
//    {{ 9 | fixedLengthNumber:4 }} => "0009"
//
angular.module( 'gizmos.filters' ).filter( 'fixedLengthNumber', function () {
  return function( input, numberLength ) {
    return (1e10 + input + '').slice( -numberLength )
  }
} )

