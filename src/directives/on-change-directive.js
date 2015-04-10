// Directive onChange binds to the native DOM change event, allowing it to be
// used on <input type="file">, which ng-change does not support.
angular.module( 'gizmos.directives' ).directive( 'onChange', function( ) {

  return {
    restrict: "A",
    scope: {
      onChange: "&"
    },
    link: function( $scope, $element ) {
      $element.on( 'change', function( event ) {
        $scope.onChange({ event: event })
      } )
    }
  }

} )
