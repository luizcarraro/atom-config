function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _utilsPickForPath = require('../../utils/pick-for-path');

var _utilsPickForPath2 = _interopRequireDefault(_utilsPickForPath);

'use babel';

module.exports = function findRepo(filePath) {
  return (0, _utilsPickForPath2['default'])(filePath, function (currentPath) {
    var repoPath = _path2['default'].join(currentPath, '.git');

    if (_fs2['default'].existsSync(repoPath)) {
      return repoPath;
    }
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvcHJvdmlkZXIvZ2l0L2ZpbmQtcmVwby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztvQkFFaUIsTUFBTTs7OztrQkFDUixJQUFJOzs7O2dDQUNLLDJCQUEyQjs7OztBQUpuRCxXQUFXLENBQUE7O0FBTVgsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLFFBQVEsQ0FBRSxRQUFRLEVBQUU7QUFDNUMsU0FBTyxtQ0FBWSxRQUFRLEVBQUUsVUFBQyxXQUFXLEVBQUs7QUFDNUMsUUFBSSxRQUFRLEdBQUcsa0JBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQTs7QUFFN0MsUUFBSSxnQkFBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDM0IsYUFBTyxRQUFRLENBQUE7S0FDaEI7R0FDRixDQUFDLENBQUE7Q0FDSCxDQUFBIiwiZmlsZSI6Ii9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvcHJvdmlkZXIvZ2l0L2ZpbmQtcmVwby5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGlja0ZvclBhdGggZnJvbSAnLi4vLi4vdXRpbHMvcGljay1mb3ItcGF0aCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmaW5kUmVwbyAoZmlsZVBhdGgpIHtcbiAgcmV0dXJuIHBpY2tGb3JQYXRoKGZpbGVQYXRoLCAoY3VycmVudFBhdGgpID0+IHtcbiAgICBsZXQgcmVwb1BhdGggPSBwYXRoLmpvaW4oY3VycmVudFBhdGgsICcuZ2l0JylcblxuICAgIGlmIChmcy5leGlzdHNTeW5jKHJlcG9QYXRoKSkge1xuICAgICAgcmV0dXJuIHJlcG9QYXRoXG4gICAgfVxuICB9KVxufVxuIl19