// Usage:
//
//    {{ user.rank | ordinalSuffix }} Place  => "1st Place"
//    $filter( 'ordinalSuffix' )( 99 ) Place  => "99th Place"
//
angular.module( 'gizmos.filters' ).filter( 'ordinalSuffix', function() {

  return function( number ) {
    var teens, remainder, suffixes, suffix

    number = +number || 0

    teens = [ 11, 12, 13, 14, 15, 16, 17, 18, 19 ]
    remainder = number % 10

    suffixes = {
      1: 'st',
      2: 'nd',
      3: 'rd',
      fallback: 'th'
    }

    if ( teens.indexOf( number ) > -1 ) {
      suffix = suffixes.fallback
    } else {
      suffix = ( suffixes[ Math.abs( remainder ) ] || suffixes.fallback )
    }

    return number + suffix

  }

})

