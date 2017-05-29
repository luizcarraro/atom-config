(function() {
  var CONFIG_ACTIVATION, CONFIG_DEACTIVATION, Facepalm, Subscriber;

  Subscriber = require('emissary').Subscriber;

  CONFIG_ACTIVATION = 'atom-facepalm.activationEvents';

  CONFIG_DEACTIVATION = 'atom-facepalm.deactivationEvents';

  Facepalm = (function() {
    function Facepalm() {}

    Subscriber.includeInto(Facepalm);

    Facepalm.prototype.on = function() {
      atom.config.observe(CONFIG_ACTIVATION, (function(_this) {
        return function() {
          return _this.updateSubscriptions();
        };
      })(this));
      return atom.config.observe(CONFIG_DEACTIVATION, (function(_this) {
        return function() {
          return _this.updateSubscriptions();
        };
      })(this));
    };

    Facepalm.prototype.off = function() {
      this.unsubscribe();
      atom.config.unobserve(CONFIG_ACTIVATION);
      return atom.config.unobserve(CONFIG_DEACTIVATION);
    };

    Facepalm.prototype.updateSubscriptions = function() {
      var activations, deactivations;
      this.unsubscribe();
      activations = atom.config.get(CONFIG_ACTIVATION);
      if (activations.trim().length === 0) {
        this.engage();
      } else {
        this.disengage();
        this.subscribe(atom, activations, (function(_this) {
          return function() {
            return _this.engage();
          };
        })(this));
      }
      deactivations = atom.config.get(CONFIG_DEACTIVATION);
      return this.subscribe(atom, deactivations, (function(_this) {
        return function() {
          return _this.disengage();
        };
      })(this));
    };

    Facepalm.prototype.engage = function() {
      return this.watcher = atom.workspaceView.eachEditorView(function(view) {
        return view.addClass('facepalm');
      });
    };

    Facepalm.prototype.disengage = function() {
      var i, len, ref, results, view;
      if (this.watcher) {
        this.watcher.off();
      }
      ref = atom.workspaceView.getEditorViews();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        results.push(view.removeClass('facepalm'));
      }
      return results;
    };

    return Facepalm;

  })();

  module.exports = {
    activate: function() {
      this.inst = new Facepalm;
      return this.inst.on();
    },
    deactivate: function() {
      return this.inst.off();
    },
    configDefaults: {
      activationEvents: '',
      deactivationEvents: ''
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2F0b20tZmFjZXBhbG0vbGliL2ZhY2VwYWxtLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQTtBQUFBLE1BQUE7O0VBQUMsYUFBYyxPQUFBLENBQVEsVUFBUjs7RUFFZixpQkFBQSxHQUFvQjs7RUFDcEIsbUJBQUEsR0FBc0I7O0VBRWhCOzs7SUFDSixVQUFVLENBQUMsV0FBWCxDQUF1QixRQUF2Qjs7dUJBRUEsRUFBQSxHQUFJLFNBQUE7TUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsaUJBQXBCLEVBQXVDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsbUJBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QzthQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixtQkFBcEIsRUFBeUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxtQkFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpDO0lBRkU7O3VCQUlKLEdBQUEsR0FBSyxTQUFBO01BQ0gsSUFBQyxDQUFBLFdBQUQsQ0FBQTtNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBWixDQUFzQixpQkFBdEI7YUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVosQ0FBc0IsbUJBQXRCO0lBSEc7O3VCQUtMLG1CQUFBLEdBQXFCLFNBQUE7QUFDbkIsVUFBQTtNQUFBLElBQUMsQ0FBQSxXQUFELENBQUE7TUFDQSxXQUFBLEdBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQjtNQUVkLElBQUcsV0FBVyxDQUFDLElBQVosQ0FBQSxDQUFrQixDQUFDLE1BQW5CLEtBQTZCLENBQWhDO1FBQ0UsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtRQUdFLElBQUMsQ0FBQSxTQUFELENBQUE7UUFDQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVgsRUFBaUIsV0FBakIsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCLEVBSkY7O01BTUEsYUFBQSxHQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCO2FBQ2hCLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWCxFQUFpQixhQUFqQixFQUFnQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLFNBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQztJQVhtQjs7dUJBYXJCLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQW5CLENBQWtDLFNBQUMsSUFBRDtlQUMzQyxJQUFJLENBQUMsUUFBTCxDQUFjLFVBQWQ7TUFEMkMsQ0FBbEM7SUFETDs7dUJBSVIsU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsSUFBa0IsSUFBQyxDQUFBLE9BQW5CO1FBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQUEsRUFBQTs7QUFDQTtBQUFBO1dBQUEscUNBQUE7O3FCQUNFLElBQUksQ0FBQyxXQUFMLENBQWlCLFVBQWpCO0FBREY7O0lBRlM7Ozs7OztFQUtiLE1BQU0sQ0FBQyxPQUFQLEdBRUU7SUFBQSxRQUFBLEVBQVUsU0FBQTtNQUNSLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSTthQUNaLElBQUMsQ0FBQSxJQUFJLENBQUMsRUFBTixDQUFBO0lBRlEsQ0FBVjtJQUlBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQUE7SUFEVSxDQUpaO0lBT0EsY0FBQSxFQUNFO01BQUEsZ0JBQUEsRUFBa0IsRUFBbEI7TUFDQSxrQkFBQSxFQUFvQixFQURwQjtLQVJGOztBQXpDRiIsInNvdXJjZXNDb250ZW50IjpbIiMgRW5nYWdlIEZhY2VwYWxtLW1vZGU6XG4jXG4jIDEuIEFsd2F5cywgaWYgbm8gYWN0aXZhdGlvbiBldmVudHMgYXJlIGNvbmZpZ3VyZWQgKHRoZSBkZWZhdWx0KS5cbiMgMi4gT24gYW55IG9mIGEgc2V0IG9mIGFjdGl2YXRpb24gZXZlbnRzLlxuIyAzLiBPbiBhIGNvbW1hbmQgcGFsZXR0ZSBjb21tYW5kLlxuXG57U3Vic2NyaWJlcn0gPSByZXF1aXJlICdlbWlzc2FyeSdcblxuQ09ORklHX0FDVElWQVRJT04gPSAnYXRvbS1mYWNlcGFsbS5hY3RpdmF0aW9uRXZlbnRzJ1xuQ09ORklHX0RFQUNUSVZBVElPTiA9ICdhdG9tLWZhY2VwYWxtLmRlYWN0aXZhdGlvbkV2ZW50cydcblxuY2xhc3MgRmFjZXBhbG1cbiAgU3Vic2NyaWJlci5pbmNsdWRlSW50byBAXG5cbiAgb246IC0+XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSBDT05GSUdfQUNUSVZBVElPTiwgPT4gQHVwZGF0ZVN1YnNjcmlwdGlvbnMoKVxuICAgIGF0b20uY29uZmlnLm9ic2VydmUgQ09ORklHX0RFQUNUSVZBVElPTiwgPT4gQHVwZGF0ZVN1YnNjcmlwdGlvbnMoKVxuXG4gIG9mZjogLT5cbiAgICBAdW5zdWJzY3JpYmUoKVxuICAgIGF0b20uY29uZmlnLnVub2JzZXJ2ZSBDT05GSUdfQUNUSVZBVElPTlxuICAgIGF0b20uY29uZmlnLnVub2JzZXJ2ZSBDT05GSUdfREVBQ1RJVkFUSU9OXG5cbiAgdXBkYXRlU3Vic2NyaXB0aW9uczogLT5cbiAgICBAdW5zdWJzY3JpYmUoKVxuICAgIGFjdGl2YXRpb25zID0gYXRvbS5jb25maWcuZ2V0IENPTkZJR19BQ1RJVkFUSU9OXG5cbiAgICBpZiBhY3RpdmF0aW9ucy50cmltKCkubGVuZ3RoIGlzIDBcbiAgICAgIEBlbmdhZ2UoKVxuICAgIGVsc2VcbiAgICAgIEBkaXNlbmdhZ2UoKVxuICAgICAgQHN1YnNjcmliZSBhdG9tLCBhY3RpdmF0aW9ucywgPT4gQGVuZ2FnZSgpXG5cbiAgICBkZWFjdGl2YXRpb25zID0gYXRvbS5jb25maWcuZ2V0IENPTkZJR19ERUFDVElWQVRJT05cbiAgICBAc3Vic2NyaWJlIGF0b20sIGRlYWN0aXZhdGlvbnMsID0+IEBkaXNlbmdhZ2UoKVxuXG4gIGVuZ2FnZTogLT5cbiAgICBAd2F0Y2hlciA9IGF0b20ud29ya3NwYWNlVmlldy5lYWNoRWRpdG9yVmlldyAodmlldykgLT5cbiAgICAgIHZpZXcuYWRkQ2xhc3MgJ2ZhY2VwYWxtJ1xuXG4gIGRpc2VuZ2FnZTogLT5cbiAgICBAd2F0Y2hlci5vZmYoKSBpZiBAd2F0Y2hlclxuICAgIGZvciB2aWV3IGluIGF0b20ud29ya3NwYWNlVmlldy5nZXRFZGl0b3JWaWV3cygpXG4gICAgICB2aWV3LnJlbW92ZUNsYXNzICdmYWNlcGFsbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIEBpbnN0ID0gbmV3IEZhY2VwYWxtXG4gICAgQGluc3Qub24oKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGluc3Qub2ZmKClcblxuICBjb25maWdEZWZhdWx0czpcbiAgICBhY3RpdmF0aW9uRXZlbnRzOiAnJ1xuICAgIGRlYWN0aXZhdGlvbkV2ZW50czogJydcbiJdfQ==
