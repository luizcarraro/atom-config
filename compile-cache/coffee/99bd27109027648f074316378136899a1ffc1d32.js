(function() {
  module.exports = {
    golden_ratio_conjugate: 0.618033988749895,
    hsvToRgb: function(h, s, v) {
      var c, h2, h3, m, x;
      c = v * s;
      h2 = (360.0 * h) / 60.0;
      h3 = Math.abs((h2 % 2) - 1.0);
      x = c * (1.0 - h3);
      m = v - c;
      if ((0 <= h2 && h2 < 1)) {
        return [c + m, x + m, m];
      }
      if ((1 <= h2 && h2 < 2)) {
        return [x + m, c + m, m];
      }
      if ((2 <= h2 && h2 < 3)) {
        return [m, c + m, x + m];
      }
      if ((3 <= h2 && h2 < 4)) {
        return [m, x + m, c + m];
      }
      if ((4 <= h2 && h2 < 5)) {
        return [x + m, m, c + m];
      }
      if ((5 <= h2 && h2 < 6)) {
        return [c + m, m, x + m];
      }
    },
    getFixedColor: function() {
      var c;
      c = this.getConfig("fixed");
      return "rgb(" + c.red + "," + c.green + "," + c.blue + ")";
    },
    getRandomGenerator: function*() {
      var b, g, r, rgb, seed;
      seed = Math.random();
      while (true) {
        seed += this.golden_ratio_conjugate;
        seed = seed - (Math.floor(seed / 1));
        rgb = this.hsvToRgb(seed, 1, 1);
        r = Math.floor((rgb[0] * 255) / 1);
        g = Math.floor((rgb[1] * 255) / 1);
        b = Math.floor((rgb[2] * 255) / 1);
        yield ("rgb(" + r + "," + g + "," + b + ")");
      }
    },
    getColorAtPosition: function(editor, editorElement, screenPosition) {
      var bufferPosition, el, error, scope;
      screenPosition = [screenPosition.row, screenPosition.column - 1];
      bufferPosition = editor.bufferPositionForScreenPosition(screenPosition);
      scope = editor.scopeDescriptorForBufferPosition(bufferPosition);
      scope = scope.toString().replace(/\./g, '.syntax--');
      try {
        el = editorElement.querySelector(scope);
      } catch (error1) {
        error = error1;
        "rgb(255, 255, 255)";
      }
      if (el) {
        return getComputedStyle(el).color;
      } else {
        return "rgb(255, 255, 255)";
      }
    },
    getColor: function(editor, editorElement, screenPosition) {
      var colorType;
      colorType = this.getConfig("type");
      if (colorType === "random") {
        return this.getRandomGenerator();
      } else if (colorType === "fixed") {
        return this.getFixedColor();
      } else {
        return this.getColorAtPosition(editor, editorElement, screenPosition);
      }
    },
    getConfig: function(config) {
      return atom.config.get("activate-power-mode.particles.colours." + config);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL2FjdGl2YXRlLXBvd2VyLW1vZGUvbGliL2NvbG9yLWhlbHBlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsc0JBQUEsRUFBd0IsaUJBQXhCO0lBRUEsUUFBQSxFQUFVLFNBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMO0FBQ1IsVUFBQTtNQUFBLENBQUEsR0FBSSxDQUFBLEdBQUk7TUFDUixFQUFBLEdBQUssQ0FBQyxLQUFBLEdBQU0sQ0FBUCxDQUFBLEdBQVc7TUFDaEIsRUFBQSxHQUFLLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxFQUFBLEdBQUcsQ0FBSixDQUFBLEdBQVMsR0FBbEI7TUFDTCxDQUFBLEdBQUksQ0FBQSxHQUFJLENBQUMsR0FBQSxHQUFNLEVBQVA7TUFDUixDQUFBLEdBQUksQ0FBQSxHQUFJO01BQ1IsSUFBRyxDQUFBLENBQUEsSUFBRyxFQUFILElBQUcsRUFBSCxHQUFNLENBQU4sQ0FBSDtBQUFnQixlQUFPLENBQUMsQ0FBQSxHQUFFLENBQUgsRUFBSyxDQUFBLEdBQUUsQ0FBUCxFQUFTLENBQVQsRUFBdkI7O01BQ0EsSUFBRyxDQUFBLENBQUEsSUFBRyxFQUFILElBQUcsRUFBSCxHQUFNLENBQU4sQ0FBSDtBQUFnQixlQUFPLENBQUMsQ0FBQSxHQUFFLENBQUgsRUFBSyxDQUFBLEdBQUUsQ0FBUCxFQUFTLENBQVQsRUFBdkI7O01BQ0EsSUFBRyxDQUFBLENBQUEsSUFBRyxFQUFILElBQUcsRUFBSCxHQUFNLENBQU4sQ0FBSDtBQUFnQixlQUFPLENBQUMsQ0FBRCxFQUFHLENBQUEsR0FBRSxDQUFMLEVBQU8sQ0FBQSxHQUFFLENBQVQsRUFBdkI7O01BQ0EsSUFBRyxDQUFBLENBQUEsSUFBRyxFQUFILElBQUcsRUFBSCxHQUFNLENBQU4sQ0FBSDtB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QUMsR0FBWixDQUFnQix3Q0FBQSxHQUF5QyxNQUF6RDtJQURTLENBMURYOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuICBnb2xkZW5fcmF0aW9fY29uanVnYXRlOiAwLjYxODAzMzk4ODc0OTg5NVxuXG4gIGhzdlRvUmdiOiAoaCxzLHYpIC0+ICMgSFNWIHRvIFJHQiBhbGdvcml0aG0sIGFzIHBlciB3aWtpcGVkaWFcbiAgICBjID0gdiAqIHNcbiAgICBoMiA9ICgzNjAuMCpoKSAvNjAuMCAjIEFjY29yZGluZyB0byB3aWtpcGVkaWEsIDA8aDwzNjAuLi5cbiAgICBoMyA9IE1hdGguYWJzKChoMiUyKSAtIDEuMClcbiAgICB4ID0gYyAqICgxLjAgLSBoMylcbiAgICBtID0gdiAtIGNcbiAgICBpZiAwPD1oMjwxIHRoZW4gcmV0dXJuIFtjK20seCttLG1dXG4gICAgaWYgMTw9aDI8MiB0aGVuIHJldHVybiBbeCttLGMrbSxtXVxuICAgIGlmIDI8PWgyPDMgdGhlbiByZXR1cm4gW20sYyttLHgrbV1cbiAgICBpZiAzPD1oMjw0IHRoZW4gcmV0dXJuIFttLHgrbSxjK21dXG4gICAgaWYgNDw9aDI8NSB0aGVuIHJldHVybiBbeCttLG0sYyttXVxuICAgIGlmIDU8PWgyPDYgdGhlbiByZXR1cm4gW2MrbSxtLHgrbV1cblxuICBnZXRGaXhlZENvbG9yOiAtPlxuICAgIGMgPSBAZ2V0Q29uZmlnIFwiZml4ZWRcIlxuXG4gICAgXCJyZ2IoI3tjLnJlZH0sI3tjLmdyZWVufSwje2MuYmx1ZX0pXCJcblxuICBnZXRSYW5kb21HZW5lcmF0b3I6IC0+XG4gICAgc2VlZCA9IE1hdGgucmFuZG9tKClcbiAgICBsb29wXG4gICAgICBzZWVkICs9IEBnb2xkZW5fcmF0aW9fY29uanVnYXRlXG4gICAgICBzZWVkID0gc2VlZCAtIChzZWVkLy8xKVxuICAgICAgcmdiID0gQGhzdlRvUmdiKHNlZWQsMSwxKVxuICAgICAgciA9IChyZ2JbMF0qMjU1KS8vMVxuICAgICAgZyA9IChyZ2JbMV0qMjU1KS8vMVxuICAgICAgYiA9IChyZ2JbMl0qMjU1KS8vMVxuXG4gICAgICB5aWVsZCBcInJnYigje3J9LCN7Z30sI3tifSlcIlxuICAgIHJldHVyblxuXG4gIGdldENvbG9yQXRQb3NpdGlvbjogKGVkaXRvciwgZWRpdG9yRWxlbWVudCwgc2NyZWVuUG9zaXRpb24pIC0+XG4gICAgc2NyZWVuUG9zaXRpb24gPSBbc2NyZWVuUG9zaXRpb24ucm93LCBzY3JlZW5Qb3NpdGlvbi5jb2x1bW4gLSAxXVxuICAgIGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24gc2NyZWVuUG9zaXRpb25cbiAgICBzY29wZSA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbiBidWZmZXJQb3NpdGlvblxuICAgIHNjb3BlID0gc2NvcGUudG9TdHJpbmcoKS5yZXBsYWNlKC9cXC4vZywgJy5zeW50YXgtLScpXG5cbiAgICB0cnlcbiAgICAgIGVsID0gZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yIHNjb3BlXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgIFwicmdiKDI1NSwgMjU1LCAyNTUpXCJcblxuICAgIGlmIGVsXG4gICAgICBnZXRDb21wdXRlZFN0eWxlKGVsKS5jb2xvclxuICAgIGVsc2VcbiAgICAgIFwicmdiKDI1NSwgMjU1LCAyNTUpXCJcblxuICBnZXRDb2xvcjogKGVkaXRvciwgZWRpdG9yRWxlbWVudCwgc2NyZWVuUG9zaXRpb24pIC0+XG4gICAgY29sb3JUeXBlID0gQGdldENvbmZpZyhcInR5cGVcIilcbiAgICBpZiAoY29sb3JUeXBlID09IFwicmFuZG9tXCIpXG4gICAgICBAZ2V0UmFuZG9tR2VuZXJhdG9yKClcbiAgICBlbHNlIGlmIGNvbG9yVHlwZSA9PSBcImZpeGVkXCJcbiAgICAgIEBnZXRGaXhlZENvbG9yKClcbiAgICBlbHNlXG4gICAgICBAZ2V0Q29sb3JBdFBvc2l0aW9uIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgc2NyZWVuUG9zaXRpb25cblxuICBnZXRDb25maWc6IChjb25maWcpIC0+XG4gICAgYXRvbS5jb25maWcuZ2V0IFwiYWN0aXZhdGUtcG93ZXItbW9kZS5wYXJ0aWNsZXMuY29sb3Vycy4je2NvbmZpZ31cIlxuIl19
