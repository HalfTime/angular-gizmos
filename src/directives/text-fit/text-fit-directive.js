// Directive textFit attaches textFit behavior to an element.  
angular.module( 'gizmos.directives' ).directive( 'textFit', function( $timeout,  $window, textFit ) {
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
        $scope.$on( 'textFit', onTextChange )
        
        // Add focus event to trigger textfit
        $window.addEventListener('focus', onTextChange)
        
        // Deregister on destroy
        $scope.$on( '$destroy', () => {
          
            if( textFitGroup ) {
              deregisterFn()
            } 
            
            $window.removeEventListener('focus', onTextChange)
          
          })
      }

      // When the text changes, update the element's text and rerun textFit.
      // If we have a parent text fit group, notify it.
      var onTextChange = () => {
        let { text } = $scope

        if( !text ) {
          return
        }

        $element.text( text )
        
        doTextFit()
        
      }

      var doTextFit = () => {

        let fontSize
        

        if( textFitGroup ) {
          
          // If part of a group then run resize through parent          

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

