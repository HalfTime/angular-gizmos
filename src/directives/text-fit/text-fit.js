// Value textFit is the core text resizing function to scale up the font-size
// of the given element until it no longer fits inside its container.
//
// Returns the final font size in pixels as a Number.
//
// Based off https://github.com/STRML/textFit but differs:
// - Introduces no wrapper <span>'s, which can interfere with flex centering.
//   Flex styling should be used to vertically center instead.
// - Gets the size from its container, not the element itself's original
//   dimensions.
// - Rounds font sizes by .1px not 1px, which can make a significant difference
//   esp. on small screen.
// - Allows silent returns or warnings if the element has no dimensions, based
//   on the shouldWarn parameter.  This allows the caller to retry again later,
//   perhaps after the element has become visible.
angular.module( 'gizmos.directives' ).value( 'textFit', function textFit( element, options, shouldWarn ) {
  var min, max, mid, lastMid, containerWidth, containerHeight, projectedPercentageOfBox
  
  element = angular.element( element )
  options = options || {}

  // Min and max font size.
  projectedPercentageOfBox = options.projectedPercentageOfBox || .87 
  min = options.min || 6
  max = Math.min(element.parent()[0].offsetHeight / element.text().split(' ').length, options.max) || 20;
  mid = Math.floor(Math.min(element.parent()[0].offsetHeight / element.text().split(' ').length, options.max || 20) * projectedPercentageOfBox * 10) / 10
  
  containerWidth = element.parent()[0].offsetWidth;
  containerHeight = element.parent()[0].offsetHeight;
  
  // Do a binary search for the best font size
  while ( min <= max ) {


    element.css( 'font-size', mid+'px' )

    // Use scrollWidth because it checks for overflow text
    var width = element[0].scrollWidth
    var height = element[0].offsetHeight
    var isTooBig = ( height > containerHeight || width > containerWidth )
    if( options.debug ) {
      console.log( '[text-fit] %sx%s in %sx%s. %s < (%s) < %s - %s', width, height, containerWidth, containerHeight, min, mid, max, isTooBig ? 'too big' : 'too small' )
    }

    if( !width || !height ) {
      if( shouldWarn ) {
        console.warn( '[text-fit] Cannot fit elements text because the element is %sx%s.', width, height, element[0])
      }
      return
    }

    if( isTooBig ) {
      max = mid;
    } else {
      min = mid;
    }
    
    lastMid = mid
    mid = Math.floor( ( min + max ) / 2 * 10 ) / 10

    if( mid === lastMid ) {
      break
    }

    
  }

  return mid
} )



