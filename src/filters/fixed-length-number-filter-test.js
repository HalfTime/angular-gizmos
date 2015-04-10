describe( "fixedLengthNumber filter", function () {
  var filter

  beforeEach( module( 'gizmos.filters' ) )

  beforeEach( inject( function ( _$filter_ ) {
    filter = _$filter_('fixedLengthNumber')
  } ) )

  it( "should pad the input number with 0's to the number of digits", function () {
    expect( filter(9, 1) ).toEqual( "9" )
    expect( filter(9, 4) ).toEqual( "0009" )
    expect( filter(111, 6) ).toEqual( "000111" )
  } )


  describe( "caveats and edge cases", function () {
    it( "should allow strings as inputs", function () {
      expect( filter("9", "3") ).toEqual( "009" )
    } )

    it( "will chop off leading digits if the number is larger than the number of digits", function () {
      expect( filter(123, 2) ).toEqual( "23" )
    } )

    it( "will not handle 0 as a number of digits", function () {
      expect( filter(9, 0) ).toEqual( "10000000009" )
    } )
  } )

} )


