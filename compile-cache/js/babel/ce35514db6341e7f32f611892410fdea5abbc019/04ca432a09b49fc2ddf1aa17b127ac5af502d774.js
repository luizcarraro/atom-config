Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _getBlame = require('./get-blame');

var _getBlame2 = _interopRequireDefault(_getBlame);

var _getCommit2 = require('./get-commit');

var _getCommit3 = _interopRequireDefault(_getCommit2);

var _getCommitLink2 = require('./get-commit-link');

var _getCommitLink3 = _interopRequireDefault(_getCommitLink2);

var _abstract = require('../abstract');

var _abstract2 = _interopRequireDefault(_abstract);

'use babel';

var GitProvider = (function (_AbstractProvider) {
  _inherits(GitProvider, _AbstractProvider);

  function GitProvider() {
    _classCallCheck(this, GitProvider);

    _get(Object.getPrototypeOf(GitProvider.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(GitProvider, [{
    key: 'supports',
    value: function supports(type) {
      return ['copy', 'link'].indexOf(type) !== -1;
    }
  }, {
    key: 'blame',
    value: function blame(callback) {
      if (this.exists()) {
        return (0, _getBlame2['default'])(this.filePath, callback);
      }
      callback(null);
    }
  }, {
    key: 'getCommit',
    value: function getCommit(hash, callback) {
      (0, _getCommit3['default'])(this.filePath, hash, callback);
    }
  }, {
    key: 'getCommitLink',
    value: function getCommitLink(hash, callback) {
      (0, _getCommitLink3['default'])(this.filePath, hash, callback);
    }
  }]);

  return GitProvider;
})(_abstract2['default']);

exports['default'] = GitProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvcHJvdmlkZXIvZ2l0L21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7d0JBRXFCLGFBQWE7Ozs7MEJBQ1osY0FBYzs7Ozs4QkFDVixtQkFBbUI7Ozs7d0JBQ2hCLGFBQWE7Ozs7QUFMMUMsV0FBVyxDQUFBOztJQU9VLFdBQVc7WUFBWCxXQUFXOztXQUFYLFdBQVc7MEJBQVgsV0FBVzs7K0JBQVgsV0FBVzs7O2VBQVgsV0FBVzs7V0FDckIsa0JBQUMsSUFBSSxFQUFFO0FBQ2QsYUFBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7S0FDN0M7OztXQUVLLGVBQUMsUUFBUSxFQUFFO0FBQ2YsVUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDakIsZUFBTywyQkFBUyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO09BQ3pDO0FBQ0QsY0FBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ2Y7OztXQUVTLG1CQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDekIsa0NBQVUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDekM7OztXQUVhLHVCQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDN0Isc0NBQWMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDN0M7OztTQWxCa0IsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2JsYW1lL2xpYi9wcm92aWRlci9naXQvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBnZXRCbGFtZSBmcm9tICcuL2dldC1ibGFtZSdcbmltcG9ydCBnZXRDb21taXQgZnJvbSAnLi9nZXQtY29tbWl0J1xuaW1wb3J0IGdldENvbW1pdExpbmsgZnJvbSAnLi9nZXQtY29tbWl0LWxpbmsnXG5pbXBvcnQgQWJzdHJhY3RQcm92aWRlciBmcm9tICcuLi9hYnN0cmFjdCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2l0UHJvdmlkZXIgZXh0ZW5kcyBBYnN0cmFjdFByb3ZpZGVyIHtcbiAgc3VwcG9ydHMgKHR5cGUpIHtcbiAgICByZXR1cm4gWydjb3B5JywgJ2xpbmsnXS5pbmRleE9mKHR5cGUpICE9PSAtMVxuICB9XG5cbiAgYmxhbWUgKGNhbGxiYWNrKSB7XG4gICAgaWYgKHRoaXMuZXhpc3RzKCkpIHtcbiAgICAgIHJldHVybiBnZXRCbGFtZSh0aGlzLmZpbGVQYXRoLCBjYWxsYmFjaylcbiAgICB9XG4gICAgY2FsbGJhY2sobnVsbClcbiAgfVxuXG4gIGdldENvbW1pdCAoaGFzaCwgY2FsbGJhY2spIHtcbiAgICBnZXRDb21taXQodGhpcy5maWxlUGF0aCwgaGFzaCwgY2FsbGJhY2spXG4gIH1cblxuICBnZXRDb21taXRMaW5rIChoYXNoLCBjYWxsYmFjaykge1xuICAgIGdldENvbW1pdExpbmsodGhpcy5maWxlUGF0aCwgaGFzaCwgY2FsbGJhY2spXG4gIH1cbn1cbiJdfQ==