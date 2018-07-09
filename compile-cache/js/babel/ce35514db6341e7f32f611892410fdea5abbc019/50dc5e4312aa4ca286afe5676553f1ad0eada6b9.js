Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = getBlame;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _gitBlame = require('git-blame');

var _gitBlame2 = _interopRequireDefault(_gitBlame);

var _utilsFindRepo = require('../../utils/find-repo');

var _utilsFindRepo2 = _interopRequireDefault(_utilsFindRepo);

'use babel';

function getBlame(filePath, callback) {
  var repoPath = (0, _utilsFindRepo2['default'])(filePath);
  var basePath = repoPath.replace(/\.git$/, '');
  filePath = filePath.replace(basePath, '');

  var commits = {};
  var lines = [];

  (0, _gitBlame2['default'])(repoPath, {
    file: filePath,
    rev: 'HEAD',
    ignoreWhitespace: atom.config.get('blame.ignoreWhitespace'),
    detectMoved: atom.config.get('blame.detectMoved'),
    detectCopy: atom.config.get('blame.detectCopy')
  }).on('data', function (type, data) {
    if (type === 'commit') {
      commits[data.hash] = data;
    } else {
      lines.push(data);
    }
  }).on('error', function (err) {
    return console.error(filePath, err) || callback(null);
  }).on('end', function () {
    var result = lines.sort(function (a, b) {
      return Number(a.finalLine) - Number(b.finalLine);
    }).reduce(function (result, _ref) {
      var line = _ref.finalLine;
      var rev = _ref.hash;
      var _commits$rev$author = commits[rev].author;
      var name = _commits$rev$author.name;
      var timestamp = _commits$rev$author.timestamp;

      var date = _moment2['default'].unix(timestamp).toISOString();

      result[line] = { author: { name: name }, date: date, line: line, rev: rev };

      return result;
    }, {});

    callback(result);
  });
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvcHJvdmlkZXIvZ2l0L2dldC1ibGFtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7cUJBTXdCLFFBQVE7Ozs7c0JBSmIsUUFBUTs7Ozt3QkFDTixXQUFXOzs7OzZCQUNYLHVCQUF1Qjs7OztBQUo1QyxXQUFXLENBQUE7O0FBTUksU0FBUyxRQUFRLENBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRTtBQUNwRCxNQUFNLFFBQVEsR0FBRyxnQ0FBUyxRQUFRLENBQUMsQ0FBQTtBQUNuQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUMvQyxVQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUE7O0FBRXpDLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQTtBQUNsQixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUE7O0FBRWhCLDZCQUFTLFFBQVEsRUFBRTtBQUNqQixRQUFJLEVBQUUsUUFBUTtBQUNkLE9BQUcsRUFBRSxNQUFNO0FBQ1gsb0JBQWdCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUM7QUFDM0QsZUFBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDO0FBQ2pELGNBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQztHQUNoRCxDQUFDLENBQ0MsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDMUIsUUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ3JCLGFBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFBO0tBQzFCLE1BQU07QUFDTCxXQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ2pCO0dBQ0YsQ0FBQyxDQUNELEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxHQUFHO1dBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQztHQUFBLENBQUMsQ0FDcEUsRUFBRSxDQUFDLEtBQUssRUFBRSxZQUFNO0FBQ2YsUUFBTSxNQUFNLEdBQUcsS0FBSyxDQUNqQixJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQzthQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7S0FBQSxDQUFDLENBQ3pELE1BQU0sQ0FBQyxVQUFDLE1BQU0sRUFBRSxJQUE4QixFQUFLO1VBQXRCLElBQUksR0FBakIsSUFBOEIsQ0FBNUIsU0FBUztVQUFjLEdBQUcsR0FBNUIsSUFBOEIsQ0FBWCxJQUFJO2dDQUNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBNUMsTUFBTTtVQUFJLElBQUksdUJBQUosSUFBSTtVQUFFLFNBQVMsdUJBQVQsU0FBUzs7QUFFakMsVUFBTSxJQUFJLEdBQUcsb0JBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBOztBQUVqRCxZQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFFLEdBQUcsRUFBSCxHQUFHLEVBQUUsQ0FBQTs7QUFFcEQsYUFBTyxNQUFNLENBQUE7S0FDZCxFQUFFLEVBQUUsQ0FBQyxDQUFBOztBQUVSLFlBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtHQUNqQixDQUFDLENBQUE7Q0FDTCIsImZpbGUiOiIvaG9tZS9sdWl6LmNhcnJhcm8vLmF0b20vcGFja2FnZXMvYmxhbWUvbGliL3Byb3ZpZGVyL2dpdC9nZXQtYmxhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCdcbmltcG9ydCBnaXRCbGFtZSBmcm9tICdnaXQtYmxhbWUnXG5pbXBvcnQgZmluZFJlcG8gZnJvbSAnLi4vLi4vdXRpbHMvZmluZC1yZXBvJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRCbGFtZSAoZmlsZVBhdGgsIGNhbGxiYWNrKSB7XG4gIGNvbnN0IHJlcG9QYXRoID0gZmluZFJlcG8oZmlsZVBhdGgpXG4gIGNvbnN0IGJhc2VQYXRoID0gcmVwb1BhdGgucmVwbGFjZSgvXFwuZ2l0JC8sICcnKVxuICBmaWxlUGF0aCA9IGZpbGVQYXRoLnJlcGxhY2UoYmFzZVBhdGgsICcnKVxuXG4gIGNvbnN0IGNvbW1pdHMgPSB7fVxuICBjb25zdCBsaW5lcyA9IFtdXG5cbiAgZ2l0QmxhbWUocmVwb1BhdGgsIHtcbiAgICBmaWxlOiBmaWxlUGF0aCxcbiAgICByZXY6ICdIRUFEJyxcbiAgICBpZ25vcmVXaGl0ZXNwYWNlOiBhdG9tLmNvbmZpZy5nZXQoJ2JsYW1lLmlnbm9yZVdoaXRlc3BhY2UnKSxcbiAgICBkZXRlY3RNb3ZlZDogYXRvbS5jb25maWcuZ2V0KCdibGFtZS5kZXRlY3RNb3ZlZCcpLFxuICAgIGRldGVjdENvcHk6IGF0b20uY29uZmlnLmdldCgnYmxhbWUuZGV0ZWN0Q29weScpXG4gIH0pXG4gICAgLm9uKCdkYXRhJywgKHR5cGUsIGRhdGEpID0+IHtcbiAgICAgIGlmICh0eXBlID09PSAnY29tbWl0Jykge1xuICAgICAgICBjb21taXRzW2RhdGEuaGFzaF0gPSBkYXRhXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaW5lcy5wdXNoKGRhdGEpXG4gICAgICB9XG4gICAgfSlcbiAgICAub24oJ2Vycm9yJywgKGVycikgPT4gY29uc29sZS5lcnJvcihmaWxlUGF0aCwgZXJyKSB8fCBjYWxsYmFjayhudWxsKSlcbiAgICAub24oJ2VuZCcsICgpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGxpbmVzXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBOdW1iZXIoYS5maW5hbExpbmUpIC0gTnVtYmVyKGIuZmluYWxMaW5lKSlcbiAgICAgICAgLnJlZHVjZSgocmVzdWx0LCB7IGZpbmFsTGluZTogbGluZSwgaGFzaDogcmV2IH0pID0+IHtcbiAgICAgICAgICBjb25zdCB7IGF1dGhvcjogeyBuYW1lLCB0aW1lc3RhbXAgfSB9ID0gY29tbWl0c1tyZXZdXG5cbiAgICAgICAgICBjb25zdCBkYXRlID0gbW9tZW50LnVuaXgodGltZXN0YW1wKS50b0lTT1N0cmluZygpXG5cbiAgICAgICAgICByZXN1bHRbbGluZV0gPSB7IGF1dGhvcjogeyBuYW1lIH0sIGRhdGUsIGxpbmUsIHJldiB9XG5cbiAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIH0sIHt9KVxuXG4gICAgICBjYWxsYmFjayhyZXN1bHQpXG4gICAgfSlcbn1cbiJdfQ==