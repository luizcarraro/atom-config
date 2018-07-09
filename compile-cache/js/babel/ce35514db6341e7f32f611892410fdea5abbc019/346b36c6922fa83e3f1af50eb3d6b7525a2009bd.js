Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

'use babel';

var dashBoardUri = 'atom://serverless-dashboard';

exports['default'] = {

  serverlessDashboardView: null,
  modalPanel: null,
  subscriptions: null,

  activate: function activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.workspace.addOpener((function (_this) {
      return function (filePath) {
        if (filePath === dashBoardUri) {
          return _this.openManagemantPanel();
        }
      };
    })(this)));
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'serverless-dashboard:open-management-panel': function serverlessDashboardOpenManagementPanel() {
        return atom.workspace.open(dashBoardUri);
      }
    }));
  },

  deactivate: function deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
  },

  openManagemantPanel: function openManagemantPanel() {
    var remote = require('electron').remote;
    var files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), { properties: ['openFile'] });
    if (files && files.length) {
      var data = _jsYaml2['default'].safeLoad(_fs2['default'].readFileSync(files[0], 'utf8'));
      var DashbordView = require('./serverless-dashboard-view');
      return new DashbordView(data, files[0]);
    }
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9zZXJ2ZXJsZXNzLWRhc2hib2FyZC9saWIvc2VydmVybGVzcy1kYXNoYm9hcmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUVvQyxNQUFNOztzQkFDekIsU0FBUzs7OztrQkFDWCxJQUFJOzs7O0FBSm5CLFdBQVcsQ0FBQTs7QUFLWCxJQUFNLFlBQVksR0FBRyw2QkFBNkIsQ0FBQTs7cUJBRW5DOztBQUViLHlCQUF1QixFQUFFLElBQUk7QUFDN0IsWUFBVSxFQUFFLElBQUk7QUFDaEIsZUFBYSxFQUFFLElBQUk7O0FBRW5CLFVBQVEsRUFBQyxrQkFBQyxLQUFLLEVBQUU7O0FBRWYsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQzFELGFBQU8sVUFBQyxRQUFRLEVBQUs7QUFDbkIsWUFBSSxRQUFRLEtBQUssWUFBWSxFQUFFO0FBQzdCLGlCQUFPLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO1NBQ25DO09BQ0YsQ0FBQTtLQUNGLENBQUEsQ0FBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRVYsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDekQsa0RBQTRDLEVBQUUsa0RBQU07QUFDbEQsZUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtPQUN6QztLQUNGLENBQUMsQ0FBQyxDQUFBO0dBQ0o7O0FBRUQsWUFBVSxFQUFDLHNCQUFHO0FBQ1osUUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUN6QixRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0dBQzdCOztBQUVELHFCQUFtQixFQUFDLCtCQUFHO0FBQ3JCLFFBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUE7QUFDekMsUUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsRUFBQyxVQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBQyxDQUFDLENBQUE7QUFDakcsUUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUN6QixVQUFNLElBQUksR0FBRyxvQkFBSyxRQUFRLENBQUMsZ0JBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQzdELFVBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFBO0FBQzNELGFBQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3hDO0dBQ0Y7Q0FDRiIsImZpbGUiOiIvaG9tZS9sdWl6LmNhcnJhcm8vLmF0b20vcGFja2FnZXMvc2VydmVybGVzcy1kYXNoYm9hcmQvbGliL3NlcnZlcmxlc3MtZGFzaGJvYXJkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeWFtbCBmcm9tICdqcy15YW1sJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuY29uc3QgZGFzaEJvYXJkVXJpID0gJ2F0b206Ly9zZXJ2ZXJsZXNzLWRhc2hib2FyZCdcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIHNlcnZlcmxlc3NEYXNoYm9hcmRWaWV3OiBudWxsLFxuICBtb2RhbFBhbmVsOiBudWxsLFxuICBzdWJzY3JpcHRpb25zOiBudWxsLFxuXG4gIGFjdGl2YXRlIChzdGF0ZSkge1xuICAgIC8vIEV2ZW50cyBzdWJzY3JpYmVkIHRvIGluIGF0b20ncyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKCgoX3RoaXMpID0+IHtcbiAgICAgIHJldHVybiAoZmlsZVBhdGgpID0+IHtcbiAgICAgICAgaWYgKGZpbGVQYXRoID09PSBkYXNoQm9hcmRVcmkpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMub3Blbk1hbmFnZW1hbnRQYW5lbCgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSh0aGlzKSkpXG4gICAgLy8gUmVnaXN0ZXIgY29tbWFuZCB0aGF0IHRvZ2dsZXMgdGhpcyB2aWV3XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnc2VydmVybGVzcy1kYXNoYm9hcmQ6b3Blbi1tYW5hZ2VtZW50LXBhbmVsJzogKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2Uub3BlbihkYXNoQm9hcmRVcmkpXG4gICAgICB9XG4gICAgfSkpXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSAoKSB7XG4gICAgdGhpcy5tb2RhbFBhbmVsLmRlc3Ryb3koKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfSxcblxuICBvcGVuTWFuYWdlbWFudFBhbmVsICgpIHtcbiAgICBjb25zdCByZW1vdGUgPSByZXF1aXJlKCdlbGVjdHJvbicpLnJlbW90ZVxuICAgIGNvbnN0IGZpbGVzID0gcmVtb3RlLmRpYWxvZy5zaG93T3BlbkRpYWxvZyhyZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLCB7cHJvcGVydGllczogWydvcGVuRmlsZSddfSlcbiAgICBpZiAoZmlsZXMgJiYgZmlsZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBkYXRhID0geWFtbC5zYWZlTG9hZChmcy5yZWFkRmlsZVN5bmMoZmlsZXNbMF0sICd1dGY4JykpXG4gICAgICBjb25zdCBEYXNoYm9yZFZpZXcgPSByZXF1aXJlKCcuL3NlcnZlcmxlc3MtZGFzaGJvYXJkLXZpZXcnKVxuICAgICAgcmV0dXJuIG5ldyBEYXNoYm9yZFZpZXcoZGF0YSwgZmlsZXNbMF0pXG4gICAgfVxuICB9XG59XG4iXX0=