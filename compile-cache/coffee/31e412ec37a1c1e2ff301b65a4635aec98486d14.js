(function() {
  var GistClient, Promise, github,
    slice = [].slice;

  github = require('octonode');

  Promise = require('bluebird');

  module.exports = GistClient = (function() {
    function GistClient(token, hostname) {
      this.token = token;
      this.hostname = hostname;
      this.client = github.client(this.token, {
        hostname: this.hostname
      }).gist();
    }

    GistClient.prototype.destroy = function() {};

    GistClient.prototype.create = function(gist) {
      return this.request('create', gist);
    };

    GistClient.prototype.list = function() {
      var params;
      params = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this.request.apply(this, ['list'].concat(slice.call(params)));
    };

    GistClient.prototype.get = function(id) {
      return this.request('get', id);
    };

    GistClient.prototype.edit = function(id, gist) {
      return this.request('edit', id, gist);
    };

    GistClient.prototype["delete"] = function(id) {
      return this.request('delete', id);
    };

    GistClient.prototype.request = function() {
      var method, params;
      method = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var callback, ref;
          if (!_this.token) {
            return reject(new Error('required token'));
          }
          callback = function() {
            var error, results;
            error = arguments[0], results = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            if (error) {
              return reject(error);
            } else {
              return resolve.apply(null, results);
            }
          };
          return (ref = _this.client)[method].apply(ref, slice.call(params).concat([callback]));
        };
      })(this));
    };

    return GistClient;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2dpc3QvbGliL2dpc3QtY2xpZW50LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMkJBQUE7SUFBQTs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBQ1QsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFFUyxvQkFBQyxLQUFELEVBQVMsUUFBVDtNQUFDLElBQUMsQ0FBQSxRQUFEO01BQVEsSUFBQyxDQUFBLFdBQUQ7TUFDcEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQUMsQ0FBQSxLQUFmLEVBQXNCO1FBQUUsVUFBRCxJQUFDLENBQUEsUUFBRjtPQUF0QixDQUFrQyxDQUFDLElBQW5DLENBQUE7SUFEQzs7eUJBR2IsT0FBQSxHQUFTLFNBQUEsR0FBQTs7eUJBRVQsTUFBQSxHQUFRLFNBQUMsSUFBRDthQUNOLElBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUFtQixJQUFuQjtJQURNOzt5QkFHUixJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7TUFESzthQUNMLElBQUMsQ0FBQSxPQUFELGFBQVMsQ0FBQSxNQUFRLFNBQUEsV0FBQSxNQUFBLENBQUEsQ0FBakI7SUFESTs7eUJBR04sR0FBQSxHQUFLLFNBQUMsRUFBRDthQUNILElBQUMsQ0FBQSxPQUFELENBQVMsS0FBVCxFQUFnQixFQUFoQjtJQURHOzt5QkFHTCxJQUFBLEdBQU0sU0FBQyxFQUFELEVBQUssSUFBTDthQUNKLElBQUMsQ0FBQSxPQUFELENBQVMsTUFBVCxFQUFpQixFQUFqQixFQUFxQixJQUFyQjtJQURJOzswQkFHTixRQUFBLEdBQVEsU0FBQyxFQUFEO2FBQ04sSUFBQyxDQUFBLE9BQUQsQ0FBUyxRQUFULEVBQW1CLEVBQW5CO0lBRE07O3lCQUdSLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQURRLHVCQUFRO2FBQ1osSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ1YsY0FBQTtVQUFBLElBQUEsQ0FBa0QsS0FBQyxDQUFBLEtBQW5EO0FBQUEsbUJBQU8sTUFBQSxDQUFXLElBQUEsS0FBQSxDQUFNLGdCQUFOLENBQVgsRUFBUDs7VUFFQSxRQUFBLEdBQVcsU0FBQTtBQUNULGdCQUFBO1lBRFUsc0JBQU87WUFDakIsSUFBRyxLQUFIO3FCQUNFLE1BQUEsQ0FBTyxLQUFQLEVBREY7YUFBQSxNQUFBO3FCQUdFLE9BQUEsYUFBUSxPQUFSLEVBSEY7O1VBRFM7aUJBTVgsT0FBQSxLQUFDLENBQUEsTUFBRCxDQUFRLENBQUEsTUFBQSxDQUFSLFlBQWdCLFdBQUEsTUFBQSxDQUFBLFFBQVcsQ0FBQSxRQUFBLENBQVgsQ0FBaEI7UUFUVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQURHOzs7OztBQTFCWCIsInNvdXJjZXNDb250ZW50IjpbImdpdGh1YiA9IHJlcXVpcmUgJ29jdG9ub2RlJ1xuUHJvbWlzZSA9IHJlcXVpcmUgJ2JsdWViaXJkJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBHaXN0Q2xpZW50XG5cbiAgY29uc3RydWN0b3I6IChAdG9rZW4sIEBob3N0bmFtZSkgLT5cbiAgICBAY2xpZW50ID0gZ2l0aHViLmNsaWVudChAdG9rZW4sIHtAaG9zdG5hbWV9KS5naXN0KClcblxuICBkZXN0cm95OiAtPlxuXG4gIGNyZWF0ZTogKGdpc3QpIC0+XG4gICAgQHJlcXVlc3QoJ2NyZWF0ZScsIGdpc3QpXG5cbiAgbGlzdDogKHBhcmFtcy4uLikgLT5cbiAgICBAcmVxdWVzdCgnbGlzdCcsIHBhcmFtcy4uLilcblxuICBnZXQ6IChpZCkgLT5cbiAgICBAcmVxdWVzdCgnZ2V0JywgaWQpXG5cbiAgZWRpdDogKGlkLCBnaXN0KSAtPlxuICAgIEByZXF1ZXN0KCdlZGl0JywgaWQsIGdpc3QpXG5cbiAgZGVsZXRlOiAoaWQpIC0+XG4gICAgQHJlcXVlc3QoJ2RlbGV0ZScsIGlkKVxuXG4gIHJlcXVlc3Q6IChtZXRob2QsIHBhcmFtcy4uLikgLT5cbiAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoJ3JlcXVpcmVkIHRva2VuJykpIHVubGVzcyBAdG9rZW5cblxuICAgICAgY2FsbGJhY2sgPSAoZXJyb3IsIHJlc3VsdHMuLi4pIC0+XG4gICAgICAgIGlmIGVycm9yXG4gICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHRzLi4uKVxuXG4gICAgICBAY2xpZW50W21ldGhvZF0ocGFyYW1zLi4uLCBjYWxsYmFjaylcbiAgICApXG4iXX0=
