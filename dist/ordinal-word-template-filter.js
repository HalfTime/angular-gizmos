
// ordinalWordTemplate takes a string and replaces instances of {n} integers with their respective ordinal word.
//
// Dependencies:
//   - angular-grab-bag:filter:ordinalWord
//
// Usage:
//
//  {{ Brad is in {1} place, Andre The Giant is in {99}. | ordinalWordTemplate }}
//    => 'Brad is in first place, Andre The Giant is in ninety-ninth.'
//
//  $filter( 'ordinalWordTemplate' )( 'Lance attended the {10} annual coffee convention.'
//    => 'Lance attended the tenth annual coffee convention.'
//
angular.module( 'gizmos.filters' ).filter( 'ordinalWordTemplate', function( $filter ) {
  return function ( sentence ) {
    return sentence.replace( /\{\d+\}/g, function( token ) {
      return $filter( 'ordinalWord' )( token.match( /\d+/ )[ 0 ] )
    } )
  }
} )
