function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _gitWrapper = require('git-wrapper');

var _gitWrapper2 = _interopRequireDefault(_gitWrapper);

var _findRepo = require('./find-repo');

var _findRepo2 = _interopRequireDefault(_findRepo);

var _utilsCommitCache = require('../../utils/commit-cache');

var _utilsCommitCache2 = _interopRequireDefault(_utilsCommitCache);

'use babel';

var cache = new _utilsCommitCache2['default']();

var showOpts = {
  s: true,
  format: '%ae%n%an%n%ce%n%cn%n%B'
};

function getCommitMessage(file, hash, callback) {
  var repoPath = (0, _findRepo2['default'])(file);

  if (!repoPath) {
    return;
  }

  var git = new _gitWrapper2['default']({ 'git-dir': repoPath });
  git.exec('show', showOpts, [hash], function (error, msg) {
    if (error) {
      return;
    }
    callback(msg);
  });
}

function getCommit(file, hash, callback) {
  var cached = cache.get(file, hash);

  if (cached) {
    return callback(cached);
  }

  getCommitMessage(file, hash, function (msg) {
    var lines = msg.split(/\n/g);

    var commit = {
      author: { email: lines.shift(), name: lines.shift() },
      commiter: { email: lines.shift(), name: lines.shift() },
      subject: lines.shift(),
      message: lines.join('\n').replace(/(^\s+|\s+$)/, '')
    };

    cache.set(file, hash, commit);

    callback(commit);
  });
}

module.exports = getCommit;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvcHJvdmlkZXIvZ2l0L2dldC1jb21taXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7MEJBRWdCLGFBQWE7Ozs7d0JBQ1IsYUFBYTs7OztnQ0FDViwwQkFBMEI7Ozs7QUFKbEQsV0FBVyxDQUFBOztBQU1YLElBQU0sS0FBSyxHQUFHLG1DQUFpQixDQUFBOztBQUUvQixJQUFNLFFBQVEsR0FBRztBQUNmLEdBQUMsRUFBRSxJQUFJO0FBQ1AsUUFBTSxFQUFFLHdCQUF3QjtDQUNqQyxDQUFBOztBQUVELFNBQVMsZ0JBQWdCLENBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDL0MsTUFBTSxRQUFRLEdBQUcsMkJBQVMsSUFBSSxDQUFDLENBQUE7O0FBRS9CLE1BQUksQ0FBQyxRQUFRLEVBQUU7QUFBRSxXQUFNO0dBQUU7O0FBRXpCLE1BQU0sR0FBRyxHQUFHLDRCQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUE7QUFDNUMsS0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUUsSUFBSSxDQUFFLEVBQUUsVUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFLO0FBQ25ELFFBQUksS0FBSyxFQUFFO0FBQUUsYUFBTTtLQUFFO0FBQ3JCLFlBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtHQUNkLENBQUMsQ0FBQTtDQUNIOztBQUVELFNBQVMsU0FBUyxDQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0FBQ3hDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBOztBQUVwQyxNQUFJLE1BQU0sRUFBRTtBQUFFLFdBQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0dBQUU7O0FBRXZDLGtCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBQyxHQUFHLEVBQUs7QUFDcEMsUUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTs7QUFFOUIsUUFBTSxNQUFNLEdBQUc7QUFDYixZQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUU7QUFDckQsY0FBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFO0FBQ3ZELGFBQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFO0FBQ3RCLGFBQU8sRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDO0tBQ3JELENBQUE7O0FBRUQsU0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBOztBQUU3QixZQUFRLENBQUMsTUFBTSxDQUFDLENBQUE7R0FDakIsQ0FBQyxDQUFBO0NBQ0g7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUEiLCJmaWxlIjoiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2JsYW1lL2xpYi9wcm92aWRlci9naXQvZ2V0LWNvbW1pdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBHaXQgZnJvbSAnZ2l0LXdyYXBwZXInXG5pbXBvcnQgZmluZFJlcG8gZnJvbSAnLi9maW5kLXJlcG8nXG5pbXBvcnQgQ29tbWl0Q2FjaGUgZnJvbSAnLi4vLi4vdXRpbHMvY29tbWl0LWNhY2hlJ1xuXG5jb25zdCBjYWNoZSA9IG5ldyBDb21taXRDYWNoZSgpXG5cbmNvbnN0IHNob3dPcHRzID0ge1xuICBzOiB0cnVlLFxuICBmb3JtYXQ6ICclYWUlbiVhbiVuJWNlJW4lY24lbiVCJ1xufVxuXG5mdW5jdGlvbiBnZXRDb21taXRNZXNzYWdlIChmaWxlLCBoYXNoLCBjYWxsYmFjaykge1xuICBjb25zdCByZXBvUGF0aCA9IGZpbmRSZXBvKGZpbGUpXG5cbiAgaWYgKCFyZXBvUGF0aCkgeyByZXR1cm4gfVxuXG4gIGNvbnN0IGdpdCA9IG5ldyBHaXQoeyAnZ2l0LWRpcic6IHJlcG9QYXRoIH0pXG4gIGdpdC5leGVjKCdzaG93Jywgc2hvd09wdHMsIFsgaGFzaCBdLCAoZXJyb3IsIG1zZykgPT4ge1xuICAgIGlmIChlcnJvcikgeyByZXR1cm4gfVxuICAgIGNhbGxiYWNrKG1zZylcbiAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0Q29tbWl0IChmaWxlLCBoYXNoLCBjYWxsYmFjaykge1xuICBjb25zdCBjYWNoZWQgPSBjYWNoZS5nZXQoZmlsZSwgaGFzaClcblxuICBpZiAoY2FjaGVkKSB7IHJldHVybiBjYWxsYmFjayhjYWNoZWQpIH1cblxuICBnZXRDb21taXRNZXNzYWdlKGZpbGUsIGhhc2gsIChtc2cpID0+IHtcbiAgICBjb25zdCBsaW5lcyA9IG1zZy5zcGxpdCgvXFxuL2cpXG5cbiAgICBjb25zdCBjb21taXQgPSB7XG4gICAgICBhdXRob3I6IHsgZW1haWw6IGxpbmVzLnNoaWZ0KCksIG5hbWU6IGxpbmVzLnNoaWZ0KCkgfSxcbiAgICAgIGNvbW1pdGVyOiB7IGVtYWlsOiBsaW5lcy5zaGlmdCgpLCBuYW1lOiBsaW5lcy5zaGlmdCgpIH0sXG4gICAgICBzdWJqZWN0OiBsaW5lcy5zaGlmdCgpLFxuICAgICAgbWVzc2FnZTogbGluZXMuam9pbignXFxuJykucmVwbGFjZSgvKF5cXHMrfFxccyskKS8sICcnKVxuICAgIH1cblxuICAgIGNhY2hlLnNldChmaWxlLCBoYXNoLCBjb21taXQpXG5cbiAgICBjYWxsYmFjayhjb21taXQpXG4gIH0pXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0Q29tbWl0XG4iXX0=