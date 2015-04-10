describe( "timesince filter", function () {
  var filter, SECONDS, MINUTES, HOURS, DAYS, YEARS

  SECONDS  = 1000
  MINUTES = 1000 * 60
  HOURS   = 1000 * 60 * 60
  DAYS    = 1000 * 60 * 60 * 24
  YEARS   = 1000 * 60 * 60 * 24 * 365

  beforeEach( module( 'gizmos.filters' ) )

  beforeEach( inject( function ( _$filter_ ) {
    filter = _$filter_('timesince')
  } ) )

  describe( "when given a past date", function() {
    it( "should format seconds", function () {
      expect( filter( Date.now() ) ).toEqual( 'less than a minute ago' )
      expect( filter( Date.now() - 59 * SECONDS ) ).toEqual( 'less than a minute ago' )
    } )

    it( "should format minutes", function() {
      expect( filter( Date.now() - 61 * SECONDS ) ).toEqual( '1 min ago' )
    } )

    it( "should round to the nearest minute", function() {
      expect( filter( Date.now() - 89 * SECONDS ) ).toEqual( '1 min ago' )
      expect( filter( Date.now() - 91 * SECONDS ) ).toEqual( '2 mins ago' )
      expect( filter( Date.now() - 119 * SECONDS ) ).toEqual( '2 mins ago' )
    } )

    it( "should format hours", function() {
      expect( filter( Date.now() - 60.01 * MINUTES ) ).toEqual( '1 hr ago' )
      expect( filter( Date.now() - 89 * MINUTES ) ).toEqual( '1 hr ago' )
      expect( filter( Date.now() - 90.01 * MINUTES ) ).toEqual( '2 hrs ago' )
    } )

    it( "should format days", function() {
      expect( filter( Date.now() - 24.01 * HOURS ) ).toEqual( '1 day ago' )
      expect( filter( Date.now() - 36.01 * HOURS ) ).toEqual( '2 days ago' )
    } )

    it( "should format weeks", function() {
      expect( filter( Date.now() - 7.01 * DAYS ) ).toEqual( '1 week ago' )
      expect( filter( Date.now() - 11.01 * DAYS ) ).toEqual( '2 weeks ago' )
      expect( filter( Date.now() - 365.01 * DAYS ) ).toEqual( '52 weeks ago' )
    } )

    it( "should format years", function() {
      expect( filter( Date.now() - 366.01 * DAYS ) ).toEqual( '1 year ago' )
      expect( filter( Date.now() - 549.01 * DAYS ) ).toEqual( '2 years ago' )
    } )

    it( "should format decades", function() {
      expect( filter( Date.now() - 20.01 * YEARS ) ).toEqual( '2 decades ago' )
    } )
  } )

  describe( "when given a future date", function() {
    it( "should format seconds", function () {
      expect( filter( Date.now() + 1 * SECONDS ) ).toEqual( 'in less than a minute' )
      expect( filter( Date.now() + 59 * SECONDS ) ).toEqual( 'in less than a minute' )
    } )

    it( "should format minutes", function() {
      expect( filter( Date.now() + 61 * SECONDS ) ).toEqual( 'in 1 min' )
    } )

    it( "should round to the nearest minute", function() {
      expect( filter( Date.now() + 89 * SECONDS ) ).toEqual( 'in 1 min' )
      expect( filter( Date.now() + 91 * SECONDS ) ).toEqual( 'in 2 mins' )
      expect( filter( Date.now() + 120 * SECONDS ) ).toEqual( 'in 2 mins' )
    } )

    it( "should format hours", function() {
      expect( filter( Date.now() + 60 * MINUTES ) ).toEqual( 'in 1 hr' )
      expect( filter( Date.now() + 89 * MINUTES ) ).toEqual( 'in 1 hr' )
      expect( filter( Date.now() + 91 * MINUTES ) ).toEqual( 'in 2 hrs' )
    } )

    it( "should format days", function() {
      expect( filter( Date.now() + 24.01 * HOURS ) ).toEqual( 'in 1 day' )
      expect( filter( Date.now() + 36.01 * HOURS ) ).toEqual( 'in 2 days' )
    } )

    it( "should format weeks", function() {
      expect( filter( Date.now() + 7.01 * DAYS ) ).toEqual( 'in 1 week' )
      expect( filter( Date.now() + 11 * DAYS ) ).toEqual( 'in 2 weeks' )
      expect( filter( Date.now() + 365 * DAYS ) ).toEqual( 'in 52 weeks' )
    } )

    it( "should format years", function() {
      expect( filter( Date.now() + 366 * DAYS ) ).toEqual( 'in 1 year' )
      expect( filter( Date.now() + 549 * DAYS ) ).toEqual( 'in 2 years' )
    } )

    it( "should format decades", function() {
      expect( filter( Date.now() + 20.01 * YEARS ) ).toEqual( 'in 2 decades' )
    } )
  } )

  describe( "when faulty data is provided", function() {
    it( "should return 'never' when given null", function() {
      expect( filter( null ) ).toEqual( 'never' )
    } )

    it( "should return 'never' when given undefined", function() {
      expect( filter( undefined ) ).toEqual( 'never' )
    } )

    it( "should return 'never' when given 0", function() {
      expect( filter( 0 ) ).toEqual( 'never' )
    } )

    it( "should return 'never' when given a non-numeric string", function() {
      expect( filter( 'baz' ) ).toEqual( 'never' )
    } )
  } )

  it ( "works given a date string", function() {
    var dateString = new Date( Date.now() - 2.01 * YEARS ).toString()
    expect( filter( dateString ) ).toEqual( '2 years ago' )
  } )

} )



