describe( "debounce service", function () {

  beforeEach( function () {
    module( 'gizmos.services' )

    // Add a mock _ object to window with debounce
    window._ = {
      debounce: function ( callback, delay, options ) {
        callback()
      }
    }
  } )

  it( "should throw an error when injected if `_` is not defined", function () {
    window._ = null
    expect( function () {
      inject( function ( debounce ) { } )
    } ).toThrow()
  } )

  it( "should delegate to _.debounce", function () {
    spyOn( window._, 'debounce')
    inject( function ( debounce ) {
      debounce( angular.noop, 1 )
      expect( window._.debounce ).toHaveBeenCalled()
    } )
  } )

  it( "should trigger a rootScope digest", function () {
    inject( function ( debounce, $rootScope ) {
      spyOn( $rootScope, '$digest')
      debounce( angular.noop, 100 )
      expect( $rootScope.$digest ).toHaveBeenCalled()
    } )
  } )
} )


