(function() {
  var CommitDialog, Dialog,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require('./dialog');

  module.exports = CommitDialog = (function(superClass) {
    extend(CommitDialog, superClass);

    function CommitDialog() {
      return CommitDialog.__super__.constructor.apply(this, arguments);
    }

    CommitDialog.content = function() {
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
            return _this.strong('Commit');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Commit Message');
            return _this.textarea({
              "class": 'native-key-bindings',
              outlet: 'msg',
              keyUp: 'colorLength'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'commit'
            }, function() {
              _this.i({
                "class": 'icon commit'
              });
              return _this.span('Commit');
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

    CommitDialog.prototype.activate = function() {
      CommitDialog.__super__.activate.call(this);
      this.msg.val('');
      this.msg.focus();
    };

    CommitDialog.prototype.colorLength = function() {
      var i, j, len, line, ref, too_long;
      too_long = false;
      ref = this.msg.val().split("\n");
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        line = ref[i];
        if ((i === 0 && line.length > 50) || (i > 0 && line.length > 80)) {
          too_long = true;
          break;
        }
      }
      if (too_long) {
        this.msg.addClass('over-fifty');
      } else {
        this.msg.removeClass('over-fifty');
      }
    };

    CommitDialog.prototype.commit = function() {
      this.deactivate();
      this.parentView.commit();
    };

    CommitDialog.prototype.getMessage = function() {
      return (this.msg.val()) + " ";
    };

    return CommitDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL2NvbW1pdC1kaWFsb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvQkFBQTtJQUFBOzs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7T0FBTCxFQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDcEIsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLENBQUQsQ0FBRztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sa0JBQVA7Y0FBMkIsS0FBQSxFQUFPLFFBQWxDO2FBQUg7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSO1VBRnFCLENBQXZCO1VBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUE7WUFDbEIsS0FBQyxDQUFBLEtBQUQsQ0FBTyxnQkFBUDttQkFDQSxLQUFDLENBQUEsUUFBRCxDQUFVO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxxQkFBUDtjQUE4QixNQUFBLEVBQVEsS0FBdEM7Y0FBNkMsS0FBQSxFQUFPLGFBQXBEO2FBQVY7VUFGa0IsQ0FBcEI7aUJBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUE7WUFDckIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtjQUFpQixLQUFBLEVBQU8sUUFBeEI7YUFBUixFQUEwQyxTQUFBO2NBQ3hDLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOO1lBRndDLENBQTFDO21CQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxLQUFBLEVBQU8sUUFBUDthQUFSLEVBQXlCLFNBQUE7Y0FDdkIsS0FBQyxDQUFBLENBQUQsQ0FBRztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7ZUFBSDtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLFFBQU47WUFGdUIsQ0FBekI7VUFKcUIsQ0FBdkI7UUFQb0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRFE7OzJCQWdCVixRQUFBLEdBQVUsU0FBQTtNQUNSLHlDQUFBO01BQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFMLENBQVMsRUFBVDtNQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFBO0lBSFE7OzJCQU1WLFdBQUEsR0FBYSxTQUFBO0FBQ1gsVUFBQTtNQUFBLFFBQUEsR0FBVztBQUNYO0FBQUEsV0FBQSw2Q0FBQTs7UUFDRSxJQUFHLENBQUMsQ0FBQSxLQUFLLENBQUwsSUFBVSxJQUFJLENBQUMsTUFBTCxHQUFjLEVBQXpCLENBQUEsSUFBZ0MsQ0FBQyxDQUFBLEdBQUksQ0FBSixJQUFTLElBQUksQ0FBQyxNQUFMLEdBQWMsRUFBeEIsQ0FBbkM7VUFDRSxRQUFBLEdBQVc7QUFDWCxnQkFGRjs7QUFERjtNQUtBLElBQUcsUUFBSDtRQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLFlBQWQsRUFERjtPQUFBLE1BQUE7UUFHRSxJQUFDLENBQUEsR0FBRyxDQUFDLFdBQUwsQ0FBaUIsWUFBakIsRUFIRjs7SUFQVzs7MkJBYWIsTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQUE7SUFGTTs7MkJBS1IsVUFBQSxHQUFZLFNBQUE7QUFDVixhQUFTLENBQUMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUFMLENBQUEsQ0FBRCxDQUFBLEdBQVk7SUFEWDs7OztLQXpDYTtBQUgzQiIsInNvdXJjZXNDb250ZW50IjpbIkRpYWxvZyA9IHJlcXVpcmUgJy4vZGlhbG9nJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDb21taXREaWFsb2cgZXh0ZW5kcyBEaWFsb2dcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ2RpYWxvZycsID0+XG4gICAgICBAZGl2IGNsYXNzOiAnaGVhZGluZycsID0+XG4gICAgICAgIEBpIGNsYXNzOiAnaWNvbiB4IGNsaWNrYWJsZScsIGNsaWNrOiAnY2FuY2VsJ1xuICAgICAgICBAc3Ryb25nICdDb21taXQnXG4gICAgICBAZGl2IGNsYXNzOiAnYm9keScsID0+XG4gICAgICAgIEBsYWJlbCAnQ29tbWl0IE1lc3NhZ2UnXG4gICAgICAgIEB0ZXh0YXJlYSBjbGFzczogJ25hdGl2ZS1rZXktYmluZGluZ3MnLCBvdXRsZXQ6ICdtc2cnLCBrZXlVcDogJ2NvbG9yTGVuZ3RoJ1xuICAgICAgQGRpdiBjbGFzczogJ2J1dHRvbnMnLCA9PlxuICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYWN0aXZlJywgY2xpY2s6ICdjb21taXQnLCA9PlxuICAgICAgICAgIEBpIGNsYXNzOiAnaWNvbiBjb21taXQnXG4gICAgICAgICAgQHNwYW4gJ0NvbW1pdCdcbiAgICAgICAgQGJ1dHRvbiBjbGljazogJ2NhbmNlbCcsID0+XG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIHgnXG4gICAgICAgICAgQHNwYW4gJ0NhbmNlbCdcblxuICBhY3RpdmF0ZTogLT5cbiAgICBzdXBlcigpXG4gICAgQG1zZy52YWwoJycpXG4gICAgQG1zZy5mb2N1cygpXG4gICAgcmV0dXJuXG5cbiAgY29sb3JMZW5ndGg6IC0+XG4gICAgdG9vX2xvbmcgPSBmYWxzZVxuICAgIGZvciBsaW5lLCBpIGluIEBtc2cudmFsKCkuc3BsaXQoXCJcXG5cIilcbiAgICAgIGlmIChpID09IDAgJiYgbGluZS5sZW5ndGggPiA1MCkgfHwgKGkgPiAwICYmIGxpbmUubGVuZ3RoID4gODApXG4gICAgICAgIHRvb19sb25nID0gdHJ1ZVxuICAgICAgICBicmVha1xuXG4gICAgaWYgdG9vX2xvbmdcbiAgICAgIEBtc2cuYWRkQ2xhc3MoJ292ZXItZmlmdHknKVxuICAgIGVsc2VcbiAgICAgIEBtc2cucmVtb3ZlQ2xhc3MoJ292ZXItZmlmdHknKVxuICAgIHJldHVyblxuXG4gIGNvbW1pdDogLT5cbiAgICBAZGVhY3RpdmF0ZSgpXG4gICAgQHBhcmVudFZpZXcuY29tbWl0KClcbiAgICByZXR1cm5cblxuICBnZXRNZXNzYWdlOiAtPlxuICAgIHJldHVybiBcIiN7QG1zZy52YWwoKX0gXCJcbiJdfQ==
