(function() {
  var Point, SublimeSelectEditorHandler,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Point = require('atom').Point;

  module.exports = SublimeSelectEditorHandler = (function() {
    function SublimeSelectEditorHandler(editor, inputCfg) {
      this.onRangeChange = bind(this.onRangeChange, this);
      this.onBlur = bind(this.onBlur, this);
      this.onMouseEventToHijack = bind(this.onMouseEventToHijack, this);
      this.onMouseMove = bind(this.onMouseMove, this);
      this.onMouseDown = bind(this.onMouseDown, this);
      this.editor = editor;
      this.inputCfg = inputCfg;
      this._resetState();
      this._setup_vars();
    }

    SublimeSelectEditorHandler.prototype.subscribe = function() {
      this.selection_observer = this.editor.onDidChangeSelectionRange(this.onRangeChange);
      this.editorElement.addEventListener('mousedown', this.onMouseDown);
      this.editorElement.addEventListener('mousemove', this.onMouseMove);
      this.editorElement.addEventListener('mouseup', this.onMouseEventToHijack);
      this.editorElement.addEventListener('mouseleave', this.onMouseEventToHijack);
      this.editorElement.addEventListener('mouseenter', this.onMouseEventToHijack);
      this.editorElement.addEventListener('contextmenu', this.onMouseEventToHijack);
      return this.editorElement.addEventListener('blur', this.onBlur);
    };

    SublimeSelectEditorHandler.prototype.unsubscribe = function() {
      this._resetState();
      this.selection_observer.dispose();
      this.editorElement.removeEventListener('mousedown', this.onMouseDown);
      this.editorElement.removeEventListener('mousemove', this.onMouseMove);
      this.editorElement.removeEventListener('mouseup', this.onMouseEventToHijack);
      this.editorElement.removeEventListener('mouseleave', this.onMouseEventToHijack);
      this.editorElement.removeEventListener('mouseenter', this.onMouseEventToHijack);
      this.editorElement.removeEventListener('contextmenu', this.onMouseEventToHijack);
      return this.editorElement.removeEventListener('blur', this.onBlur);
    };

    SublimeSelectEditorHandler.prototype.onMouseDown = function(e) {
      if (this.mouseStartPos) {
        e.preventDefault();
        return false;
      }
      if (this._mainMouseAndKeyDown(e)) {
        this._resetState();
        this.mouseStartPos = this._screenPositionForMouseEvent(e);
        this.mouseEndPos = this.mouseStartPos;
        e.preventDefault();
        return false;
      }
    };

    SublimeSelectEditorHandler.prototype.onMouseMove = function(e) {
      if (this.mouseStartPos) {
        e.preventDefault();
        if (this._mainMouseDown(e)) {
          this.mouseEndPos = this._screenPositionForMouseEvent(e);
          if (this.mouseEndPos.isEqual(this.mouseEndPosPrev)) {
            return;
          }
          this._selectBoxAroundCursors();
          this.mouseEndPosPrev = this.mouseEndPos;
          return false;
        }
        if (e.which === 0) {
          return this._resetState();
        }
      }
    };

    SublimeSelectEditorHandler.prototype.onMouseEventToHijack = function(e) {
      if (this.mouseStartPos) {
        e.preventDefault();
        return false;
      }
    };

    SublimeSelectEditorHandler.prototype.onBlur = function(e) {
      return this._resetState();
    };

    SublimeSelectEditorHandler.prototype.onRangeChange = function(newVal) {
      if (this.mouseStartPos && !newVal.selection.isSingleScreenLine()) {
        newVal.selection.destroy();
        return this._selectBoxAroundCursors();
      }
    };

    SublimeSelectEditorHandler.prototype._resetState = function() {
      this.mouseStartPos = null;
      return this.mouseEndPos = null;
    };

    SublimeSelectEditorHandler.prototype._setup_vars = function() {
      if (this.editorElement == null) {
        this.editorElement = atom.views.getView(this.editor);
      }
      return this.editorComponent != null ? this.editorComponent : this.editorComponent = this.editorElement.component;
    };

    SublimeSelectEditorHandler.prototype._screenPositionForMouseEvent = function(e) {
      var column, defaultCharWidth, pixelPosition, row, targetLeft, targetTop;
      this._setup_vars();
      pixelPosition = this.editorComponent.pixelPositionForMouseEvent(e);
      targetTop = pixelPosition.top;
      targetLeft = pixelPosition.left;
      defaultCharWidth = this.editor.getDefaultCharWidth();
      row = Math.floor(targetTop / this.editor.getLineHeightInPixels());
      if (row > this.editor.getLastBufferRow()) {
        targetLeft = 2e308;
      }
      row = Math.min(row, this.editor.getLastBufferRow());
      row = Math.max(0, row);
      column = Math.round(targetLeft / defaultCharWidth);
      return new Point(row, column);
    };

    SublimeSelectEditorHandler.prototype._mainMouseDown = function(e) {
      return e.which === this.inputCfg.mouseNum;
    };

    SublimeSelectEditorHandler.prototype._mainMouseAndKeyDown = function(e) {
      if (this.inputCfg.selectKey) {
        return this._mainMouseDown(e) && e[this.inputCfg.selectKey];
      } else {
        return this._mainMouseDown(e);
      }
    };

    SublimeSelectEditorHandler.prototype._numCharsInScreenRange = function(screenRange) {
      var bufferRange, contentsOfRange;
      bufferRange = this.editor.bufferRangeForScreenRange(screenRange);
      contentsOfRange = this.editor.getTextInBufferRange(bufferRange);
      return contentsOfRange.length;
    };

    SublimeSelectEditorHandler.prototype._selectBoxAroundCursors = function() {
      var emptyRanges, finalRanges, i, isReversed, numChars, range, ranges, ref, ref1, row;
      if (this.mouseStartPos && this.mouseEndPos) {
        emptyRanges = [];
        ranges = [];
        for (row = i = ref = this.mouseStartPos.row, ref1 = this.mouseEndPos.row; ref <= ref1 ? i <= ref1 : i >= ref1; row = ref <= ref1 ? ++i : --i) {
          if (this.mouseEndPos.column < 0) {
            this.mouseEndPos.column = 0;
          }
          range = [[row, this.mouseStartPos.column], [row, this.mouseEndPos.column]];
          numChars = this._numCharsInScreenRange(range);
          if (numChars === 0) {
            emptyRanges.push(range);
          } else {
            ranges.push(range);
          }
        }
        finalRanges = ranges.length ? ranges : emptyRanges;
        if (finalRanges.length) {
          isReversed = this.mouseEndPos.column < this.mouseStartPos.column;
          return this.editor.setSelectedScreenRanges(finalRanges, {
            reversed: isReversed
          });
        }
      }
    };

    return SublimeSelectEditorHandler;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL1N1YmxpbWUtU3R5bGUtQ29sdW1uLVNlbGVjdGlvbi9saWIvZWRpdG9yLWhhbmRsZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpQ0FBQTtJQUFBOztFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDUTtJQUNTLG9DQUFDLE1BQUQsRUFBUyxRQUFUOzs7Ozs7TUFDWCxJQUFDLENBQUEsTUFBRCxHQUFVO01BQ1YsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxXQUFELENBQUE7TUFDQSxJQUFDLENBQUEsV0FBRCxDQUFBO0lBSlc7O3lDQU1iLFNBQUEsR0FBVyxTQUFBO01BQ1QsSUFBQyxDQUFBLGtCQUFELEdBQXNCLElBQUMsQ0FBQSxNQUFNLENBQUMseUJBQVIsQ0FBa0MsSUFBQyxDQUFBLGFBQW5DO01BQ3RCLElBQUMsQ0FBQSxhQUFhLENBQUMsZ0JBQWYsQ0FBZ0MsV0FBaEMsRUFBK0MsSUFBQyxDQUFBLFdBQWhEO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxnQkFBZixDQUFnQyxXQUFoQyxFQUErQyxJQUFDLENBQUEsV0FBaEQ7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLGdCQUFmLENBQWdDLFNBQWhDLEVBQStDLElBQUMsQ0FBQSxvQkFBaEQ7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLGdCQUFmLENBQWdDLFlBQWhDLEVBQStDLElBQUMsQ0FBQSxvQkFBaEQ7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLGdCQUFmLENBQWdDLFlBQWhDLEVBQStDLElBQUMsQ0FBQSxvQkFBaEQ7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLGdCQUFmLENBQWdDLGFBQWhDLEVBQStDLElBQUMsQ0FBQSxvQkFBaEQ7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLGdC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dUJBQVIsQ0FBZ0MsV0FBaEMsRUFBNkM7WUFBQyxRQUFBLEVBQVUsVUFBWDtXQUE3QyxFQUZGO1NBZEY7O0lBRHVCOzs7OztBQW5IN0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjbGFzcyBTdWJsaW1lU2VsZWN0RWRpdG9ySGFuZGxlclxuICAgIGNvbnN0cnVjdG9yOiAoZWRpdG9yLCBpbnB1dENmZykgLT5cbiAgICAgIEBlZGl0b3IgPSBlZGl0b3JcbiAgICAgIEBpbnB1dENmZyA9IGlucHV0Q2ZnXG4gICAgICBAX3Jlc2V0U3RhdGUoKVxuICAgICAgQF9zZXR1cF92YXJzKClcblxuICAgIHN1YnNjcmliZTogLT5cbiAgICAgIEBzZWxlY3Rpb25fb2JzZXJ2ZXIgPSBAZWRpdG9yLm9uRGlkQ2hhbmdlU2VsZWN0aW9uUmFuZ2UgQG9uUmFuZ2VDaGFuZ2VcbiAgICAgIEBlZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsICAgQG9uTW91c2VEb3duXG4gICAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCAgIEBvbk1vdXNlTW92ZVxuICAgICAgQGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsICAgICBAb25Nb3VzZUV2ZW50VG9IaWphY2tcbiAgICAgIEBlZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlbGVhdmUnLCAgQG9uTW91c2VFdmVudFRvSGlqYWNrXG4gICAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZWVudGVyJywgIEBvbk1vdXNlRXZlbnRUb0hpamFja1xuICAgICAgQGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnY29udGV4dG1lbnUnLCBAb25Nb3VzZUV2ZW50VG9IaWphY2tcbiAgICAgIEBlZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2JsdXInLCAgICAgICAgQG9uQmx1clxuXG4gICAgdW5zdWJzY3JpYmU6IC0+XG4gICAgICBAX3Jlc2V0U3RhdGUoKVxuICAgICAgQHNlbGVjdGlvbl9vYnNlcnZlci5kaXNwb3NlKClcbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsICAgQG9uTW91c2VEb3duXG4gICAgICBAZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCAgIEBvbk1vdXNlTW92ZVxuICAgICAgQGVkaXRvckVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsICAgICBAb25Nb3VzZUV2ZW50VG9IaWphY2tcbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ21vdXNlbGVhdmUnLCAgQG9uTW91c2VFdmVudFRvSGlqYWNrXG4gICAgICBAZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZWVudGVyJywgIEBvbk1vdXNlRXZlbnRUb0hpamFja1xuICAgICAgQGVkaXRvckVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAnY29udGV4dG1lbnUnLCBAb25Nb3VzZUV2ZW50VG9IaWphY2tcbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2JsdXInLCAgICAgICAgQG9uQmx1clxuXG4gICAgIyAtLS0tLS0tXG4gICAgIyBFdmVudCBIYW5kbGVyc1xuICAgICMgLS0tLS0tLVxuXG4gICAgb25Nb3VzZURvd246IChlKSA9PlxuICAgICAgaWYgQG1vdXNlU3RhcnRQb3NcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICBpZiBAX21haW5Nb3VzZUFuZEtleURvd24oZSlcbiAgICAgICAgQF9yZXNldFN0YXRlKClcbiAgICAgICAgQG1vdXNlU3RhcnRQb3MgPSBAX3NjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudChlKVxuICAgICAgICBAbW91c2VFbmRQb3MgICA9IEBtb3VzZVN0YXJ0UG9zXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgIG9uTW91c2VNb3ZlOiAoZSkgPT5cbiAgICAgIGlmIEBtb3VzZVN0YXJ0UG9zXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBpZiBAX21haW5Nb3VzZURvd24oZSlcbiAgICAgICAgICBAbW91c2VFbmRQb3MgPSBAX3NjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudChlKVxuICAgICAgICAgIHJldHVybiBpZiBAbW91c2VFbmRQb3MuaXNFcXVhbCBAbW91c2VFbmRQb3NQcmV2XG4gICAgICAgICAgQF9zZWxlY3RCb3hBcm91bmRDdXJzb3JzKClcbiAgICAgICAgICBAbW91c2VFbmRQb3NQcmV2ID0gQG1vdXNlRW5kUG9zXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIGlmIGUud2hpY2ggPT0gMFxuICAgICAgICAgIEBfcmVzZXRTdGF0ZSgpXG5cbiAgICAjIEhpamFjayBhbGwgdGhlIG1vdXNlIGV2ZW50cyB3aGlsZSBzZWxlY3RpbmdcbiAgICBvbk1vdXNlRXZlbnRUb0hpamFjazogKGUpID0+XG4gICAgICBpZiBAbW91c2VTdGFydFBvc1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBvbkJsdXI6IChlKSA9PlxuICAgICAgQF9yZXNldFN0YXRlKClcblxuICAgIG9uUmFuZ2VDaGFuZ2U6IChuZXdWYWwpID0+XG4gICAgICBpZiBAbW91c2VTdGFydFBvcyBhbmQgIW5ld1ZhbC5zZWxlY3Rpb24uaXNTaW5nbGVTY3JlZW5MaW5lKClcbiAgICAgICAgbmV3VmFsLnNlbGVjdGlvbi5kZXN0cm95KClcbiAgICAgICAgQF9zZWxlY3RCb3hBcm91bmRDdXJzb3JzKClcblxuICAgICMgLS0tLS0tLVxuICAgICMgTWV0aG9kc1xuICAgICMgLS0tLS0tLVxuXG4gICAgX3Jlc2V0U3RhdGU6IC0+XG4gICAgICBAbW91c2VTdGFydFBvcyA9IG51bGxcbiAgICAgIEBtb3VzZUVuZFBvcyAgID0gbnVsbFxuXG4gICAgX3NldHVwX3ZhcnM6IC0+XG4gICAgICBAZWRpdG9yRWxlbWVudCA/PSBhdG9tLnZpZXdzLmdldFZpZXcgQGVkaXRvclxuICAgICAgQGVkaXRvckNvbXBvbmVudCA/PSBAZWRpdG9yRWxlbWVudC5jb21wb25lbnRcblxuICAgICMgSSBoYWQgdG8gY3JlYXRlIG15IG93biB2ZXJzaW9uIG9mIEBlZGl0b3JDb21wb25lbnQuc2NyZWVuUG9zaXRpb25Gcm9tTW91c2VFdmVudFxuICAgIF9zY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQ6IChlKSAtPlxuICAgICAgQF9zZXR1cF92YXJzKClcbiAgICAgIHBpeGVsUG9zaXRpb24gICAgPSBAZWRpdG9yQ29tcG9uZW50LnBpeGVsUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGUpXG4gICAgICB0YXJnZXRUb3AgICAgICAgID0gcGl4ZWxQb3NpdGlvbi50b3BcbiAgICAgIHRhcmdldExlZnQgICAgICAgPSBwaXhlbFBvc2l0aW9uLmxlZnRcbiAgICAgIGRlZmF1bHRDaGFyV2lkdGggPSBAZWRpdG9yLmdldERlZmF1bHRDaGFyV2lkdGgoKVxuICAgICAgcm93ICAgICAgICAgICAgICA9IE1hdGguZmxvb3IodGFyZ2V0VG9wIC8gQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSlcbiAgICAgIHRhcmdldExlZnQgICAgICAgPSBJbmZpbml0eSBpZiByb3cgPiBAZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKVxuICAgICAgcm93ICAgICAgICAgICAgICA9IE1hdGgubWluKHJvdywgQGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCkpXG4gICAgICByb3cgICAgICAgICAgICAgID0gTWF0aC5tYXgoMCwgcm93KVxuICAgICAgY29sdW1uICAgICAgICAgICA9IE1hdGgucm91bmQgKHRhcmdldExlZnQpIC8gZGVmYXVsdENoYXJXaWR0aFxuICAgICAgbmV3IFBvaW50KHJvdywgY29sdW1uKVxuXG4gICAgIyBtZXRob2RzIGZvciBjaGVja2luZyBtb3VzZS9rZXkgc3RhdGUgYWdhaW5zdCBjb25maWdcbiAgICBfbWFpbk1vdXNlRG93bjogKGUpIC0+XG4gICAgICBlLndoaWNoIGlzIEBpbnB1dENmZy5tb3VzZU51bVxuXG4gICAgX21haW5Nb3VzZUFuZEtleURvd246IChlKSAtPlxuICAgICAgaWYgQGlucHV0Q2ZnLnNlbGVjdEtleVxuICAgICAgICBAX21haW5Nb3VzZURvd24oZSkgYW5kIGVbQGlucHV0Q2ZnLnNlbGVjdEtleV1cbiAgICAgIGVsc2VcbiAgICAgICAgQF9tYWluTW91c2VEb3duKGUpXG5cbiAgICBfbnVtQ2hhcnNJblNjcmVlblJhbmdlOiAoc2NyZWVuUmFuZ2UpIC0+XG4gICAgICBidWZmZXJSYW5nZSA9IEBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY3JlZW5SYW5nZShzY3JlZW5SYW5nZSlcbiAgICAgIGNvbnRlbnRzT2ZSYW5nZSA9IEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoYnVmZmVyUmFuZ2UpXG4gICAgICBjb250ZW50c09mUmFuZ2UubGVuZ3RoXG5cbiAgICAjIERvIHRoZSBhY3R1YWwgc2VsZWN0aW5nXG4gICAgX3NlbGVjdEJveEFyb3VuZEN1cnNvcnM6IC0+XG4gICAgICBpZiBAbW91c2VTdGFydFBvcyBhbmQgQG1vdXNlRW5kUG9zXG4gICAgICAgIGVtcHR5UmFuZ2VzID0gW11cbiAgICAgICAgcmFuZ2VzID0gW11cblxuICAgICAgICBmb3Igcm93IGluIFtAbW91c2VTdGFydFBvcy5yb3cuLkBtb3VzZUVuZFBvcy5yb3ddXG4gICAgICAgICAgQG1vdXNlRW5kUG9zLmNvbHVtbiA9IDAgaWYgQG1vdXNlRW5kUG9zLmNvbHVtbiA8IDBcbiAgICAgICAgICByYW5nZSA9IFtbcm93LCBAbW91c2VTdGFydFBvcy5jb2x1bW5dLCBbcm93LCBAbW91c2VFbmRQb3MuY29sdW1uXV1cbiAgICAgICAgICBudW1DaGFycyA9IEBfbnVtQ2hhcnNJblNjcmVlblJhbmdlKHJhbmdlKVxuICAgICAgICAgIGlmIG51bUNoYXJzID09IDBcbiAgICAgICAgICAgIGVtcHR5UmFuZ2VzLnB1c2ggcmFuZ2VcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5nZXMucHVzaCByYW5nZVxuXG4gICAgICAgIGZpbmFsUmFuZ2VzID0gaWYgcmFuZ2VzLmxlbmd0aCB0aGVuIHJhbmdlcyBlbHNlIGVtcHR5UmFuZ2VzXG4gICAgICAgIGlmIGZpbmFsUmFuZ2VzLmxlbmd0aFxuICAgICAgICAgIGlzUmV2ZXJzZWQgPSBAbW91c2VFbmRQb3MuY29sdW1uIDwgQG1vdXNlU3RhcnRQb3MuY29sdW1uXG4gICAgICAgICAgQGVkaXRvci5zZXRTZWxlY3RlZFNjcmVlblJhbmdlcyBmaW5hbFJhbmdlcywge3JldmVyc2VkOiBpc1JldmVyc2VkfVxuIl19
