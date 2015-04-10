angular.module( 'gizmos.filters', [])
angular.module( 'gizmos.services', [])
angular.module( 'gizmos.directives', [])

angular.module( 'gizmos', [
  'gizmos.filters',
  'gizmos.services',
  'gizmos.directives',
])


// Service debounce returns a single debounce function which wraps _.debounce
// and integrates into the digest loop cycle.
angular.module('gizmos.services').service( 'debounce', function ( $rootScope, $window ) {

  if( !$window._ ) {
    throw new Error( "underscore/lodash required to use debounce service" )
  }

  function debounce( callback, delay, options ) {
    return $window._.debounce( function () {
      callback()
      $rootScope.$apply()
    }, delay, options )
  }

  return debounce

} )


// Filter fixedLengthNumber
// Source: http://stackoverflow.com/questions/17648014/how-can-i-use-an-angularjs-filter-to-format-a-number-to-have-leading-zeros
// Usage:
//
//    {{ 9 | fixedLengthNumber:4 }} => "0009"
//
angular.module( 'gizmos.filters' ).filter( 'fixedLengthNumber', function () {
  return function( input, numberLength ) {
    return (1e10 + input + '').slice( -numberLength )
  }
} )


// Usage:
//
//    {{ user.rank | ordinalSuffix }} Place  => "1st Place"
//    $filter( 'ordinalSuffix' )( 99 ) Place  => "99th Place"
//
angular.module( 'gizmos.filters' ).filter( 'ordinalSuffix', function() {

  return function( number ) {
    var teens, remainder, suffixes, suffix

    number = +number || 0

    teens = [ 11, 12, 13, 14, 15, 16, 17, 18, 19 ]
    remainder = number % 10

    suffixes = {
      1: 'st',
      2: 'nd',
      3: 'rd',
      fallback: 'th'
    }

    if ( teens.indexOf( number ) > -1 ) {
      suffix = suffixes.fallback
    } else {
      suffix = ( suffixes[ Math.abs( remainder ) ] || suffixes.fallback )
    }

    return number + suffix

  }

})


// Usage:
//
//    {{ 1 | ordinalWord }} place  => 'first place'
//    $filter( 'ordinalWord' )( 99 ) + ' place' => 'ninety-ninth place'
//
angular.module( 'gizmos.filters' ).filter( 'ordinalWord', [
  function() {
    return function( number ) {
      var baseWords, decaWords
      var decaOrdinalWord, nonDecaOrdinalWord, ordinalWord

      number = Math.abs( +number ) || 0

      baseWords = [ 'zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelvth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth' ]

      decaWords = [ 'twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet' ]

      decaOrdinalWord = function( number ) {
        return decaWords[ Math.floor( number / 10 ) - 2 ] + 'ieth'
      }

      nonDecaOrdinalWord = function( number ) {
        return decaWords[ Math.floor( number / 10 ) - 2 ] + 'y-' + baseWords[ number % 10 ]
      }

      ordinalWord = function( number ) {
        if ( number < 20 ) {
          return baseWords[ number ]
        }

        if ( number % 10 === 0 ) {
          return decaOrdinalWord( number )
        }

        return nonDecaOrdinalWord( number )
      }

      return ordinalWord( number )
    }
  }
]);


// ordinalWordTemplate takes a string and replaces instances of {n} integers with their respective ordinal word.
//
// Dependencies:
//   - angular-grab-bag:filter:ordinalWord
//
// Usage:
//
//  {{ Brad is in {1} place, Andre The Giant is in {99}. | ordinalWordTemplate }}
//    => 'Brad is in first place, Andre The Giant is in ninety-ninth.'
//
//  $filter( 'ordinalWordTemplate' )( 'Lance attended the {10} annual coffee convention.'
//    => 'Lance attended the tenth annual coffee convention.'
//
angular.module( 'gizmos.filters' ).filter( 'ordinalWordTemplate', function( $filter ) {
  return function ( sentence ) {
    return sentence.replace( /\{\d+\}/g, function( token ) {
      return $filter( 'ordinalWord' )( token.match( /\d+/ )[ 0 ] )
    } )
  }
} )

// Filter timesince turns a date object into a textual description of when it
// occured.  Similar to the Rails method `time_ago_in_words`
//
// Adapted From: https://gist.github.com/rodyhaddad/5896883
//
// Usage:
//
//    {{ record.savedAt | timesince }}  // => "19 minutes ago"
//
angular.module( 'gizmos.filters' ).filter( 'timesince', function () {

  return function ( time, local, raw ) {
    var offset, units, template, verbose, ordinal, getRoundedOffsetTime, 
      getEpochKey, filterAndProcessDate, setCurrentTime, setLocalTime, setTimeOffset

    units = {
      minute : 60,
      hour : 3600,
      day : 86400,
      week : 604800,
      month : 2629744,
      year : 31556926,
      decade : 315569260
    }

    getRoundedOffsetTime = function( unit ) {
      return Math.round( Math.abs( offset / unit ) )
    }

    getEpochKey = function() {
      var epoch = ( offset <= units.minute )       ? 'second' :
                  ( offset < units.hour )          ? 'minute' :
                  ( offset < units.day )           ? 'hour'   :
                  ( offset < units.week )          ? 'day'    :
                  ( offset < units.year )          ? 'week'   :
                  ( offset < units.decade )        ? 'year'   :
                  ( offset < units.decade * 100 )  ? 'decade' : 'never'
      return epoch
    }

    filterAndProcessDate = function() {
      var templates = {
          second:  { time: '', desc: ( raw ? 'now' : 'less than a minute' ) },
          minute:  { time: getRoundedOffsetTime( units.minute ), desc: ' min' },
          hour:    { time: getRoundedOffsetTime( units.hour ),   desc: ' hr' },
          day:     { time: getRoundedOffsetTime( units.day ),    desc: ' day' },
          week:    { time: getRoundedOffsetTime( units.week ),   desc: ' week' },
          year:    { time: getRoundedOffsetTime( units.year ),   desc: ' year' },
          decade:  { time: getRoundedOffsetTime( units.decade ), desc: ' decade' },
          never:   { time: '', desc: 'never' }
      }

      return templates[ getEpochKey() ]
    }

    setCurrentTime = function() {
      if ( !time ) { return }

      if ( angular.isString( time ) ) {
        time = new Date(time);
      }

      if ( angular.isDate( time ) ) {
        time = time.getTime()
      }
    }

    setLocalTime = function() {
      if ( !local ) {
        local = Date.now()
      }

      if ( angular.isDate( local ) ) {
        local = local.getTime()
      }
    }

    setTimeOffset = function() {
      setCurrentTime()
      setLocalTime()

      if ( !time ) { return }

      return Math.abs( ( local - time ) / 1000 )
    }

    offset = setTimeOffset()
    template = filterAndProcessDate()

    if ( !template ) { return }

    ordinal = ( template.time > 1 ) ? 's' : ''
    verbose = template.time + template.desc + ordinal

    if ( raw || template.desc == 'never' ) {
      return verbose
    }

    return ( time <= local ) ? verbose + ' ago' : 'in ' + verbose
  }

} );


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



// Directive backgroundImage works like ng-src, except setting the image url as
// a background-image.  This allows using `background-size: contain|cover`,
// which allow flexible sized images that maintain their aspect ratios, but
// unlike using <img> with a set max-width and max-height, both dimensions will
// stop flexing once either max is reached.
//
// Remember to interpolate the url.  Usage:
//
//   <div background-image="{{ user.imageUrl }}"></div>
//
angular.module("gizmos.directives").directive("backgroundImage", function () {

  return {
    restrict: "A",
    link: function link($scope, $element, attributes) {
      attributes.$observe("backgroundImage", function (url) {
        if (!url) {
          return;
        }

        $element.css("background-image", "url(" + url + ")");
      });
    }
  };
});
// Directive imageSrc is a helper that looks up the image's name in the
// `Config.imageUrls` registry, and sets that as the img's src.  The map of
// imageUrls comes from DATA which is assigned in the main application.html
// file.  This way individual slim partials do not need to guard against the
// rails `image_path` method being defined as karma does not have access to
// this method.
//
// Usage:
//
//    // Returns the url defined for `DATA.imageUrls.logo` or throws if undefined
//    <img image-src='logo'>
//
angular.module("gizmos.directives").directive("imageSrc", ["Config", function (Config) {
  return {
    restrict: "A",
    link: function link($scope, element, attributes) {
      attributes.$observe("imageSrc", function (name) {
        attributes.$set("src", Config.imageUrls.get(name));
      });
    }
  };
}]);
// Directive textFit attaches textFit behavior to an element.  Currently, all
// it does is register with an ancester textFitGroup directive which handles
// resizing it.  Behavior for it to resize itself can be added when needed.
angular.module("gizmos.directives").directive("textFit", ["$timeout", "textFit", function ($timeout, textFit) {
  return {
    restrict: "A",
    scope: {
      text: "=textFit",
      textFitOptions: "=textFitOptions"
    },
    require: "^?textFitGroup",

    link: function link($scope, $element, $attributes, textFitGroup) {
      var initialize = function () {
        var deregisterFn;

        if (textFitGroup) {
          // Register with our parent text fit group
          deregisterFn = textFitGroup.add($element);
        }

        $scope.$watch("text", onTextChange);
        $scope.$on("$destroy", deregisterFn || angular.noop);
        $scope.$on("textFit", onTextChange);
      };

      // When the text changes, update the element's text and rerun textFit.
      // If we have a parent text fit group, notify it.
      var onTextChange = function () {
        var text = $scope.text;

        if (!text) {
          return;
        }

        $element.text(text);
        doTextFit();
      };

      // If an element is not visible it will appear to be 0x0 and not re-size
      // properly.  This is common if the element or its ancestor is ng-hidden.
      var retryCount = 0;
      var maxRetryCount = 10;
      var retryInterval = 35;

      var doTextFit = function () {
        var fontSize = undefined;
        var isLastRetry = retryCount >= maxRetryCount;

        // Much faster check then `:visible`, though not as robust.
        var isVisible = !$element.closest(".ng-hide").length;

        if (isVisible) {
          fontSize = textFit($element, $scope.textFitOptions, isLastRetry);
        }

        if (!fontSize) {
          retryCount += 1;
          $timeout(doTextFit, retryInterval, false);
          return;
        }

        if (textFitGroup) {
          textFitGroup.notifyOfRelayout(fontSize);
        }
      };

      initialize();
    } };
}]);
// Directive textFitGroup coordinates between multiple child textFit directive
// elements.  When the UI is ready for them to run the textFit function (e.g.
// after having their text set and `display: none` removed), it resizes them to
// the best fit and then finds the smallest font size and syncs them to all
// have that font size, so things don't look odd.
//
// The directive knows it is time to call textFit when the `isNeeded` property
// on the passed in model is set to true.
angular.module("gizmos.directives").directive("textFitGroup", ["$timeout", "textFit", function ($timeout, textFit) {
  return {
    restrict: "A",

    controller: function controller() {
      var _this = this;

      // The child textFit elements that have registered with us through a
      // textFit directive.
      this.elements = [];

      // List of font sizes for relayouts that have happened in the last digest cycle.
      this.recentRelayoutFontSizes = [];

      // Adds a textFit element to this group.
      // Returns a deregister function the caller should call when destroyed.
      this.add = function (textFitElement) {
        _this.elements.push(textFitElement);
        return _.remove.bind(_, _this.elements, textFitElement);
      };

      // When a child textFit element does a relayout, it notifies us.  We
      // queue a resize and sync to happen, which assumes all children are
      // updating their text in a single digest cycle.
      this.notifyOfRelayout = function (fontSize) {
        _this.recentRelayoutFontSizes.push(fontSize);

        if (_this.recentRelayoutFontSizes.length === 1) {
          $timeout(function () {
            var minFontSize = _.min(_this.recentRelayoutFontSizes);
            console.log("[textFitGroup] notifyOfRelayout()", _this.recentRelayoutFontSizes, minFontSize);
            _this.elements.forEach(function (el) {
              return el.css("font-size", minFontSize);
            });
            _this.recentRelayoutFontSizes = [];
          });
        }
      };

      // Calls textFit on each element, then finds the smallest font size
      // amongst all elements and sizes them all to that size.
      this.resizeElements = function () {
        var fontSizes, smallestFontSize;

        fontSizes = this.elements.map(function (el) {
          return textFit(el);
        });
        smallestFontSize = _.min(fontSizes);
        console.log("[textFitGroup] resizeElement()", fontSizes, smallestFontSize);

        this.elements.forEach(function (el) {
          return el.css("font-size", smallestFontSize);
        });
      };
    } };
}]);
// Value textFit is the core text resizing function to scale up the font-size
// of the given element until it no longer fits inside its container.
//
// Returns the final font size in pixels as a Number.
//
// Based off https://github.com/STRML/textFit but differs:
// - Introduces no wrapper <span>'s, which can interfere with flex centering.
//   Flex styling should be used to vertically center instead.
// - Gets the size from its container, not the element itself's original
//   dimensions.
// - Rounds font sizes by .1px not 1px, which can make a significant difference
//   esp. on small screen.
// - Allows silent returns or warnings if the element has no dimensions, based
//   on the shouldWarn parameter.  This allows the caller to retry again later,
//   perhaps after the element has become visible.
angular.module("gizmos.directives").value("textFit", function textFit(element, options, shouldWarn) {
  var min, max, mid, lastMid, containerWidth, containerHeight;

  element = angular.element(element);
  options = options || {};

  // Min and max font size.
  min = options.min || 6;
  max = options.max || 30;

  containerWidth = element.parent().width();
  containerHeight = element.parent().height();

  // Do a binary search for the best font size
  while (min <= max) {
    lastMid = mid;
    mid = Math.floor((min + max) / 2 * 10) / 10;

    if (mid === lastMid) {
      break;
    }

    element.css("font-size", mid);

    var width = element[0].offsetWidth;
    var height = element[0].offsetHeight;
    var isTooBig = height > containerHeight || width > containerWidth;
    //console.log( '[text-fit] %sx%s in %sx%s. %s < (%s) < %s - %s', width, height, containerWidth, containerHeight, min, mid, max, isTooBig ? 'too big' : 'too small' )

    if (!width || !height) {
      if (shouldWarn) {
        console.warn("[text-fit] Cannot fit elements text because the element is %sx%s.", width, height, element[0]);
      }
      return;
    }

    if (isTooBig) {
      max = mid;
    } else {
      min = mid;
    }
  }

  return mid;
});
// Directive topic ring creates created a simple donut shape using the provided
// `color` and `percent` of topic level completed
angular.module("gizmos.directives").directive("topicRing", ["$injector", function ($injector) {
  return {
    templateUrl: "topic-ring.html",
    scope: {
      topic: "=" },

    link: {
      pre: function pre($scope) {
        $scope.color = null;
        $scope.level = null;
        $scope.percent = null;

        $scope.chartOptions = {
          barColor: "#408bdc",
          trackColor: "#e6e6e6",
          scaleColor: "#dfe0e0",
          scaleLength: 0,
          lineCap: "",
          lineWidth: 3,
          size: 35,
          rotate: 0,
          animate: {
            duration: 1500,
            enabled: true
          }
        };

        $scope.$watch("topic", _.skipNulls(function (topic) {
          $scope.color = topic.color;
          if (topic.quizExperienceForUser) {
            var Experience = $injector.get("Experience");
            $scope.percent = Experience.levelCompletion(topic.quizExperienceForUser) * 100;
            $scope.level = Experience.levelNumber(topic.quizExperienceForUser);
          } else {
            $scope.percent = 100;
            $scope.level = "";
          }
        }));
      }

    }

  };
}]);
angular.module("gizmos.topicRing").run(["$templateCache", function ($templateCache) {
  $templateCache.put("topic-ring.html", "<div ng-class=\"color\" easypiechart=\"\" percent=\"percent\" options=\"chartOptions\" class=\"topic-ring\"><div ng-bind=\"level\" class=\"topic-ring-level\"></div></div>");
}]);