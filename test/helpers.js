let global = Function('return this')()

// Some helper functions, available as a global in all tests ;)
global.helpers = {
  global,

  // Use inject to get a service that returns it, not passes it into a
  // function.
  inject( name ) {
    let result
    inject( [ name, ( service ) => result = service ] )
    return result
  },

  // Triger a digest cycle
  digest() {
    this.inject( '$rootScope' ).$digest()
  },

  // Flush the $timeout queue
  flush(ms=undefined) {
    this.inject( '$timeout' ).flush(ms)
  },


  // Compiles the given html string, in a scope w/ the given properties.
  // Returns the element.  The elements scope can be accessed via the standard
  // `el.scope()`.
  compile( html, scopeProperties={} ) {
    let $rootScope = this.inject( '$rootScope' )
    let $compile = this.inject( '$compile' )
    let $scope = angular.extend( $rootScope.$new(), scopeProperties )
    let el = $compile( html )( $scope )
    $scope.$digest()
    return el
  },

  // Install angulars dependency injection in to jasmine's functions - `it`, `beforeEach`.
  // Usage:
  //
  //    it( 'works', ( $http, Users ) => {
  //      // ...
  //    } )
  injectJasmineFunctions() {
    var _it = it
    this.global.it = function( description, fn ) {
      return _it(description, function() {
        inject(fn)
      })
    }

    var _fit = fit
    this.global.fit = function( description, fn ) {
      return _fit(description, function() {
        inject(fn)
      })
    }

    var _beforeEach = beforeEach
    this.global.beforeEach = function( fn ) {
      return _beforeEach(function() {
        if(fn.length) {
          inject(fn)
        } else {
          fn()
        }
      })
    }

    var _afterEach = afterEach
    this.global.afterEach = function( fn ) {
      return _afterEach(function() {
        if( fn.length ) {
          inject(fn)
        } else {
          fn()
        }
      })
    }
  },
}

global.helpers.injectJasmineFunctions()

