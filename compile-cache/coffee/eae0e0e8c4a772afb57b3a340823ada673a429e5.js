(function() {
  var Dialog, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;

  module.exports = Dialog = (function(superClass) {
    extend(Dialog, superClass);

    function Dialog() {
      return Dialog.__super__.constructor.apply(this, arguments);
    }

    Dialog.prototype.activate = function() {
      this.addClass('active');
    };

    Dialog.prototype.deactivate = function() {
      this.removeClass('active');
    };

    Dialog.prototype.cancel = function() {
      this.deactivate();
    };

    return Dialog;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpdC1jb250cm9sL2xpYi9kaWFsb2dzL2RpYWxvZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLFlBQUE7SUFBQTs7O0VBQUMsT0FBUSxPQUFBLENBQVEsc0JBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztxQkFDSixRQUFBLEdBQVUsU0FBQTtNQUNSLElBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtJQURROztxQkFJVixVQUFBLEdBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxXQUFELENBQWEsUUFBYjtJQURVOztxQkFJWixNQUFBLEdBQVEsU0FBQTtNQUNOLElBQUMsQ0FBQSxVQUFELENBQUE7SUFETTs7OztLQVRXO0FBSHJCIiwic291cmNlc0NvbnRlbnQiOlsie1ZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIERpYWxvZyBleHRlbmRzIFZpZXdcbiAgYWN0aXZhdGU6IC0+XG4gICAgQGFkZENsYXNzKCdhY3RpdmUnKVxuICAgIHJldHVyblxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgIHJldHVyblxuXG4gIGNhbmNlbDogLT5cbiAgICBAZGVhY3RpdmF0ZSgpXG4gICAgcmV0dXJuXG4iXX0=
