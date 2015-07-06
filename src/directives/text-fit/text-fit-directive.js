// Directive textFit attaches textFit behavior to an element.  
angular.module( 'gizmos.directives' ).directive( 'textFit', function( $timeout, textFit, $parse ) {
  return {
    restrict: 'A',
    scope: {
      text: '=textFit',
      textFitOptions: '=textFitOptions'
    },
    require: '^?textFitGroup',

    link: function( $scope, $element, $attributes, textFitGroup ) {      
      let initialize = () => {
        var deregisterFn

        if( textFitGroup ) {
          // Register with our parent text fit group
          deregisterFn = textFitGroup.add( $element )
        }

        $scope.$watch( 'text', onTextChange )
        $scope.$on( '$destroy', deregisterFn || angular.noop )
        $scope.$on( 'textFit', onTextChange )
      }

      // When the text changes, update the element's text and rerun textFit.
      // If we have a parent text fit group, notify it.
      var onTextChange = () => {
        let { text } = $scope

        if( !text) {
          return
        }

        $element.text( text )
        doTextFit()
      }

      var doTextFit = () => {

        // Check if item is visible. 
        let isVisible = !($element[0].offsetHeight === 0)

        if( isVisible ) {
          fontSize = textFit( $element, $scope.textFitOptions )
        }

        if( textFitGroup ) {
          textFitGroup.notifyOfRelayout( fontSize )
        }
      }

      // Timeout so that view initially renders mostly so we know if it is hidden.
      $timeout(initialize)

    },
  }
} )

