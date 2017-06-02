(function() {
  var Dialog, FlowDialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = FlowDialog = (function(superClass) {
    extend(FlowDialog, superClass);

    function FlowDialog() {
      return FlowDialog.__super__.constructor.apply(this, arguments);
    }

    FlowDialog.content = function() {
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
            return _this.strong('Workflow - GitFlow');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Git Flow ');
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'flowType',
              change: 'flowTypeChange'
            });
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'flowAction',
              change: 'flowActionChange'
            });
            _this.label('Branch Name:', {
              outlet: 'labelBranchName'
            });
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'branchName'
            });
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'branchChoose'
            });
            _this.label('Message:', {
              outlet: 'labelMessage'
            });
            _this.textarea({
              "class": 'native-key-bindings',
              outlet: 'message'
            });
            _this.input({
              "class": 'native-key-bindings',
              type: 'checkbox',
              outlet: 'noTag',
              id: 'noTag'
            });
            return _this.label('No Tag', {
              outlet: 'labelNoTag',
              "for": 'noTag'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'flow'
            }, function() {
              _this.i({
                "class": 'icon flow'
              });
              return _this.span('Ok');
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

    FlowDialog.prototype.activate = function(branches) {
      var current;
      current = git.getLocalBranch();
      this.branches = branches;
      this.flowType.find('option').remove();
      this.flowType.append("<option value='feature'>feature</option>");
      this.flowType.append("<option value='release'>release</option>");
      this.flowType.append("<option value='hotfix'>hotfix</option>");
      this.flowType.append("<option value='init'>init</option>");
      this.flowAction.find('option').remove();
      this.flowAction.append("<option value='start'>start</option>");
      this.flowAction.append("<option value='finish'>finish</option>");
      this.flowAction.append("<option value='publish'>publish</option>");
      this.flowAction.append("<option value='pull'>pull</option>");
      this.flowTypeChange();
      this.flowActionChange();
      return FlowDialog.__super__.activate.call(this);
    };

    FlowDialog.prototype.flow = function() {
      var actionSelected, branchSelected;
      this.deactivate();
      if (this.flowType.val() === "init") {
        this.parentView.flow(this.flowType.val(), '-d', '');
      } else {
        branchSelected = this.branchName.val() !== '' ? this.branchName.val() : this.branchChoose.val();
        actionSelected = this.flowAction.val();
        if ((branchSelected != null) && branchSelected !== '') {
          if (actionSelected === "finish") {
            if (this.message.val() !== '') {
              actionSelected += ' -m "' + this.message.val() + '"';
            }
            if (this.noTag.prop('checked')) {
              actionSelected += ' -n';
            }
          }
          this.parentView.flow(this.flowType.val(), actionSelected, branchSelected);
        } else {
          git.alert("> No branches selected... Git flow action not valid.");
        }
      }
    };

    FlowDialog.prototype.checkMessageNeeded = function() {
      this.message.val("");
      if (this.flowAction.val() === "finish" && (this.flowType.val() === "release" || this.flowType.val() === "hotfix")) {
        this.message.show();
        this.labelMessage.show();
      } else {
        this.message.hide();
        this.labelMessage.hide();
      }
    };

    FlowDialog.prototype.checkNoTagNeeded = function() {
      if (this.flowAction.val() === "finish" && (this.flowType.val() === "release" || this.flowType.val() === "hotfix")) {
        this.noTag.show();
        this.labelNoTag.show();
      } else {
        this.noTag.hide();
        this.labelNoTag.hide();
      }
    };

    FlowDialog.prototype.flowTypeChange = function() {
      if (this.flowType.val() === "init") {
        this.flowAction.hide();
        this.branchName.hide();
        this.branchChoose.hide();
        this.labelBranchName.hide();
      } else {
        this.flowAction.show();
        this.flowActionChange();
        this.labelBranchName.show();
      }
      this.checkMessageNeeded();
      this.checkNoTagNeeded();
    };

    FlowDialog.prototype.flowActionChange = function() {
      var branch, i, len, ref, value;
      this.checkMessageNeeded();
      this.checkNoTagNeeded();
      if (this.flowAction.val() !== "start") {
        this.branchName.hide();
        this.branchName.val('');
        this.branchChoose.find('option').remove();
        ref = this.branches;
        for (i = 0, len = ref.length; i < len; i++) {
          branch = ref[i];
          if (branch.indexOf(this.flowType.val()) !== -1) {
            value = branch.replace(this.flowType.val() + '/', '');
            this.branchChoose.append("<option value='" + value + "'>" + value + "</option>");
          }
        }
        if (this.branchChoose.find('option').length <= 0) {
          this.branchChoose.append("<option value=''> --no " + this.flowType.val() + " branches--</option>");
        }
        return this.branchChoose.show();
      } else {
        this.branchName.show();
        this.branchChoose.val('');
        return this.branchChoose.hide();
      }
    };

    return FlowDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL2Zsb3ctZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUVULEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNwQixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxrQkFBUDtjQUEyQixLQUFBLEVBQU8sUUFBbEM7YUFBSDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLG9CQUFSO1VBRnFCLENBQXZCO1VBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUE7WUFDbEIsS0FBQyxDQUFBLEtBQUQsQ0FBTyxXQUFQO1lBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scUJBQVA7Y0FBOEIsTUFBQSxFQUFRLFVBQXRDO2NBQWtELE1BQUEsRUFBUSxnQkFBMUQ7YUFBUjtZQUNBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHFCQUFQO2NBQThCLE1BQUEsRUFBUSxZQUF0QztjQUFvRCxNQUFBLEVBQVEsa0JB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QUEwQixJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBQSxDQUExQixHQUEwQyxzQkFBL0QsRUFERjs7ZUFFQSxJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBQSxFQVZGO09BQUEsTUFBQTtRQVlFLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFBO1FBQ0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLEVBQWxCO2VBQ0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQUEsRUFkRjs7SUFIZ0I7Ozs7S0FsR0s7QUFMekIiLCJzb3VyY2VzQ29udGVudCI6WyJEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZydcblxuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBGbG93RGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdkaWFsb2cnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcnLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24geCBjbGlja2FibGUnLCBjbGljazogJ2NhbmNlbCdcbiAgICAgICAgQHN0cm9uZyAnV29ya2Zsb3cgLSBHaXRGbG93J1xuICAgICAgQGRpdiBjbGFzczogJ2JvZHknLCA9PlxuICAgICAgICBAbGFiZWwgJ0dpdCBGbG93ICdcbiAgICAgICAgQHNlbGVjdCBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCBvdXRsZXQ6ICdmbG93VHlwZScsIGNoYW5nZTogJ2Zsb3dUeXBlQ2hhbmdlJ1xuICAgICAgICBAc2VsZWN0IGNsYXNzOiAnbmF0aXZlLWtleS1iaW5kaW5ncycsIG91dGxldDogJ2Zsb3dBY3Rpb24nLCBjaGFuZ2U6ICdmbG93QWN0aW9uQ2hhbmdlJ1xuICAgICAgICBAbGFiZWwgJ0JyYW5jaCBOYW1lOicsIG91dGxldDogJ2xhYmVsQnJhbmNoTmFtZSdcbiAgICAgICAgQGlucHV0IGNsYXNzOiAnbmF0aXZlLWtleS1iaW5kaW5ncycsIHR5cGU6ICd0ZXh0Jywgb3V0bGV0OiAnYnJhbmNoTmFtZSdcbiAgICAgICAgQHNlbGVjdCBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCBvdXRsZXQ6ICdicmFuY2hDaG9vc2UnXG4gICAgICAgIEBsYWJlbCAnTWVzc2FnZTonLCBvdXRsZXQ6ICdsYWJlbE1lc3NhZ2UnXG4gICAgICAgIEB0ZXh0YXJlYSBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCBvdXRsZXQ6ICdtZXNzYWdlJ1xuICAgICAgICBAaW5wdXQgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJywgdHlwZTogJ2NoZWNrYm94Jywgb3V0bGV0OiAnbm9UYWcnLCBpZDogJ25vVGFnJ1xuICAgICAgICBAbGFiZWwgJ05vIFRhZycsIG91dGxldDogJ2xhYmVsTm9UYWcnLCBmb3I6ICdub1RhZydcbiAgICAgIEBkaXYgY2xhc3M6ICdidXR0b25zJywgPT5cbiAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2FjdGl2ZScsIGNsaWNrOiAnZmxvdycsID0+XG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIGZsb3cnXG4gICAgICAgICAgQHNwYW4gJ09rJ1xuICAgICAgICBAYnV0dG9uIGNsaWNrOiAnY2FuY2VsJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24geCdcbiAgICAgICAgICBAc3BhbiAnQ2FuY2VsJ1xuXG4gIGFjdGl2YXRlOiAoYnJhbmNoZXMpIC0+XG4gICAgY3VycmVudCA9IGdpdC5nZXRMb2NhbEJyYW5jaCgpXG4gICAgQGJyYW5jaGVzID0gYnJhbmNoZXM7XG5cbiAgICBAZmxvd1R5cGUuZmluZCgnb3B0aW9uJykucmVtb3ZlKClcbiAgICBAZmxvd1R5cGUuYXBwZW5kIFwiPG9wdGlvbiB2YWx1ZT0nZmVhdHVyZSc+ZmVhdHVyZTwvb3B0aW9uPlwiXG4gICAgQGZsb3dUeXBlLmFwcGVuZCBcIjxvcHRpb24gdmFsdWU9J3JlbGVhc2UnPnJlbGVhc2U8L29wdGlvbj5cIlxuICAgIEBmbG93VHlwZS5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPSdob3RmaXgnPmhvdGZpeDwvb3B0aW9uPlwiXG4gICAgQGZsb3dUeXBlLmFwcGVuZCBcIjxvcHRpb24gdmFsdWU9J2luaXQnPmluaXQ8L29wdGlvbj5cIlxuXG4gICAgQGZsb3dBY3Rpb24uZmluZCgnb3B0aW9uJykucmVtb3ZlKClcbiAgICBAZmxvd0FjdGlvbi5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPSdzdGFydCc+c3RhcnQ8L29wdGlvbj5cIlxuICAgIEBmbG93QWN0aW9uLmFwcGVuZCBcIjxvcHRpb24gdmFsdWU9J2ZpbmlzaCc+ZmluaXNoPC9vcHRpb24+XCJcbiAgICBAZmxvd0FjdGlvbi5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPSdwdWJsaXNoJz5wdWJsaXNoPC9vcHRpb24+XCJcbiAgICBAZmxvd0FjdGlvbi5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPSdwdWxsJz5wdWxsPC9vcHRpb24+XCJcblxuICAgIEBmbG93VHlwZUNoYW5nZSgpXG4gICAgQGZsb3dBY3Rpb25DaGFuZ2UoKVxuXG4gICAgcmV0dXJuIHN1cGVyKClcblxuICBmbG93OiAtPlxuICAgIEBkZWFjdGl2YXRlKClcbiAgICAjaW5pdCB3aXRoIGRlZmF1bHQgYnJhbmNoIG5hbWVcbiAgICBpZiAoQGZsb3dUeXBlLnZhbCgpID09IFwiaW5pdFwiKVxuICAgICAgQHBhcmVudFZpZXcuZmxvdyhAZmxvd1R5cGUudmFsKCksJy1kJywnJylcbiAgICBlbHNlXG4gICAgICBicmFuY2hTZWxlY3RlZCA9IGlmIChAYnJhbmNoTmFtZS52YWwoKSAhPSAnJykgdGhlbiBAYnJhbmNoTmFtZS52YWwoKSBlbHNlIEBicmFuY2hDaG9vc2UudmFsKCk7XG4gICAgICBhY3Rpb25TZWxlY3RlZCA9IEBmbG93QWN0aW9uLnZhbCgpXG4gICAgICBpZihicmFuY2hTZWxlY3RlZD8gJiYgYnJhbmNoU2VsZWN0ZWQgIT0gJycpXG4gICAgICAgIGlmKGFjdGlvblNlbGVjdGVkID09IFwiZmluaXNoXCIpXG4gICAgICAgICAgaWYoQG1lc3NhZ2UudmFsKCkhPSAnJylcbiAgICAgICAgICAgIGFjdGlvblNlbGVjdGVkICs9ICcgLW0gXCInK0BtZXNzYWdlLnZhbCgpKydcIic7XG4gICAgICAgICAgaWYoQG5vVGFnLnByb3AoJ2NoZWNrZWQnKSlcbiAgICAgICAgICAgIGFjdGlvblNlbGVjdGVkICs9ICcgLW4nO1xuICAgICAgICBAcGFyZW50Vmlldy5mbG93KEBmbG93VHlwZS52YWwoKSxhY3Rpb25TZWxlY3RlZCxicmFuY2hTZWxlY3RlZClcbiAgICAgIGVsc2VcbiAgICAgICAgZ2l0LmFsZXJ0IFwiPiBObyBicmFuY2hlcyBzZWxlY3RlZC4uLiBHaXQgZmxvdyBhY3Rpb24gbm90IHZhbGlkLlwiXG4gICAgcmV0dXJuXG5cbiAgY2hlY2tNZXNzYWdlTmVlZGVkOiAtPlxuICAgIEBtZXNzYWdlLnZhbChcIlwiKVxuICAgIGlmKEBmbG93QWN0aW9uLnZhbCgpID09IFwiZmluaXNoXCIgJiYgKEBmbG93VHlwZS52YWwoKSA9PSBcInJlbGVhc2VcIiB8fCBAZmxvd1R5cGUudmFsKCkgPT0gXCJob3RmaXhcIiApIClcbiAgICAgIEBtZXNzYWdlLnNob3coKVxuICAgICAgQGxhYmVsTWVzc2FnZS5zaG93KClcbiAgICBlbHNlXG4gICAgICBAbWVzc2FnZS5oaWRlKClcbiAgICAgIEBsYWJlbE1lc3NhZ2UuaGlkZSgpXG4gICAgcmV0dXJuXG5cbiAgY2hlY2tOb1RhZ05lZWRlZDogLT5cbiAgICBpZihAZmxvd0FjdGlvbi52YWwoKSA9PSBcImZpbmlzaFwiICYmIChAZmxvd1R5cGUudmFsKCkgPT0gXCJyZWxlYXNlXCIgfHwgQGZsb3dUeXBlLnZhbCgpID09IFwiaG90Zml4XCIgKSApXG4gICAgICBAbm9UYWcuc2hvdygpXG4gICAgICBAbGFiZWxOb1RhZy5zaG93KClcbiAgICBlbHNlXG4gICAgICBAbm9UYWcuaGlkZSgpXG4gICAgICBAbGFiZWxOb1RhZy5oaWRlKClcbiAgICByZXR1cm5cblxuICBmbG93VHlwZUNoYW5nZTogLT5cbiAgICBpZiAoQGZsb3dUeXBlLnZhbCgpID09IFwiaW5pdFwiKVxuICAgICAgQGZsb3dBY3Rpb24uaGlkZSgpXG4gICAgICBAYnJhbmNoTmFtZS5oaWRlKClcbiAgICAgIEBicmFuY2hDaG9vc2UuaGlkZSgpXG4gICAgICBAbGFiZWxCcmFuY2hOYW1lLmhpZGUoKVxuICAgIGVsc2VcbiAgICAgIEBmbG93QWN0aW9uLnNob3coKVxuICAgICAgQGZsb3dBY3Rpb25DaGFuZ2UoKVxuICAgICAgQGxhYmVsQnJhbmNoTmFtZS5zaG93KClcbiAgICBAY2hlY2tNZXNzYWdlTmVlZGVkKClcbiAgICBAY2hlY2tOb1RhZ05lZWRlZCgpXG4gICAgcmV0dXJuXG5cbiAgZmxvd0FjdGlvbkNoYW5nZTogLT5cbiAgICBAY2hlY2tNZXNzYWdlTmVlZGVkKClcbiAgICBAY2hlY2tOb1RhZ05lZWRlZCgpXG4gICAgaWYgKEBmbG93QWN0aW9uLnZhbCgpICE9IFwic3RhcnRcIilcbiAgICAgIEBicmFuY2hOYW1lLmhpZGUoKVxuICAgICAgQGJyYW5jaE5hbWUudmFsKCcnKVxuICAgICAgQGJyYW5jaENob29zZS5maW5kKCdvcHRpb24nKS5yZW1vdmUoKVxuICAgICAgZm9yIGJyYW5jaCBpbiBAYnJhbmNoZXNcbiAgICAgICAgaWYgKGJyYW5jaC5pbmRleE9mKEBmbG93VHlwZS52YWwoKSkgIT0gLTEgKVxuICAgICAgICAgIHZhbHVlID0gYnJhbmNoLnJlcGxhY2UoQGZsb3dUeXBlLnZhbCgpKycvJywnJylcbiAgICAgICAgICBAYnJhbmNoQ2hvb3NlLmFwcGVuZCBcIjxvcHRpb24gdmFsdWU9JyN7dmFsdWV9Jz4je3ZhbHVlfTwvb3B0aW9uPlwiXG4gICAgICBpZiAoQGJyYW5jaENob29zZS5maW5kKCdvcHRpb24nKS5sZW5ndGggPD0gMClcbiAgICAgICAgQGJyYW5jaENob29zZS5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPScnPiAtLW5vIFwiK0BmbG93VHlwZS52YWwoKStcIiBicmFuY2hlcy0tPC9vcHRpb24+XCJcbiAgICAgIEBicmFuY2hDaG9vc2Uuc2hvdygpXG4gICAgZWxzZVxuICAgICAgQGJyYW5jaE5hbWUuc2hvdygpXG4gICAgICBAYnJhbmNoQ2hvb3NlLnZhbCgnJylcbiAgICAgIEBicmFuY2hDaG9vc2UuaGlkZSgpXG4iXX0=
