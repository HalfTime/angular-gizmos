describe( "Lodash extensions", function() {

  describe( "_.capitalize()", function() {
    it( "capitalizes the first letter in the given string", function() {
      expect( _.capitalize( "the-big-cheese" ) ).toBe( 'The-big-cheese' )
    } )
  } )

  describe( "_.titlecase()", function() {
    it( "works on underscore separated strings", function() {
      expect( _.titlecase( "the-big-cheese" ) ).toBe( 'TheBigCheese' )
    } )

    it( "works on dash separated strings", function() {
      expect( _.titlecase( "the_big_cheese" ) ).toBe( 'TheBigCheese' )
    } )

    it( "works on single space separated strings", function() {
      expect( _.titlecase( "the big cheese" ) ).toBe( 'TheBigCheese' )
    } )
  } )

  describe( "_.camelcase()", function() {
    it( "works on underscore separated strings", function() {
      expect( _.camelcase( "the-big-cheese" ) ).toBe( 'theBigCheese' )
    } )

    it( "works on dash separated strings", function() {
      expect( _.camelcase( "the_big_cheese" ) ).toBe( 'theBigCheese' )
    } )

    it( "works on single space separated strings", function() {
      expect( _.camelcase( "the big cheese" ) ).toBe( 'theBigCheese' )
    } )
  } )

  describe( "_.camelcaseKeys()", function() {
    it( "converts top level keys to camelCase", function() {
      expect( _.camelcaseKeys( { a_b: 6 } ) ).toEqual( { aB: 6 } )
      expect( _.camelcaseKeys( { 'a b': 6 } ) ).toEqual( { aB: 6 } )
      expect( _.camelcaseKeys( { 'a-b': 6 } ) ).toEqual( { aB: 6 } )
    } )

    it( "converts nested keys to camelCase", function() {
      expect( _.camelcaseKeys( { a_b: { d_e: 6 } } ) ).toEqual( { aB: { dE: 6 } } )
    } )

    it( "converts nested keys in arrays to camelCase", function() {
      expect( _.camelcaseKeys( { a_b: [ { d_e: 6 } ] } ) ).toEqual( { aB: [ { dE: 6 } ] } )
    } )

    it( "works given an array", function() {
      expect( _.camelcaseKeys( [ {a_b: 1} ] ) ).toEqual( [ {aB: 1} ] )
    } )

    it( "works given a primitive", function() {
      expect( _.camelcaseKeys( 9 ) ).toEqual( 9 )
      expect( _.camelcaseKeys( '9' ) ).toEqual( '9' )
      expect( _.camelcaseKeys( null ) ).toEqual( null )
      expect( _.camelcaseKeys( undefined ) ).toEqual( undefined )
    } )

    it( "does not work w/ boxed primitives", function() { // jshint -W053
      expect( function() { _.camelcaseKeys( new String("Who uses these anyways") ) } ).toThrowError()
    } )
  } )

  describe( "_.uuid()", function() {
    it( "returns a large string", function() {
      expect( _.uuid().length ).toBeGreaterThan( 10 )
    } )

    it( "returns a unique string each time its called", function() {
      expect( _.uuid() === _.uuid() ).toBe( false )
    } )
  } )

  describe( "_.id()", function() {
    it( "returns the given number", function() {
      expect( _.id( 7099 ) ).toBe( 7099 )
    } )

    it( "casts a numeric string into a number", function() {
      expect( _.id( '7099' ) ).toBe( 7099 )
    } )

    it( "throws given a string that isn't a number", function() {
      expect( function() { _.id( 'rat' ) } ).toThrowError( /Unable to coerce/ )
    } )

    describe( "given an object", function() {
      it( "returns its numeric 'id' property", function() {
        expect( _.id( { id: 7099 } ) ).toBe( 7099 )
      } )

      it( "casts a numeric string 'id' property to a number", function() {
        expect( _.id( { id: '7099' } ) ).toBe( 7099 )
      } )

      it( "throws if the 'id' property is a non-numeric string", function() {
        expect( function() { _.id( {id: 'rat'} ) } ).toThrowError( /Unable to coerce/ )
      } )

      it( "throws if the 'id' property doesn't exist", function() {
        expect( function() { _.id( {cid: 1} ) } ).toThrowError( /Unable to coerce/ )
      } )
    } )
  } )


  describe( "_.findById()", function() {
    var a, b, c, list

    beforeEach( function() {
      a = { id: 1 }
      b = { id: 2 }
      c = { id: 3 }
      list = [ a, b, c]
    } )

    it( "returns the first object in the list with the given id", function() {
      expect( _.findById( list, 2 ) ).toBe( b )
      a.id = b.id
      expect( _.findById( list, 2 ) ).toBe( a )
    } )

    it( "coerces the given id to a number when comparing", function() {
      expect( _.findById( list, '2' ) ).toBe( b )
    } )

    it( "coerces the given object with an `id` property", function() {
      expect( _.findById( list, {id: '3'} ) ).toBe( c )
    } )

    it( "throws an error if the given id isn't found", function() {
      expect( function() { _.findById( list, 999 ) } ).toThrowError()
    } )
  } )


  describe( "_.skipNulls()", function() {
    it( "returns a function that is only invoked if its first argument is not null or undefined", function() {
      var wrappedFn = _.skipNulls(function() { return true })

      expect( wrappedFn() ).toEqual( undefined )
      expect( wrappedFn(null) ).toEqual( undefined )
      expect( wrappedFn(undefined) ).toEqual( undefined )
      expect( wrappedFn(undefined, true) ).toEqual( undefined )
      expect( wrappedFn(0) ).toEqual( true )
      expect( wrappedFn("") ).toEqual( true )
      expect( wrappedFn([]) ).toEqual( true )
      expect( wrappedFn({}) ).toEqual( true )
    } )
  } )


  describe( "_.skipUndefined()", function() {
    it( "returns a function that is only invoked if its first argument is not undefined", function() {
      var wrappedFn = _.skipUndefined(function() { return true })

      expect( wrappedFn() ).toEqual( undefined )
      expect( wrappedFn(null) ).toEqual( true )
      expect( wrappedFn(undefined) ).toEqual( undefined )
      expect( wrappedFn(undefined, true) ).toEqual( undefined )
      expect( wrappedFn(0) ).toEqual( true )
      expect( wrappedFn("") ).toEqual( true )
      expect( wrappedFn([]) ).toEqual( true )
      expect( wrappedFn({}) ).toEqual( true )
    } )
  } )


  describe( "_.setter()", function() {
    describe( "given an object and a property name", function() {
      it( "returns a function which assigns a value to that property's name", function() {
        var setName, object = {}
        setName = _.setter( object, 'name' )
        setName( "Todd" )
        expect( object.name ).toBe( "Todd" )
      } )
    } )

    describe( "given an object, a property name, and an initial value", function() {
      it( "returns a function which always assigns the inital value", function() {
        var setName, object = {}
        setName = _.setter( object, 'name', 'Mark' )
        setName( 'Todd' ) 
        expect( object.name ).toBe( "Mark" )
      } )
    } )
  } )


  describe( "_.randomFlip()", function() {
    // Calls randomFlip multiple times with the given arg and returns a unique list of the results 
    var repeatRandomFlipWithArg = function( arg ) {
      var results = []
      _.times( 20, function() {
        results.push( _.randomFlip( arg ) )
      } )
      return _.uniq( results ).sort()
    }

    it( "given no argument returns a mix of true and false", function() {
      expect( repeatRandomFlipWithArg( ) ).toEqual( [false, true] )
    } )

    it( "given 1 it returns true every time", function() {
      expect( repeatRandomFlipWithArg( 1 ) ).toEqual( [true] )
    } )

    it( "given 0 it returns false every time", function() {
      expect( repeatRandomFlipWithArg( 0 ) ).toEqual( [false] )
    } )
  } )


  describe( "_.formatPercent()", function() {
    it( "takes in a decimal percent and returns a string as a hundred percent with a '%'", function() {
      expect( _.formatPercent( 0.08 ) ).toEqual( "8%" )
      expect( _.formatPercent( 1 ) ).toEqual( "100%" )
      expect( _.formatPercent( 0 ) ).toEqual( "0%" )
      expect( _.formatPercent( -1 ) ).toEqual( "-100%" )
      expect( _.formatPercent( null ) ).toEqual( "0%" )
    } )

    it( "accepts a parameter to round to the given precision", function() {
      expect( _.formatPercent( 0.333333) ).toEqual( "33.3333%" )
      expect( _.formatPercent( 0.333333, 0 ) ).toEqual( "33%" )
      expect( _.formatPercent( 0.333333, 2 ) ).toEqual( "33.33%" )
      expect( _.formatPercent( 0.333333, false ) ).toEqual( "33%" )
    } )

  } )

  describe( "_.registry()", function() {

    describe( "get()", function() {
      it( "returns the value stored for the given key", function() {
        var registry = _.registry()
        registry.set( 'cool', 'hat' )
        expect( registry.get( 'cool' ) ).toEqual( 'hat' )
      } )

      it( "throws an error if the given key is not present", function() {
        var registry = _.registry().set( { a: 1, b: 2 } )
        var expectedError = "No key `sandles` in `(no name)` registry.  Available: `a, b`"
        expect( function() { registry.get( "sandles" ) } ).toThrowError( expectedError )
      } )

      it( "includes the registry's name in the error message if given", function() {
        var registry = _.registry( "My Shoes" ).set( { a: 1, b: 2 } )
        var expectedError = "No key `sandles` in `My Shoes` registry.  Available: `a, b`"
        expect( function() { registry.get( "sandles" ) } ).toThrowError( expectedError )
      } )
    } )

    describe( "set()", function() {
      it( "can set a single value at a time", function() {
        var registry = _.registry("Shoes")
        registry.set( "sneakers", 9 )
        expect( registry.get( "sneakers" ) ).toEqual( 9 )
      } )

      it( "can set multiple values at once", function() {
        var registry = _.registry("Shoes")
        registry.set( { sneakers: 9, horse: 713 } )
        expect( registry.get( "sneakers" ) ).toEqual( 9 )
      } )

      it( "is chainable", function() {
        var registry = _.registry("Shoes")
        expect( registry.set('a', 1).set('b', 2).get('a') ).toEqual( 1 )
      } )
    } )

  } )
} )


