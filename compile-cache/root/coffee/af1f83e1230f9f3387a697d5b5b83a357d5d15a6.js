(function() {
  var OutputViewManager, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  module.exports = function(repo) {
    var cwd;
    cwd = repo.getWorkingDirectory();
    return git.cmd(['stash', 'apply'], {
      cwd: cwd
    }, {
      color: true
    }).then(function(msg) {
      if (msg !== '') {
        return OutputViewManager.getView().showContent(msg);
      }
    })["catch"](function(msg) {
      return notifier.addInfo(msg);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LXN0YXNoLWFwcGx5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRDtBQUNmLFFBQUE7SUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLG1CQUFMLENBQUE7V0FDTixHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsT0FBRCxFQUFVLE9BQVYsQ0FBUixFQUE0QjtNQUFDLEtBQUEsR0FBRDtLQUE1QixFQUFtQztNQUFBLEtBQUEsRUFBTyxJQUFQO0tBQW5DLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxHQUFEO01BQ0osSUFBZ0QsR0FBQSxLQUFTLEVBQXpEO2VBQUEsaUJBQWlCLENBQUMsT0FBbEIsQ0FBQSxDQUEyQixDQUFDLFdBQTVCLENBQXdDLEdBQXhDLEVBQUE7O0lBREksQ0FETixDQUdBLEVBQUMsS0FBRCxFQUhBLENBR08sU0FBQyxHQUFEO2FBQ0wsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBakI7SUFESyxDQUhQO0VBRmU7QUFKakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvKSAtPlxuICBjd2QgPSByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuICBnaXQuY21kKFsnc3Rhc2gnLCAnYXBwbHknXSwge2N3ZH0sIGNvbG9yOiB0cnVlKVxuICAudGhlbiAobXNnKSAtPlxuICAgIE91dHB1dFZpZXdNYW5hZ2VyLmdldFZpZXcoKS5zaG93Q29udGVudChtc2cpIGlmIG1zZyBpc250ICcnXG4gIC5jYXRjaCAobXNnKSAtPlxuICAgIG5vdGlmaWVyLmFkZEluZm8gbXNnXG4iXX0=
