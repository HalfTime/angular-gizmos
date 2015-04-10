// Directive imageSrc is a helper that looks up the image's name in the
// `Config.imageUrls` registry, and sets that as the img's src.  The map of
// imageUrls comes from DATA which is assigned in the main application.html
// file.  This way individual slim partials do not need to guard against the
// rails `image_path` method being defined as karma does not have access to
// this method.
//
// Usage:
//
//    // Returns the url defined for `DATA.imageUrls.logo` or throws if undefined
//    <img image-src='logo'>
//
angular.module( 'gizmos.directives' ).directive( 'imageSrc', function( Config ) {
  return {
    restrict: 'A',
    link: function( $scope, element, attributes ) {
      attributes.$observe( 'imageSrc', function( name ) {
        attributes.$set( 'src', Config.imageUrls.get( name ) )
      } )
    }
  }
} )

