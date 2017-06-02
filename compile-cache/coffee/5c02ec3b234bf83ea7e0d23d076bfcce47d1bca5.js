(function() {
  var Dialog, ProjectDialog, git, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  path = require('path');

  module.exports = ProjectDialog = (function(superClass) {
    extend(ProjectDialog, superClass);

    function ProjectDialog() {
      return ProjectDialog.__super__.constructor.apply(this, arguments);
    }

    ProjectDialog.content = function() {
      return this.div({
        "class": 'dialog'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading'
          }, function() {
            _this.i({
              "class": 'icon x clickable',
              click: 'cancel'
            });
            return _this.strong('Project');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Current Project');
            return _this.select({
              outlet: 'projectList'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'changeProject'
            }, function() {
              _this.i({
                "class": 'icon icon-repo-pull'
              });
              return _this.span('Change');
            });
            return _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('Cancel');
            });
          });
        };
      })(this));
    };

    ProjectDialog.prototype.activate = function() {
      var fn, i, len, projectIndex, projectList, ref, repo;
      projectIndex = 0;
      projectList = this.projectList;
      projectList.html('');
      ref = atom.project.getRepositories();
      fn = function(repo) {
        var option;
        if (repo) {
          option = document.createElement("option");
          option.value = projectIndex;
          option.text = path.basename(path.resolve(repo.path, '..'));
          projectList.append(option);
        }
        return projectIndex = projectIndex + 1;
      };
      for (i = 0, len = ref.length; i < len; i++) {
        repo = ref[i];
        fn(repo);
      }
      projectList.val(git.getProjectIndex);
      return ProjectDialog.__super__.activate.call(this);
    };

    ProjectDialog.prototype.changeProject = function() {
      var repo;
      this.deactivate();
      git.setProjectIndex(this.projectList.val());
      repo = git.getRepository();
      this.parentView.setWorkspaceTitle(repo.path.split('/').reverse()[1]);
      this.parentView.update();
    };

    return ProjectDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL3Byb2plY3QtZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0NBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUVULEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLGFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7T0FBTCxFQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDcEIsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLENBQUQsQ0FBRztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sa0JBQVA7Y0FBMkIsS0FBQSxFQUFPLFFBQWxDO2FBQUg7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxTQUFSO1VBRnFCLENBQXZCO1VBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUE7WUFDbEIsS0FBQyxDQUFBLEtBQUQsQ0FBTyxpQkFBUDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsTUFBQSxFQUFRLGFBQVI7YUFBUjtVQUZrQixDQUFwQjtpQkFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2NBQWlCLEtBQUEsRUFBTyxlQUF4QjthQUFSLEVBQWlELFNBQUE7Y0FDL0MsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHFCQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOO1lBRitDLENBQWpEO21CQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxLQUFBLEVBQU8sUUFBUDthQUFSLEVBQXlCLFNBQUE7Y0FDdkIsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLFFBQU47WUFGdUIsQ0FBekI7VUFKcUIsQ0FBdkI7UUFQb0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRFE7OzRCQWdCVixRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxZQUFBLEdBQWU7TUFDZixXQUFBLEdBQWMsSUFBQyxDQUFBO01BQ2YsV0FBVyxDQUFDLElBQVosQ0FBaUIsRUFBakI7QUFDQTtXQUNJLFNBQUMsSUFBRDtBQUNBLFlBQUE7UUFBQSxJQUFHLElBQUg7VUFDRSxNQUFBLEdBQVMsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkI7VUFDVCxNQUFNLENBQUMsS0FBUCxHQUFlO1VBQ2YsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFJLENBQUMsUUFBTCxDQUFjLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBSSxDQUFDLElBQWxCLEVBQXdCLElBQXhCLENBQWQ7VUFDZCxXQUFXLENBQUMsTUFBWixDQUFtQixNQUFuQixFQUpGOztlQUtBLFlBQUEsR0FBZSxZQUFBLEdBQWU7TUFOOUI7QUFESixXQUFBLHFDQUFBOztXQUNLO0FBREw7TUFTQSxXQUFXLENBQUMsR0FBWixDQUFnQixHQUFHLENBQUMsZUFBcEI7QUFFQSxhQUFPLDBDQUFBO0lBZkM7OzRCQWlCVixhQUFBLEdBQWUsU0FBQTtBQUNiLFVBQUE7TUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsR0FBRyxDQUFDLGVBQUosQ0FBb0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQUEsQ0FBcEI7TUFDQSxJQUFBLEdBQU8sR0FBRyxDQUFDLGFBQUosQ0FBQTtNQUVQLElBQUMsQ0FBQSxVQUFVLENBQUMsaUJBQVosQ0FBOEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFWLENBQWdCLEdBQWhCLENBQW9CLENBQUMsT0FBckIsQ0FBQSxDQUErQixDQUFBLENBQUEsQ0FBN0Q7TUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBQTtJQU5hOzs7O0tBbENXO0FBTjVCIiwic291cmNlc0NvbnRlbnQiOlsiRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2cnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQcm9qZWN0RGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdkaWFsb2cnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcnLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24geCBjbGlja2FibGUnLCBjbGljazogJ2NhbmNlbCdcbiAgICAgICAgQHN0cm9uZyAnUHJvamVjdCdcbiAgICAgIEBkaXYgY2xhc3M6ICdib2R5JywgPT5cbiAgICAgICAgQGxhYmVsICdDdXJyZW50IFByb2plY3QnXG4gICAgICAgIEBzZWxlY3Qgb3V0bGV0OiAncHJvamVjdExpc3QnXG4gICAgICBAZGl2IGNsYXNzOiAnYnV0dG9ucycsID0+XG4gICAgICAgIEBidXR0b24gY2xhc3M6ICdhY3RpdmUnLCBjbGljazogJ2NoYW5nZVByb2plY3QnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiBpY29uLXJlcG8tcHVsbCdcbiAgICAgICAgICBAc3BhbiAnQ2hhbmdlJ1xuICAgICAgICBAYnV0dG9uIGNsaWNrOiAnY2FuY2VsJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24geCdcbiAgICAgICAgICBAc3BhbiAnQ2FuY2VsJ1xuXG4gIGFjdGl2YXRlOiAtPlxuICAgIHByb2plY3RJbmRleCA9IDBcbiAgICBwcm9qZWN0TGlzdCA9IEBwcm9qZWN0TGlzdFxuICAgIHByb2plY3RMaXN0Lmh0bWwgJydcbiAgICBmb3IgcmVwbyBpbiBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKClcbiAgICAgIGRvKHJlcG8pIC0+XG4gICAgICAgIGlmIHJlcG9cbiAgICAgICAgICBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpXG4gICAgICAgICAgb3B0aW9uLnZhbHVlID0gcHJvamVjdEluZGV4XG4gICAgICAgICAgb3B0aW9uLnRleHQgPSBwYXRoLmJhc2VuYW1lKHBhdGgucmVzb2x2ZShyZXBvLnBhdGgsICcuLicpKVxuICAgICAgICAgIHByb2plY3RMaXN0LmFwcGVuZChvcHRpb24pXG4gICAgICAgIHByb2plY3RJbmRleCA9IHByb2plY3RJbmRleCArIDFcblxuICAgIHByb2plY3RMaXN0LnZhbChnaXQuZ2V0UHJvamVjdEluZGV4KVxuXG4gICAgcmV0dXJuIHN1cGVyKClcblxuICBjaGFuZ2VQcm9qZWN0OiAtPlxuICAgIEBkZWFjdGl2YXRlKClcbiAgICBnaXQuc2V0UHJvamVjdEluZGV4KEBwcm9qZWN0TGlzdC52YWwoKSlcbiAgICByZXBvID0gZ2l0LmdldFJlcG9zaXRvcnkoKVxuXG4gICAgQHBhcmVudFZpZXcuc2V0V29ya3NwYWNlVGl0bGUocmVwby5wYXRoLnNwbGl0KCcvJykucmV2ZXJzZSgpWzFdKVxuICAgIEBwYXJlbnRWaWV3LnVwZGF0ZSgpXG4gICAgcmV0dXJuXG4iXX0=
