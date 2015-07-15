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
  var min, max, mid, lastMid, containerStyle, containerWidth, containerHeight, projectedPercentageOfBox, accuracy, allowWordWrap, debug
  
  debug = function ( ...args ) {

    if ( options.debug ) {
      
      console[ options.debug === true ? 'log' : options.debug ]( ...args )
      
    }
    
  }  
  
  // ToDo: get options from text-fit-group
  options = options || {}

  debug('[textFit] Running on: ', element.text())

  // Check if element is hidden
  if ( element[0].offsetHeight === 0 ){
    debug('[textFit] hidden element: ', element.text())
    return null
  }
  
  // Set accuracy for faster guessing
  accuracy = options.accuracy || 0
  
  // dis-allow word wrap
  allowWordWrap = !(options.wordWrap === false)
  if(!allowWordWrap) {
    element.css('white-space', 'nowrap')
  }
  
  // This is slow but WAY more reliable than el.scrollWidth. This method factors
  // in padding and such. Slower probably not an issue since the container is 
  // only computed once per font resize.
  containerStyle = window.getComputedStyle(element.parent()[0]);
  if (containerStyle["box-sizing"] === "border-box") {
    containerWidth = Math.round(parseFloat(containerStyle.width)) - Math.round(parseFloat(containerStyle.paddingLeft)) - Math.round(parseFloat(containerStyle.paddingRight));
    containerHeight = Math.round(parseFloat(containerStyle.height)) - Math.round(parseFloat(containerStyle.paddingTop)) - Math.round(parseFloat(containerStyle.paddingBottom));
  } else {
    containerWidth = Math.round(parseFloat(containerStyle.width));
    containerHeight = Math.round(parseFloat(containerStyle.height));
  }

  // Min and max font size.
  min = options.min || 6
  max = Math.min(containerHeight, (options.max || 120) );
  mid = Math.floor( ( min + max ) / 2 * 10 ) / 10
  
  // Do a binary search for the best font size
  while ( (min + accuracy) <= max ) {


    element.css( 'font-size', mid+'px' )

    // Use scrollWidth because it checks for overflow text
    var width = element[0].scrollWidth
    var height = element[0].offsetHeight
    var isTooBig = ( height > containerHeight || width > containerWidth )
    
    debug( '[textFit] %sx%s in %sx%s. %s < (%s) < %s - %s', width, height, containerWidth, containerHeight, min, mid, max, isTooBig ? 'too big' : 'too small' )

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



