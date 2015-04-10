// Usage:
//
//    {{ 1 | ordinalWord }} place  => 'first place'
//    $filter( 'ordinalWord' )( 99 ) + ' place' => 'ninety-ninth place'
//
angular.module( 'gizmos.filters' ).filter( 'ordinalWord', [
  function() {
    return function( number ) {
      var baseWords, decaWords
      var decaOrdinalWord, nonDecaOrdinalWord, ordinalWord

      number = Math.abs( +number ) || 0

      baseWords = [ 'zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelvth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth' ]

      decaWords = [ 'twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet' ]

      decaOrdinalWord = function( number ) {
        return decaWords[ Math.floor( number / 10 ) - 2 ] + 'ieth'
      }

      nonDecaOrdinalWord = function( number ) {
        return decaWords[ Math.floor( number / 10 ) - 2 ] + 'y-' + baseWords[ number % 10 ]
      }

      ordinalWord = function( number ) {
        if ( number < 20 ) {
          return baseWords[ number ]
        }

        if ( number % 10 === 0 ) {
          return decaOrdinalWord( number )
        }

        return nonDecaOrdinalWord( number )
      }

      return ordinalWord( number )
    }
  }
]);
