(function() {
  var $$, ListView, OutputViewManager, RemoteBranchListView, SelectListView, _pull, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  _pull = require('../models/_pull');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  RemoteBranchListView = require('./remote-branch-list-view');

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(repo, data1, arg1) {
      var ref1;
      this.repo = repo;
      this.data = data1;
      ref1 = arg1 != null ? arg1 : {}, this.mode = ref1.mode, this.tag = ref1.tag, this.extraArgs = ref1.extraArgs;
      ListView.__super__.initialize.apply(this, arguments);
      if (this.tag == null) {
        this.tag = '';
      }
      if (this.extraArgs == null) {
        this.extraArgs = [];
      }
      this.show();
      this.parseData();
      return this.result = new Promise((function(_this) {
        return function(resolve1, reject1) {
          _this.resolve = resolve1;
          _this.reject = reject1;
        };
      })(this));
    };

    ListView.prototype.parseData = function() {
      var items, remotes;
      items = this.data.split("\n");
      remotes = items.filter(function(item) {
        return item !== '';
      }).map(function(item) {
        return {
          name: item
        };
      });
      if (remotes.length === 1) {
        return this.confirmed(remotes[0]);
      } else {
        this.setItems(remotes);
        return this.focusFilterEditor();
      }
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

    ListView.prototype.viewForItem = function(arg1) {
      var name;
      name = arg1.name;
      return $$(function() {
        return this.li(name);
      });
    };

    ListView.prototype.pull = function(remoteName) {
      if (atom.config.get('git-plus.remoteInteractions.promptForBranch')) {
        return git.cmd(['branch', '--no-color', '-r'], {
          cwd: this.repo.getWorkingDirectory()
        }).then((function(_this) {
          return function(data) {
            return new Promise(function(resolve, reject) {
              return new RemoteBranchListView(data, remoteName, function(arg1) {
                var args, branchName, name, startMessage, view;
                name = arg1.name;
                branchName = name.substring(name.indexOf('/') + 1);
                view = OutputViewManager.getView();
                startMessage = notifier.addInfo("Pulling...", {
                  dismissable: true
                });
                args = ['pull'].concat(_this.extraArgs, remoteName, branchName).filter(function(arg) {
                  return arg !== '';
                });
                return git.cmd(args, {
                  cwd: _this.repo.getWorkingDirectory()
                }, {
                  color: true
                }).then(function(data) {
                  resolve(branchName);
                  view.showContent(data);
                  startMessage.dismiss();
                  return git.refresh(_this.repo);
                })["catch"](function(error) {
                  reject();
                  view.showContent(error);
                  return startMessage.dismiss();
                });
              });
            });
          };
        })(this));
      } else {
        return _pull(this.repo, {
          extraArgs: this.extraArgs
        });
      }
    };

    ListView.prototype.confirmed = function(arg1) {
      var name, pullBeforePush;
      name = arg1.name;
      if (this.mode === 'pull') {
        this.pull(name);
      } else if (this.mode === 'fetch-prune') {
        this.mode = 'fetch';
        this.execute(name, '--prune');
      } else if (this.mode === 'push') {
        pullBeforePush = atom.config.get('git-plus.remoteInteractions.pullBeforePush');
        if (pullBeforePush && atom.config.get('git-plus.remoteInteractions.pullRebase')) {
          this.extraArgs = '--rebase';
        }
        if (pullBeforePush) {
          this.pull(name).then((function(_this) {
            return function(branch) {
              return _this.execute(name, null, branch);
            };
          })(this));
        } else {
          this.execute(name);
        }
      } else if (this.mode === 'push -u') {
        this.pushAndSetUpstream(name);
      } else {
        this.execute(name);
      }
      return this.cancel();
    };

    ListView.prototype.execute = function(remote, extraArgs, branch) {
      var args, message, startMessage, view;
      if (remote == null) {
        remote = '';
      }
      if (extraArgs == null) {
        extraArgs = '';
      }
      if (atom.config.get('git-plus.remoteInteractions.promptForBranch')) {
        if (branch != null) {
          view = OutputViewManager.getView();
          args = [this.mode];
          if (extraArgs.length > 0) {
            args.push(extraArgs);
          }
          args = args.concat([remote, branch]);
          message = (this.mode[0].toUpperCase() + this.mode.substring(1)) + "ing...";
          startMessage = notifier.addInfo(message, {
            dismissable: true
          });
          return git.cmd(args, {
            cwd: this.repo.getWorkingDirectory()
          }, {
            color: true
          }).then((function(_this) {
            return function(data) {
              if (data !== '') {
                view.showContent(data);
              }
              startMessage.dismiss();
              return git.refresh(_this.repo);
            };
          })(this))["catch"]((function(_this) {
            return function(data) {
              if (data !== '') {
                view.showContent(data);
              }
              return startMessage.dismiss();
            };
          })(this));
        } else {
          return git.cmd(['branch', '--no-color', '-r'], {
            cwd: this.repo.getWorkingDirectory()
          }).then((function(_this) {
            return function(data) {
              return new RemoteBranchListView(data, remote, function(arg1) {
                var branchName, name;
                name = arg1.name;
                branchName = name.substring(name.indexOf('/') + 1);
                view = OutputViewManager.getView();
                startMessage = notifier.addInfo("Pushing...", {
                  dismissable: true
                });
                args = ['push'].concat(extraArgs, remote, branchName).filter(function(arg) {
                  return arg !== '';
                });
                return git.cmd(args, {
                  cwd: _this.repo.getWorkingDirectory()
                }, {
                  color: true
                }).then(function(data) {
                  view.showContent(data);
                  startMessage.dismiss();
                  return git.refresh(_this.repo);
                })["catch"](function(error) {
                  view.showContent(error);
                  return startMessage.dismiss();
                });
              });
            };
          })(this));
        }
      } else {
        view = OutputViewManager.getView();
        args = [this.mode];
        if (extraArgs.length > 0) {
          args.push(extraArgs);
        }
        args = args.concat([remote, this.tag]).filter(function(arg) {
          return arg !== '';
        });
        message = (this.mode[0].toUpperCase() + this.mode.substring(1)) + "ing...";
        startMessage = notifier.addInfo(message, {
          dismissable: true
        });
        return git.cmd(args, {
          cwd: this.repo.getWorkingDirectory()
        }, {
          color: true
        }).then((function(_this) {
          return function(data) {
            if (data !== '') {
              view.showContent(data);
            }
            startMessage.dismiss();
            return git.refresh(_this.repo);
          };
        })(this))["catch"]((function(_this) {
          return function(data) {
            if (data !== '') {
              view.showContent(data);
            }
            return startMessage.dismiss();
          };
        })(this));
      }
    };

    ListView.prototype.pushAndSetUpstream = function(remote) {
      var args, message, startMessage, view;
      if (remote == null) {
        remote = '';
      }
      view = OutputViewManager.getView();
      args = ['push', '-u', remote, 'HEAD'].filter(function(arg) {
        return arg !== '';
      });
      message = "Pushing...";
      startMessage = notifier.addInfo(message, {
        dismissable: true
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then(function(data) {
        if (data !== '') {
          view.showContent(data);
        }
        return startMessage.dismiss();
      })["catch"]((function(_this) {
        return function(data) {
          if (data !== '') {
            view.showContent(data);
          }
          return startMessage.dismiss();
        };
      })(this));
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi92aWV3cy9yZW1vdGUtbGlzdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0dBQUE7SUFBQTs7O0VBQUEsTUFBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsV0FBRCxFQUFLOztFQUVMLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixLQUFBLEdBQVEsT0FBQSxDQUFRLGlCQUFSOztFQUNSLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBQ3BCLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwyQkFBUjs7RUFFdkIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozt1QkFDSixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsS0FBUixFQUFlLElBQWY7QUFDVixVQUFBO01BRFcsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsT0FBRDs0QkFBTyxPQUEwQixJQUF6QixJQUFDLENBQUEsWUFBQSxNQUFNLElBQUMsQ0FBQSxXQUFBLEtBQUssSUFBQyxDQUFBLGlCQUFBO01BQ3hDLDBDQUFBLFNBQUE7O1FBQ0EsSUFBQyxDQUFBLE1BQU87OztRQUNSLElBQUMsQ0FBQSxZQUFhOztNQUNkLElBQUMsQ0FBQSxJQUFELENBQUE7TUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLE9BQUosQ0FBWSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsUUFBRCxFQUFXLE9BQVg7VUFBQyxLQUFDLENBQUEsVUFBRDtVQUFVLEtBQUMsQ0FBQSxTQUFEO1FBQVg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVo7SUFOQTs7dUJBUVosU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01B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UUFBQSxXQUFBLEVBQWEsSUFBYjtPQUExQjthQUNmLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFMO09BQWQsRUFBZ0Q7UUFBQyxLQUFBLEVBQU8sSUFBUjtPQUFoRCxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDtRQUNKLElBQUcsSUFBQSxLQUFVLEVBQWI7VUFDRSxJQUFJLENBQUMsV0FBTCxDQUFpQixJQUFqQixFQURGOztlQUVBLFlBQVksQ0FBQyxPQUFiLENBQUE7TUFISSxDQUROLENBS0EsRUFBQyxLQUFELEVBTEEsQ0FLTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUNMLElBQUcsSUFBQSxLQUFVLEVBQWI7WUFDRSxJQUFJLENBQUMsV0FBTCxDQUFpQixJQUFqQixFQURGOztpQkFFQSxZQUFZLENBQUMsT0FBYixDQUFBO1FBSEs7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTFA7SUFMa0I7Ozs7S0FsSUM7QUFUdkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7JCQsIFNlbGVjdExpc3RWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5fcHVsbCA9IHJlcXVpcmUgJy4uL21vZGVscy9fcHVsbCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5SZW1vdGVCcmFuY2hMaXN0VmlldyA9IHJlcXVpcmUgJy4vcmVtb3RlLWJyYW5jaC1saXN0LXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIExpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBAZGF0YSwge0Btb2RlLCBAdGFnLCBAZXh0cmFBcmdzfT17fSkgLT5cbiAgICBzdXBlclxuICAgIEB0YWcgPz0gJydcbiAgICBAZXh0cmFBcmdzID89IFtdXG4gICAgQHNob3coKVxuICAgIEBwYXJzZURhdGEoKVxuICAgIEByZXN1bHQgPSBuZXcgUHJvbWlzZSAoQHJlc29sdmUsIEByZWplY3QpID0+XG5cbiAgcGFyc2VEYXRhOiAtPlxuICAgIGl0ZW1zID0gQGRhdGEuc3BsaXQoXCJcXG5cIilcbiAgICByZW1vdGVzID0gaXRlbXMuZmlsdGVyKChpdGVtKSAtPiBpdGVtIGlzbnQgJycpLm1hcCAoaXRlbSkgLT4geyBuYW1lOiBpdGVtIH1cbiAgICBpZiByZW1vdGVzLmxlbmd0aCBpcyAxXG4gICAgICBAY29uZmlybWVkIHJlbW90ZXNbMF1cbiAgICBlbHNlXG4gICAgICBAc2V0SXRlbXMgcmVtb3Rlc1xuICAgICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBnZXRGaWx0ZXJLZXk6IC0+ICduYW1lJ1xuXG4gIHNob3c6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuXG4gIGNhbmNlbGxlZDogLT4gQGhpZGUoKVxuXG4gIGhpZGU6IC0+IEBwYW5lbD8uZGVzdHJveSgpXG5cbiAgdmlld0Zvckl0ZW06ICh7bmFtZX0pIC0+XG4gICAgJCQgLT5cbiAgICAgIEBsaSBuYW1lXG5cbiAgcHVsbDogKHJlbW90ZU5hbWUpIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHJvbXB0Rm9yQnJhbmNoJylcbiAgICAgIGdpdC5jbWQoWydicmFuY2gnLCAnLS1uby1jb2xvcicsICctciddLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICAgIG5ldyBSZW1vdGVCcmFuY2hMaXN0VmlldyBkYXRhLCByZW1vdGVOYW1lLCAoe25hbWV9KSA9PlxuICAgICAgICAgICAgYnJhbmNoTmFtZSA9IG5hbWUuc3Vic3RyaW5nKG5hbWUuaW5kZXhPZignLycpICsgMSlcbiAgICAgICAgICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5nZXRWaWV3KClcbiAgICAgICAgICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gXCJQdWxsaW5nLi4uXCIsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICBhcmdzID0gWydwdWxsJ10uY29uY2F0KEBleHRyYUFyZ3MsIHJlbW90ZU5hbWUsIGJyYW5jaE5hbWUpLmZpbHRlcigoYXJnKSAtPiBhcmcgaXNudCAnJylcbiAgICAgICAgICAgIGdpdC5jbWQoYXJncywgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gICAgICAgICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgICAgICAgcmVzb2x2ZSBicmFuY2hOYW1lXG4gICAgICAgICAgICAgIHZpZXcuc2hvd0NvbnRlbnQoZGF0YSlcbiAgICAgICAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgICAgICAgICAgICBnaXQucmVmcmVzaCBAcmVwb1xuICAgICAgICAgICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgICAgICAgICAgcmVqZWN0KClcbiAgICAgICAgICAgICAgdmlldy5zaG93Q29udGVudChlcnJvcilcbiAgICAgICAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgIGVsc2VcbiAgICAgIF9wdWxsIEByZXBvLCBleHRyYUFyZ3M6IEBleHRyYUFyZ3NcblxuICBjb25maXJtZWQ6ICh7bmFtZX0pIC0+XG4gICAgaWYgQG1vZGUgaXMgJ3B1bGwnXG4gICAgICBAcHVsbCBuYW1lXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAnZmV0Y2gtcHJ1bmUnXG4gICAgICBAbW9kZSA9ICdmZXRjaCdcbiAgICAgIEBleGVjdXRlIG5hbWUsICctLXBydW5lJ1xuICAgIGVsc2UgaWYgQG1vZGUgaXMgJ3B1c2gnXG4gICAgICBwdWxsQmVmb3JlUHVzaCA9IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnB1bGxCZWZvcmVQdXNoJylcbiAgICAgIEBleHRyYUFyZ3MgPSAnLS1yZWJhc2UnIGlmIHB1bGxCZWZvcmVQdXNoIGFuZCBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLnJlbW90ZUludGVyYWN0aW9ucy5wdWxsUmViYXNlJylcbiAgICAgIGlmIHB1bGxCZWZvcmVQdXNoXG4gICAgICAgIEBwdWxsKG5hbWUpLnRoZW4gKGJyYW5jaCkgPT4gQGV4ZWN1dGUgbmFtZSwgbnVsbCwgYnJhbmNoXG4gICAgICBlbHNlXG4gICAgICAgIEBleGVjdXRlIG5hbWVcbiAgICBlbHNlIGlmIEBtb2RlIGlzICdwdXNoIC11J1xuICAgICAgQHB1c2hBbmRTZXRVcHN0cmVhbSBuYW1lXG4gICAgZWxzZVxuICAgICAgQGV4ZWN1dGUgbmFtZVxuICAgIEBjYW5jZWwoKVxuXG4gIGV4ZWN1dGU6IChyZW1vdGU9JycsIGV4dHJhQXJncz0nJywgYnJhbmNoKSAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnByb21wdEZvckJyYW5jaCcpXG4gICAgICBpZiBicmFuY2g/XG4gICAgICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5nZXRWaWV3KClcbiAgICAgICAgYXJncyA9IFtAbW9kZV1cbiAgICAgICAgaWYgZXh0cmFBcmdzLmxlbmd0aCA+IDBcbiAgICAgICAgICBhcmdzLnB1c2ggZXh0cmFBcmdzXG4gICAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChbcmVtb3RlLCBicmFuY2hdKVxuICAgICAgICBtZXNzYWdlID0gXCIje0Btb2RlWzBdLnRvVXBwZXJDYXNlKCkrQG1vZGUuc3Vic3RyaW5nKDEpfWluZy4uLlwiXG4gICAgICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gbWVzc2FnZSwgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgICAgICB2aWV3LnNob3dDb250ZW50KGRhdGEpXG4gICAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgICAgICAgIGdpdC5yZWZyZXNoIEByZXBvXG4gICAgICAgIC5jYXRjaCAoZGF0YSkgPT5cbiAgICAgICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgICAgIHZpZXcuc2hvd0NvbnRlbnQoZGF0YSlcbiAgICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgICBlbHNlXG4gICAgICAgIGdpdC5jbWQoWydicmFuY2gnLCAnLS1uby1jb2xvcicsICctciddLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgICAgbmV3IFJlbW90ZUJyYW5jaExpc3RWaWV3IGRhdGEsIHJlbW90ZSwgKHtuYW1lfSkgPT5cbiAgICAgICAgICAgIGJyYW5jaE5hbWUgPSBuYW1lLnN1YnN0cmluZyhuYW1lLmluZGV4T2YoJy8nKSArIDEpXG4gICAgICAgICAgICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuZ2V0VmlldygpXG4gICAgICAgICAgICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIFwiUHVzaGluZy4uLlwiLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgYXJncyA9IFsncHVzaCddLmNvbmNhdChleHRyYUFyZ3MsIHJlbW90ZSwgYnJhbmNoTmFtZSkuZmlsdGVyKChhcmcpIC0+IGFyZyBpc250ICcnKVxuICAgICAgICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAgICAgICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgICAgICAgICB2aWV3LnNob3dDb250ZW50KGRhdGEpXG4gICAgICAgICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAgICAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cbiAgICAgICAgICAgIC5jYXRjaCAoZXJyb3IpID0+XG4gICAgICAgICAgICAgIHZpZXcuc2hvd0NvbnRlbnQoZXJyb3IpXG4gICAgICAgICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICBlbHNlXG4gICAgICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuZ2V0VmlldygpXG4gICAgICBhcmdzID0gW0Btb2RlXVxuICAgICAgaWYgZXh0cmFBcmdzLmxlbmd0aCA+IDBcbiAgICAgICAgYXJncy5wdXNoIGV4dHJhQXJnc1xuICAgICAgYXJncyA9IGFyZ3MuY29uY2F0KFtyZW1vdGUsIEB0YWddKS5maWx0ZXIoKGFyZykgLT4gYXJnIGlzbnQgJycpXG4gICAgICBtZXNzYWdlID0gXCIje0Btb2RlWzBdLnRvVXBwZXJDYXNlKCkrQG1vZGUuc3Vic3RyaW5nKDEpfWluZy4uLlwiXG4gICAgICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIG1lc3NhZ2UsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgIGlmIGRhdGEgaXNudCAnJ1xuICAgICAgICAgIHZpZXcuc2hvd0NvbnRlbnQoZGF0YSlcbiAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgICAgICBnaXQucmVmcmVzaCBAcmVwb1xuICAgICAgLmNhdGNoIChkYXRhKSA9PlxuICAgICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgICB2aWV3LnNob3dDb250ZW50KGRhdGEpXG4gICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcblxuICBwdXNoQW5kU2V0VXBzdHJlYW06IChyZW1vdGU9JycpIC0+XG4gICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmdldFZpZXcoKVxuICAgIGFyZ3MgPSBbJ3B1c2gnLCAnLXUnLCByZW1vdGUsICdIRUFEJ10uZmlsdGVyKChhcmcpIC0+IGFyZyBpc250ICcnKVxuICAgIG1lc3NhZ2UgPSBcIlB1c2hpbmcuLi5cIlxuICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gbWVzc2FnZSwgZGlzbWlzc2FibGU6IHRydWVcbiAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgIC50aGVuIChkYXRhKSAtPlxuICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgIHZpZXcuc2hvd0NvbnRlbnQoZGF0YSlcbiAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAuY2F0Y2ggKGRhdGEpID0+XG4gICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgdmlldy5zaG93Q29udGVudChkYXRhKVxuICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuIl19
