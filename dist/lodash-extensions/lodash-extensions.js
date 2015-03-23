// Contains useful extensions to the `_` utility object.
_.mixin( {

  // Quick and dirty logging, useful when debugging callbacks:
  //
  //    $http.get().then(_.log, _.log)
  //
  log: function() {
    console.log.apply(console, arguments)
  },

  // Converts the given underscore, dash, or space seperated word into
  // camelCase.
  camelcase: function( string ) {
    return string.replace(/([_\-\s]\w)/g, function( m ) { return m[ 1 ].toUpperCase() })
  },

  // Capitalizes the first letter in the given string.
  capitalize: function( string ) {
    return string.charAt( 0 ).toUpperCase() + string.slice( 1 )
  },

  // Converts the given underscore, dash, or space seperated word into
  // TitleCase.
  titlecase: function( string ) {
    return _.capitalize( _.camelcase( string ) )
  },

  // Round
  // _.round(12345.6789, 2)   => 12345.68
  round: function( number, decimals ) {
    return Math.round( number * Math.pow( 10, decimals ) ) / Math.pow( 10, decimals )
  },

  // Returns a new object with all the keys in the given object converted to
  // camelCase.  It converts keys recursively in nested objects and arrays.
  //
  // Example:
  //
  //    _.camelcaseKeys( { first_name: 'pedro', hobbies: [ { full_name: "Sports" } ] } )
  //    // =>
  //    { firstName: "pedro", hobbies: [ { fullName: "Sports" } ] }
  //
  camelcaseKeys: function( object ) {
    var result = {}

    if ( _.isArray( object ) ) {
      return object.map( _.camelcaseKeys )
    }
    if( ! _.isObject( object ) ) {
      return object
    }

    _.each( object, function( value, key ) {
      result[ _.camelcase( key ) ] = _.camelcaseKeys( value )
    } )

    return result
  },

  // Generates a new UUID
  // Source: http://stackoverflow.com/a/8809472
  uuid: function() {
    var d = Date.now()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) { // jshint bitwise: false
      var r = ( d + Math.random() *16 ) % 16 | 0
      d = Math.floor( d/16 )
      return ( c === 'x' ? r : ( r & 0x7 | 0x8 ) ).toString( 16 )
    })
  },

  // Coerces the given object into its numeric id.  Given a number it will just
  // return the number.  Given a string it will cast to a number and ensure the
  // result is a number.  Given an object it will cast the `id` property to a
  // valid number.  Otherwise, it will throw an error.
  //
  // This allows writing functions that can be called given an object or
  // an id, giving more flexibility to the calleer:
  //
  //    findThing( thing.id )
  //    findThing( thing )
  //
  //    // inside findThing()
  //    var id = _.id( thing )
  //
  // As well as additional checks so hard to debug situations like
  // `GET /users/NaN` will instead fail early.
  //
  // Usage:
  //    _.id(6)             // => 6
  //    _.id('6')           // => 6
  //    _.id({ id: '6' })   // => 6
  //    _.id({ hi: '6' })   // => throws error
  id: function( objectOrId ) {
    if( typeof objectOrId === "number" ) {
      return objectOrId
    } else if( typeof objectOrId === "string" && !isNaN( +objectOrId ) ) {
      return +objectOrId
    } else if( typeof objectOrId === "object" && ('id' in objectOrId) ) {
      return _.id( objectOrId.id )
    } else {
      throw new Error( "Unable to coerce object to an id: `" + JSON.stringify( objectOrId ) + "`" )
    }
  },

  // Returns the object in the given list with an id property that matches the given id.
  // The id is cooerced to a number before comparing.
  // Throws an error if the id is not found in the list.
  findById: function( list, id ) {
    var object
    id = _.id( id )
    object = _.findWhere( list, { id: id } )
    if( !object ) {
      throw Error( "id not found in list: `" + id + "`.  Available: " + JSON.stringify( _.pluck( list, 'id' ) ) )
    }
    return object
  },

  // Wraps the given `fn`, only calling it when invoked and its first parameter
  // is not null or undefined.
  //
  // Useful for $watch expressions which almost
  // always ignore the first invocation when uninitialized.
  //
  // Usage:
  //
  //    setName = function( name ) { ... }
  //    scope.$watch( "foo", _.skipUndefined( setName ) )
  //
  skipUndefined: function( fn ) {
    return function( newValue, oldValue ) {
      if( typeof newValue === 'undefined' ) { return }
      return fn( newValue, oldValue )
    }
  },

  // Works similar to skip Undefined, but also skips `null` in addition to `undefined`.
  skipNulls: function( fn ) {
    return function( newValue, oldValue ) {
      if( typeof newValue === 'undefined' || newValue === null ) { return }
      return fn( newValue, oldValue )
    }
  },

  // Returns a setter function for the given property on the given object.
  // When you create the setter you can also pass in a staticValue that will
  // always be used as the value when called.
  //
  // Useful for $watch expressions which just set a value on the scope.
  //
  // Usage:
  //
  //    setName = _.setter( obj, 'name' )
  //    setName( "Jimmy" )
  //
  //    $scope.$watch( "Active.game", _.setter( $scope, 'game' ) )
  //
  //    resetFlag = _.setter( $scope, 'isFoo', false )
  //    $scope.isFoo = true
  //    resetFlag()
  setter: function( object, propertyName, staticValue ) {
    return function( value ) {
      if( typeof staticValue === 'undefined' ) {
        object[ propertyName ] = value
      } else {
        object[ propertyName ] = staticValue
      }
    }
  },

  // Returns a function that acts as a getter for the given property on the
  // given object.  Useful in watch expressions:
  //
  //    $scope.$watch( _.getter( Users, 'all' ), function( users ) { ... } )
  //
  // Instead of:
  //    $scope.$watch( function() { return Users.all }, function ( users ) { ... })
  //    // or
  //    $scope.Users = Users
  //    $scope.$watch( "Users.all", function( users ) { ... } )
  //
  getter: function( object, key ) {
    return function() {
      return object[ key ]
    }
  },

  // Formats a decimal percent `.1` as a percent string `10%`, suitible for
  // usage as a CSS property. Passing a truthy value as the second argument
  // will return a rounded version of the percent.
  //
  // Usage:
  //
  //    _.formatPercent( 0.3333333333 )  // => "33.33333333%"
  //    _.formatPercent( 0.3333333333, 0 )  // => "33%"
  //    _.formatPercent( 0.3333333333, 2 )  // => "33.33%"
  //
  formatPercent: function( decimalPercent, precision ) {
    var number = decimalPercent * 100

    if( typeof precision !== 'undefined' ) {
      number = number.toFixed( precision )
    }

    return number + "%"
  },

  // Returns `true` or `false`, based on flipping a random 'coin'.  Given no
  // arguments it has a 50% chance of returning true.  Given a single number
  // between 0 and 1, it will use that number as a decimal probibility to
  // return true, closer to 1 being a higher probibility.
  //
  // Usage:
  //
  //    _.randomFlip()    // => 50% chance of returning true
  //    _.randomFlip(.50) // => 50% chance of returning true
  //    _.randomFlip(.75) // => 75% change of returning true
  //    _.randomFlip(1)   // => 100% change of returning true
  //    _.randomFlip(0)   // => 0% change of returning true
  randomFlip: function( probabilityOfReturningTrue ) {
    if( _.isUndefined( probabilityOfReturningTrue ) ) {
      probabilityOfReturningTrue = 0.5
    }
    return ( Math.random() <= probabilityOfReturningTrue )
  },


  // Checks the properties of the given object, useful as interfaces change
  // rapidly in development, especially for objects that use the
  // `extend(this, properties)` pattern in their constructors.
  //
  // Will extend w/ additional functionality as needed.
  //
  // Usage:
  //
  //    _.check( person, 'name age')  // throws error if `name` or `age` are not properties on `person`
  //
  check: function( object, optionsOrRequiredProperties ) {
    var requiredProperties

    if( !object ) { throw Error("No object given to _.check") }

    if( _.isString( optionsOrRequiredProperties ) ) {
      requiredProperties = optionsOrRequiredProperties.split(" ")
    }

    requiredProperties.forEach( function( name ) {
      if( ! ( name in object ) ) {
        throw Error( "Check Failed - object did not contain a property `" + name + "`.  It had:\n\t" + Object.keys( object ).join("\n\t") )
      }
    } )
  },

  // `registry()` returns an object that works like cache that allows you to
  // `get` and `set` values by a key, but it throws an error if you try to get
  // an key that doesn't exist.
  //
  // The `name` parameter is used in the debugging error message.
  registry: function( name ) {
    var store = {}

    function Registry( name ) {
      this.name = name || "(no name)"
    }

    // Returns the value stored for the given `key`
    Registry.prototype.get = function( key ) {
      if( !( key in store ) ) {
        throw Error("No key `" + key + "` in `" + this.name + "` registry.  Available: `" + Object.keys( store ).join(", ") + "`" )
      }
      return store[ key ]
    }

    // Sets the value(s) in the registry.  Can be called with an object of
    // key/value pairs, or as a single key, value entry.
    //
    // Usage:
    //    r.set({a: 1, b: [1,2,3]})
    //    r.set('a', 1).set('b', [1,2,3])
    Registry.prototype.set = function( keyOrObject, value ) {
      if( typeof keyOrObject === 'object' && !value) {
        _.forEach( keyOrObject, function( value, key ) {
          store[ key ] = value
        } )
      } else {
        store[ keyOrObject ] = value
      }

      return this
    }

    return new Registry( name )
  }

} )


