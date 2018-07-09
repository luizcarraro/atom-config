'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CommitCache = (function () {
  function CommitCache() {
    _classCallCheck(this, CommitCache);

    this.cache = {};
  }

  _createClass(CommitCache, [{
    key: 'get',
    value: function get(file, hash) {
      return this.cache[file + '|' + hash] || null;
    }
  }, {
    key: 'set',
    value: function set(file, hash, msg) {
      this.cache[file + '|' + hash] = msg;
    }
  }]);

  return CommitCache;
})();

exports['default'] = CommitCache;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvdXRpbHMvY29tbWl0LWNhY2hlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7OztJQUVVLFdBQVc7QUFDbEIsV0FETyxXQUFXLEdBQ2Y7MEJBREksV0FBVzs7QUFFNUIsUUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUE7R0FDaEI7O2VBSGtCLFdBQVc7O1dBSzFCLGFBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUNmLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBSSxJQUFJLFNBQUksSUFBSSxDQUFHLElBQUksSUFBSSxDQUFBO0tBQzdDOzs7V0FFRyxhQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFO0FBQ3BCLFVBQUksQ0FBQyxLQUFLLENBQUksSUFBSSxTQUFJLElBQUksQ0FBRyxHQUFHLEdBQUcsQ0FBQTtLQUNwQzs7O1NBWGtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvdXRpbHMvY29tbWl0LWNhY2hlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWl0Q2FjaGUge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5jYWNoZSA9IHt9XG4gIH1cblxuICBnZXQgKGZpbGUsIGhhc2gpIHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZVtgJHtmaWxlfXwke2hhc2h9YF0gfHwgbnVsbFxuICB9XG5cbiAgc2V0IChmaWxlLCBoYXNoLCBtc2cpIHtcbiAgICB0aGlzLmNhY2hlW2Ake2ZpbGV9fCR7aGFzaH1gXSA9IG1zZ1xuICB9XG59XG4iXX0=