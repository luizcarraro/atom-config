Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

var _conventionalChangelog = require('conventional-changelog');

var _conventionalChangelog2 = _interopRequireDefault(_conventionalChangelog);

var _conventionalCommitsDetector = require('conventional-commits-detector');

var _conventionalCommitsDetector2 = _interopRequireDefault(_conventionalCommitsDetector);

var _conventionalGithubReleaser = require('conventional-github-releaser');

var _conventionalGithubReleaser2 = _interopRequireDefault(_conventionalGithubReleaser);

var _gitRawCommits = require('git-raw-commits');

var _gitRawCommits2 = _interopRequireDefault(_gitRawCommits);

var _loophole = require('loophole');

var _loophole2 = _interopRequireDefault(_loophole);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

'use babel';

function chdirToRepo() {
  var editor = atom.workspace.getActiveTextEditor();

  if (!editor) {
    return;
  }

  var file = editor.getURI();

  // hack
  process.chdir(_path2['default'].dirname(file));
}

function getConfigs(done) {
  var preset = atom.config.get('conventional-changelog.preset').toLowerCase();
  var append = atom.config.get('conventional-changelog.append');
  var releaseCount = atom.config.get('conventional-changelog.releaseCount');

  if (preset === 'auto') {
    _loophole2['default'].allowUnsafeNewFunctionAsync(function (unsafeDone) {
      var commits = [];

      (0, _gitRawCommits2['default'])().on('error', function (err) {
        err.message = 'Error in git-raw-commits: ' + err.message;
        done(err);
        unsafeDone();
      }).pipe((0, _through22['default'])(function (data, enc, cb) {
        commits.push(data.toString());
        cb();
      }, function () {
        preset = (0, _conventionalCommitsDetector2['default'])(commits);

        done(null, [{
          preset: preset,
          append: append,
          releaseCount: releaseCount
        }]);
        unsafeDone();
      }));
    });
    return;
  }

  done(null, [{
    preset: preset,
    append: append,
    releaseCount: releaseCount
  }]);
}

function changelog() {
  chdirToRepo();

  var editor = atom.workspace.getActiveTextEditor();
  var text = editor.getText();

  getConfigs(function (err, data) {
    if (err) {
      console.error(err);
      atom.beep();
      return;
    }

    var configs = data;
    var opts = configs[0];

    _loophole2['default'].allowUnsafeNewFunctionAsync(function (unsafeDone) {
      return _conventionalChangelog2['default'].apply(undefined, _toConsumableArray(configs)).on('error', function (err) {
        err.message = 'Error in conventional-changelog: ' + err.message;
        console.error(err);
        atom.beep();
        unsafeDone();
      }).pipe((0, _concatStream2['default'])(function (data) {
        data = data.toString();

        if (opts.releaseCount === 0) {
          text = data;
        } else if (opts.append) {
          text = text + data;
        } else if (!opts.append) {
          text = data + text;
        }

        editor.setText(text);
        unsafeDone();
      }));
    });
  });
}

function githubRelease() {
  chdirToRepo();
  getConfigs(function (err, data) {
    if (err) {
      console.error(err);
      atom.beep();
      return;
    }

    var configs = data;

    _loophole2['default'].allowUnsafeNewFunctionAsync(function (unsafeDone) {
      return _conventionalGithubReleaser2['default'].apply(undefined, [{
        type: 'token'
      }].concat(_toConsumableArray(configs), [function (err, data) {
        if (err) {
          err.message = 'Error in conventional-github-releaser: ' + err.message;
          console.error(err);
          atom.beep();
          unsafeDone();
        }

        unsafeDone();
      }]));
    });
  });
}

var config = {
  preset: {
    type: 'string',
    description: 'auto, angular, atom, ember, eslint, express, jquery, jscs, jshint or codemirror.',
    'default': 'auto'
  },
  append: {
    type: 'boolean',
    description: 'Should the log be appended to existing data.',
    'default': false
  },
  releaseCount: {
    type: 'number',
    description: 'How many releases of changelog you want to generate.',
    'default': 1
  }
};

exports.config = config;
var activate = function activate() {
  atom.commands.add('atom-workspace', 'conventional-changelog:changelog', changelog);
  atom.commands.add('atom-workspace', 'conventional-changelog:githubRelease', githubRelease);
};
exports.activate = activate;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9jb252ZW50aW9uYWwtY2hhbmdlbG9nL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OzRCQUN5QixlQUFlOzs7O3FDQUNOLHdCQUF3Qjs7OzsyQ0FDbEIsK0JBQStCOzs7OzBDQUNoQyw4QkFBOEI7Ozs7NkJBQzNDLGlCQUFpQjs7Ozt3QkFDdEIsVUFBVTs7OztvQkFDZCxNQUFNOzs7O3dCQUNILFVBQVU7Ozs7QUFSOUIsV0FBVyxDQUFDOztBQVVaLFNBQVMsV0FBVyxHQUFHO0FBQ3JCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzs7QUFFckQsTUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNaLFdBQU87R0FDUDs7QUFFQSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7OztBQUc3QixTQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ25DOztBQUVELFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRTtBQUN4QixNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzVFLE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFDOUQsTUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQzs7QUFFMUUsTUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFO0FBQ3JCLDBCQUFTLDJCQUEyQixDQUFDLFVBQUMsVUFBVSxFQUFLO0FBQ25ELFVBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQzs7QUFFakIsdUNBQWUsQ0FDWixFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUMsR0FB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QyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0NBQzVGLENBQUMiLCJmaWxlIjoiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2NvbnZlbnRpb25hbC1jaGFuZ2Vsb2cvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbmltcG9ydCBjb25jYXRTdHJlYW0gZnJvbSAnY29uY2F0LXN0cmVhbSc7XG5pbXBvcnQgY29udmVudGlvbmFsQ2hhbmdlbG9nIGZyb20gJ2NvbnZlbnRpb25hbC1jaGFuZ2Vsb2cnO1xuaW1wb3J0IGNvbnZlbnRpb25hbENvbW1pdHNEZXRlY3RvciBmcm9tICdjb252ZW50aW9uYWwtY29tbWl0cy1kZXRlY3Rvcic7XG5pbXBvcnQgY29udmVudGlvbmFsR2l0aHViUmVsZWFzZXIgZnJvbSAnY29udmVudGlvbmFsLWdpdGh1Yi1yZWxlYXNlcic7XG5pbXBvcnQgZ2l0UmF3Q29tbWl0cyBmcm9tICdnaXQtcmF3LWNvbW1pdHMnO1xuaW1wb3J0IGxvb3Bob2xlIGZyb20gJ2xvb3Bob2xlJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHRocm91Z2ggZnJvbSAndGhyb3VnaDInO1xuXG5mdW5jdGlvbiBjaGRpclRvUmVwbygpIHtcbiAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuXG5cdGlmICghZWRpdG9yKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cbiAgY29uc3QgZmlsZSA9IGVkaXRvci5nZXRVUkkoKTtcblxuICAvLyBoYWNrXG4gIHByb2Nlc3MuY2hkaXIocGF0aC5kaXJuYW1lKGZpbGUpKTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29uZmlncyhkb25lKSB7XG4gIGxldCBwcmVzZXQgPSBhdG9tLmNvbmZpZy5nZXQoJ2NvbnZlbnRpb25hbC1jaGFuZ2Vsb2cucHJlc2V0JykudG9Mb3dlckNhc2UoKTtcbiAgbGV0IGFwcGVuZCA9IGF0b20uY29uZmlnLmdldCgnY29udmVudGlvbmFsLWNoYW5nZWxvZy5hcHBlbmQnKTtcbiAgbGV0IHJlbGVhc2VDb3VudCA9IGF0b20uY29uZmlnLmdldCgnY29udmVudGlvbmFsLWNoYW5nZWxvZy5yZWxlYXNlQ291bnQnKTtcblxuICBpZiAocHJlc2V0ID09PSAnYXV0bycpIHtcbiAgICBsb29waG9sZS5hbGxvd1Vuc2FmZU5ld0Z1bmN0aW9uQXN5bmMoKHVuc2FmZURvbmUpID0+IHtcbiAgICAgIGxldCBjb21taXRzID0gW107XG5cbiAgICAgIGdpdFJhd0NvbW1pdHMoKVxuICAgICAgICAub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICAgIGVyci5tZXNzYWdlID0gJ0Vycm9yIGluIGdpdC1yYXctY29tbWl0czogJyArIGVyci5tZXNzYWdlO1xuICAgICAgICAgIGRvbmUoZXJyKTtcbiAgICAgICAgICB1bnNhZmVEb25lKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5waXBlKHRocm91Z2goKGRhdGEsIGVuYywgY2IpID0+IHtcbiAgICAgICAgICBjb21taXRzLnB1c2goZGF0YS50b1N0cmluZygpKTtcbiAgICAgICAgICBjYigpO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgcHJlc2V0ID0gY29udmVudGlvbmFsQ29tbWl0c0RldGVjdG9yKGNvbW1pdHMpO1xuXG4gICAgICAgICAgZG9uZShudWxsLCBbe1xuICAgICAgICAgICAgcHJlc2V0LFxuICAgICAgICAgICAgYXBwZW5kLFxuICAgICAgICAgICAgcmVsZWFzZUNvdW50XG4gICAgICAgICAgfV0pO1xuICAgICAgICAgIHVuc2FmZURvbmUoKTtcbiAgICAgICAgfSkpO1xuICAgICAgfSlcbiAgICByZXR1cm47XG4gIH1cblxuICBkb25lKG51bGwsIFt7XG4gICAgcHJlc2V0LFxuICAgIGFwcGVuZCxcblx0ICByZWxlYXNlQ291bnRcbiAgfV0pO1xufVxuXG5mdW5jdGlvbiBjaGFuZ2Vsb2coKSB7XG4gIGNoZGlyVG9SZXBvKCk7XG5cbiAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICBsZXQgdGV4dCA9IGVkaXRvci5nZXRUZXh0KCk7XG5cbiAgZ2V0Q29uZmlncygoZXJyLCBkYXRhKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGNvbmZpZ3MgPSBkYXRhO1xuICAgIGxldCBvcHRzID0gY29uZmlnc1swXTtcblxuICAgIGxvb3Bob2xlLmFsbG93VW5zYWZlTmV3RnVuY3Rpb25Bc3luYygodW5zYWZlRG9uZSkgPT4ge1xuICAgICAgcmV0dXJuIGNvbnZlbnRpb25hbENoYW5nZWxvZyguLi5jb25maWdzKVxuICAgICAgICAub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgZXJyLm1lc3NhZ2UgPSAnRXJyb3IgaW4gY29udmVudGlvbmFsLWNoYW5nZWxvZzogJyArIGVyci5tZXNzYWdlO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICBhdG9tLmJlZXAoKTtcbiAgICAgICAgICB1bnNhZmVEb25lKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5waXBlKGNvbmNhdFN0cmVhbSgoZGF0YSkgPT4ge1xuICAgICAgICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICBpZiAob3B0cy5yZWxlYXNlQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgIHRleHQgPSBkYXRhO1xuICAgICAgICAgIH0gZWxzZSBpZiAob3B0cy5hcHBlbmQpIHtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0ICsgZGF0YTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCFvcHRzLmFwcGVuZCkge1xuICAgICAgICAgICAgdGV4dCA9IGRhdGEgKyB0ZXh0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KHRleHQpO1xuICAgICAgICAgIHVuc2FmZURvbmUoKTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2l0aHViUmVsZWFzZSgpIHtcbiAgY2hkaXJUb1JlcG8oKTtcbiAgZ2V0Q29uZmlncygoZXJyLCBkYXRhKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGNvbmZpZ3MgPSBkYXRhO1xuXG4gICAgbG9vcGhvbGUuYWxsb3dVbnNhZmVOZXdGdW5jdGlvbkFzeW5jKCh1bnNhZmVEb25lKSA9PiB7XG4gICAgICByZXR1cm4gY29udmVudGlvbmFsR2l0aHViUmVsZWFzZXIoe1xuICAgICAgICB0eXBlOiAndG9rZW4nXG4gICAgICB9LCAuLi5jb25maWdzLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBlcnIubWVzc2FnZSA9ICdFcnJvciBpbiBjb252ZW50aW9uYWwtZ2l0aHViLXJlbGVhc2VyOiAnICsgZXJyLm1lc3NhZ2U7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgIGF0b20uYmVlcCgpO1xuICAgICAgICAgIHVuc2FmZURvbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVuc2FmZURvbmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZXhwb3J0IGxldCBjb25maWcgPSB7XG4gIHByZXNldDoge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlc2NyaXB0aW9uOiAnYXV0bywgYW5ndWxhciwgYXRvbSwgZW1iZXIsIGVzbGludCwgZXhwcmVzcywganF1ZXJ5LCBqc2NzLCBqc2hpbnQgb3IgY29kZW1pcnJvci4nLFxuICAgIGRlZmF1bHQ6ICdhdXRvJ1xuICB9LFxuICBhcHBlbmQ6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVzY3JpcHRpb246ICdTaG91bGQgdGhlIGxvZyBiZSBhcHBlbmRlZCB0byBleGlzdGluZyBkYXRhLicsXG4gICAgZGVmYXVsdDogZmFsc2VcbiAgfSxcblx0cmVsZWFzZUNvdW50OiB7XG4gICAgdHlwZTogJ251bWJlcicsXG4gICAgZGVzY3JpcHRpb246ICdIb3cgbWFueSByZWxlYXNlcyBvZiBjaGFuZ2Vsb2cgeW91IHdhbnQgdG8gZ2VuZXJhdGUuJyxcblx0XHRkZWZhdWx0OiAxXG5cdH1cbn07XG5cbmV4cG9ydCBsZXQgYWN0aXZhdGUgPSAoKSA9PiB7XG5cdGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdjb252ZW50aW9uYWwtY2hhbmdlbG9nOmNoYW5nZWxvZycsIGNoYW5nZWxvZyk7XG4gIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdjb252ZW50aW9uYWwtY2hhbmdlbG9nOmdpdGh1YlJlbGVhc2UnLCBnaXRodWJSZWxlYXNlKTtcbn07XG4iXX0=