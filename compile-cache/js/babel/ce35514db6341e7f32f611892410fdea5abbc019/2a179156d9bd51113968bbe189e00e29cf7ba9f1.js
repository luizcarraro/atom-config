function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _pickForPath = require('./pick-for-path');

var _pickForPath2 = _interopRequireDefault(_pickForPath);

'use babel';

var types = ['git', 'svn', 'hg'];

module.exports = function findRepoType(filePath) {
  return (0, _pickForPath2['default'])(filePath, function (currentPath) {
    var type = types.find(function (type) {
      return _fs2['default'].existsSync(_path2['default'].join(currentPath, '.' + type));
    });

    if (type) {
      return type;
    }
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvdXRpbHMvZmluZC1yZXBvLXR5cGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7b0JBRWlCLE1BQU07Ozs7a0JBQ1IsSUFBSTs7OzsyQkFDSyxpQkFBaUI7Ozs7QUFKekMsV0FBVyxDQUFBOztBQU1YLElBQU0sS0FBSyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQTs7QUFFbEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLFlBQVksQ0FBRSxRQUFRLEVBQUU7QUFDaEQsU0FBTyw4QkFBWSxRQUFRLEVBQUUsVUFBQyxXQUFXLEVBQUs7QUFDNUMsUUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUM5QixhQUFPLGdCQUFHLFVBQVUsQ0FBQyxrQkFBSyxJQUFJLENBQUMsV0FBVyxRQUFNLElBQUksQ0FBRyxDQUFDLENBQUE7S0FDekQsQ0FBQyxDQUFBOztBQUVGLFFBQUksSUFBSSxFQUFFO0FBQUUsYUFBTyxJQUFJLENBQUE7S0FBRTtHQUMxQixDQUFDLENBQUE7Q0FDSCxDQUFBIiwiZmlsZSI6Ii9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvdXRpbHMvZmluZC1yZXBvLXR5cGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBpY2tGb3JQYXRoIGZyb20gJy4vcGljay1mb3ItcGF0aCdcblxuY29uc3QgdHlwZXMgPSBbJ2dpdCcsICdzdm4nLCAnaGcnXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbmRSZXBvVHlwZSAoZmlsZVBhdGgpIHtcbiAgcmV0dXJuIHBpY2tGb3JQYXRoKGZpbGVQYXRoLCAoY3VycmVudFBhdGgpID0+IHtcbiAgICBsZXQgdHlwZSA9IHR5cGVzLmZpbmQoKHR5cGUpID0+IHtcbiAgICAgIHJldHVybiBmcy5leGlzdHNTeW5jKHBhdGguam9pbihjdXJyZW50UGF0aCwgYC4ke3R5cGV9YCkpXG4gICAgfSlcblxuICAgIGlmICh0eXBlKSB7IHJldHVybiB0eXBlIH1cbiAgfSlcbn1cbiJdfQ==