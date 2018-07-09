Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _gravatar = require('gravatar');

var _gravatar2 = _interopRequireDefault(_gravatar);

var _open = require('open');

var _open2 = _interopRequireDefault(_open);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _atom = require('atom');

var _providerFactory = require('./provider/factory');

var _providerFactory2 = _interopRequireDefault(_providerFactory);

var _utilsCreateElement = require('./utils/create-element');

var _utilsCreateElement2 = _interopRequireDefault(_utilsCreateElement);

var _utilsThrottle = require('./utils/throttle');

var _utilsThrottle2 = _interopRequireDefault(_utilsThrottle);

var _colorRainbow = require('color-rainbow');

var _colorRainbow2 = _interopRequireDefault(_colorRainbow);

'use babel';

var BlameGutterView = (function () {
  function BlameGutterView(state, editor) {
    _classCallCheck(this, BlameGutterView);

    this.state = state;
    this.editor = editor;
    this.listeners = {};

    this.state.width = atom.config.get('blame.defaultWidth');
    this.setGutterWidth(this.state.width);

    this.provider = (0, _providerFactory2['default'])(this.editor.getPath());

    this.gutter = this.editor.addGutter({ name: 'blame' });
    this.markers = [];

    this.editorElement = atom.views.getView(this.editor);

    this.setVisible(true);
  }

  _createClass(BlameGutterView, [{
    key: 'toggleVisible',
    value: function toggleVisible() {
      this.setVisible(!this.visible);
    }
  }, {
    key: 'setVisible',
    value: function setVisible(visible) {
      var _this = this;

      if (!this.provider) {
        visible = false;
      }

      this.visible = visible;

      if (this.editor.isModified()) {
        this.visible = false;
      }

      if (this.visible) {
        this.update();

        if (!this.disposables) {
          this.disposables = new _atom.CompositeDisposable();
        }
        this.disposables.add(this.editor.onDidSave(function () {
          return _this.update();
        }));

        this.gutter.show();

        this.scrollListener = this.editorElement.onDidChangeScrollTop((0, _utilsThrottle2['default'])(function () {
          return _this.hideTooltips();
        }, 500));
      } else {
        if (this.scrollListener) {
          this.scrollListener.dispose();
        }
        this.gutter.hide();

        if (this.disposables) {
          this.disposables.dispose();
        }
        this.disposables = null;
        this.removeAllMarkers();
      }
    }
  }, {
    key: 'hideTooltips',
    value: function hideTooltips() {
      // Trigger resize event on window to hide tooltips
      window.dispatchEvent(new window.Event('resize'));
    }
  }, {
    key: 'update',
    value: function update() {
      var _this2 = this;

      this.provider.blame(function (result) {
        if (!_this2.visible) {
          return;
        }

        _this2.removeAllMarkers();

        var lastHash = null;
        var commitCount = 0;

        if (!result) {
          return;
        }

        var hashes = Object.keys(result).reduce(function (hashes, key) {
          var line = result[key];
          var hash = line.rev.replace(/\s.*/, '');

          if (hashes.indexOf(hash) === -1) {
            hashes.push(hash);
          }
          return hashes;
        }, []);

        var rainbow = new _colorRainbow2['default'](hashes.length);
        var hashColors = hashes.reduce(function (colors, hash) {
          colors[hash] = 'rgba(' + rainbow.next().values.rgb.join(',') + ', 0.4)';
          return colors;
        }, {});

        Object.keys(result).forEach(function (lineNumber) {
          var line = result[lineNumber];

          var lineStr = undefined,
              rowCls = undefined;
          var hash = line.rev.replace(/\s.*/, '');

          if (lastHash !== hash) {
            lineStr = _this2.formatGutter(hash, line, hashColors[hash]);
            rowCls = 'blame-' + (commitCount++ % 2 === 0 ? 'even' : 'odd');
          } else {
            lineStr = '';
          }

          lastHash = hash;

          _this2.addMarker(Number(lineNumber) - 1, hash, rowCls, lineStr, hashColors[hash]);
        });
      });
    }
  }, {
    key: 'formatGutter',
    value: function formatGutter(hash, line, color) {
      var dateFormat = atom.config.get('blame.dateFormat');
      var dateStr = (0, _moment2['default'])(line.date).format(dateFormat);

      if (this.isCommited(hash)) {
        return atom.config.get('blame.gutterFormat').replace('{hash}', '<span class="hash">' + hash.substr(0, 8) + '</span>').replace('{long-hash}', '<span class="hash">' + hash + '</span>').replace('{date}', '<span class="date">' + dateStr + '</span>').replace('{author}', '<span class="author">' + line.author.name + '</span>');
      }

      return '' + line.author;
    }
  }, {
    key: 'linkClicked',
    value: function linkClicked(hash) {
      this.provider.getCommitLink(hash.replace(/^[\^]/, ''), function (link) {
        if (link) {
          return (0, _open2['default'])(link);
        }
        atom.notifications.addInfo('Unknown url.');
      });
    }
  }, {
    key: 'copyClicked',
    value: function copyClicked(hash) {
      atom.clipboard.write(hash);
    }
  }, {
    key: 'addMarker',
    value: function addMarker(lineNo, hash, rowCls, lineStr, color) {
      var item = this.markerInnerDiv(rowCls, hash, color);

      // no need to create objects and events on blank lines
      if (lineStr.length > 0) {
        var actionsCount = 0;
        if (this.isCommited(hash)) {
          if (this.provider.supports('copy')) {
            item.appendChild(this.copySpan(hash));
            actionsCount++;
          }
          if (this.provider.supports('link')) {
            item.appendChild(this.linkSpan(hash));
            actionsCount++;
          }
        }

        item.appendChild(this.lineSpan(lineStr, hash));
        item.classList.add('action-count-' + actionsCount);

        if (this.isCommited(hash)) {
          this.addTooltip(item, hash);
        }
      }

      item.appendChild(this.resizeHandleDiv());

      var marker = this.editor.markBufferRange([[lineNo, 0], [lineNo, 0]]);
      this.editor.decorateMarker(marker, {
        type: 'gutter',
        gutterName: 'blame',
        'class': 'blame-gutter',
        item: item
      });
      this.markers.push(marker);
    }
  }, {
    key: 'markerInnerDiv',
    value: function markerInnerDiv(rowCls, hash, color) {
      var _this3 = this;

      var item = (0, _utilsCreateElement2['default'])('div', {
        classes: ['blame-gutter-inner', rowCls],
        events: {
          mouseover: function mouseover() {
            return _this3.highlight(hash);
          },
          mouseout: function mouseout() {
            return _this3.highlight();
          }
        }
      });

      item.style.borderLeft = '6px solid ' + color;
      item.dataset.hash = hash;

      return item;
    }
  }, {
    key: 'highlight',
    value: function highlight() {
      var hash = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      [].concat(_toConsumableArray(document.getElementsByClassName('blame-gutter-inner'))).forEach(function (item) {
        if (item.dataset.hash === hash) {
          item.classList.add('highlight');
        } else {
          item.classList.remove('highlight');
        }
      });
    }
  }, {
    key: 'resizeHandleDiv',
    value: function resizeHandleDiv() {
      return (0, _utilsCreateElement2['default'])('div', {
        classes: ['blame-gutter-handle'],
        events: { mousedown: this.resizeStarted.bind(this) }
      });
    }
  }, {
    key: 'lineSpan',
    value: function lineSpan(str, hash) {
      return (0, _utilsCreateElement2['default'])('span', { inner: str });
    }
  }, {
    key: 'copySpan',
    value: function copySpan(hash) {
      var _this4 = this;

      return this.iconSpan(hash, 'copy', function () {
        _this4.copyClicked(hash);
      });
    }
  }, {
    key: 'linkSpan',
    value: function linkSpan(hash) {
      var _this5 = this;

      return this.iconSpan(hash, 'link', function () {
        _this5.linkClicked(hash);
      });
    }
  }, {
    key: 'iconSpan',
    value: function iconSpan(hash, key, listener) {
      return (0, _utilsCreateElement2['default'])('span', {
        classes: ['icon', 'icon-' + key],
        attributes: { 'data-hash': hash },
        events: { click: listener }
      });
    }
  }, {
    key: 'removeAllMarkers',
    value: function removeAllMarkers() {
      this.markers.forEach(function (marker) {
        return marker.destroy();
      });
      this.markers = [];
    }
  }, {
    key: 'resizeStarted',
    value: function resizeStarted(e) {
      this.bind('mousemove', this.resizeMove);
      this.bind('mouseup', this.resizeStopped);

      this.resizeStartedAtX = e.pageX;
      this.resizeWidth = this.state.width;
    }
  }, {
    key: 'resizeStopped',
    value: function resizeStopped(e) {
      this.unbind('mousemove');
      this.unbind('mouseup');

      e.stopPropagation();
      e.preventDefault();
    }
  }, {
    key: 'bind',
    value: function bind(event, listener) {
      this.unbind(event);
      this.listeners[event] = listener.bind(this);
      document.addEventListener(event, this.listeners[event]);
    }
  }, {
    key: 'unbind',
    value: function unbind(event) {
      if (this.listeners[event]) {
        document.removeEventListener(event, this.listeners[event]);
        this.listeners[event] = false;
      }
    }
  }, {
    key: 'resizeMove',
    value: function resizeMove(e) {
      var diff = e.pageX - this.resizeStartedAtX;
      this.setGutterWidth(this.resizeWidth + diff);

      e.stopPropagation();
      e.preventDefault();
    }
  }, {
    key: 'gutterStyle',
    value: function gutterStyle() {
      var sheet = document.createElement('style');
      sheet.type = 'text/css';
      sheet.id = 'blame-gutter-style';

      return sheet;
    }
  }, {
    key: 'setGutterWidth',
    value: function setGutterWidth(width) {
      this.state.width = Math.max(50, Math.min(width, 500));

      var sheet = document.getElementById('blame-gutter-style');
      if (!sheet) {
        sheet = this.gutterStyle();
        document.head.appendChild(sheet);
      }

      sheet.innerHTML = '\n      atom-text-editor .gutter[gutter-name="blame"] {\n        width: ' + this.state.width + 'px\n      }\n    ';
    }
  }, {
    key: 'isCommited',
    value: function isCommited(hash) {
      return !/^[0]+$/.test(hash);
    }
  }, {
    key: 'addTooltip',
    value: function addTooltip(item, hash) {
      var _this6 = this;

      if (!item.getAttribute('data-has-tooltip')) {
        item.setAttribute('data-has-tooltip', true);

        this.provider.getCommit(hash.replace(/^[\^]/, ''), function (msg) {
          if (!_this6.visible) {
            return;
          }
          var avatar = _gravatar2['default'].url(msg.author.email, { s: 80 });
          var avatarCommiterStr = undefined;

          var authorStr = msg.author.name;

          if (msg.commiter) {
            if (msg.author.name !== msg.commiter.name) {
              authorStr += ' | Commiter: ' + msg.commiter.name;
            }

            if (msg.author.email !== msg.commiter.email) {
              avatarCommiterStr = '<img class="commiter-avatar" src="http:' + _gravatar2['default'].url(msg.commiter.email, { s: 40 }) + '"/>';
            }
          }

          _this6.disposables.add(atom.tooltips.add(item, {
            title: '\n            <div class="blame-tooltip">\n              <div class="head">\n                <img class="avatar" src="http:' + avatar + '"/>\n                ' + avatarCommiterStr + '\n                <div class="subject">' + msg.subject + '</div>\n                <div class="author">' + authorStr + '</div>\n              </div>\n              <div class="body">' + msg.message.replace('\n', '<br>') + '</div>\n            </div>\n          '
          }));
        });
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.setVisible(false);
      this.gutter.destroy();
      if (this.disposables) {
        this.disposables.dispose();
      }
    }
  }]);

  return BlameGutterView;
})();

exports['default'] = BlameGutterView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2x1aXouY2FycmFyby8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvYmxhbWUtZ3V0dGVyLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3dCQUVxQixVQUFVOzs7O29CQUNkLE1BQU07Ozs7c0JBQ0osUUFBUTs7OztvQkFDUyxNQUFNOzsrQkFDZCxvQkFBb0I7Ozs7a0NBQ3RCLHdCQUF3Qjs7Ozs2QkFDN0Isa0JBQWtCOzs7OzRCQUNuQixlQUFlOzs7O0FBVG5DLFdBQVcsQ0FBQTs7SUFXTCxlQUFlO0FBQ1AsV0FEUixlQUFlLENBQ04sS0FBSyxFQUFFLE1BQU0sRUFBRTswQkFEeEIsZUFBZTs7QUFFakIsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsUUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUE7O0FBRW5CLFFBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFDeEQsUUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBOztBQUVyQyxRQUFJLENBQUMsUUFBUSxHQUFHLGtDQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7O0FBRXRELFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtBQUN0RCxRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQTs7QUFFakIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7O0FBRXBELFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFD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QUMsSUFBSSxFQUFFLE1BQU0sQ0FBQywyQ0FFeEQ7V0FDRixDQUFDLENBQUMsQ0FBQTtTQUNKLENBQUMsQ0FBQTtPQUNIO0tBQ0Y7OztXQUVPLG1CQUFHO0FBQ1QsVUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN0QixVQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3JCLFVBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUFFLFlBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUE7T0FBRTtLQUNyRDs7O1NBeFZHLGVBQWU7OztxQkEyVk4sZUFBZSIsImZpbGUiOiIvaG9tZS9sdWl6LmNhcnJhcm8vLmF0b20vcGFja2FnZXMvYmxhbWUvbGliL2JsYW1lLWd1dHRlci12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IGdyYXZhdGFyIGZyb20gJ2dyYXZhdGFyJ1xuaW1wb3J0IG9wZW4gZnJvbSAnb3BlbidcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50J1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgcHJvdmlkZXJGYWN0b3J5IGZyb20gJy4vcHJvdmlkZXIvZmFjdG9yeSdcbmltcG9ydCBjcmVhdGVFbGVtZW50IGZyb20gJy4vdXRpbHMvY3JlYXRlLWVsZW1lbnQnXG5pbXBvcnQgdGhyb3R0bGUgZnJvbSAnLi91dGlscy90aHJvdHRsZSdcbmltcG9ydCBSYWluYm93IGZyb20gJ2NvbG9yLXJhaW5ib3cnXG5cbmNsYXNzIEJsYW1lR3V0dGVyVmlldyB7XG4gIGNvbnN0cnVjdG9yIChzdGF0ZSwgZWRpdG9yKSB7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlXG4gICAgdGhpcy5lZGl0b3IgPSBlZGl0b3JcbiAgICB0aGlzLmxpc3RlbmVycyA9IHt9XG5cbiAgICB0aGlzLnN0YXRlLndpZHRoID0gYXRvbS5jb25maWcuZ2V0KCdibGFtZS5kZWZhdWx0V2lkdGgnKVxuICAgIHRoaXMuc2V0R3V0dGVyV2lkdGgodGhpcy5zdGF0ZS53aWR0aClcblxuICAgIHRoaXMucHJvdmlkZXIgPSBwcm92aWRlckZhY3RvcnkodGhpcy5lZGl0b3IuZ2V0UGF0aCgpKVxuXG4gICAgdGhpcy5ndXR0ZXIgPSB0aGlzLmVkaXRvci5hZGRHdXR0ZXIoeyBuYW1lOiAnYmxhbWUnIH0pXG4gICAgdGhpcy5tYXJrZXJzID0gW11cblxuICAgIHRoaXMuZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmVkaXRvcilcblxuICAgIHRoaXMuc2V0VmlzaWJsZSh0cnVlKVxuICB9XG5cbiAgdG9nZ2xlVmlzaWJsZSAoKSB7XG4gICAgdGhpcy5zZXRWaXNpYmxlKCF0aGlzLnZpc2libGUpXG4gIH1cblxuICBzZXRWaXNpYmxlICh2aXNpYmxlKSB7XG4gICAgaWYgKCF0aGlzLnByb3ZpZGVyKSB7XG4gICAgICB2aXNpYmxlID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlXG5cbiAgICBpZiAodGhpcy5lZGl0b3IuaXNNb2RpZmllZCgpKSB7IHRoaXMudmlzaWJsZSA9IGZhbHNlIH1cblxuICAgIGlmICh0aGlzLnZpc2libGUpIHtcbiAgICAgIHRoaXMudXBkYXRlKClcblxuICAgICAgaWYgKCF0aGlzLmRpc3Bvc2FibGVzKSB7IHRoaXMuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpIH1cbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuZWRpdG9yLm9uRGlkU2F2ZSgoKSA9PiB0aGlzLnVwZGF0ZSgpKSlcblxuICAgICAgdGhpcy5ndXR0ZXIuc2hvdygpXG5cbiAgICAgIHRoaXMuc2Nyb2xsTGlzdGVuZXIgPSB0aGlzLmVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AoXG4gICAgICAgIHRocm90dGxlKCgpID0+IHRoaXMuaGlkZVRvb2x0aXBzKCksIDUwMClcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuc2Nyb2xsTGlzdGVuZXIpIHsgdGhpcy5zY3JvbGxMaXN0ZW5lci5kaXNwb3NlKCkgfVxuICAgICAgdGhpcy5ndXR0ZXIuaGlkZSgpXG5cbiAgICAgIGlmICh0aGlzLmRpc3Bvc2FibGVzKSB7IHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpIH1cbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBudWxsXG4gICAgICB0aGlzLnJlbW92ZUFsbE1hcmtlcnMoKVxuICAgIH1cbiAgfVxuXG4gIGhpZGVUb29sdGlwcyAoKSB7XG4gICAgLy8gVHJpZ2dlciByZXNpemUgZXZlbnQgb24gd2luZG93IHRvIGhpZGUgdG9vbHRpcHNcbiAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgd2luZG93LkV2ZW50KCdyZXNpemUnKSlcbiAgfVxuXG4gIHVwZGF0ZSAoKSB7XG4gICAgdGhpcy5wcm92aWRlci5ibGFtZSgocmVzdWx0KSA9PiB7XG4gICAgICBpZiAoIXRoaXMudmlzaWJsZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdGhpcy5yZW1vdmVBbGxNYXJrZXJzKClcblxuICAgICAgbGV0IGxhc3RIYXNoID0gbnVsbFxuICAgICAgbGV0IGNvbW1pdENvdW50ID0gMFxuXG4gICAgICBpZiAoIXJlc3VsdCkgeyByZXR1cm4gfVxuXG4gICAgICBjb25zdCBoYXNoZXMgPSBPYmplY3Qua2V5cyhyZXN1bHQpXG4gICAgICAgIC5yZWR1Y2UoKGhhc2hlcywga2V5KSA9PiB7XG4gICAgICAgICAgY29uc3QgbGluZSA9IHJlc3VsdFtrZXldXG4gICAgICAgICAgY29uc3QgaGFzaCA9IGxpbmUucmV2LnJlcGxhY2UoL1xccy4qLywgJycpXG5cbiAgICAgICAgICBpZiAoaGFzaGVzLmluZGV4T2YoaGFzaCkgPT09IC0xKSB7XG4gICAgICAgICAgICBoYXNoZXMucHVzaChoYXNoKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaGFzaGVzXG4gICAgICAgIH0sIFtdKVxuXG4gICAgICBjb25zdCByYWluYm93ID0gbmV3IFJhaW5ib3coaGFzaGVzLmxlbmd0aClcbiAgICAgIGNvbnN0IGhhc2hDb2xvcnMgPSBoYXNoZXMucmVkdWNlKChjb2xvcnMsIGhhc2gpID0+IHtcbiAgICAgICAgY29sb3JzW2hhc2hdID0gYHJnYmEoJHtyYWluYm93Lm5leHQoKS52YWx1ZXMucmdiLmpvaW4oJywnKX0sIDAuNClgXG4gICAgICAgIHJldHVybiBjb2xvcnNcbiAgICAgIH0sIHt9KVxuXG4gICAgICBPYmplY3Qua2V5cyhyZXN1bHQpLmZvckVhY2goKGxpbmVOdW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgbGluZSA9IHJlc3VsdFtsaW5lTnVtYmVyXVxuXG4gICAgICAgIGxldCBsaW5lU3RyLCByb3dDbHNcbiAgICAgICAgY29uc3QgaGFzaCA9IGxpbmUucmV2LnJlcGxhY2UoL1xccy4qLywgJycpXG5cbiAgICAgICAgaWYgKGxhc3RIYXNoICE9PSBoYXNoKSB7XG4gICAgICAgICAgbGluZVN0ciA9IHRoaXMuZm9ybWF0R3V0dGVyKGhhc2gsIGxpbmUsIGhhc2hDb2xvcnNbaGFzaF0pXG4gICAgICAgICAgcm93Q2xzID0gYGJsYW1lLSR7KGNvbW1pdENvdW50KysgJSAyID09PSAwKSA/ICdldmVuJyA6ICdvZGQnfWBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaW5lU3RyID0gJydcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3RIYXNoID0gaGFzaFxuXG4gICAgICAgIHRoaXMuYWRkTWFya2VyKE51bWJlcihsaW5lTnVtYmVyKSAtIDEsIGhhc2gsIHJvd0NscywgbGluZVN0ciwgaGFzaENvbG9yc1toYXNoXSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGZvcm1hdEd1dHRlciAoaGFzaCwgbGluZSwgY29sb3IpIHtcbiAgICBjb25zdCBkYXRlRm9ybWF0ID0gYXRvbS5jb25maWcuZ2V0KCdibGFtZS5kYXRlRm9ybWF0JylcbiAgICBjb25zdCBkYXRlU3RyID0gbW9tZW50KGxpbmUuZGF0ZSlcbiAgICAgIC5mb3JtYXQoZGF0ZUZvcm1hdClcblxuICAgIGlmICh0aGlzLmlzQ29tbWl0ZWQoaGFzaCkpIHtcbiAgICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ2JsYW1lLmd1dHRlckZvcm1hdCcpXG4gICAgICAgIC5yZXBsYWNlKCd7aGFzaH0nLCBgPHNwYW4gY2xhc3M9XCJoYXNoXCI+JHtoYXNoLnN1YnN0cigwLCA4KX08L3NwYW4+YClcbiAgICAgICAgLnJlcGxhY2UoJ3tsb25nLWhhc2h9JywgYDxzcGFuIGNsYXNzPVwiaGFzaFwiPiR7aGFzaH08L3NwYW4+YClcbiAgICAgICAgLnJlcGxhY2UoJ3tkYXRlfScsIGA8c3BhbiBjbGFzcz1cImRhdGVcIj4ke2RhdGVTdHJ9PC9zcGFuPmApXG4gICAgICAgIC5yZXBsYWNlKCd7YXV0aG9yfScsIGA8c3BhbiBjbGFzcz1cImF1dGhvclwiPiR7bGluZS5hdXRob3IubmFtZX08L3NwYW4+YClcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7bGluZS5hdXRob3J9YFxuICB9XG5cbiAgbGlua0NsaWNrZWQgKGhhc2gpIHtcbiAgICB0aGlzLnByb3ZpZGVyLmdldENvbW1pdExpbmsoaGFzaC5yZXBsYWNlKC9eW1xcXl0vLCAnJyksIChsaW5rKSA9PiB7XG4gICAgICBpZiAobGluaykge1xuICAgICAgICByZXR1cm4gb3BlbihsaW5rKVxuICAgICAgfVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1Vua25vd24gdXJsLicpXG4gICAgfSlcbiAgfVxuXG4gIGNvcHlDbGlja2VkIChoYXNoKSB7XG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoaGFzaClcbiAgfVxuXG4gIGFkZE1hcmtlciAobGluZU5vLCBoYXNoLCByb3dDbHMsIGxpbmVTdHIsIGNvbG9yKSB7XG4gICAgY29uc3QgaXRlbSA9IHRoaXMubWFya2VySW5uZXJEaXYocm93Q2xzLCBoYXNoLCBjb2xvcilcblxuICAgIC8vIG5vIG5lZWQgdG8gY3JlYXRlIG9iamVjdHMgYW5kIGV2ZW50cyBvbiBibGFuayBsaW5lc1xuICAgIGlmIChsaW5lU3RyLmxlbmd0aCA+IDApIHtcbiAgICAgIGxldCBhY3Rpb25zQ291bnQgPSAwXG4gICAgICBpZiAodGhpcy5pc0NvbW1pdGVkKGhhc2gpKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3ZpZGVyLnN1cHBvcnRzKCdjb3B5JykpIHtcbiAgICAgICAgICBpdGVtLmFwcGVuZENoaWxkKHRoaXMuY29weVNwYW4oaGFzaCkpXG4gICAgICAgICAgYWN0aW9uc0NvdW50KytcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm92aWRlci5zdXBwb3J0cygnbGluaycpKSB7XG4gICAgICAgICAgaXRlbS5hcHBlbmRDaGlsZCh0aGlzLmxpbmtTcGFuKGhhc2gpKVxuICAgICAgICAgIGFjdGlvbnNDb3VudCsrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaXRlbS5hcHBlbmRDaGlsZCh0aGlzLmxpbmVTcGFuKGxpbmVTdHIsIGhhc2gpKVxuICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKGBhY3Rpb24tY291bnQtJHthY3Rpb25zQ291bnR9YClcblxuICAgICAgaWYgKHRoaXMuaXNDb21taXRlZChoYXNoKSkge1xuICAgICAgICB0aGlzLmFkZFRvb2x0aXAoaXRlbSwgaGFzaClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpdGVtLmFwcGVuZENoaWxkKHRoaXMucmVzaXplSGFuZGxlRGl2KCkpXG5cbiAgICBjb25zdCBtYXJrZXIgPSB0aGlzLmVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1tsaW5lTm8sIDBdLCBbbGluZU5vLCAwXV0pXG4gICAgdGhpcy5lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICB0eXBlOiAnZ3V0dGVyJyxcbiAgICAgIGd1dHRlck5hbWU6ICdibGFtZScsXG4gICAgICBjbGFzczogJ2JsYW1lLWd1dHRlcicsXG4gICAgICBpdGVtOiBpdGVtXG4gICAgfSlcbiAgICB0aGlzLm1hcmtlcnMucHVzaChtYXJrZXIpXG4gIH1cblxuICBtYXJrZXJJbm5lckRpdiAocm93Q2xzLCBoYXNoLCBjb2xvcikge1xuICAgIGNvbnN0IGl0ZW0gPSBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICBjbGFzc2VzOiBbICdibGFtZS1ndXR0ZXItaW5uZXInLCByb3dDbHMgXSxcbiAgICAgIGV2ZW50czoge1xuICAgICAgICBtb3VzZW92ZXI6ICgpID0+IHRoaXMuaGlnaGxpZ2h0KGhhc2gpLFxuICAgICAgICBtb3VzZW91dDogKCkgPT4gdGhpcy5oaWdobGlnaHQoKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpdGVtLnN0eWxlLmJvcmRlckxlZnQgPSBgNnB4IHNvbGlkICR7Y29sb3J9YFxuICAgIGl0ZW0uZGF0YXNldC5oYXNoID0gaGFzaFxuXG4gICAgcmV0dXJuIGl0ZW1cbiAgfVxuXG4gIGhpZ2hsaWdodCAoaGFzaCA9IG51bGwpIHtcbiAgICBbLi4uZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYmxhbWUtZ3V0dGVyLWlubmVyJyldLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGlmIChpdGVtLmRhdGFzZXQuaGFzaCA9PT0gaGFzaCkge1xuICAgICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2hpZ2hsaWdodCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZ2hsaWdodCcpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJlc2l6ZUhhbmRsZURpdiAoKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgIGNsYXNzZXM6IFsgJ2JsYW1lLWd1dHRlci1oYW5kbGUnIF0sXG4gICAgICBldmVudHM6IHsgbW91c2Vkb3duOiB0aGlzLnJlc2l6ZVN0YXJ0ZWQuYmluZCh0aGlzKSB9XG4gICAgfSlcbiAgfVxuXG4gIGxpbmVTcGFuIChzdHIsIGhhc2gpIHtcbiAgICByZXR1cm4gY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgaW5uZXI6IHN0ciB9KVxuICB9XG5cbiAgY29weVNwYW4gKGhhc2gpIHtcbiAgICByZXR1cm4gdGhpcy5pY29uU3BhbihoYXNoLCAnY29weScsICgpID0+IHtcbiAgICAgIHRoaXMuY29weUNsaWNrZWQoaGFzaClcbiAgICB9KVxuICB9XG5cbiAgbGlua1NwYW4gKGhhc2gpIHtcbiAgICByZXR1cm4gdGhpcy5pY29uU3BhbihoYXNoLCAnbGluaycsICgpID0+IHtcbiAgICAgIHRoaXMubGlua0NsaWNrZWQoaGFzaClcbiAgICB9KVxuICB9XG5cbiAgaWNvblNwYW4gKGhhc2gsIGtleSwgbGlzdGVuZXIpIHtcbiAgICByZXR1cm4gY3JlYXRlRWxlbWVudCgnc3BhbicsIHtcbiAgICAgIGNsYXNzZXM6IFsgJ2ljb24nLCBgaWNvbi0ke2tleX1gIF0sXG4gICAgICBhdHRyaWJ1dGVzOiB7ICdkYXRhLWhhc2gnOiBoYXNoIH0sXG4gICAgICBldmVudHM6IHsgY2xpY2s6IGxpc3RlbmVyIH1cbiAgICB9KVxuICB9XG5cbiAgcmVtb3ZlQWxsTWFya2VycyAoKSB7XG4gICAgdGhpcy5tYXJrZXJzLmZvckVhY2gobWFya2VyID0+IG1hcmtlci5kZXN0cm95KCkpXG4gICAgdGhpcy5tYXJrZXJzID0gW11cbiAgfVxuXG4gIHJlc2l6ZVN0YXJ0ZWQgKGUpIHtcbiAgICB0aGlzLmJpbmQoJ21vdXNlbW92ZScsIHRoaXMucmVzaXplTW92ZSlcbiAgICB0aGlzLmJpbmQoJ21vdXNldXAnLCB0aGlzLnJlc2l6ZVN0b3BwZWQpXG5cbiAgICB0aGlzLnJlc2l6ZVN0YXJ0ZWRBdFggPSBlLnBhZ2VYXG4gICAgdGhpcy5yZXNpemVXaWR0aCA9IHRoaXMuc3RhdGUud2lkdGhcbiAgfVxuXG4gIHJlc2l6ZVN0b3BwZWQgKGUpIHtcbiAgICB0aGlzLnVuYmluZCgnbW91c2Vtb3ZlJylcbiAgICB0aGlzLnVuYmluZCgnbW91c2V1cCcpXG5cbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBiaW5kIChldmVudCwgbGlzdGVuZXIpIHtcbiAgICB0aGlzLnVuYmluZChldmVudClcbiAgICB0aGlzLmxpc3RlbmVyc1tldmVudF0gPSBsaXN0ZW5lci5iaW5kKHRoaXMpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5saXN0ZW5lcnNbZXZlbnRdKVxuICB9XG5cbiAgdW5iaW5kIChldmVudCkge1xuICAgIGlmICh0aGlzLmxpc3RlbmVyc1tldmVudF0pIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMubGlzdGVuZXJzW2V2ZW50XSlcbiAgICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50XSA9IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgcmVzaXplTW92ZSAoZSkge1xuICAgIGNvbnN0IGRpZmYgPSBlLnBhZ2VYIC0gdGhpcy5yZXNpemVTdGFydGVkQXRYXG4gICAgdGhpcy5zZXRHdXR0ZXJXaWR0aCh0aGlzLnJlc2l6ZVdpZHRoICsgZGlmZilcblxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGd1dHRlclN0eWxlICgpIHtcbiAgICBjb25zdCBzaGVldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgICBzaGVldC50eXBlID0gJ3RleHQvY3NzJ1xuICAgIHNoZWV0LmlkID0gJ2JsYW1lLWd1dHRlci1zdHlsZSdcblxuICAgIHJldHVybiBzaGVldFxuICB9XG5cbiAgc2V0R3V0dGVyV2lkdGggKHdpZHRoKSB7XG4gICAgdGhpcy5zdGF0ZS53aWR0aCA9IE1hdGgubWF4KDUwLCBNYXRoLm1pbih3aWR0aCwgNTAwKSlcblxuICAgIGxldCBzaGVldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdibGFtZS1ndXR0ZXItc3R5bGUnKVxuICAgIGlmICghc2hlZXQpIHtcbiAgICAgIHNoZWV0ID0gdGhpcy5ndXR0ZXJTdHlsZSgpXG4gICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNoZWV0KVxuICAgIH1cblxuICAgIHNoZWV0LmlubmVySFRNTCA9IGBcbiAgICAgIGF0b20tdGV4dC1lZGl0b3IgLmd1dHRlcltndXR0ZXItbmFtZT1cImJsYW1lXCJdIHtcbiAgICAgICAgd2lkdGg6ICR7dGhpcy5zdGF0ZS53aWR0aH1weFxuICAgICAgfVxuICAgIGBcbiAgfVxuXG4gIGlzQ29tbWl0ZWQgKGhhc2gpIHtcbiAgICByZXR1cm4gIS9eWzBdKyQvLnRlc3QoaGFzaClcbiAgfVxuXG4gIGFkZFRvb2x0aXAgKGl0ZW0sIGhhc2gpIHtcbiAgICBpZiAoIWl0ZW0uZ2V0QXR0cmlidXRlKCdkYXRhLWhhcy10b29sdGlwJykpIHtcbiAgICAgIGl0ZW0uc2V0QXR0cmlidXRlKCdkYXRhLWhhcy10b29sdGlwJywgdHJ1ZSlcblxuICAgICAgdGhpcy5wcm92aWRlci5nZXRDb21taXQoaGFzaC5yZXBsYWNlKC9eW1xcXl0vLCAnJyksIChtc2cpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnZpc2libGUpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhdmF0YXIgPSBncmF2YXRhci51cmwobXNnLmF1dGhvci5lbWFpbCwgeyBzOiA4MCB9KVxuICAgICAgICBsZXQgYXZhdGFyQ29tbWl0ZXJTdHJcblxuICAgICAgICBsZXQgYXV0aG9yU3RyID0gbXNnLmF1dGhvci5uYW1lXG5cbiAgICAgICAgaWYgKG1zZy5jb21taXRlcikge1xuICAgICAgICAgIGlmIChtc2cuYXV0aG9yLm5hbWUgIT09IG1zZy5jb21taXRlci5uYW1lKSB7XG4gICAgICAgICAgICBhdXRob3JTdHIgKz0gYCB8IENvbW1pdGVyOiAke21zZy5jb21taXRlci5uYW1lfWBcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobXNnLmF1dGhvci5lbWFpbCAhPT0gbXNnLmNvbW1pdGVyLmVtYWlsKSB7XG4gICAgICAgICAgICBhdmF0YXJDb21taXRlclN0ciA9IGA8aW1nIGNsYXNzPVwiY29tbWl0ZXItYXZhdGFyXCIgc3JjPVwiaHR0cDoke2dyYXZhdGFyLnVybChtc2cuY29tbWl0ZXIuZW1haWwsIHsgczogNDAgfSl9XCIvPmBcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLnRvb2x0aXBzLmFkZChpdGVtLCB7XG4gICAgICAgICAgdGl0bGU6IGBcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJibGFtZS10b29sdGlwXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkXCI+XG4gICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cImF2YXRhclwiIHNyYz1cImh0dHA6JHthdmF0YXJ9XCIvPlxuICAgICAgICAgICAgICAgICR7YXZhdGFyQ29tbWl0ZXJTdHJ9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN1YmplY3RcIj4ke21zZy5zdWJqZWN0fTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhdXRob3JcIj4ke2F1dGhvclN0cn08L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJib2R5XCI+JHttc2cubWVzc2FnZS5yZXBsYWNlKCdcXG4nLCAnPGJyPicpfTwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgYFxuICAgICAgICB9KSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSAoKSB7XG4gICAgdGhpcy5zZXRWaXNpYmxlKGZhbHNlKVxuICAgIHRoaXMuZ3V0dGVyLmRlc3Ryb3koKVxuICAgIGlmICh0aGlzLmRpc3Bvc2FibGVzKSB7IHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCbGFtZUd1dHRlclZpZXdcbiJdfQ==