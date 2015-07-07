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
  var min, max, mid, lastMid, containerStyle, containerWidth, containerHeight, projectedPercentageOfBox, accuracy, allowWordWrap
  
  // element = angular.element( element )
  
  
  // Check if element is hidden
  if ( element[0].offsetHeight === 0 ){
    console.log('[textFit] hidden element: ', element.text())
    return null
  }
  
  console.log('[textFit] Running on: ', element.text())
  
  // ToDo: get options from text-fit-group
  options = options || {}
  
  // Set accuracy for faster guessing
  accuracy = options.accuracy || 0
  
  // dis-allow word wrap
  allowWordWrap = (options.wordWrap !== undefined && options.wordWrap)
  if(!allowWordWrap) {
    element.css('white-space', 'nowrap')
  }
  
    // This is slow but WAY more reliable than el.scrollWidth. This method factors
  // in padding and such. Slower probably not an issue since the container is 
  // only computed once per font resize.
  containerStyle = window.getComputedStyle(element.parent()[0])
  if( containerStyle["box-sizing"] === 'border-box') {
    containerWidth = parseInt(containerStyle.width, 10) - parseInt(containerStyle.paddingLeft, 10) - parseInt(containerStyle.paddingRight, 10) 
    containerHeight = parseInt(containerStyle.height, 10)  - parseInt(containerStyle.paddingTop, 10) - parseInt(containerStyle.paddingBottom, 10)
  } else {
    containerWidth = parseFloat(containerStyle.width)
    containerHeight = parseFloat(containerStyle.height)     
  }

  // Min and max font size.
  projectedPercentageOfBox = options.projectedPercentageOfBox || .87 
  min = options.min || 6
  max = Math.min(containerHeight / (allowWordWrap ? element.text().split(' ').length : 1), options.max) || 120;
  
  // Its assumed that initial mid should be as big as possible since most 
  // answers will fit into regular sizes words or phrases. Size is determines by 
  // container height devided by how many spaces used. 
  mid = Math.floor(Math.min(containerHeight / element.text().split(' ').length, options.max || 20) * projectedPercentageOfBox * 10) / 10
  
  // Do a binary search for the best font size
  while ( (min + accuracy) <= max ) {


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



