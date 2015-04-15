// Directive textFit attaches textFit behavior to an element.  Currently, all
// it does is register with an ancester textFitGroup directive which handles
// resizing it.  Behavior for it to resize itself can be added when needed.
angular.module( 'gizmos.directives' ).directive( 'textFit', function( $timeout, textFit ) {
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

      // If an element is not visible it will appear to be 0x0 and not re-size
      // properly.  This is common if the element or its ancestor is ng-hidden.
      let retryCount = 0
      let maxRetryCount = 10
      let retryInterval = 35

      var doTextFit = () => {
        let fontSize
        let isLastRetry = ( retryCount >= maxRetryCount )

        // Much faster check then `:visible`, though not as robust.
        let isVisible = ( !$element.closest('.ng-hide').length )

        if( isVisible ) {
          fontSize = textFit( $element, $scope.textFitOptions, isLastRetry )
        }

        if( !fontSize && !isLastRetry ) {
          retryCount += 1
          $timeout( doTextFit, retryInterval, false )
          return
        }

        if( textFitGroup ) {
          textFitGroup.notifyOfRelayout( fontSize )
        }
      }

      initialize()

    },
  }
} )

