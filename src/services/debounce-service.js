// Service debounce returns a single debounce function which wraps _.debounce
// and integrates into the digest loop cycle.
angular.module('gizmos.services').service( 'debounce', function ( $rootScope, $window ) {

  if( !$window._ ) {
    throw new Error( "underscore/lodash required to use debounce service" )
  }

  function debounce( callback, delay, options ) {
    return $window._.debounce( function () {
      callback()
      $rootScope.$apply()
    }, delay, options )
  }

  return debounce

} )

