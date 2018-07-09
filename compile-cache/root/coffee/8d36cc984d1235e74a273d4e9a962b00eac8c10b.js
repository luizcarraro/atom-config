(function() {
  var RemoteListView, git;

  git = require('../git');

  RemoteListView = require('../views/remote-list-view');

  module.exports = function(repo) {
    return git.cmd(['remote'], {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return new RemoteListView(repo, data, {
        mode: 'fetch-prune'
      });
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LWZldGNoLXBydW5lLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLGNBQUEsR0FBaUIsT0FBQSxDQUFRLDJCQUFSOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7V0FDZixHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxDQUFSLEVBQW9CO01BQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7S0FBcEIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7YUFBVSxJQUFJLGNBQUosQ0FBbUIsSUFBbkIsRUFBeUIsSUFBekIsRUFBK0I7UUFBQSxJQUFBLEVBQU0sYUFBTjtPQUEvQjtJQUFWLENBRE47RUFEZTtBQUhqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblJlbW90ZUxpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvcmVtb3RlLWxpc3QtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgZ2l0LmNtZChbJ3JlbW90ZSddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAudGhlbiAoZGF0YSkgLT4gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIGRhdGEsIG1vZGU6ICdmZXRjaC1wcnVuZScpXG4iXX0=
