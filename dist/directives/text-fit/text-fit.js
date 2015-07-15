// Directive textFit attaches textFit behavior to an element. 
angular.module("gizmos.directives").directive("textFit", ["$timeout", "textFit", "$parse", function ($timeout, textFit, $parse) {
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

      var doTextFit = function () {

        var fontSize = undefined;

        if (textFitGroup) {

          // If part of a group then run resize through parent         

          fontSize = textFitGroup.doGroupTextFit($element, $scope.textFitOptions);
          textFitGroup.notifyOfRelayout(fontSize);
        } else {

          fontSize = textFit($element, $scope.textFitOptions);
        }
      };

      // Timeout so that view initially renders mostly so we know if it is hidden.
      $timeout(initialize);
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
angular.module("gizmos.directives").directive("textFitGroup", ["$timeout", "$parse", "textFit", function ($timeout, $parse, textFit) {
  return {
    restrict: "A",
    scope: { textFitOptions: "=textFitGroup" },
    controller: ["$scope", function controller($scope) {
      var _this = this;

      // The child textFit elements that have registered with us through a
      // textFit directive.
      this.elements = [];

      // List of font sizes for relayouts that have happened in the last digest cycle.
      this.relayoutNotified = false;

      // Adds a textFit element to this group.
      // Returns a deregister function the caller should call when destroyed.
      this.add = function (textFitElement) {
        _this.elements.push(textFitElement);
        return _.remove.bind(_, _this.elements, textFitElement);
      };

      // When a child textFit element does a relayout, it notifies us.  We
      // queue a resize and sync to happen, which assumes all children are
      // updating their text in a single digest cycle.
      this.notifyOfRelayout = function () {

        if (!_this.relayoutNotified) {
          _this.relayoutNotified = true;
          $timeout(function () {
            _this.setToMin();
            _this.relayoutNotified = false;
          });
        }
      };

      // Finds the smallest font size amongst all elements
      // and sizes them all to that size.
      this.setToMin = function () {
        var fontSizes, smallestFontSize;

        fontSizes = this.elements.map(function (el) {
          return parseInt(el.css("font-size"), 10);
        });
        smallestFontSize = _.min(fontSizes);
        if ($scope.textFitOptions && $scope.textFitOptions.debug) {
          console[$scope.textFitOptions.debug === true ? "log" : $scope.textFitOptions.debug]("[textFitGroup] resizeElement()", fontSizes, smallestFontSize);
        }

        this.elements.forEach(function (el) {
          return el.css("font-size", smallestFontSize);
        });
      };

      this.doGroupTextFit = function (el, childOptions) {

        var opts = angular.extend({}, $scope.textFitOptions, childOptions);

        return textFit(el, opts);
      };
    }] };
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
  var min, max, mid, lastMid, containerStyle, containerWidth, containerHeight, projectedPercentageOfBox, accuracy, allowWordWrap, debug;

  debug = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (options.debug) {

      console[options.debug === true ? "log" : options.debug].apply(console, args);
    }
  };

  // ToDo: get options from text-fit-group
  options = options || {};

  debug("[textFit] Running on: ", element.text());

  // Check if element is hidden
  if (element[0].offsetHeight === 0) {
    debug("[textFit] hidden element: ", element.text());
    return null;
  }

  // Set accuracy for faster guessing
  accuracy = options.accuracy || 0;

  // dis-allow word wrap
  allowWordWrap = !(options.wordWrap === false);
  if (!allowWordWrap) {
    element.css("white-space", "nowrap");
  }

  // This is slow but WAY more reliable than el.scrollWidth. This method factors
  // in padding and such. Slower probably not an issue since the container is
  // only computed once per font resize.
  containerStyle = window.getComputedStyle(element.parent()[0]);
  if (containerStyle["box-sizing"] === "border-box") {
    containerWidth = Math.round(parseFloat(containerStyle.width) - parseFloat(containerStyle.paddingLeft) - parseFloat(containerStyle.paddingRight));
    containerHeight = Math.round(parseFloat(containerStyle.height) - parseFloat(containerStyle.paddingTop) - parseFloat(containerStyle.paddingBottom));
  } else {
    containerWidth = Math.round(parseFloat(containerStyle.width));
    containerHeight = Math.round(parseFloat(containerStyle.height));
  }

  // Min and max font size.
  min = options.min || 6;
  max = Math.min(containerHeight, options.max || 120);
  mid = Math.floor((min + max) / 2 * 10) / 10;

  // Do a binary search for the best font size
  while (min + accuracy <= max) {

    element.css("font-size", mid + "px");

    // Use scrollWidth because it checks for overflow text
    var width = element[0].scrollWidth;
    var height = element[0].offsetHeight;
    var isTooBig = height > containerHeight || width > containerWidth;

    debug("[textFit] %sx%s in %sx%s. %s < (%s) < %s - %s", width, height, containerWidth, containerHeight, min, mid, max, isTooBig ? "too big" : "too small");

    if (isTooBig) {
      max = mid;
    } else {
      min = mid;
    }

    lastMid = mid;
    mid = Math.floor((min + max) / 2 * 10) / 10;

    if (mid === lastMid) {
      break;
    }
  }

  return mid;
});