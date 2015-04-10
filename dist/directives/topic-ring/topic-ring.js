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