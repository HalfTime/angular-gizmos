// Directive textFitGroup coordinates between multiple child textFit directive
// elements.  When the UI is ready for them to run the textFit function (e.g.
// after having their text set and `display: none` removed), it resizes them to
// the best fit and then finds the smallest font size and syncs them to all
// have that font size, so things don't look odd.
//
// The directive knows it is time to call textFit when the `isNeeded` property
// on the passed in model is set to true.
angular.module( 'gizmos.directives' ).directive( 'textFitGroup', function( $timeout, $parse, textFit ) {
  return {
    restrict: 'A',
    scope: { 'textFitOptions' : '=textFitGroup' },
    controller: function($scope) {
      
      // The child textFit elements that have registered with us through a
      // textFit directive.
      this.elements = []

      // List of font sizes for relayouts that have happened in the last digest cycle.
      this.relayoutNotified = false

      // Adds a textFit element to this group.
      // Returns a deregister function the caller should call when destroyed.
      this.add = ( textFitElement ) => {
        this.elements.push( textFitElement )
        return _.remove.bind( _, this.elements, textFitElement )
      }

      // When a child textFit element does a relayout, it notifies us.  We
      // queue a resize and sync to happen, which assumes all children are
      // updating their text in a single digest cycle.
      this.notifyOfRelayout = (  ) => {

        if( !this.relayoutNotified ) {
          this.relayoutNotified = true
          $timeout( () => {
            this.setToMin()
            this.recentRelayoutFontSizes = []
          } )
        } 
      }

      // Calls textFit on each element, then finds the smallest font size
      // amongst all elements and sizes them all to that size.
      this.setToMin = function() {
        var fontSizes, smallestFontSize

        fontSizes = this.elements.map( ( el ) => parseInt(el.css('font-size'), 10) )
        smallestFontSize = _.min( fontSizes )
        console.log( '[textFitGroup] resizeElement()', fontSizes, smallestFontSize )

        this.elements.forEach( ( el ) => el.css( 'font-size', smallestFontSize ) )
      }
      
      this.doGroupTextFit = ( el, childOptions ) => {
        
        let opts = angular.extend({}, $scope.textFitOptions, childOptions)
        
        return textFit( el, opts)
        
      } 
    },

  }
} )


