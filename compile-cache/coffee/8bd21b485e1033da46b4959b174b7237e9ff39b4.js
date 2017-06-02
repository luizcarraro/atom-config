(function() {
  var Dialog, PushDialog, git,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = PushDialog = (function(superClass) {
    extend(PushDialog, superClass);

    function PushDialog() {
      return PushDialog.__super__.constructor.apply(this, arguments);
    }

    PushDialog.content = function() {
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
            return _this.strong('Push');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.div(function() {
              return _this.button({
                click: 'upstream'
              }, function() {
                return _this.p('Push upstream', function() {
                  return _this.i({
                    "class": 'icon push'
                  });
                });
              });
            });
            _this.label('Push from branch');
            _this.input({
              "class": 'native-key-bindings',
              readonly: true,
              outlet: 'fromBranch'
            });
            _this.label('To branch');
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'toBranch'
            });
            return _this.div(function() {
              _this.label('Force Push');
              return _this.input({
                type: 'checkbox',
                "class": 'checkbox',
                outlet: 'force'
              });
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'push'
            }, function() {
              _this.i({
                "class": 'icon push'
              });
              return _this.span('Push');
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

    PushDialog.prototype.activate = function(remotes) {
      var i, len, remote;
      this.fromBranch.val(git.getLocalBranch());
      this.toBranch.find('option').remove();
      this.toBranch.append("<option value='origin'>origin</option>");
      for (i = 0, len = remotes.length; i < len; i++) {
        remote = remotes[i];
        this.toBranch.append("<option value='" + remote + "'>" + remote + "</option>");
      }
      return PushDialog.__super__.activate.call(this);
    };

    PushDialog.prototype.push = function() {
      var branch, remote;
      this.deactivate();
      remote = this.toBranch.val().split('/')[0];
      branch = git.getLocalBranch();
      this.parentView.push(remote, branch, this.Force());
    };

    PushDialog.prototype.upstream = function() {
      this.deactivate();
      return this.parentView.push('', '');
    };

    PushDialog.prototype.Force = function() {
      return this.force.is(':checked');
    };

    return PushDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL3B1c2gtZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUNULEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNwQixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQTtZQUNyQixLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxrQkFBUDtjQUEwQixLQUFBLEVBQU8sUUFBakM7YUFBSDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLE1BQVI7VUFGcUIsQ0FBdkI7VUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQTtZQUNsQixLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUE7cUJBQ0gsS0FBQyxDQUFBLE1BQUQsQ0FBUTtnQkFBQSxLQUFBLEVBQU8sVUFBUDtlQUFSLEVBQTBCLFNBQUE7dUJBQ3hCLEtBQUMsQ0FBQSxDQUFELENBQUcsZUFBSCxFQUFvQixTQUFBO3lCQUNsQixLQUFDLENBQUEsQ0FBRCxDQUFHO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sV0FBUDttQkFBSDtnQkFEa0IsQ0FBcEI7Y0FEd0IsQ0FBMUI7WUFERyxDQUFM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ZSAnLi4vZ2l0J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQdXNoRGlhbG9nIGV4dGVuZHMgRGlhbG9nXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdkaWFsb2cnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcnLCA9PlxuICAgICAgICBAaSBjbGFzczogJ2ljb24geCBjbGlja2FibGUnLGNsaWNrOiAnY2FuY2VsJ1xuICAgICAgICBAc3Ryb25nICdQdXNoJ1xuICAgICAgQGRpdiBjbGFzczogJ2JvZHknLCA9PlxuICAgICAgICBAZGl2ID0+XG4gICAgICAgICAgQGJ1dHRvbiBjbGljazogJ3Vwc3RyZWFtJyw9PlxuICAgICAgICAgICAgQHAgJ1B1c2ggdXBzdHJlYW0nLCA9PlxuICAgICAgICAgICAgICBAaSBjbGFzczogJ2ljb24gcHVzaCdcbiAgICAgICAgQGxhYmVsICdQdXNoIGZyb20gYnJhbmNoJ1xuICAgICAgICBAaW5wdXQgY2xhc3M6ICduYXRpdmUta2V5LWJpbmRpbmdzJyxyZWFkb25seTogdHJ1ZSxvdXRsZXQ6ICdmcm9tQnJhbmNoJ1xuICAgICAgICBAbGFiZWwgJ1RvIGJyYW5jaCdcbiAgICAgICAgQHNlbGVjdCBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLG91dGxldDogJ3RvQnJhbmNoJ1xuICAgICAgICBAZGl2ID0+XG4gICAgICAgICAgQGxhYmVsICdGb3JjZSBQdXNoJ1xuICAgICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLGNsYXNzOiAnY2hlY2tib3gnLG91dGxldDogJ2ZvcmNlJ1xuICAgICAgQGRpdiBjbGFzczogJ2J1dHRvbnMnLCA9PlxuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYWN0aXZlJywgY2xpY2s6ICdwdXNoJywgPT5cbiAgICAgICAgICBAaSBjbGFzczogJ2ljb24gcHVzaCdcbiAgICAgICAgICBAc3BhbiAnUHVzaCdcbiAgICAgICAgQGJ1dHRvbiBjbGljazogJ2NhbmNlbCcsID0+XG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIHgnXG4gICAgICAgICAgQHNwYW4gJ0NhbmNlbCdcblxuICBhY3RpdmF0ZTogKHJlbW90ZXMpIC0+XG4gICAgQGZyb21CcmFuY2gudmFsKGdpdC5nZXRMb2NhbEJyYW5jaCgpKVxuICAgIEB0b0JyYW5jaC5maW5kKCdvcHRpb24nKS5yZW1vdmUoKVxuICAgICMgYWRkIHNpbXBsZSBvcmlnaW4gYnJhbmNoXG4gICAgQHRvQnJhbmNoLmFwcGVuZCBcIjxvcHRpb24gdmFsdWU9J29yaWdpbic+b3JpZ2luPC9vcHRpb24+XCJcbiAgICBmb3IgcmVtb3RlIGluIHJlbW90ZXNcbiAgICAgIEB0b0JyYW5jaC5hcHBlbmQgXCI8b3B0aW9uIHZhbHVlPScje3JlbW90ZX0nPiN7cmVtb3RlfTwvb3B0aW9uPlwiXG4gICAgcmV0dXJuIHN1cGVyKClcblxuICBwdXNoOiAtPlxuICAgIEBkZWFjdGl2YXRlKClcbiAgICByZW1vdGUgPSBAdG9CcmFuY2gudmFsKCkuc3BsaXQoJy8nKVswXVxuICAgICMgYnJhbmNoID0gQHRvQnJhbmNoLnZhbCgpLnNwbGl0KCcvJylbMV1cbiAgICBicmFuY2ggPSBnaXQuZ2V0TG9jYWxCcmFuY2goKVxuICAgIEBwYXJlbnRWaWV3LnB1c2gocmVtb3RlLGJyYW5jaCxARm9yY2UoKSlcbiAgICByZXR1cm5cblxuICB1cHN0cmVhbTogLT5cbiAgICBAZGVhY3RpdmF0ZSgpXG4gICAgQHBhcmVudFZpZXcucHVzaCgnJywnJylcblxuICBGb3JjZTogLT5cbiAgICByZXR1cm4gQGZvcmNlLmlzKCc6Y2hlY2tlZCcpXG4iXX0=
