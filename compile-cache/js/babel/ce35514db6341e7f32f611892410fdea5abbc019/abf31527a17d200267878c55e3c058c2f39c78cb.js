Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

'use babel';

var AbstractProvider = (function () {
  function AbstractProvider(filePath, type) {
    _classCallCheck(this, AbstractProvider);

    this.filePath = filePath;
    this.type = type;
  }

  _createClass(AbstractProvider, [{
    key: 'supports',
    value: function supports(type) {
      return false;
    }
  }, {
    key: 'blame',
    value: function blame(callback) {}
  }, {
    key: 'getCommit',
    value: function getCommit(hash, callback) {}
  }, {
    key: 'getCommitLink',
    value: function getCommitLink(hash, callback) {}
  }, {
    key: 'dependenciesExist',
    value: function dependenciesExist() {
      return this.filePath && _fs2['default'].existsSync(this.filePath);
    }
  }, {
    key: 'exists',
    value: function exists() {
      return this.filePath && _fs2['default'].existsSync(this.filePath);
    }
  }]);

  return AbstractProvider;
})();

exports['default'] = AbstractProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvcHJvdmlkZXIvYWJzdHJhY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztrQkFFZSxJQUFJOzs7O0FBRm5CLFdBQVcsQ0FBQTs7SUFJVSxnQkFBZ0I7QUFDdkIsV0FETyxnQkFBZ0IsQ0FDdEIsUUFBUSxFQUFFLElBQUksRUFBRTswQkFEVixnQkFBZ0I7O0FBRWpDLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0FBQ3hCLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2pCOztlQUprQixnQkFBZ0I7O1dBTTFCLGtCQUFDLElBQUksRUFBRTtBQUNkLGFBQU8sS0FBSyxDQUFBO0tBQ2I7OztXQUVLLGVBQUMsUUFBUSxFQUFFLEVBQUU7OztXQUVULG1CQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRTs7O1dBRWYsdUJBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFOzs7V0FFZiw2QkFBRztBQUNuQixhQUFPLElBQUksQ0FBQyxRQUFRLElBQUksZ0JBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUNyRDs7O1dBRU0sa0JBQUc7QUFDUixhQUFPLElBQUksQ0FBQyxRQUFRLElBQUksZ0JBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUNyRDs7O1NBdEJrQixnQkFBZ0I7OztxQkFBaEIsZ0JBQWdCIiwiZmlsZSI6Ii9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvcHJvdmlkZXIvYWJzdHJhY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFic3RyYWN0UHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvciAoZmlsZVBhdGgsIHR5cGUpIHtcbiAgICB0aGlzLmZpbGVQYXRoID0gZmlsZVBhdGhcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gIH1cblxuICBzdXBwb3J0cyAodHlwZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgYmxhbWUgKGNhbGxiYWNrKSB7fVxuXG4gIGdldENvbW1pdCAoaGFzaCwgY2FsbGJhY2spIHt9XG5cbiAgZ2V0Q29tbWl0TGluayAoaGFzaCwgY2FsbGJhY2spIHt9XG5cbiAgZGVwZW5kZW5jaWVzRXhpc3QgKCkge1xuICAgIHJldHVybiB0aGlzLmZpbGVQYXRoICYmIGZzLmV4aXN0c1N5bmModGhpcy5maWxlUGF0aClcbiAgfVxuXG4gIGV4aXN0cyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZVBhdGggJiYgZnMuZXhpc3RzU3luYyh0aGlzLmZpbGVQYXRoKVxuICB9XG59XG4iXX0=