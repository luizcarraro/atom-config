(function() {
  var $$, ListView, OutputViewManager, SelectListView, fs, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fs = require('fs-plus');

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(repo, data) {
      this.repo = repo;
      this.data = data;
      ListView.__super__.initialize.apply(this, arguments);
      this.show();
      return this.parseData();
    };

    ListView.prototype.parseData = function() {
      var branches, i, item, items, len;
      items = this.data.split("\n");
      branches = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        item = item.replace(/\s/g, '');
        if (item !== '') {
          branches.push({
            name: item
          });
        }
      }
      this.setItems(branches);
      return this.focusFilterEditor();
    };

    ListView.prototype.getFilterKey = function() {
      return 'name';
    };

    ListView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    ListView.prototype.cancelled = function() {
      return this.hide();
    };

    ListView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    ListView.prototype.viewForItem = function(arg) {
      var current, name;
      name = arg.name;
      current = false;
      if (name.startsWith("*")) {
        name = name.slice(1);
        current = true;
      }
      return $$(function() {
        return this.li(name, (function(_this) {
          return function() {
            return _this.div({
              "class": 'pull-right'
            }, function() {
              if (current) {
                return _this.span('Current');
              }
            });
          };
        })(this));
      });
    };

    ListView.prototype.confirmed = function(arg) {
      var name;
      name = arg.name;
      this.rebase(name.match(/\*?(.*)/)[1]);
      return this.cancel();
    };

    ListView.prototype.rebase = function(branch) {
      return git.cmd(['rebase', branch], {
        cwd: this.repo.getWorkingDirectory()
      }).then((function(_this) {
        return function(msg) {
          OutputViewManager.getView().showContent(msg);
          atom.workspace.getTextEditors().forEach(function(editor) {
            return fs.exists(editor.getPath(), function(exist) {
              if (!exist) {
                return editor.destroy();
              }
            });
          });
          return git.refresh(_this.repo);
        };
      })(this))["catch"]((function(_this) {
        return function(msg) {
          notifier.addError(msg);
          return git.refresh(_this.repo);
        };
      })(this));
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi92aWV3cy9yZWJhc2UtbGlzdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUVBQUE7SUFBQTs7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLE1BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFdBQUQsRUFBSzs7RUFDTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFFcEIsTUFBTSxDQUFDLE9BQVAsR0FDUTs7Ozs7Ozt1QkFDSixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsSUFBUjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLE9BQUQ7TUFDbEIsMENBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxJQUFELENBQUE7YUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBO0lBSFU7O3VCQUtaLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBWSxJQUFaO01BQ1IsUUFBQSxHQUFXO0FBQ1gsV0FBQSx1Q0FBQTs7UUFDRSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLEVBQXBCO1FBQ1AsSUFBTyxJQUFBLEtBQVEsRUFBZjtVQUNFLFFBQVEsQ0FBQyxJQUFULENBQWM7WUFBQyxJQUFBLEVBQU0sSUFBUDtXQUFkLEVBREY7O0FBRkY7TUFJQSxJQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQVJTOzt1QkFVWCxZQUFBLEdBQWMsU0FBQTthQUFHO0lBQUg7O3VCQUVkLElBQUEsR0FBTSxTQUFBOztRQUNKLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCOztNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO2FBQ0EsSUFBQyxDQUFBLG1CQUFELENBQUE7SUFISTs7dUJBS04sU0FBQSxHQUFXLFNBQUE7YUFBRyxJQUFDLENBQUEsSUFBRCxDQUFBO0lBQUg7O3VCQUVYLElBQUEsR0FBTSxTQUFBO0FBQ0osVUFBQTsrQ0FBTSxDQUFFLE9BQVIsQ0FBQTtJQURJOzt1QkFHTixXQUFBLEdBQWEsU0FBQyxHQUFEO0FBQ1gsVUFBQTtNQURhLE9BQUQ7TUFDWixPQUFBLEdBQVU7TUFDVixJQUFHLElBQUksQ0FBQyxVQUFMLENBQWdCLEdBQWhCLENBQUg7UUFDRSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFYO1FBQ1AsT0FBQSxHQUFVLEtBRlo7O2FBR0EsRUFBQSxDQUFHLFNBQUE7ZUFDRCxJQUFDLENBQUEsRUFBRCxDQUFJLElBQUosRUFBVSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNSLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFlBQVA7YUFBTCxFQUEwQixTQUFBO2NBQ3hCLElBQW9CLE9BQXBCO3VCQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixFQUFBOztZQUR3QixDQUExQjtVQURRO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWO01BREMsQ0FBSDtJQUxXOzt1QkFVYixTQUFBLEdBQVcsU0FBQyxHQUFEO0FBQ1QsVUFBQTtNQURXLE9BQUQ7TUFDVixJQUFDLENBQUEsTUFBRCxDQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBWCxDQUFzQixDQUFBLENBQUEsQ0FBOUI7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBRlM7O3VCQUlYLE1BQUEsR0FBUSxTQUFDLE1BQUQ7YUFDTixHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxFQUFXLE1BQVgsQ0FBUixFQUE0QjtRQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBTDtPQUE1QixDQUNBLENBQUMsSUFERCxDQUNNLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO1VBQ0osaUJBQWlCLENBQUMsT0FBbEIsQ0FBQSxDQUEyQixDQUFDLFdBQTVCLENBQXdDLEdBQXhDO1VBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQUEsQ0FBK0IsQ0FBQyxPQUFoQyxDQUF3QyxTQUFDLE1BQUQ7bUJBQ3RDLEVBQUUsQ0FBQyxNQUFILENBQVUsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFWLEVBQTRCLFNBQUMsS0FBRDtjQUFXLElBQW9CLENBQUksS0FBeEI7dUJBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxFQUFBOztZQUFYLENBQTVCO1VBRHNDLENBQXhDO2lCQUVBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBQyxDQUFBLElBQWI7UUFKSTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQU1BLEVBQUMsS0FBRCxFQU5BLENBTU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7VUFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFsQjtpQkFDQSxHQUFHLENBQUMsT0FBSixDQUFZLEtBQUMsQ0FBQSxJQUFiO1FBRks7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTlA7SUFETTs7OztLQTFDYTtBQVB6QiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNsYXNzIExpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgICBpbml0aWFsaXplOiAoQHJlcG8sIEBkYXRhKSAtPlxuICAgICAgc3VwZXJcbiAgICAgIEBzaG93KClcbiAgICAgIEBwYXJzZURhdGEoKVxuXG4gICAgcGFyc2VEYXRhOiAtPlxuICAgICAgaXRlbXMgPSBAZGF0YS5zcGxpdChcIlxcblwiKVxuICAgICAgYnJhbmNoZXMgPSBbXVxuICAgICAgZm9yIGl0ZW0gaW4gaXRlbXNcbiAgICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXFxzL2csICcnKVxuICAgICAgICB1bmxlc3MgaXRlbSBpcyAnJ1xuICAgICAgICAgIGJyYW5jaGVzLnB1c2gge25hbWU6IGl0ZW19XG4gICAgICBAc2V0SXRlbXMgYnJhbmNoZXNcbiAgICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgICBnZXRGaWx0ZXJLZXk6IC0+ICduYW1lJ1xuXG4gICAgc2hvdzogLT5cbiAgICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgICBAcGFuZWwuc2hvdygpXG4gICAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG5cbiAgICBjYW5jZWxsZWQ6IC0+IEBoaWRlKClcblxuICAgIGhpZGU6IC0+XG4gICAgICBAcGFuZWw/LmRlc3Ryb3koKVxuXG4gICAgdmlld0Zvckl0ZW06ICh7bmFtZX0pIC0+XG4gICAgICBjdXJyZW50ID0gZmFsc2VcbiAgICAgIGlmIG5hbWUuc3RhcnRzV2l0aCBcIipcIlxuICAgICAgICBuYW1lID0gbmFtZS5zbGljZSgxKVxuICAgICAgICBjdXJyZW50ID0gdHJ1ZVxuICAgICAgJCQgLT5cbiAgICAgICAgQGxpIG5hbWUsID0+XG4gICAgICAgICAgQGRpdiBjbGFzczogJ3B1bGwtcmlnaHQnLCA9PlxuICAgICAgICAgICAgQHNwYW4oJ0N1cnJlbnQnKSBpZiBjdXJyZW50XG5cbiAgICBjb25maXJtZWQ6ICh7bmFtZX0pIC0+XG4gICAgICBAcmViYXNlIG5hbWUubWF0Y2goL1xcKj8oLiopLylbMV1cbiAgICAgIEBjYW5jZWwoKVxuXG4gICAgcmViYXNlOiAoYnJhbmNoKSAtPlxuICAgICAgZ2l0LmNtZChbJ3JlYmFzZScsIGJyYW5jaF0sIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgLnRoZW4gKG1zZykgPT5cbiAgICAgICAgT3V0cHV0Vmlld01hbmFnZXIuZ2V0VmlldygpLnNob3dDb250ZW50KG1zZylcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5mb3JFYWNoIChlZGl0b3IpIC0+XG4gICAgICAgICAgZnMuZXhpc3RzIGVkaXRvci5nZXRQYXRoKCksIChleGlzdCkgLT4gZWRpdG9yLmRlc3Ryb3koKSBpZiBub3QgZXhpc3RcbiAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cbiAgICAgIC5jYXRjaCAobXNnKSA9PlxuICAgICAgICBub3RpZmllci5hZGRFcnJvciBtc2dcbiAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cbiJdfQ==
