(function() {
  var $, $$, BranchDialog, BranchView, CommitDialog, ConfirmDialog, CreateTagDialog, DeleteDialog, DiffView, FileView, FlowDialog, GitControlView, LogView, MenuView, MergeDialog, MidrebaseDialog, ProjectDialog, PushDialog, PushTagsDialog, RebaseDialog, View, child_process, git, gitWorkspaceTitle, ref, runShell,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$, $$ = ref.$$;

  child_process = require('child_process');

  git = require('./git');

  BranchView = require('./views/branch-view');

  DiffView = require('./views/diff-view');

  FileView = require('./views/file-view');

  LogView = require('./views/log-view');

  MenuView = require('./views/menu-view');

  ProjectDialog = require('./dialogs/project-dialog');

  BranchDialog = require('./dialogs/branch-dialog');

  CommitDialog = require('./dialogs/commit-dialog');

  ConfirmDialog = require('./dialogs/confirm-dialog');

  CreateTagDialog = require('./dialogs/create-tag-dialog');

  DeleteDialog = require('./dialogs/delete-dialog');

  MergeDialog = require('./dialogs/merge-dialog');

  FlowDialog = require('./dialogs/flow-dialog');

  PushDialog = require('./dialogs/push-dialog');

  PushTagsDialog = require('./dialogs/push-tags-dialog');

  RebaseDialog = require('./dialogs/rebase-dialog');

  MidrebaseDialog = require('./dialogs/midrebase-dialog');

  runShell = function(cmd, output) {
    var shell;
    shell = child_process.execSync(cmd, {
      encoding: 'utf8'
    }).trim();
    if (shell === output) {
      return true;
    } else if (shell !== output) {
      return false;
    }
  };

  gitWorkspaceTitle = '';

  module.exports = GitControlView = (function(superClass) {
    extend(GitControlView, superClass);

    function GitControlView() {
      this.tag = bind(this.tag, this);
      this.midrebase = bind(this.midrebase, this);
      this.rebase = bind(this.rebase, this);
      this.flow = bind(this.flow, this);
      this.merge = bind(this.merge, this);
      return GitControlView.__super__.constructor.apply(this, arguments);
    }

    GitControlView.content = function() {
      if (git.isInitialised()) {
        return this.div({
          "class": 'git-control'
        }, (function(_this) {
          return function() {
            _this.subview('menuView', new MenuView());
            _this.div({
              "class": 'content',
              outlet: 'contentView'
            }, function() {
              _this.div({
                "class": 'sidebar'
              }, function() {
                _this.subview('filesView', new FileView());
                _this.subview('localBranchView', new BranchView({
                  name: 'Local',
                  local: true
                }));
                return _this.subview('remoteBranchView', new BranchView({
                  name: 'Remote'
                }));
              });
              _this.div({
                "class": 'domain'
              }, function() {
                return _this.subview('diffView', new DiffView());
              });
              _this.subview('projectDialog', new ProjectDialog());
              _this.subview('branchDialog', new BranchDialog());
              _this.subview('commitDialog', new CommitDialog());
              _this.subview('createtagDialog', new CreateTagDialog());
              _this.subview('mergeDialog', new MergeDialog());
              _this.subview('flowDialog', new FlowDialog());
              _this.subview('pushDialog', new PushDialog());
              _this.subview('pushtagDialog', new PushTagsDialog());
              _this.subview('rebaseDialog', new RebaseDialog());
              return _this.subview('midrebaseDialog', new MidrebaseDialog());
            });
            return _this.subview('logView', new LogView());
          };
        })(this));
      } else {
        return this.div({
          "class": 'git-control'
        }, (function(_this) {
          return function() {
            return _this.subview('logView', new LogView());
          };
        })(this));
      }
    };

    GitControlView.prototype.serialize = function() {};

    GitControlView.prototype.initialize = function() {
      console.log('GitControlView: initialize');
      git.setLogger((function(_this) {
        return function(log, iserror) {
          return _this.logView.log(log, iserror);
        };
      })(this));
      this.active = true;
      this.branchSelected = null;
      if (!git.isInitialised()) {
        git.alert("> This project is not a git repository. Either open another project or create a repository.");
      } else {
        this.setWorkspaceTitle(git.getRepository().path.split('/').reverse()[1]);
      }
      this.update(true);
    };

    GitControlView.prototype.destroy = function() {
      console.log('GitControlView: destroy');
      this.active = false;
    };

    GitControlView.prototype.setWorkspaceTitle = function(title) {
      return gitWorkspaceTitle = title;
    };

    GitControlView.prototype.getTitle = function() {
      return 'git:control';
    };

    GitControlView.prototype.update = function(nofetch) {
      if (git.isInitialised()) {
        this.loadBranches();
        this.showStatus();
        this.filesView.setWorkspaceTitle(gitWorkspaceTitle);
        if (!nofetch) {
          this.fetchMenuClick();
          if (this.diffView) {
            this.diffView.clearAll();
          }
        }
      }
    };

    GitControlView.prototype.loadLog = function() {
      git.log(this.selectedBranch).then(function(logs) {
        console.log('git.log', logs);
      });
    };

    GitControlView.prototype.checkoutBranch = function(branch, remote) {
      git.checkout(branch, remote).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.branchCount = function(count) {
      var remotes;
      if (git.isInitialised()) {
        remotes = git.hasOrigin();
        this.menuView.activate('upstream', remotes && count.behind);
        this.menuView.activate('downstream', remotes && (count.ahead || !git.getRemoteBranch()));
        this.menuView.activate('remote', remotes);
      }
    };

    GitControlView.prototype.loadBranches = function() {
      if (git.isInitialised()) {
        this.selectedBranch = git.getLocalBranch();
        git.getBranches().then((function(_this) {
          return function(branches) {
            _this.branches = branches;
            _this.remoteBranchView.addAll(branches.remote);
            _this.localBranchView.addAll(branches.local, true);
          };
        })(this));
      }
    };

    GitControlView.prototype.showSelectedFiles = function() {
      this.menuView.activate('file', this.filesView.hasSelected());
      this.menuView.activate('file.merging', this.filesView.hasSelected() || git.isMerging());
    };

    GitControlView.prototype.showStatus = function() {
      git.status().then((function(_this) {
        return function(files) {
          _this.filesView.addAll(files);
        };
      })(this));
    };

    GitControlView.prototype.projectMenuClick = function() {
      this.projectDialog.activate();
    };

    GitControlView.prototype.branchMenuClick = function() {
      this.branchDialog.activate();
    };

    GitControlView.prototype.compareMenuClick = function() {
      git.diff(this.filesView.getSelected().all.join(' ')).then((function(_this) {
        return function(diffs) {
          return _this.diffView.addAll(diffs);
        };
      })(this));
    };

    GitControlView.prototype.commitMenuClick = function() {
      if (!(this.filesView.hasSelected() || git.isMerging())) {
        return;
      }
      this.commitDialog.activate();
    };

    GitControlView.prototype.commit = function() {
      var files, msg;
      if (!this.filesView.hasSelected()) {
        return;
      }
      msg = this.commitDialog.getMessage();
      files = this.filesView.getSelected();
      this.filesView.unselectAll();
      git.add(files.add).then(function() {
        return git.remove(files.rem);
      }).then(function() {
        return git.commit(msg);
      }).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.createBranch = function(branch) {
      git.createBranch(branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.deleteBranch = function(branch) {
      var confirmCb, forceDeleteCallback;
      confirmCb = (function(_this) {
        return function(params) {
          git.deleteBranch(params.branch).then(function() {
            return _this.update();
          });
        };
      })(this);
      forceDeleteCallback = (function(_this) {
        return function(params) {
          return git.forceDeleteBranch(params.branch).then(function() {
            return _this.update();
          });
        };
      })(this);
      this.contentView.append(new DeleteDialog({
        hdr: 'Delete Branch',
        msg: "Are you sure you want to delete the local branch '" + branch + "'?",
        cb: confirmCb,
        fdCb: forceDeleteCallback,
        branch: branch
      }));
    };

    GitControlView.prototype.fetchMenuClick = function() {
      if (git.isInitialised()) {
        if (!git.hasOrigin()) {
          return;
        }
      }
      git.fetch().then((function(_this) {
        return function() {
          return _this.loadBranches();
        };
      })(this));
    };

    GitControlView.prototype.mergeMenuClick = function() {
      this.mergeDialog.activate(this.branches.local);
    };

    GitControlView.prototype.merge = function(branch, noff) {
      git.merge(branch, noff).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.flowMenuClick = function() {
      this.flowDialog.activate(this.branches.local);
    };

    GitControlView.prototype.flow = function(type, action, branch) {
      git.flow(type, action, branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.ptagMenuClick = function() {
      this.pushtagDialog.activate();
    };

    GitControlView.prototype.ptag = function(remote) {
      git.ptag(remote).then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pullMenuClick = function() {
      git.pull().then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pullupMenuClick = function() {
      git.pullup().then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pushMenuClick = function() {
      git.getBranches().then((function(_this) {
        return function(branches) {
          return _this.pushDialog.activate(branches.remote);
        };
      })(this));
    };

    GitControlView.prototype.push = function(remote, branches, force) {
      return git.push(remote, branches, force).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.rebaseMenuClick = function() {
      var check;
      check = runShell('ls `git rev-parse --git-dir` | grep rebase || echo norebase', 'norebase');
      if (check === true) {
        this.rebaseDialog.activate(this.branches.local);
      } else if (check === false) {
        this.midrebaseDialog.activate();
      }
    };

    GitControlView.prototype.rebase = function(branch) {
      git.rebase(branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.midrebase = function(contin, abort, skip) {
      git.midrebase(contin, abort, skip).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.resetMenuClick = function() {
      var files;
      if (!this.filesView.hasSelected()) {
        return;
      }
      files = this.filesView.getSelected();
      return atom.confirm({
        message: "Reset will erase changes since the last commit in the selected files. Are you sure?",
        buttons: {
          Cancel: (function(_this) {
            return function() {};
          })(this),
          Reset: (function(_this) {
            return function() {
              git.reset(files.all).then(function() {
                return _this.update();
              });
            };
          })(this)
        }
      });
    };

    GitControlView.prototype.tagMenuClick = function() {
      this.createtagDialog.activate();
    };

    GitControlView.prototype.tag = function(name, href, msg) {
      git.tag(name, href, msg).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    return GitControlView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9naXQtY29udHJvbC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaVRBQUE7SUFBQTs7OztFQUFBLE1BQWdCLE9BQUEsQ0FBUSxzQkFBUixDQUFoQixFQUFDLGVBQUQsRUFBTyxTQUFQLEVBQVU7O0VBRVYsYUFBQSxHQUFnQixPQUFBLENBQVEsZUFBUjs7RUFFaEIsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSOztFQUVOLFVBQUEsR0FBYSxPQUFBLENBQVEscUJBQVI7O0VBQ2IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLG1CQUFSOztFQUNYLE9BQUEsR0FBVSxPQUFBLENBQVEsa0JBQVI7O0VBQ1YsUUFBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUjs7RUFFWCxhQUFBLEdBQWdCLE9BQUEsQ0FBUSwwQkFBUjs7RUFDaEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSx5QkFBUjs7RUFDZixZQUFBLEdBQWUsT0FBQSxDQUFRLHlCQUFSOztFQUNmLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLDBCQUFSOztFQUNoQixlQUFBLEdBQWtCLE9BQUEsQ0FBUSw2QkFBUjs7RUFDbEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSx5QkFBUjs7RUFDZixXQUFBLEdBQWMsT0FBQSxDQUFRLHdCQUFSOztFQUNkLFVBQUEsR0FBYSxPQUFBLENBQVEsdUJBQVI7O0VBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSx1QkFBUjs7RUFDYixjQUFBLEdBQWlCLE9BQUEsQ0FBUSw0QkFBUjs7RUFDakIsWUFBQSxHQUFlLE9BQUEsQ0FBUSx5QkFBUjs7RUFDZixlQUFBLEdBQWtCLE9BQUEsQ0FBUSw0QkFBUjs7RUFFbEIsUUFBQSxHQUFXLFNBQUMsR0FBRCxFQUFNLE1BQU47QUFDVCxRQUFB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QSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVI7VUFFQSxLQUFBLEVBQU8sQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQTtjQUNMLEdBQUcsQ0FBQyxLQUFKLENBQVUsS0FBSyxDQUFDLEdBQWhCLENBQW9CLENBQUMsSUFBckIsQ0FBMEIsU0FBQTt1QkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO2NBQUgsQ0FBMUI7WUFESztVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGUDtTQUZGO09BREY7SUFMYzs7NkJBY2hCLFlBQUEsR0FBYyxTQUFBO01BQ1osSUFBQyxDQUFBLGVBQWUsQ0FBQyxRQUFqQixDQUFBO0lBRFk7OzZCQUlkLEdBQUEsR0FBSyxTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsR0FBYjtNQUNILEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjLElBQWQsRUFBb0IsR0FBcEIsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQURHOzs7O0tBbFBzQjtBQW5DN0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7VmlldywgJCwgJCR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmNoaWxkX3Byb2Nlc3MgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuXG5naXQgPSByZXF1aXJlICcuL2dpdCdcblxuQnJhbmNoVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvYnJhbmNoLXZpZXcnXG5EaWZmVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvZGlmZi12aWV3J1xuRmlsZVZpZXcgPSByZXF1aXJlICcuL3ZpZXdzL2ZpbGUtdmlldydcbkxvZ1ZpZXcgPSByZXF1aXJlICcuL3ZpZXdzL2xvZy12aWV3J1xuTWVudVZpZXcgPSByZXF1aXJlICcuL3ZpZXdzL21lbnUtdmlldydcblxuUHJvamVjdERpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9ncy9wcm9qZWN0LWRpYWxvZydcbkJyYW5jaERpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9ncy9icmFuY2gtZGlhbG9nJ1xuQ29tbWl0RGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2dzL2NvbW1pdC1kaWFsb2cnXG5Db25maXJtRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2dzL2NvbmZpcm0tZGlhbG9nJ1xuQ3JlYXRlVGFnRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2dzL2NyZWF0ZS10YWctZGlhbG9nJ1xuRGVsZXRlRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2dzL2RlbGV0ZS1kaWFsb2cnXG5NZXJnZURpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9ncy9tZXJnZS1kaWFsb2cnXG5GbG93RGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2dzL2Zsb3ctZGlhbG9nJ1xuUHVzaERpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9ncy9wdXNoLWRpYWxvZydcblB1c2hUYWdzRGlhbG9nID0gcmVxdWlyZSAnLi9kaWFsb2dzL3B1c2gtdGFncy1kaWFsb2cnXG5SZWJhc2VEaWFsb2cgPSByZXF1aXJlICcuL2RpYWxvZ3MvcmViYXNlLWRpYWxvZydcbk1pZHJlYmFzZURpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9ncy9taWRyZWJhc2UtZGlhbG9nJ1xuXG5ydW5TaGVsbCA9IChjbWQsIG91dHB1dCkgLT5cbiAgc2hlbGwgPSBjaGlsZF9wcm9jZXNzLmV4ZWNTeW5jKGNtZCwgeyBlbmNvZGluZzogJ3V0ZjgnfSkudHJpbSgpXG4gIGlmIHNoZWxsIGlzIG91dHB1dFxuICAgIHJldHVybiB0cnVlXG4gIGVsc2UgaWYgc2hlbGwgaXNudCBvdXRwdXRcbiAgICByZXR1cm4gZmFsc2VcblxuZ2l0V29ya3NwYWNlVGl0bGUgPSAnJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBHaXRDb250cm9sVmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgaWYgZ2l0LmlzSW5pdGlhbGlzZWQoKVxuICAgICAgQGRpdiBjbGFzczogJ2dpdC1jb250cm9sJywgPT5cbiAgICAgICAgQHN1YnZpZXcgJ21lbnVWaWV3JywgbmV3IE1lbnVWaWV3KClcbiAgICAgICAgQGRpdiBjbGFzczogJ2NvbnRlbnQnLCBvdXRsZXQ6ICdjb250ZW50VmlldycsID0+XG4gICAgICAgICAgQGRpdiBjbGFzczogJ3NpZGViYXInLCA9PlxuICAgICAgICAgICAgQHN1YnZpZXcgJ2ZpbGVzVmlldycsIG5ldyBGaWxlVmlldygpXG4gICAgICAgICAgICBAc3VidmlldyAnbG9jYWxCcmFuY2hWaWV3JywgbmV3IEJyYW5jaFZpZXcobmFtZTogJ0xvY2FsJywgbG9jYWw6IHRydWUpXG4gICAgICAgICAgICBAc3VidmlldyAncmVtb3RlQnJhbmNoVmlldycsIG5ldyBCcmFuY2hWaWV3KG5hbWU6ICdSZW1vdGUnKVxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdkb21haW4nLCA9PlxuICAgICAgICAgICAgQHN1YnZpZXcgJ2RpZmZWaWV3JywgbmV3IERpZmZWaWV3KClcbiAgICAgICAgICBAc3VidmlldyAncHJvamVjdERpYWxvZycsIG5ldyBQcm9qZWN0RGlhbG9nKClcbiAgICAgICAgICBAc3VidmlldyAnYnJhbmNoRGlhbG9nJywgbmV3IEJyYW5jaERpYWxvZygpXG4gICAgICAgICAgQHN1YnZpZXcgJ2NvbW1pdERpYWxvZycsIG5ldyBDb21taXREaWFsb2coKVxuICAgICAgICAgIEBzdWJ2aWV3ICdjcmVhdGV0YWdEaWFsb2cnLCBuZXcgQ3JlYXRlVGFnRGlhbG9nKClcbiAgICAgICAgICBAc3VidmlldyAnbWVyZ2VEaWFsb2cnLCBuZXcgTWVyZ2VEaWFsb2coKVxuICAgICAgICAgIEBzdWJ2aWV3ICdmbG93RGlhbG9nJywgbmV3IEZsb3dEaWFsb2coKVxuICAgICAgICAgIEBzdWJ2aWV3ICdwdXNoRGlhbG9nJywgbmV3IFB1c2hEaWFsb2coKVxuICAgICAgICAgIEBzdWJ2aWV3ICdwdXNodGFnRGlhbG9nJywgbmV3IFB1c2hUYWdzRGlhbG9nKClcbiAgICAgICAgICBAc3VidmlldyAncmViYXNlRGlhbG9nJywgbmV3IFJlYmFzZURpYWxvZygpXG4gICAgICAgICAgQHN1YnZpZXcgJ21pZHJlYmFzZURpYWxvZycsIG5ldyBNaWRyZWJhc2VEaWFsb2coKVxuICAgICAgICBAc3VidmlldyAnbG9nVmlldycsIG5ldyBMb2dWaWV3KClcbiAgICBlbHNlICNUaGlzIGlzIHNvIHRoYXQgbm8gZXJyb3IgbWVzc2FnZXMgY2FuIGJlIGNyZWF0ZWQgYnkgcHVzaGluZyBidXR0b25zIHRoYXQgYXJlIHVuYXZhaWxhYmxlLlxuICAgICAgQGRpdiBjbGFzczogJ2dpdC1jb250cm9sJywgPT5cbiAgICAgICAgQHN1YnZpZXcgJ2xvZ1ZpZXcnLCBuZXcgTG9nVmlldygpXG5cbiAgc2VyaWFsaXplOiAtPlxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgY29uc29sZS5sb2cgJ0dpdENvbnRyb2xWaWV3OiBpbml0aWFsaXplJ1xuXG4gICAgZ2l0LnNldExvZ2dlciAobG9nLCBpc2Vycm9yKSA9PiBAbG9nVmlldy5sb2cobG9nLCBpc2Vycm9yKVxuXG4gICAgQGFjdGl2ZSA9IHRydWVcbiAgICBAYnJhbmNoU2VsZWN0ZWQgPSBudWxsXG5cbiAgICBpZiAhZ2l0LmlzSW5pdGlhbGlzZWQoKVxuICAgICAgZ2l0LmFsZXJ0IFwiPiBUaGlzIHByb2plY3QgaXMgbm90IGEgZ2l0IHJlcG9zaXRvcnkuIEVpdGhlciBvcGVuIGFub3RoZXIgcHJvamVjdCBvciBjcmVhdGUgYSByZXBvc2l0b3J5LlwiXG4gICAgZWxzZVxuICAgICAgQHNldFdvcmtzcGFjZVRpdGxlKGdpdC5nZXRSZXBvc2l0b3J5KCkucGF0aC5zcGxpdCgnLycpLnJldmVyc2UoKVsxXSlcbiAgICBAdXBkYXRlKHRydWUpXG5cbiAgICByZXR1cm5cblxuICBkZXN0cm95OiAtPlxuICAgIGNvbnNvbGUubG9nICdHaXRDb250cm9sVmlldzogZGVzdHJveSdcbiAgICBAYWN0aXZlID0gZmFsc2VcbiAgICByZXR1cm5cblxuICBzZXRXb3Jrc3BhY2VUaXRsZTogKHRpdGxlKSAtPlxuICAgIGdpdFdvcmtzcGFjZVRpdGxlID0gdGl0bGVcblxuICBnZXRUaXRsZTogLT5cbiAgICByZXR1cm4gJ2dpdDpjb250cm9sJ1xuXG4gIHVwZGF0ZTogKG5vZmV0Y2gpIC0+XG4gICAgaWYgZ2l0LmlzSW5pdGlhbGlzZWQoKVxuICAgICAgQGxvYWRCcmFuY2hlcygpXG4gICAgICBAc2hvd1N0YXR1cygpXG4gICAgICBAZmlsZXNWaWV3LnNldFdvcmtzcGFjZVRpdGxlKGdpdFdvcmtzcGFjZVRpdGxlKVxuICAgICAgdW5sZXNzIG5vZmV0Y2hcbiAgICAgICAgQGZldGNoTWVudUNsaWNrKClcbiAgICAgICAgaWYgQGRpZmZWaWV3XG4gICAgICAgICAgQGRpZmZWaWV3LmNsZWFyQWxsKClcblxuICAgIHJldHVyblxuXG4gIGxvYWRMb2c6IC0+XG4gICAgZ2l0LmxvZyhAc2VsZWN0ZWRCcmFuY2gpLnRoZW4gKGxvZ3MpIC0+XG4gICAgICBjb25zb2xlLmxvZyAnZ2l0LmxvZycsIGxvZ3NcbiAgICAgIHJldHVyblxuICAgIHJldHVyblxuXG4gIGNoZWNrb3V0QnJhbmNoOiAoYnJhbmNoLCByZW1vdGUpIC0+XG4gICAgZ2l0LmNoZWNrb3V0KGJyYW5jaCwgcmVtb3RlKS50aGVuID0+IEB1cGRhdGUoKVxuICAgIHJldHVyblxuXG4gIGJyYW5jaENvdW50OiAoY291bnQpIC0+XG4gICAgaWYgZ2l0LmlzSW5pdGlhbGlzZWQoKVxuICAgICAgcmVtb3RlcyA9IGdpdC5oYXNPcmlnaW4oKVxuXG4gICAgICBAbWVudVZpZXcuYWN0aXZhdGUoJ3Vwc3RyZWFtJywgcmVtb3RlcyBhbmQgY291bnQuYmVoaW5kKVxuICAgICAgQG1lbnVWaWV3LmFjdGl2YXRlKCdkb3duc3RyZWFtJywgcmVtb3RlcyBhbmQgKGNvdW50LmFoZWFkIG9yICFnaXQuZ2V0UmVtb3RlQnJhbmNoKCkpKVxuICAgICAgQG1lbnVWaWV3LmFjdGl2YXRlKCdyZW1vdGUnLCByZW1vdGVzKVxuICAgIHJldHVyblxuXG4gIGxvYWRCcmFuY2hlczogLT5cbiAgICBpZiBnaXQuaXNJbml0aWFsaXNlZCgpXG4gICAgICBAc2VsZWN0ZWRCcmFuY2ggPSBnaXQuZ2V0TG9jYWxCcmFuY2goKVxuXG4gICAgICBnaXQuZ2V0QnJhbmNoZXMoKS50aGVuIChicmFuY2hlcykgPT5cbiAgICAgICAgQGJyYW5jaGVzID0gYnJhbmNoZXNcbiAgICAgICAgQHJlbW90ZUJyYW5jaFZpZXcuYWRkQWxsKGJyYW5jaGVzLnJlbW90ZSlcbiAgICAgICAgQGxvY2FsQnJhbmNoVmlldy5hZGRBbGwoYnJhbmNoZXMubG9jYWwsIHRydWUpXG4gICAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuXG5cbiAgc2hvd1NlbGVjdGVkRmlsZXM6IC0+XG4gICAgQG1lbnVWaWV3LmFjdGl2YXRlKCdmaWxlJywgQGZpbGVzVmlldy5oYXNTZWxlY3RlZCgpKVxuICAgIEBtZW51Vmlldy5hY3RpdmF0ZSgnZmlsZS5tZXJnaW5nJywgQGZpbGVzVmlldy5oYXNTZWxlY3RlZCgpIG9yIGdpdC5pc01lcmdpbmcoKSlcbiAgICByZXR1cm5cblxuICBzaG93U3RhdHVzOiAtPlxuICAgIGdpdC5zdGF0dXMoKS50aGVuIChmaWxlcykgPT5cbiAgICAgIEBmaWxlc1ZpZXcuYWRkQWxsKGZpbGVzKVxuICAgICAgcmV0dXJuXG4gICAgcmV0dXJuXG5cbiAgcHJvamVjdE1lbnVDbGljazogLT5cbiAgICBAcHJvamVjdERpYWxvZy5hY3RpdmF0ZSgpXG4gICAgcmV0dXJuXG5cbiAgYnJhbmNoTWVudUNsaWNrOiAtPlxuICAgIEBicmFuY2hEaWFsb2cuYWN0aXZhdGUoKVxuICAgIHJldHVyblxuXG4gIGNvbXBhcmVNZW51Q2xpY2s6IC0+XG4gICAgZ2l0LmRpZmYoQGZpbGVzVmlldy5nZXRTZWxlY3RlZCgpLmFsbC5qb2luKCcgJykpLnRoZW4gKGRpZmZzKSA9PiBAZGlmZlZpZXcuYWRkQWxsKGRpZmZzKVxuICAgIHJldHVyblxuXG4gIGNvbW1pdE1lbnVDbGljazogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBmaWxlc1ZpZXcuaGFzU2VsZWN0ZWQoKSBvciBnaXQuaXNNZXJnaW5nKClcblxuICAgIEBjb21taXREaWFsb2cuYWN0aXZhdGUoKVxuICAgIHJldHVyblxuXG4gIGNvbW1pdDogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBmaWxlc1ZpZXcuaGFzU2VsZWN0ZWQoKVxuXG4gICAgbXNnID0gQGNvbW1pdERpYWxvZy5nZXRNZXNzYWdlKClcblxuICAgIGZpbGVzID0gQGZpbGVzVmlldy5nZXRTZWxlY3RlZCgpXG4gICAgQGZpbGVzVmlldy51bnNlbGVjdEFsbCgpXG5cbiAgICBnaXQuYWRkKGZpbGVzLmFkZClcbiAgICAgIC50aGVuIC0+IGdpdC5yZW1vdmUoZmlsZXMucmVtKVxuICAgICAgLnRoZW4gLT4gZ2l0LmNvbW1pdChtc2cpXG4gICAgICAudGhlbiA9PiBAdXBkYXRlKClcbiAgICByZXR1cm5cblxuICBjcmVhdGVCcmFuY2g6IChicmFuY2gpIC0+XG4gICAgZ2l0LmNyZWF0ZUJyYW5jaChicmFuY2gpLnRoZW4gPT4gQHVwZGF0ZSgpXG4gICAgcmV0dXJuXG5cbiAgZGVsZXRlQnJhbmNoOiAoYnJhbmNoKSAtPlxuICAgIGNvbmZpcm1DYiA9IChwYXJhbXMpID0+XG4gICAgICBnaXQuZGVsZXRlQnJhbmNoKHBhcmFtcy5icmFuY2gpLnRoZW4gPT4gQHVwZGF0ZSgpXG4gICAgICByZXR1cm5cblxuICAgIGZvcmNlRGVsZXRlQ2FsbGJhY2sgPSAocGFyYW1zKSA9PlxuICAgICAgZ2l0LmZvcmNlRGVsZXRlQnJhbmNoKHBhcmFtcy5icmFuY2gpLnRoZW4gPT4gQHVwZGF0ZSgpXG5cbiAgICBAY29udGVudFZpZXcuYXBwZW5kIG5ldyBEZWxldGVEaWFsb2dcbiAgICAgIGhkcjogJ0RlbGV0ZSBCcmFuY2gnXG4gICAgICBtc2c6IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGUgbG9jYWwgYnJhbmNoICcje2JyYW5jaH0nP1wiXG4gICAgICBjYjogY29uZmlybUNiXG4gICAgICBmZENiOiBmb3JjZURlbGV0ZUNhbGxiYWNrXG4gICAgICBicmFuY2g6IGJyYW5jaFxuICAgIHJldHVyblxuXG4gIGZldGNoTWVudUNsaWNrOiAtPlxuICAgIGlmIGdpdC5pc0luaXRpYWxpc2VkKClcbiAgICAgIHJldHVybiB1bmxlc3MgZ2l0Lmhhc09yaWdpbigpXG5cbiAgICBnaXQuZmV0Y2goKS50aGVuID0+IEBsb2FkQnJhbmNoZXMoKVxuICAgIHJldHVyblxuXG4gIG1lcmdlTWVudUNsaWNrOiAtPlxuICAgIEBtZXJnZURpYWxvZy5hY3RpdmF0ZShAYnJhbmNoZXMubG9jYWwpXG4gICAgcmV0dXJuXG5cbiAgbWVyZ2U6IChicmFuY2gsbm9mZikgPT5cbiAgICBnaXQubWVyZ2UoYnJhbmNoLG5vZmYpLnRoZW4gPT4gQHVwZGF0ZSgpXG4gICAgcmV0dXJuXG5cbiAgZmxvd01lbnVDbGljazogLT5cbiAgICBAZmxvd0RpYWxvZy5hY3RpdmF0ZShAYnJhbmNoZXMubG9jYWwpXG4gICAgcmV0dXJuXG5cbiAgZmxvdzogKHR5cGUsYWN0aW9uLGJyYW5jaCkgPT5cbiAgICBnaXQuZmxvdyh0eXBlLGFjdGlvbixicmFuY2gpLnRoZW4gPT4gQHVwZGF0ZSgpXG4gICAgcmV0dXJuXG5cbiAgcHRhZ01lbnVDbGljazogLT5cbiAgICBAcHVzaHRhZ0RpYWxvZy5hY3RpdmF0ZSgpXG4gICAgcmV0dXJuXG5cbiAgcHRhZzogKHJlbW90ZSkgLT5cbiAgICBnaXQucHRhZyhyZW1vdGUpLnRoZW4gPT4gQHVwZGF0ZSh0cnVlKVxuICAgIHJldHVyblxuXG4gIHB1bGxNZW51Q2xpY2s6IC0+XG4gICAgZ2l0LnB1bGwoKS50aGVuID0+IEB1cGRhdGUodHJ1ZSlcbiAgICByZXR1cm5cblxuICBwdWxsdXBNZW51Q2xpY2s6IC0+XG4gICAgZ2l0LnB1bGx1cCgpLnRoZW4gPT4gQHVwZGF0ZSh0cnVlKVxuICAgIHJldHVyblxuXG4gIHB1c2hNZW51Q2xpY2s6IC0+XG4gICAgZ2l0LmdldEJyYW5jaGVzKCkudGhlbiAoYnJhbmNoZXMpID0+ICBAcHVzaERpYWxvZy5hY3RpdmF0ZShicmFuY2hlcy5yZW1vdGUpXG4gICAgcmV0dXJuXG5cbiAgcHVzaDogKHJlbW90ZSwgYnJhbmNoZXMsIGZvcmNlKSAtPlxuICAgIGdpdC5wdXNoKHJlbW90ZSxicmFuY2hlcyxmb3JjZSkudGhlbiA9PiBAdXBkYXRlKClcblxuICByZWJhc2VNZW51Q2xpY2s6IC0+XG4gICAgY2hlY2sgPSBydW5TaGVsbCgnbHMgYGdpdCByZXYtcGFyc2UgLS1naXQtZGlyYCB8IGdyZXAgcmViYXNlIHx8IGVjaG8gbm9yZWJhc2UnLCdub3JlYmFzZScpXG4gICAgaWYgY2hlY2sgaXMgdHJ1ZVxuICAgICAgQHJlYmFzZURpYWxvZy5hY3RpdmF0ZShAYnJhbmNoZXMubG9jYWwpXG4gICAgZWxzZSBpZiBjaGVjayBpcyBmYWxzZVxuICAgICAgQG1pZHJlYmFzZURpYWxvZy5hY3RpdmF0ZSgpXG4gICAgcmV0dXJuXG5cbiAgcmViYXNlOiAoYnJhbmNoKSA9PlxuICAgIGdpdC5yZWJhc2UoYnJhbmNoKS50aGVuID0+IEB1cGRhdGUoKVxuICAgIHJldHVyblxuXG4gIG1pZHJlYmFzZTogKGNvbnRpbiwgYWJvcnQsIHNraXApID0+XG4gICAgZ2l0Lm1pZHJlYmFzZShjb250aW4sYWJvcnQsc2tpcCkudGhlbiA9PiBAdXBkYXRlKClcbiAgICByZXR1cm5cblxuICByZXNldE1lbnVDbGljazogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBmaWxlc1ZpZXcuaGFzU2VsZWN0ZWQoKVxuXG4gICAgZmlsZXMgPSBAZmlsZXNWaWV3LmdldFNlbGVjdGVkKClcblxuICAgIGF0b20uY29uZmlybVxuICAgICAgbWVzc2FnZTogXCJSZXNldCB3aWxsIGVyYXNlIGNoYW5nZXMgc2luY2UgdGhlIGxhc3QgY29tbWl0IGluIHRoZSBzZWxlY3RlZCBmaWxlcy4gQXJlIHlvdSBzdXJlP1wiXG4gICAgICBidXR0b25zOlxuICAgICAgICBDYW5jZWw6ID0+XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIFJlc2V0OiA9PlxuICAgICAgICAgIGdpdC5yZXNldChmaWxlcy5hbGwpLnRoZW4gPT4gQHVwZGF0ZSgpXG4gICAgICAgICAgcmV0dXJuXG5cbiAgdGFnTWVudUNsaWNrOiAtPlxuICAgIEBjcmVhdGV0YWdEaWFsb2cuYWN0aXZhdGUoKVxuICAgIHJldHVyblxuXG4gIHRhZzogKG5hbWUsIGhyZWYsIG1zZykgPT5cbiAgICBnaXQudGFnKG5hbWUsIGhyZWYsIG1zZykudGhlbiA9PiBAdXBkYXRlKClcbiAgICByZXR1cm5cbiJdfQ==
