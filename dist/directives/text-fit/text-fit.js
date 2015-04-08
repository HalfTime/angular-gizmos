angular.module("gizmos.textFit", []);
describe("textFit directive", function () {

  beforeEach(module("gizmos.textFit"));

  var render = function (text) {
    var template = "\n      <div style=\"width: 80px; height: 80px\">\n        <div text-fit=\"text\"></div>\n      </div>\n    ";
    var el = helpers.compile(template, { text: text }).appendTo("body");
    helpers.flush();
    return el;
  };

  it("sets an inline font-size style", function () {
    var html = render("hi there").html();
    expect(html).toMatch("font-size:");
  });
});
// Directive textFit attaches textFit behavior to an element.  Currently, all
// it does is register with an ancester textFitGroup directive which handles
// resizing it.  Behavior for it to resize itself can be added when needed.
angular.module("gizmos.textFit").directive("textFit", ["$timeout", "textFit", function ($timeout, textFit) {
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
angular.module("gizmos.textFit").directive("textFitGroup", ["$timeout", "textFit", function ($timeout, textFit) {
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
describe("textFit()", function () {

  beforeEach(module("gizmos.textFit"));

  // Builds an element with a sized container and the given text
  var buildElement = function (_ref) {
    var text = _ref.text;

    var container = $("<div style=\"width: 50px; height: 50px\"></div>").appendTo("body");
    return $("<div>" + text + "</div>").appendTo(container);
  };

  it("shrinks the font size as the text gets longer", inject(function (textFit) {
    var shortTextFontSize = textFit(buildElement({ text: "rat" }));
    var mediumTextFontSize = textFit(buildElement({ text: "dece rat" }));
    var longTextFontSize = textFit(buildElement({ text: "a totally DECENT rat!" }));

    expect(longTextFontSize).toBeLessThan(mediumTextFontSize);
    expect(mediumTextFontSize).toBeLessThan(shortTextFontSize);
  }));
});
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
angular.module("gizmos.textFit").value("textFit", function textFit(element, options, shouldWarn) {
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