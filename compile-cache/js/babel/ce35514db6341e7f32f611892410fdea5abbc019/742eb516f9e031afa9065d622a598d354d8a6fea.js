'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = throttle;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function throttle(fn, threshold, scope) {
  threshold = threshold || 250;

  var last = undefined,
      timer = undefined;

  var step = function step(time, args) {
    last = time;
    fn.apply(undefined, _toConsumableArray(args));
  };

  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var now = new Date().getTime();

    clearTimeout(timer);

    if (last && now < last + threshold) {
      timer = setTimeout(function () {
        return step(now, args);
      }, threshold);
    } else {
      step(now, args);
    }
  };
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvdXRpbHMvdGhyb3R0bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7OztxQkFFYSxRQUFROzs7O0FBQWpCLFNBQVMsUUFBUSxDQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFO0FBQ3RELFdBQVMsR0FBRyxTQUFTLElBQUksR0FBRyxDQUFBOztBQUU1QixNQUFJLElBQUksWUFBQTtNQUFFLEtBQUssWUFBQSxDQUFBOztBQUVmLE1BQU0sSUFBSSxHQUFHLFNBQVAsSUFBSSxDQUFJLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDM0IsUUFBSSxHQUFHLElBQUksQ0FBQTtBQUNYLE1BQUUscUNBQUksSUFBSSxFQUFDLENBQUE7R0FDWixDQUFBOztBQUVELFNBQU8sWUFBYTtzQ0FBVCxJQUFJO0FBQUosVUFBSTs7O0FBQ2IsUUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTs7QUFFaEMsZ0JBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQTs7QUFFbkIsUUFBSSxJQUFJLElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxTQUFTLEVBQUU7QUFDbEMsV0FBSyxHQUFHLFVBQVUsQ0FBQztlQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO09BQUEsRUFBRSxTQUFTLENBQUMsQ0FBQTtLQUNyRCxNQUFNO0FBQ0wsVUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtLQUNoQjtHQUNGLENBQUE7Q0FDRiIsImZpbGUiOiIvaG9tZS9sdWl6LmNhcnJhcm8vLmF0b20vcGFja2FnZXMvYmxhbWUvbGliL3V0aWxzL3Rocm90dGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdGhyb3R0bGUgKGZuLCB0aHJlc2hvbGQsIHNjb3BlKSB7XG4gIHRocmVzaG9sZCA9IHRocmVzaG9sZCB8fCAyNTBcblxuICBsZXQgbGFzdCwgdGltZXJcblxuICBjb25zdCBzdGVwID0gKHRpbWUsIGFyZ3MpID0+IHtcbiAgICBsYXN0ID0gdGltZVxuICAgIGZuKC4uLmFyZ3MpXG4gIH1cblxuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKVxuXG4gICAgaWYgKGxhc3QgJiYgbm93IDwgbGFzdCArIHRocmVzaG9sZCkge1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHN0ZXAobm93LCBhcmdzKSwgdGhyZXNob2xkKVxuICAgIH0gZWxzZSB7XG4gICAgICBzdGVwKG5vdywgYXJncylcbiAgICB9XG4gIH1cbn1cbiJdfQ==