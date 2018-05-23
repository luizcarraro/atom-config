(function() {
  var OutputViewManager, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  module.exports = function(repo, arg) {
    var args, cwd, message;
    message = (arg != null ? arg : {}).message;
    cwd = repo.getWorkingDirectory();
    args = ['stash', 'save'];
    if (message) {
      args.push(message);
    }
    return git.cmd(args, {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LXN0YXNoLXNhdmUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFFcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7SUFEdUIseUJBQUQsTUFBVTtJQUNoQyxHQUFBLEdBQU0sSUFBSSxDQUFDLG1CQUFMLENBQUE7SUFDTixJQUFBLEdBQU8sQ0FBQyxPQUFELEVBQVUsTUFBVjtJQUNQLElBQXNCLE9BQXRCO01BQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQUE7O1dBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7TUFBQyxLQUFBLEdBQUQ7S0FBZCxFQUFxQjtNQUFBLEtBQUEsRUFBTyxJQUFQO0tBQXJCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxHQUFEO01BQ0osSUFBZ0QsR0FBQSxLQUFTLEVBQXpEO2VBQUEsaUJBQWlCLENBQUMsT0FBbEIsQ0FBQSxDQUEyQixDQUFDLFdBQTVCLENBQXdDLEdBQXhDLEVBQUE7O0lBREksQ0FETixDQUdBLEVBQUMsS0FBRCxFQUhBLENBR08sU0FBQyxHQUFEO2FBQ0wsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBakI7SUFESyxDQUhQO0VBSmU7QUFKakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7bWVzc2FnZX09e30pIC0+XG4gIGN3ZCA9IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG4gIGFyZ3MgPSBbJ3N0YXNoJywgJ3NhdmUnXVxuICBhcmdzLnB1c2gobWVzc2FnZSkgaWYgbWVzc2FnZVxuICBnaXQuY21kKGFyZ3MsIHtjd2R9LCBjb2xvcjogdHJ1ZSlcbiAgLnRoZW4gKG1zZykgLT5cbiAgICBPdXRwdXRWaWV3TWFuYWdlci5nZXRWaWV3KCkuc2hvd0NvbnRlbnQobXNnKSBpZiBtc2cgaXNudCAnJ1xuICAuY2F0Y2ggKG1zZykgLT5cbiAgICBub3RpZmllci5hZGRJbmZvIG1zZ1xuIl19
