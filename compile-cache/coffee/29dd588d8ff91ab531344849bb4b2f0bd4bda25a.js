(function() {
  var AtomGist, CompositeDisposable, GistClient, GistListView, InputDialog, fs, ref, showError, untildify;

  fs = require('fs');

  InputDialog = require('@aki77/atom-input-dialog');

  untildify = require('untildify');

  CompositeDisposable = require('atom').CompositeDisposable;

  showError = require('./helper').showError;

  ref = [], GistListView = ref[0], GistClient = ref[1];

  module.exports = AtomGist = {
    subscriptions: null,
    client: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
        'gist:create-public': (function(_this) {
          return function(arg) {
            var currentTarget;
            currentTarget = arg.currentTarget;
            return _this.create(currentTarget.getModel(), true);
          };
        })(this),
        'gist:create-private': (function(_this) {
          return function(arg) {
            var currentTarget;
            currentTarget = arg.currentTarget;
            return _this.create(currentTarget.getModel());
          };
        })(this),
        'gist:list': (function(_this) {
          return function(arg) {
            var currentTarget;
            currentTarget = arg.currentTarget;
            return _this.list(currentTarget.getModel());
          };
        })(this)
      }));
      return this.subscriptions.add(atom.config.onDidChange('gist', (function(_this) {
        return function() {
          return _this.resetInstance();
        };
      })(this)));
    },
    deactivate: function() {
      this.subscriptions.dispose();
      return this.resetInstance();
    },
    create: function(editor, isPublic) {
      var content, filename, scopeName;
      if (isPublic == null) {
        isPublic = false;
      }
      if (!editor) {
        return;
      }
      content = editor.getSelectedText();
      if (content.length === 0) {
        content = editor.getText();
      }
      if (content.length === 0) {
        return;
      }
      scopeName = editor.getGrammar().scopeName;
      filename = editor.getTitle();
      return this.showDialog({
        prompt: 'filename',
        defaultText: filename,
        selectedRange: [[0, 0], [0, filename.lastIndexOf('.')]]
      }).then((function(_this) {
        return function(_filename) {
          filename = _filename;
          return _this.showDialog({
            prompt: 'A description of the gist.',
            validate: function() {}
          });
        };
      })(this)).then((function(_this) {
        return function(description) {
          var files;
          files = {};
          files[filename] = {
            content: content
          };
          return _this.getClient().create({
            description: description,
            files: files,
            "public": isPublic
          });
        };
      })(this)).then(function(gist) {
        atom.clipboard.write(gist.html_url);
        return atom.notifications.addSuccess('All done!', {
          detail: "Copied to clipboard: " + gist.html_url
        });
      })["catch"](showError);
    },
    list: function(editor) {
      if (!editor) {
        return;
      }
      return this.getListView().toggle();
    },
    showDialog: function(options) {
      if (options == null) {
        options = {};
      }
      return new Promise(function(resolve, reject) {
        options.callback = resolve;
        return new InputDialog(options).attach();
      });
    },
    getToken: function() {
      var environmentName, ref1, token, tokenFile;
      environmentName = atom.config.get('gist.environmentName');
      if (process.env[environmentName] != null) {
        return process.env[environmentName];
      }
      tokenFile = atom.config.get('gist.tokenFile');
      if (tokenFile.length > 0) {
        tokenFile = untildify(tokenFile);
        if (fs.existsSync(tokenFile)) {
          return token = (ref1 = fs.readFileSync(tokenFile, {
            encoding: 'utf8'
          })) != null ? ref1.trim() : void 0;
        }
      }
      return atom.config.get('gist.token');
    },
    getHostname: function() {
      return atom.config.get('gist.hostname');
    },
    getListView: function() {
      if (GistListView == null) {
        GistListView = require('./gist-list-view');
      }
      return this.view != null ? this.view : this.view = new GistListView(this.getClient());
    },
    getClient: function() {
      if (GistClient == null) {
        GistClient = require('./gist-client');
      }
      if (this.client == null) {
        this.client = new GistClient(this.getToken(), this.getHostname());
        if (atom.config.get('gist.debug')) {
          console.log("gist token: " + this.client.token);
        }
        if (atom.config.get('gist.debug')) {
          console.log("gist hostname: " + this.client.hostname);
        }
      }
      return this.client;
    },
    resetInstance: function() {
      var ref1, ref2;
      if ((ref1 = this.client) != null) {
        ref1.destroy();
      }
      this.client = null;
      if ((ref2 = this.view) != null) {
        ref2.destroy();
      }
      return this.view = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpc3QvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsV0FBQSxHQUFjLE9BQUEsQ0FBUSwwQkFBUjs7RUFDZCxTQUFBLEdBQVksT0FBQSxDQUFRLFdBQVI7O0VBQ1gsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN2QixZQUFhLE9BQUEsQ0FBUSxVQUFSOztFQUNkLE1BQTZCLEVBQTdCLEVBQUMscUJBQUQsRUFBZTs7RUFFZixNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFBLEdBQ2Y7SUFBQSxhQUFBLEVBQWUsSUFBZjtJQUNBLE1BQUEsRUFBUSxJQURSO0lBR0EsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFFckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQiw4QkFBbEIsRUFDakI7UUFBQSxvQkFBQSxFQUFzQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEdBQUQ7QUFBcUIsZ0JBQUE7WUFBbkIsZ0JBQUQ7bUJBQW9CLEtBQUMsQ0FBQSxNQUFELENBQVEsYUFBYSxDQUFDLFFBQWQsQ0FBQSxDQUFSLEVBQWtDLElBQWxDO1VBQXJCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtRQUNBLHFCQUFBLEVBQXVCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsR0FBRDtBQUFxQixnQkFBQTtZQUFuQixnQkFBRDttQkFBb0IsS0FBQyxDQUFBLE1BQUQsQ0FBUSxhQUFhLENBQUMsUUFBZCxDQUFBLENBQVI7VUFBckI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRHZCO1FBRUEsV0FBQSxFQUFhLENBQUEsU0FB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QUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsWUFBaEIsQ0FBOUM7VUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQUEsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQW5DLEVBQUE7O1FBQ0EsSUFBb0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLFlBQWhCLENBQXBEO1VBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQkFBQSxHQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQXRDLEVBQUE7U0FIRjs7YUFJQSxJQUFDLENBQUE7SUFOUSxDQWxGWDtJQTBGQSxhQUFBLEVBQWUsU0FBQTtBQUNiLFVBQUE7O1lBQU8sQ0FBRSxPQUFULENBQUE7O01BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTs7WUFFTCxDQUFFLE9BQVAsQ0FBQTs7YUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0lBTEssQ0ExRmY7O0FBUkYiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzJ1xuSW5wdXREaWFsb2cgPSByZXF1aXJlICdAYWtpNzcvYXRvbS1pbnB1dC1kaWFsb2cnXG51bnRpbGRpZnkgPSByZXF1aXJlICd1bnRpbGRpZnknXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue3Nob3dFcnJvcn0gPSByZXF1aXJlICcuL2hlbHBlcidcbltHaXN0TGlzdFZpZXcsIEdpc3RDbGllbnRdID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSBBdG9tR2lzdCA9XG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgY2xpZW50OiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLFxuICAgICAgJ2dpc3Q6Y3JlYXRlLXB1YmxpYyc6ICh7Y3VycmVudFRhcmdldH0pID0+IEBjcmVhdGUoY3VycmVudFRhcmdldC5nZXRNb2RlbCgpLCB0cnVlKVxuICAgICAgJ2dpc3Q6Y3JlYXRlLXByaXZhdGUnOiAoe2N1cnJlbnRUYXJnZXR9KSA9PiBAY3JlYXRlKGN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKSlcbiAgICAgICdnaXN0Omxpc3QnOiAoe2N1cnJlbnRUYXJnZXR9KSA9PiBAbGlzdChjdXJyZW50VGFyZ2V0LmdldE1vZGVsKCkpXG4gICAgKSlcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnZ2lzdCcsID0+XG4gICAgICBAcmVzZXRJbnN0YW5jZSgpXG4gICAgKSlcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEByZXNldEluc3RhbmNlKClcblxuICBjcmVhdGU6IChlZGl0b3IsIGlzUHVibGljID0gZmFsc2UpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3JcblxuICAgIGNvbnRlbnQgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KClcbiAgICBjb250ZW50ID0gZWRpdG9yLmdldFRleHQoKSBpZiBjb250ZW50Lmxlbmd0aCBpcyAwXG4gICAgcmV0dXJuIGlmIGNvbnRlbnQubGVuZ3RoIGlzIDBcblxuICAgIHtzY29wZU5hbWV9ID0gZWRpdG9yLmdldEdyYW1tYXIoKVxuICAgIGZpbGVuYW1lID0gZWRpdG9yLmdldFRpdGxlKClcblxuICAgIEBzaG93RGlhbG9nKFxuICAgICAgcHJvbXB0OiAnZmlsZW5hbWUnXG4gICAgICBkZWZhdWx0VGV4dDogZmlsZW5hbWVcbiAgICAgIHNlbGVjdGVkUmFuZ2U6IFtbMCwgMF0sIFswLCBmaWxlbmFtZS5sYXN0SW5kZXhPZignLicpXV1cbiAgICApLnRoZW4oKF9maWxlbmFtZSkgPT5cbiAgICAgIGZpbGVuYW1lID0gX2ZpbGVuYW1lXG4gICAgICBAc2hvd0RpYWxvZyhcbiAgICAgICAgcHJvbXB0OiAnQSBkZXNjcmlwdGlvbiBvZiB0aGUgZ2lzdC4nXG4gICAgICAgIHZhbGlkYXRlOiAtPlxuICAgICAgKVxuICAgICkudGhlbigoZGVzY3JpcHRpb24pID0+XG4gICAgICBmaWxlcyA9IHt9XG4gICAgICBmaWxlc1tmaWxlbmFtZV0gPSB7Y29udGVudH1cblxuICAgICAgQGdldENsaWVudCgpLmNyZWF0ZSh7XG4gICAgICAgIGRlc2NyaXB0aW9uLCBmaWxlc1xuICAgICAgICBwdWJsaWM6IGlzUHVibGljXG4gICAgICB9KVxuICAgICkudGhlbigoZ2lzdCkgLT5cbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGdpc3QuaHRtbF91cmwpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcygnQWxsIGRvbmUhJywgZGV0YWlsOiBcIkNvcGllZCB0byBjbGlwYm9hcmQ6ICN7Z2lzdC5odG1sX3VybH1cIilcbiAgICApLmNhdGNoKHNob3dFcnJvcilcblxuICBsaXN0OiAoZWRpdG9yKSAtPlxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yXG4gICAgQGdldExpc3RWaWV3KCkudG9nZ2xlKClcblxuICBzaG93RGlhbG9nOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICBvcHRpb25zLmNhbGxiYWNrID0gcmVzb2x2ZVxuICAgICAgbmV3IElucHV0RGlhbG9nKG9wdGlvbnMpLmF0dGFjaCgpXG4gICAgKVxuXG4gIGdldFRva2VuOiAtPlxuICAgIGVudmlyb25tZW50TmFtZSA9IGF0b20uY29uZmlnLmdldCgnZ2lzdC5lbnZpcm9ubWVudE5hbWUnKVxuICAgIHJldHVybiBwcm9jZXNzLmVudltlbnZpcm9ubWVudE5hbWVdIGlmIHByb2Nlc3MuZW52W2Vudmlyb25tZW50TmFtZV0/XG5cbiAgICB0b2tlbkZpbGUgPSBhdG9tLmNvbmZpZy5nZXQoJ2dpc3QudG9rZW5GaWxlJylcbiAgICBpZiB0b2tlbkZpbGUubGVuZ3RoID4gMFxuICAgICAgdG9rZW5GaWxlID0gdW50aWxkaWZ5KHRva2VuRmlsZSlcbiAgICAgIGlmIGZzLmV4aXN0c1N5bmModG9rZW5GaWxlKVxuICAgICAgICByZXR1cm4gdG9rZW4gPSBmcy5yZWFkRmlsZVN5bmModG9rZW5GaWxlLCBlbmNvZGluZzogJ3V0ZjgnKT8udHJpbSgpXG5cbiAgICBhdG9tLmNvbmZpZy5nZXQoJ2dpc3QudG9rZW4nKVxuXG4gIGdldEhvc3RuYW1lOiAtPlxuICAgIGF0b20uY29uZmlnLmdldCgnZ2lzdC5ob3N0bmFtZScpXG5cbiAgZ2V0TGlzdFZpZXc6IC0+XG4gICAgR2lzdExpc3RWaWV3ID89IHJlcXVpcmUgJy4vZ2lzdC1saXN0LXZpZXcnXG4gICAgQHZpZXcgPz0gbmV3IEdpc3RMaXN0VmlldyhAZ2V0Q2xpZW50KCkpXG5cbiAgZ2V0Q2xpZW50OiAtPlxuICAgIEdpc3RDbGllbnQgPz0gcmVxdWlyZSAnLi9naXN0LWNsaWVudCdcbiAgICB1bmxlc3MgQGNsaWVudD9cbiAgICAgIEBjbGllbnQgPSBuZXcgR2lzdENsaWVudChAZ2V0VG9rZW4oKSwgQGdldEhvc3RuYW1lKCkpXG4gICAgICBjb25zb2xlLmxvZyBcImdpc3QgdG9rZW46ICN7QGNsaWVudC50b2tlbn1cIiBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpc3QuZGVidWcnKVxuICAgICAgY29uc29sZS5sb2cgXCJnaXN0IGhvc3RuYW1lOiAje0BjbGllbnQuaG9zdG5hbWV9XCIgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXN0LmRlYnVnJylcbiAgICBAY2xpZW50XG5cbiAgcmVzZXRJbnN0YW5jZTogLT5cbiAgICBAY2xpZW50Py5kZXN0cm95KClcbiAgICBAY2xpZW50ID0gbnVsbFxuXG4gICAgQHZpZXc/LmRlc3Ryb3koKVxuICAgIEB2aWV3ID0gbnVsbFxuIl19
