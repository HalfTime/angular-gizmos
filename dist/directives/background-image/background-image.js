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
angular.module("gizmos.backgroundImage", []).directive("backgroundImage", function () {

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