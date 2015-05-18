// Usage:
//
//    {{ $index | indexToAlphabet }} 0 => 'A'
//    {{ $index | indexToAlphabet:'lowercase' }} 0 => 'a'
//    $filter( 'indexToAlphabet' )( 99 )  => 'A'
//    $filter( 'indexToAlphabet' )( 2 )  => 'B'
//
angular.module( 'gizmos.filters' ).filter( 'indexToAlphabet', [
  function() {
    return function( index, lettercase ) {
      var index, alphabet, len

      alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      len = ( alphabet.length - 1 )

      if ( lettercase === 'lowercase' ) {
        alphabet = alphabet.toLowerCase()
      }

      alphabet = alphabet.split("")
      index = Math.abs( +index ) || 0

      if ( index > len ) {
        return alphabet[ 0 ]
      }

      return alphabet[ index ]

    }
  }
]);


