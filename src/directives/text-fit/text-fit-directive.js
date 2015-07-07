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
        
        // If part of a group then resize all elements in group
        // otherwise just do this one
        
        doTextFit()
          
        
        
      }

      var doTextFit = () => {

        

        if( textFitGroup ) {
          
          fontSize = textFitGroup.doGroupTextFit( $element, $scope.textFitOptions )
          textFitGroup.notifyOfRelayout( fontSize )
          
        } else {
          
          fontSize = textFit( $element, $scope.textFitOptions )
          
        }

      }

      // Timeout so that view initially renders mostly so we know if it is hidden.
      $timeout(initialize)

    },
  }
} )

