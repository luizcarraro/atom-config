(function() {
  var showError;

  showError = function(error) {
    return atom.notifications.addError(error.toString(), {
      dismissable: true
    });
  };

  module.exports = {
    showError: showError
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpc3QvbGliL2hlbHBlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFNBQUEsR0FBWSxTQUFDLEtBQUQ7V0FDVixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBNUIsRUFBOEM7TUFBQSxXQUFBLEVBQWEsSUFBYjtLQUE5QztFQURVOztFQUdaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQUMsV0FBQSxTQUFEOztBQUhqQiIsInNvdXJjZXNDb250ZW50IjpbInNob3dFcnJvciA9IChlcnJvcikgLT5cbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGVycm9yLnRvU3RyaW5nKCksIGRpc21pc3NhYmxlOiB0cnVlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtzaG93RXJyb3J9XG4iXX0=
