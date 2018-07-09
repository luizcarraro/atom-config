function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

'use babel';

function findRepo(currentPath) {
  var lastPath = undefined;
  while (currentPath && lastPath !== currentPath) {
    lastPath = currentPath;
    currentPath = _path2['default'].dirname(currentPath);

    var repoPath = _path2['default'].join(currentPath, '.git');

    if (_fs2['default'].existsSync(repoPath)) {
      return repoPath;
    }
  }

  return null;
}

module.exports = findRepo;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvdXRpbHMvZmluZC1yZXBvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O29CQUVpQixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7QUFIbkIsV0FBVyxDQUFBOztBQUtYLFNBQVMsUUFBUSxDQUFFLFdBQVcsRUFBRTtBQUM5QixNQUFJLFFBQVEsWUFBQSxDQUFBO0FBQ1osU0FBTyxXQUFXLElBQUksUUFBUSxLQUFLLFdBQVcsRUFBRTtBQUM5QyxZQUFRLEdBQUcsV0FBVyxDQUFBO0FBQ3RCLGVBQVcsR0FBRyxrQkFBSyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7O0FBRXZDLFFBQU0sUUFBUSxHQUFHLGtCQUFLLElBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUE7O0FBRS9DLFFBQUksZ0JBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzNCLGFBQU8sUUFBUSxDQUFBO0tBQ2hCO0dBQ0Y7O0FBRUQsU0FBTyxJQUFJLENBQUE7Q0FDWjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQSIsImZpbGUiOiIvaG9tZS9sdWl6LmNhcnJhcm8vLmF0b20vcGFja2FnZXMvYmxhbWUvbGliL3V0aWxzL2ZpbmQtcmVwby5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5cbmZ1bmN0aW9uIGZpbmRSZXBvIChjdXJyZW50UGF0aCkge1xuICBsZXQgbGFzdFBhdGhcbiAgd2hpbGUgKGN1cnJlbnRQYXRoICYmIGxhc3RQYXRoICE9PSBjdXJyZW50UGF0aCkge1xuICAgIGxhc3RQYXRoID0gY3VycmVudFBhdGhcbiAgICBjdXJyZW50UGF0aCA9IHBhdGguZGlybmFtZShjdXJyZW50UGF0aClcblxuICAgIGNvbnN0IHJlcG9QYXRoID0gcGF0aC5qb2luKGN1cnJlbnRQYXRoLCAnLmdpdCcpXG5cbiAgICBpZiAoZnMuZXhpc3RzU3luYyhyZXBvUGF0aCkpIHtcbiAgICAgIHJldHVybiByZXBvUGF0aFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmluZFJlcG9cbiJdfQ==