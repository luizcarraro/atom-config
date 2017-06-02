(function() {
  var $, ResizableWidthView,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = require('jquery');

  module.exports = ResizableWidthView = (function() {
    ResizableWidthView.prototype.viewContainer = null;

    ResizableWidthView.prototype.mainView = null;

    ResizableWidthView.prototype.handle = null;

    ResizableWidthView.prototype.resizerPos = null;

    function ResizableWidthView(resizerPos) {
      var fragment, html;
      if (resizerPos == null) {
        resizerPos = 'left';
      }
      this.resizeView = bind(this.resizeView, this);
      this.resizeStopped = bind(this.resizeStopped, this);
      this.resizeStarted = bind(this.resizeStarted, this);
      this.resizerPos = resizerPos;
      fragment = "<div class=\"zi-width-resizer right\"></div>\n<div class=\"zi-mainview\"></div>";
      html = "<div class=\"zi-resizable\">\n" + fragment + "\n</div>";
      this.viewContainer = $(html);
      this.mainView = this.viewContainer.find('.zi-mainview');
      this.handle = this.viewContainer.find('.zi-width-resizer');
      this.handleEvents();
    }

    ResizableWidthView.prototype.handleEvents = function() {
      this.handle.on('dblclick', (function(_this) {
        return function() {
          return _this.resizeToFitContent();
        };
      })(this));
      return this.handle.on('mousedown', (function(_this) {
        return function(e) {
          return _this.resizeStarted(e);
        };
      })(this));
    };

    ResizableWidthView.prototype.resizeStarted = function() {
      $(document).on('mousemove', this.resizeView);
      return $(document).on('mouseup', this.resizeStopped);
    };

    ResizableWidthView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizeView);
      return $(document).off('mouseup', this.resizeStopped);
    };

    ResizableWidthView.prototype.resizeView = function(arg) {
      var deltaX, pageX, which, width;
      pageX = arg.pageX, which = arg.which;
      if (which !== 1) {
        return this.resizeStopped();
      }
      if (this.resizerPos === 'left') {
        deltaX = this.handle.offset().left - pageX;
        width = this.viewContainer.width() + deltaX;
      } else {
        deltaX = pageX - this.handle.offset().left;
        width = this.viewContainer.width() + deltaX;
      }
      return this.viewContainer.width(width);
    };

    ResizableWidthView.prototype.resizeToFitContent = function() {
      return this.viewContainer.width(this.mainView.width() + 20);
    };

    ResizableWidthView.prototype.moveHandleLeft = function() {
      this.handle.addClass('left');
      this.handle.removeClass('right');
      return this.resizerPos = 'left';
    };

    ResizableWidthView.prototype.moveHandleRight = function() {
      this.handle.addClass('right');
      this.handle.removeClass('left');
      return this.resizerPos = 'right';
    };

    return ResizableWidthView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL25hdi1wYW5lbC1wbHVzL2xpYi9yZXNpemFibGUtd2lkdGgtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUVKLE1BQU0sQ0FBQyxPQUFQLEdBQ007aUNBQ0osYUFBQSxHQUFlOztpQ0FDZixRQUFBLEdBQVU7O2lDQUNWLE1BQUEsR0FBUTs7aUNBQ1IsVUFBQSxHQUFZOztJQUdDLDRCQUFDLFVBQUQ7QUFDWCxVQUFBOztRQURZLGFBQWE7Ozs7O01BQ3pCLElBQUMsQ0FBQSxVQUFELEdBQWM7TUFFZCxRQUFBLEdBQVc7TUFLWCxJQUFBLEdBQU8sZ0NBQUEsR0FFTCxRQUZLLEdBRUk7TUFHWCxJQUFDLENBQUEsYUFBRCxHQUFpQixDQUFBLENBQUUsSUFBRjtNQUNqQixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFvQixjQUFwQjtNQUNaLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQW9CLG1CQUFwQjtNQUNWLElBQUMsQ0FBQSxZQUFELENBQUE7SUFoQlc7O2lDQW1CYixZQUFBLEdBQWMsU0FBQTtNQUNaLElBQUMsQ0FBQSxNQUFNLENBQUMsRUFBUixDQUFXLFVBQVgsRUFBdUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNyQixLQUFDLENBQUEsa0JBQUQsQ0FBQTtRQURxQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7YUFHQSxJQUFDLENBQUEsTUFBTSxDQUFDLEVBQVIsQ0FBWSxXQUFaLEVBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO2lCQUFPLEtBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZjtRQUFQO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtJQUpZOztpQ0FPZCxhQUFBLEdBQWUsU0FBQTtNQUNiLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsV0FBZixFQUE0QixJQUFDLENBQUEsVUFBN0I7YUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFNBQWYsRUFBMEIsSUFBQyxDQUFBLGFBQTNCO0lBRmE7O2lDQUtmLGFBQUEsR0FBZSxTQUFBO01BQ2IsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEdBQVosQ0FBZ0IsV0FBaEIsRUFBNkIsSUFBQyxDQUFBLFVBQTlCO2FBQ0EsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEdBQVosQ0FBZ0IsU0FBaEIsRUFBMkIsSUFBQyxDQUFBLGFBQTVCO0lBRmE7O2lDQUtmLFVBQUEsR0FBWSxTQUFDLEdBQUQ7QUFDVixVQUFBO01BRFksbUJBQU87TUFDbkIsSUFBK0IsS0FBQSxLQUFTLENBQXhDO0FBQUEsZUFBTyxJQUFDLENBQUEsYUFBRCxDQUFBLEVBQVA7O01BRUEsSUFBRyxJQUFDLENBQUEsVUFBRCxLQUFlLE1BQWxCO1FBQ0UsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBLENBQWdCLENBQUMsSUFBakIsR0FBd0I7UUFDakMsS0FBQSxHQUFRLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUFBLENBQUEsR0FBeUIsT0FGbkM7T0FBQSxNQUFBO1FBSUUsTUFBQSxHQUFVLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBQSxDQUFnQixDQUFDO1FBQ25DLEtBQUEsR0FBUSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsQ0FBQSxDQUFBLEdBQXlCLE9BTG5DOzthQU1BLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUFxQixLQUFyQjtJQVRVOztpQ0FXWixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUFxQixJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBQSxDQUFBLEdBQW9CLEVBQXpDO0lBRGtCOztpQ0FHcEIsY0FBQSxHQUFnQixTQUFBO01BQ2QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLE1BQWpCO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLE9BQXBCO2FBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYztJQUhBOztpQ0FLaEIsZUFBQSxHQUFpQixTQUFBO01BQ2YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLE9BQWpCO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLE1BQXBCO2FBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYztJQUhDOzs7OztBQWpFbkIiLCJzb3VyY2VzQ29udGVudCI6WyIkID0gcmVxdWlyZSAnanF1ZXJ5J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSZXNpemFibGVXaWR0aFZpZXdcbiAgdmlld0NvbnRhaW5lcjogbnVsbFxuICBtYWluVmlldzogbnVsbFxuICBoYW5kbGU6IG51bGxcbiAgcmVzaXplclBvczogbnVsbFxuXG5cbiAgY29uc3RydWN0b3I6IChyZXNpemVyUG9zID0gJ2xlZnQnKS0+XG4gICAgQHJlc2l6ZXJQb3MgPSByZXNpemVyUG9zXG5cbiAgICBmcmFnbWVudCA9IFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XCJ6aS13aWR0aC1yZXNpemVyIHJpZ2h0XCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInppLW1haW52aWV3XCI+PC9kaXY+XG4gICAgXCJcIlwiXG5cbiAgICBodG1sID0gXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cInppLXJlc2l6YWJsZVwiPlxuICAgICN7ZnJhZ21lbnR9XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgQHZpZXdDb250YWluZXIgPSAkKGh0bWwpXG4gICAgQG1haW5WaWV3ID0gQHZpZXdDb250YWluZXIuZmluZCgnLnppLW1haW52aWV3JylcbiAgICBAaGFuZGxlID0gQHZpZXdDb250YWluZXIuZmluZCgnLnppLXdpZHRoLXJlc2l6ZXInKVxuICAgIEBoYW5kbGVFdmVudHMoKVxuXG5cbiAgaGFuZGxlRXZlbnRzOiAtPlxuICAgIEBoYW5kbGUub24gJ2RibGNsaWNrJywgPT5cbiAgICAgIEByZXNpemVUb0ZpdENvbnRlbnQoKVxuXG4gICAgQGhhbmRsZS5vbiAgJ21vdXNlZG93bicsIChlKSA9PiBAcmVzaXplU3RhcnRlZChlKVxuXG5cbiAgcmVzaXplU3RhcnRlZDogPT5cbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQHJlc2l6ZVZpZXcpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZClcblxuXG4gIHJlc2l6ZVN0b3BwZWQ6ID0+XG4gICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZW1vdmUnLCBAcmVzaXplVmlldylcbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZClcblxuXG4gIHJlc2l6ZVZpZXc6ICh7cGFnZVgsIHdoaWNofSkgPT5cbiAgICByZXR1cm4gQHJlc2l6ZVN0b3BwZWQoKSB1bmxlc3Mgd2hpY2ggaXMgMVxuXG4gICAgaWYgQHJlc2l6ZXJQb3MgPT0gJ2xlZnQnXG4gICAgICBkZWx0YVggPSBAaGFuZGxlLm9mZnNldCgpLmxlZnQgLSBwYWdlWFxuICAgICAgd2lkdGggPSBAdmlld0NvbnRhaW5lci53aWR0aCgpICsgZGVsdGFYXG4gICAgZWxzZVxuICAgICAgZGVsdGFYID0gIHBhZ2VYIC0gQGhhbmRsZS5vZmZzZXQoKS5sZWZ0XG4gICAgICB3aWR0aCA9IEB2aWV3Q29udGFpbmVyLndpZHRoKCkgKyBkZWx0YVhcbiAgICBAdmlld0NvbnRhaW5lci53aWR0aCh3aWR0aClcblxuICByZXNpemVUb0ZpdENvbnRlbnQ6IC0+XG4gICAgQHZpZXdDb250YWluZXIud2lkdGgoQG1haW5WaWV3LndpZHRoKCkgKyAyMClcblxuICBtb3ZlSGFuZGxlTGVmdDogLT5cbiAgICBAaGFuZGxlLmFkZENsYXNzKCdsZWZ0JylcbiAgICBAaGFuZGxlLnJlbW92ZUNsYXNzKCdyaWdodCcpXG4gICAgQHJlc2l6ZXJQb3MgPSAnbGVmdCdcblxuICBtb3ZlSGFuZGxlUmlnaHQ6IC0+XG4gICAgQGhhbmRsZS5hZGRDbGFzcygncmlnaHQnKVxuICAgIEBoYW5kbGUucmVtb3ZlQ2xhc3MoJ2xlZnQnKVxuICAgIEByZXNpemVyUG9zID0gJ3JpZ2h0J1xuIl19
