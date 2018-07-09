Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utilsFindRepoType = require('../utils/find-repo-type');

var _utilsFindRepoType2 = _interopRequireDefault(_utilsFindRepoType);

'use babel';

exports['default'] = function (filePath) {
  var type = (0, _utilsFindRepoType2['default'])(filePath);

  if (!type) {
    return null;
  }

  var providerPath = _path2['default'].join(__dirname, type, 'main.js');

  if (_fs2['default'].existsSync(providerPath)) {
    var Provider = require(providerPath);
    return new Provider(filePath, type);
  }
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvcHJvdmlkZXIvZmFjdG9yeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7a0JBRWUsSUFBSTs7OztvQkFDRixNQUFNOzs7O2lDQUNFLHlCQUF5Qjs7OztBQUpsRCxXQUFXLENBQUE7O3FCQU1JLFVBQVUsUUFBUSxFQUFFO0FBQ2pDLE1BQU0sSUFBSSxHQUFHLG9DQUFhLFFBQVEsQ0FBQyxDQUFBOztBQUVuQyxNQUFJLENBQUMsSUFBSSxFQUFFO0FBQUUsV0FBTyxJQUFJLENBQUE7R0FBRTs7QUFFMUIsTUFBTSxZQUFZLEdBQUcsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7O0FBRTFELE1BQUksZ0JBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQy9CLFFBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUN0QyxXQUFPLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQTtHQUNwQztDQUNGIiwiZmlsZSI6Ii9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvcHJvdmlkZXIvZmFjdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZmluZFJlcG9UeXBlIGZyb20gJy4uL3V0aWxzL2ZpbmQtcmVwby10eXBlJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoZmlsZVBhdGgpIHtcbiAgY29uc3QgdHlwZSA9IGZpbmRSZXBvVHlwZShmaWxlUGF0aClcblxuICBpZiAoIXR5cGUpIHsgcmV0dXJuIG51bGwgfVxuXG4gIGNvbnN0IHByb3ZpZGVyUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIHR5cGUsICdtYWluLmpzJylcblxuICBpZiAoZnMuZXhpc3RzU3luYyhwcm92aWRlclBhdGgpKSB7XG4gICAgY29uc3QgUHJvdmlkZXIgPSByZXF1aXJlKHByb3ZpZGVyUGF0aClcbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyKGZpbGVQYXRoLCB0eXBlKVxuICB9XG59XG4iXX0=