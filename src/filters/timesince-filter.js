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

