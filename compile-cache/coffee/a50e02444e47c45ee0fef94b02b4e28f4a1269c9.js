(function() {
  var $, QuickQueryConnectView, View, ref, remote,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$;

  remote = require('remote');

  ({
    element: null
  });

  module.exports = QuickQueryConnectView = (function(superClass) {
    extend(QuickQueryConnectView, superClass);

    function QuickQueryConnectView(protocols) {
      this.protocols = protocols;
      this.connectionsStates = [];
      QuickQueryConnectView.__super__.constructor.apply(this, arguments);
    }

    QuickQueryConnectView.prototype.initialize = function() {
      var key, option, portEditor, protocol, ref1;
      portEditor = this.port[0].getModel();
      portEditor.setText('3306');
      this.connect.keydown(function(e) {
        if (e.keyCode === 13) {
          return $(this).click();
        }
      });
      this.protocol.keydown(function(e) {
        if (e.keyCode === 13) {
          $(e.target).css({
            height: 'auto'
          });
          return e.target.size = 3;
        } else if (e.keyCode === 37 || e.keyCode === 38) {
          return $(e.target).find('option:selected').prev().prop('selected', true);
        } else if (e.keyCode === 39 || e.keyCode === 40) {
          return $(e.target).find('option:selected').next().prop('selected', true);
        }
      }).blur(function(e) {
        $(e.target).css({
          height: ''
        });
        return e.target.size = 0;
      }).on('change blur', (function(_this) {
        return function(e) {
          var protocol;
          if ($(e.target).find('option:selected').length > 0) {
            protocol = $(e.target).find('option:selected').data('protocol');
            if (protocol.handler.fromFilesystem != null) {
              _this.showLocalInfo();
              if (protocol.handler.fileExtencions != null) {
                return _this.browse_file.data('extensions', protocol.handler.fileExtencions);
              } else {
                return _this.browse_file.data('extensions', false);
              }
            } else {
              _this.showRemoteInfo();
              return portEditor.setText(protocol.handler.defaultPort.toString());
            }
          }
        };
      })(this));
      this.browse_file.click((function(_this) {
        return function(e) {
          var currentWindow, options;
          options = {
            properties: ['openFile'],
            title: 'Open Database'
          };
          currentWindow = atom.getCurrentWindow();
          if ($(e.currentTarget).data("extensions")) {
            options.filters = [
              {
                name: 'Database',
                extensions: $(e.target).data("extensions")
              }
            ];
          }
          return remote.dialog.showOpenDialog(currentWindow, options, function(files) {
            if (files != null) {
              return _this.file[0].getModel().setText(files[0]);
            }
          });
        };
      })(this));
      ref1 = this.protocols;
      for (key in ref1) {
        protocol = ref1[key];
        option = $('<option/>').text(protocol.name).val(key).data('protocol', protocol);
        this.protocol.append(option);
      }
      this.connect.click((function(_this) {
        return function(e) {
          var attr, connectionInfo, defaults, ref2, ref3, value;
          connectionInfo = {
            user: _this.user[0].getModel().getText(),
            password: _this.pass[0].getModel().getText(),
            protocol: _this.protocol.val()
          };
          if (((ref2 = _this.protocols[connectionInfo.protocol]) != null ? ref2.handler.fromFilesystem : void 0) != null) {
            connectionInfo.file = _this.file[0].getModel().getText();
          } else {
            connectionInfo.host = _this.host[0].getModel().getText();
            connectionInfo.port = _this.port[0].getModel().getText();
          }
          if (((ref3 = _this.protocols[connectionInfo.protocol]) != null ? ref3["default"] : void 0) != null) {
            defaults = _this.protocols[connectionInfo.protocol]["default"];
            for (attr in defaults) {
              value = defaults[attr];
              connectionInfo[attr] = value;
            }
          }
          if (_this.database[0].getModel().getText() !== '') {
            connectionInfo.database = _this.database[0].getModel().getText();
          }
          return $(_this.element).trigger('quickQuery.connect', [_this.buildConnection(connectionInfo)]);
        };
      })(this));
      return this.advanced_toggle.click((function(_this) {
        return function(e) {
          return _this.find(".qq-advanced-info").slideToggle(400, function() {
            return _this.advanced_toggle.children("i").toggleClass("icon-chevron-down icon-chevron-left");
          });
        };
      })(this));
    };

    QuickQueryConnectView.prototype.fixTabindex = function() {
      this.file.attr('tabindex', 2);
      this.host.attr('tabindex', 2);
      this.port.attr('tabindex', 3);
      this.user.attr('tabindex', 4);
      this.pass.attr('tabindex', 5);
      return this.database.attr('tabindex', 6);
    };

    QuickQueryConnectView.prototype.addProtocol = function(key, protocol) {
      var i, len, option, ref1, results, state;
      this.protocols[key] = protocol;
      option = $('<option/>').text(protocol.name).val(key).data('protocol', protocol);
      this.protocol.append(option);
      ref1 = this.connectionsStates;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        state = ref1[i];
        if (state.info.protocol === key) {
          results.push(state.callback(state.info));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    QuickQueryConnectView.prototype.buildConnection = function(connectionInfo) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var connection, protocolClass, ref1;
          protocolClass = (ref1 = _this.protocols[connectionInfo.protocol]) != null ? ref1.handler : void 0;
          if (protocolClass) {
            connection = new protocolClass(connectionInfo);
            return connection.connect(function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(connection);
              }
              if (err == null) {
                return _this.trigger('quickQuery.connected', connection);
              }
            });
          } else {
            return _this.connectionsStates.push({
              info: connectionInfo,
              callback: function(connectionInfo) {
                protocolClass = _this.protocols[connectionInfo.protocol].handler;
                connection = new protocolClass(connectionInfo);
                return connection.connect(function(err) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(connection);
                  }
                  if (err == null) {
                    return _this.trigger('quickQuery.connected', connection);
                  }
                });
              }
            });
          }
        };
      })(this));
    };

    QuickQueryConnectView.content = function() {
      return this.div({
        "class": 'dialog quick-query-connect'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "col-sm-12"
          }, function() {
            _this.label('protocol');
            return _this.select({
              outlet: "protocol",
              "class": "form-control input-select",
              id: "quick-query-protocol",
              tabindex: "1"
            });
          });
          _this.div({
            "class": "qq-remote-info row"
          }, function() {
            _this.div({
              "class": "col-sm-9"
            }, function() {
              _this.label('host');
              return _this.currentBuilder.tag('atom-text-editor', {
                outlet: "host",
                id: "quick-query-host",
                "class": 'editor',
                mini: 'mini',
                type: 'string'
              });
            });
            return _this.div({
              "class": "col-sm-3"
            }, function() {
              _this.label('port');
              return _this.currentBuilder.tag('atom-text-editor', {
                outlet: "port",
                id: "quick-query-port",
                "class": 'editor',
                mini: 'mini',
                type: 'string'
              });
            });
          });
          _this.div({
            "class": "qq-local-info row"
          }, function() {
            _this.div({
              "class": "col-sm-12"
            }, function() {
              return _this.label('file');
            });
            _this.div({
              "class": "col-sm-9"
            }, function() {
              return _this.currentBuilder.tag('atom-text-editor', {
                outlet: "file",
                id: "quick-query-file",
                "class": 'editor',
                mini: 'mini',
                type: 'string'
              });
            });
            return _this.div({
              "class": "col-sm-3"
            }, function() {
              return _this.button({
                outlet: "browse_file",
                id: "quick-query-browse-file",
                "class": "btn btn-default icon icon-file-directory"
              }, "Browse");
            });
          });
          _this.div({
            "class": "qq-auth-info row"
          }, function() {
            _this.div({
              "class": "col-sm-6"
            }, function() {
              _this.label('user');
              return _this.currentBuilder.tag('atom-text-editor', {
                outlet: "user",
                id: "quick-query-user",
                "class": 'editor',
                mini: 'mini',
                type: 'string'
              });
            });
            return _this.div({
              "class": "col-sm-6"
            }, function() {
              _this.label('password');
              return _this.currentBuilder.tag('atom-text-editor', {
                outlet: "pass",
                id: "quick-query-pass",
                "class": 'editor',
                mini: 'mini'
              });
            });
          });
          _this.div({
            "class": "qq-advanced-info-toggler row"
          }, function() {
            return _this.div({
              "class": "col-sm-12"
            }, function() {
              return _this.button({
                outlet: "advanced_toggle",
                "class": "advance-toggle",
                tabindex: "-1",
                title: "toggle advanced options"
              }, function() {
                return _this.i({
                  "class": "icon icon-chevron-left"
                });
              });
            });
          });
          _this.div({
            "class": "qq-advanced-info row"
          }, function() {
            return _this.div({
              "class": "col-sm-12"
            }, function() {
              _this.label('default database (optional)');
              return _this.currentBuilder.tag('atom-text-editor', {
                outlet: "database",
                id: "quick-query-database",
                "class": 'editor',
                mini: 'mini',
                type: 'string'
              });
            });
          });
          return _this.div({
            "class": "col-sm-12"
          }, function() {
            return _this.button({
              outlet: "connect",
              id: "quick-query-connect",
              "class": "btn btn-default icon icon-plug",
              tabindex: "7"
            }, "Connect");
          });
        };
      })(this));
    };

    QuickQueryConnectView.prototype.destroy = function() {
      return this.element.remove();
    };

    QuickQueryConnectView.prototype.focusFirst = function() {
      this.fixTabindex();
      return this.protocol.focus();
    };

    QuickQueryConnectView.prototype.showLocalInfo = function() {
      this.find(".qq-local-info").show();
      return this.find(".qq-remote-info").hide();
    };

    QuickQueryConnectView.prototype.showRemoteInfo = function() {
      this.find(".qq-remote-info").show();
      return this.find(".qq-local-info").hide();
    };

    QuickQueryConnectView.prototype.onWillConnect = function(callback) {
      return this.bind('quickQuery.connect', function(e, connectionPromise) {
        return callback(connectionPromise);
      });
    };

    QuickQueryConnectView.prototype.onConnectionStablished = function(callback) {
      return this.bind('quickQuery.connected', function(e, connection) {
        return callback(connection);
      });
    };

    return QuickQueryConnectView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbHVpei5jYXJyYXJvLy5hdG9tL3BhY2thZ2VzL3F1aWNrLXF1ZXJ5L2xpYi9xdWljay1xdWVyeS1jb25uZWN0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyQ0FBQTtJQUFBOzs7RUFBQSxNQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsZUFBRCxFQUFPOztFQUNQLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFFVCxDQUFBO0lBQUEsT0FBQSxFQUFTLElBQVQ7R0FBQTs7RUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDUywrQkFBQyxTQUFEO01BQUMsSUFBQyxDQUFBLFlBQUQ7TUFDWixJQUFDLENBQUEsaUJBQUQsR0FBcUI7TUFDckIsd0RBQUEsU0FBQTtJQUZXOztvQ0FJYixVQUFBLEdBQVksU0FBQTtBQUNWLFVBQUE7TUFBQSxVQUFBLEdBQWEsSUFBQyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFULENBQUE7TUFDYixVQUFVLENBQUMsT0FBWCxDQUFtQixNQUFuQjtNQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFpQixTQUFDLENBQUQ7UUFDZixJQUFtQixDQUFDLENBQUMsT0FBRixLQUFhLEVBQWhDO2lCQUFBLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxLQUFSLENBQUEsRUFBQTs7TUFEZSxDQUFqQjtNQUVBLElBQUMsQ0FBQSxRQUNDLENBQUMsT0FESCxDQUNXLFNBQUMsQ0FBRDtRQUNQLElBQUcsQ0FBQyxDQUFDLE9BQUYsS0FBYSxFQUFoQjtVQUNFLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsR0FBWixDQUFnQjtZQUFBLE1BQUEsRUFBUSxNQUFSO1dBQWhCO2lCQUNBLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBVCxHQUFnQixFQUZsQjtTQUFBLE1BR0ssSUFBSSxDQUFDLENB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QixRQUFBLENBQVMsVUFBVDtNQUQ0QixDQUE5QjtJQURzQjs7OztLQXJLVTtBQU5wQyIsInNvdXJjZXNDb250ZW50IjpbIntWaWV3LCAkfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xucmVtb3RlID0gcmVxdWlyZSAncmVtb3RlJ1xuXG5lbGVtZW50OiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFF1aWNrUXVlcnlDb25uZWN0VmlldyBleHRlbmRzIFZpZXdcbiAgY29uc3RydWN0b3I6IChAcHJvdG9jb2xzKSAtPlxuICAgIEBjb25uZWN0aW9uc1N0YXRlcyA9IFtdXG4gICAgc3VwZXJcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHBvcnRFZGl0b3IgPSBAcG9ydFswXS5nZXRNb2RlbCgpXG4gICAgcG9ydEVkaXRvci5zZXRUZXh0KCczMzA2JylcblxuICAgIEBjb25uZWN0LmtleWRvd24gKGUpIC0+XG4gICAgICAkKHRoaXMpLmNsaWNrKCkgaWYgZS5rZXlDb2RlID09IDEzXG4gICAgQHByb3RvY29sXG4gICAgICAua2V5ZG93biAoZSkgLT5cbiAgICAgICAgaWYgZS5rZXlDb2RlID09IDEzXG4gICAgICAgICAgJChlLnRhcmdldCkuY3NzIGhlaWdodDogJ2F1dG8nXG4gICAgICAgICAgZS50YXJnZXQuc2l6ZSA9IDNcbiAgICAgICAgZWxzZSBpZiAgZS5rZXlDb2RlID09IDM3IHx8IGUua2V5Q29kZSA9PSAzOFxuICAgICAgICAgICQoZS50YXJnZXQpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLnByZXYoKS5wcm9wKCdzZWxlY3RlZCcsdHJ1ZSlcbiAgICAgICAgZWxzZSBpZiAgZS5rZXlDb2RlID09IDM5IHx8IGUua2V5Q29kZSA9PSA0MFxuICAgICAgICAgICQoZS50YXJnZXQpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLm5leHQoKS5wcm9wKCdzZWxlY3RlZCcsdHJ1ZSlcbiAgICAgIC5ibHVyIChlKSAtPlxuICAgICAgICAkKGUudGFyZ2V0KS5jc3MgaGVpZ2h0OiAnJ1xuICAgICAgICBlLnRhcmdldC5zaXplID0gMFxuICAgICAgLm9uICdjaGFuZ2UgYmx1cicsIChlKSA9PlxuICAgICAgICBpZiAkKGUudGFyZ2V0KS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5sZW5ndGggPiAwXG4gICAgICAgICAgcHJvdG9jb2wgPSAkKGUudGFyZ2V0KS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5kYXRhKCdwcm90b2NvbCcpXG4gICAgICAgICAgaWYgcHJvdG9jb2wuaGFuZGxlci5mcm9tRmlsZXN5c3RlbT9cbiAgICAgICAgICAgIEBzaG93TG9jYWxJbmZvKClcbiAgICAgICAgICAgIGlmIHByb3RvY29sLmhhbmRsZXIuZmlsZUV4dGVuY2lvbnM/XG4gICAgICAgICAgICAgIEBicm93c2VfZmlsZS5kYXRhKCdleHRlbnNpb25zJyxwcm90b2NvbC5oYW5kbGVyLmZpbGVFeHRlbmNpb25zKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBAYnJvd3NlX2ZpbGUuZGF0YSgnZXh0ZW5zaW9ucycsZmFsc2UpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNob3dSZW1vdGVJbmZvKClcbiAgICAgICAgICAgIHBvcnRFZGl0b3Iuc2V0VGV4dChwcm90b2NvbC5oYW5kbGVyLmRlZmF1bHRQb3J0LnRvU3RyaW5nKCkpXG5cbiAgICBAYnJvd3NlX2ZpbGUuY2xpY2sgKGUpID0+XG4gICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnXVxuICAgICAgICAgIHRpdGxlOiAnT3BlbiBEYXRhYmFzZSdcbiAgICAgICAgY3VycmVudFdpbmRvdyA9IGF0b20uZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIGlmICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKFwiZXh0ZW5zaW9uc1wiKVxuICAgICAgICAgIG9wdGlvbnMuZmlsdGVycyA9IFt7IG5hbWU6ICdEYXRhYmFzZScsIGV4dGVuc2lvbnM6ICQoZS50YXJnZXQpLmRhdGEoXCJleHRlbnNpb25zXCIpIH1dXG4gICAgICAgIHJlbW90ZS5kaWFsb2cuc2hvd09wZW5EaWFsb2cgY3VycmVudFdpbmRvdywgb3B0aW9ucywgKGZpbGVzKSA9PlxuICAgICAgICAgIEBmaWxlWzBdLmdldE1vZGVsKCkuc2V0VGV4dChmaWxlc1swXSkgaWYgZmlsZXM/XG5cbiAgICBmb3Iga2V5LHByb3RvY29sIG9mIEBwcm90b2NvbHNcbiAgICAgIG9wdGlvbiA9ICQoJzxvcHRpb24vPicpXG4gICAgICAgIC50ZXh0KHByb3RvY29sLm5hbWUpXG4gICAgICAgIC52YWwoa2V5KVxuICAgICAgICAuZGF0YSgncHJvdG9jb2wnLHByb3RvY29sKVxuICAgICAgQHByb3RvY29sLmFwcGVuZChvcHRpb24pXG5cbiAgICBAY29ubmVjdC5jbGljayAoZSkgPT5cbiAgICAgIGNvbm5lY3Rpb25JbmZvID0ge1xuICAgICAgICB1c2VyOiBAdXNlclswXS5nZXRNb2RlbCgpLmdldFRleHQoKSxcbiAgICAgICAgcGFzc3dvcmQ6IEBwYXNzWzBdLmdldE1vZGVsKCkuZ2V0VGV4dCgpXG4gICAgICAgIHByb3RvY29sOiBAcHJvdG9jb2wudmFsKClcbiAgICAgIH1cbiAgICAgIGlmIEBwcm90b2NvbHNbY29ubmVjdGlvbkluZm8ucHJvdG9jb2xdPy5oYW5kbGVyLmZyb21GaWxlc3lzdGVtP1xuICAgICAgICBjb25uZWN0aW9uSW5mby5maWxlID0gQGZpbGVbMF0uZ2V0TW9kZWwoKS5nZXRUZXh0KClcbiAgICAgIGVsc2VcbiAgICAgICAgY29ubmVjdGlvbkluZm8uaG9zdCA9IEBob3N0WzBdLmdldE1vZGVsKCkuZ2V0VGV4dCgpXG4gICAgICAgIGNvbm5lY3Rpb25JbmZvLnBvcnQgPSBAcG9ydFswXS5nZXRNb2RlbCgpLmdldFRleHQoKVxuICAgICAgaWYgQHByb3RvY29sc1tjb25uZWN0aW9uSW5mby5wcm90b2NvbF0/LmRlZmF1bHQ/XG4gICAgICAgIGRlZmF1bHRzID0gQHByb3RvY29sc1tjb25uZWN0aW9uSW5mby5wcm90b2NvbF0uZGVmYXVsdFxuICAgICAgICBjb25uZWN0aW9uSW5mb1thdHRyXSA9IHZhbHVlIGZvciBhdHRyLHZhbHVlIG9mIGRlZmF1bHRzXG4gICAgICBpZiBAZGF0YWJhc2VbMF0uZ2V0TW9kZWwoKS5nZXRUZXh0KCkgIT0gJydcbiAgICAgICAgY29ubmVjdGlvbkluZm8uZGF0YWJhc2UgPSBAZGF0YWJhc2VbMF0uZ2V0TW9kZWwoKS5nZXRUZXh0KClcbiAgICAgICQoQGVsZW1lbnQpLnRyaWdnZXIoJ3F1aWNrUXVlcnkuY29ubmVjdCcsW0BidWlsZENvbm5lY3Rpb24oY29ubmVjdGlvbkluZm8pXSlcbiAgICBAYWR2YW5jZWRfdG9nZ2xlLmNsaWNrIChlKSA9PlxuICAgICAgQGZpbmQoXCIucXEtYWR2YW5jZWQtaW5mb1wiKS5zbGlkZVRvZ2dsZSA0MDAsID0+XG4gICAgICAgIEBhZHZhbmNlZF90b2dnbGUuY2hpbGRyZW4oXCJpXCIpLnRvZ2dsZUNsYXNzKFwiaWNvbi1jaGV2cm9uLWRvd24gaWNvbi1jaGV2cm9uLWxlZnRcIilcblxuICBmaXhUYWJpbmRleDogLT5cbiAgICBAZmlsZS5hdHRyKCd0YWJpbmRleCcsMilcbiAgICBAaG9zdC5hdHRyKCd0YWJpbmRleCcsMilcbiAgICBAcG9ydC5hdHRyKCd0YWJpbmRleCcsMylcbiAgICBAdXNlci5hdHRyKCd0YWJpbmRleCcsNClcbiAgICBAcGFzcy5hdHRyKCd0YWJpbmRleCcsNSlcbiAgICBAZGF0YWJhc2UuYXR0cigndGFiaW5kZXgnLDYpXG5cbiAgYWRkUHJvdG9jb2w6IChrZXkscHJvdG9jb2wpLT5cbiAgICBAcHJvdG9jb2xzW2tleV0gPSBwcm90b2NvbFxuICAgIG9wdGlvbiA9ICQoJzxvcHRpb24vPicpXG4gICAgICAudGV4dChwcm90b2NvbC5uYW1lKVxuICAgICAgLnZhbChrZXkpXG4gICAgICAuZGF0YSgncHJvdG9jb2wnLHByb3RvY29sKVxuICAgIEBwcm90b2NvbC5hcHBlbmQob3B0aW9uKVxuICAgIGZvciBzdGF0ZSBpbiBAY29ubmVjdGlvbnNTdGF0ZXNcbiAgICAgIHN0YXRlLmNhbGxiYWNrKHN0YXRlLmluZm8pIGlmIHN0YXRlLmluZm8ucHJvdG9jb2wgPT0ga2V5XG5cbiAgYnVpbGRDb25uZWN0aW9uOiAoY29ubmVjdGlvbkluZm8pLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KT0+XG4gICAgICBwcm90b2NvbENsYXNzID0gQHByb3RvY29sc1tjb25uZWN0aW9uSW5mby5wcm90b2NvbF0/LmhhbmRsZXJcbiAgICAgIGlmIHByb3RvY29sQ2xhc3NcbiAgICAgICAgY29ubmVjdGlvbiA9IG5ldyBwcm90b2NvbENsYXNzKGNvbm5lY3Rpb25JbmZvKVxuICAgICAgICBjb25uZWN0aW9uLmNvbm5lY3QgKGVycikgPT5cbiAgICAgICAgICBpZiBlcnIgdGhlbiByZWplY3QoZXJyKSBlbHNlIHJlc29sdmUoY29ubmVjdGlvbilcbiAgICAgICAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5jb25uZWN0ZWQnLGNvbm5lY3Rpb24pICB1bmxlc3MgZXJyP1xuICAgICAgZWxzZSAjd2hhaXQgdW50aWwgdGhlIHBhY2thZ2UgaXMgbG9hZGVkXG4gICAgICAgIEBjb25uZWN0aW9uc1N0YXRlcy5wdXNoXG4gICAgICAgICAgaW5mbzogY29ubmVjdGlvbkluZm9cbiAgICAgICAgICBjYWxsYmFjazogKGNvbm5lY3Rpb25JbmZvKSA9PlxuICAgICAgICAgICAgcHJvdG9jb2xDbGFzcyA9IEBwcm90b2NvbHNbY29ubmVjdGlvbkluZm8ucHJvdG9jb2xdLmhhbmRsZXJcbiAgICAgICAgICAgIGNvbm5lY3Rpb24gPSBuZXcgcHJvdG9jb2xDbGFzcyhjb25uZWN0aW9uSW5mbylcbiAgICAgICAgICAgIGNvbm5lY3Rpb24uY29ubmVjdCAoZXJyKSA9PlxuICAgICAgICAgICAgICBpZiBlcnIgdGhlbiByZWplY3QoZXJyKSBlbHNlIHJlc29sdmUoY29ubmVjdGlvbilcbiAgICAgICAgICAgICAgQHRyaWdnZXIoJ3F1aWNrUXVlcnkuY29ubmVjdGVkJyxjb25uZWN0aW9uKSAgdW5sZXNzIGVycj9cblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnZGlhbG9nIHF1aWNrLXF1ZXJ5LWNvbm5lY3QnLCA9PlxuICAgICAgQGRpdiBjbGFzczogXCJjb2wtc20tMTJcIiAsID0+XG4gICAgICAgIEBsYWJlbCAncHJvdG9jb2wnXG4gICAgICAgIEBzZWxlY3Qgb3V0bGV0OiBcInByb3RvY29sXCIsIGNsYXNzOiBcImZvcm0tY29udHJvbCBpbnB1dC1zZWxlY3RcIiAsIGlkOiBcInF1aWNrLXF1ZXJ5LXByb3RvY29sXCIsIHRhYmluZGV4OiBcIjFcIlxuICAgICAgQGRpdiBjbGFzczogXCJxcS1yZW1vdGUtaW5mbyByb3dcIiwgPT5cbiAgICAgICAgQGRpdiBjbGFzczogXCJjb2wtc20tOVwiICwgPT5cbiAgICAgICAgICBAbGFiZWwgJ2hvc3QnXG4gICAgICAgICAgQGN1cnJlbnRCdWlsZGVyLnRhZyAnYXRvbS10ZXh0LWVkaXRvcicsIG91dGxldDogXCJob3N0XCIsIGlkOiBcInF1aWNrLXF1ZXJ5LWhvc3RcIiwgY2xhc3M6ICdlZGl0b3InLCBtaW5pOiAnbWluaScsIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIEBkaXYgY2xhc3M6XCJjb2wtc20tM1wiICwgPT5cbiAgICAgICAgICBAbGFiZWwgJ3BvcnQnXG4gICAgICAgICAgQGN1cnJlbnRCdWlsZGVyLnRhZyAnYXRvbS10ZXh0LWVkaXRvcicsIG91dGxldDogXCJwb3J0XCIsIGlkOiBcInF1aWNrLXF1ZXJ5LXBvcnRcIiwgY2xhc3M6ICdlZGl0b3InLCBtaW5pOiAnbWluaScsIHR5cGU6ICdzdHJpbmcnXG4gICAgICBAZGl2IGNsYXNzOiBcInFxLWxvY2FsLWluZm8gcm93XCIgLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiBcImNvbC1zbS0xMlwiLCA9PlxuICAgICAgICAgIEBsYWJlbCAnZmlsZSdcbiAgICAgICAgQGRpdiBjbGFzczogXCJjb2wtc20tOVwiLCA9PlxuICAgICAgICAgIEBjdXJyZW50QnVpbGRlci50YWcgJ2F0b20tdGV4dC1lZGl0b3InLG91dGxldDogXCJmaWxlXCIsIGlkOiBcInF1aWNrLXF1ZXJ5LWZpbGVcIiwgY2xhc3M6ICdlZGl0b3InLCBtaW5pOiAnbWluaScsIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIEBkaXYgY2xhc3M6IFwiY29sLXNtLTNcIiwgPT5cbiAgICAgICAgICBAYnV0dG9uIG91dGxldDogXCJicm93c2VfZmlsZVwiLCBpZDpcInF1aWNrLXF1ZXJ5LWJyb3dzZS1maWxlXCIsIGNsYXNzOiBcImJ0biBidG4tZGVmYXVsdCBpY29uIGljb24tZmlsZS1kaXJlY3RvcnlcIiwgXCJCcm93c2VcIlxuICAgICAgQGRpdiBjbGFzczogXCJxcS1hdXRoLWluZm8gcm93XCIsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6IFwiY29sLXNtLTZcIiAsID0+XG4gICAgICAgICAgQGxhYmVsICd1c2VyJ1xuICAgICAgICAgIEBjdXJyZW50QnVpbGRlci50YWcgJ2F0b20tdGV4dC1lZGl0b3InLCBvdXRsZXQ6IFwidXNlclwiLCBpZDogXCJxdWljay1xdWVyeS11c2VyXCIsIGNsYXNzOiAnZWRpdG9yJywgbWluaTogJ21pbmknLCB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICBAZGl2IGNsYXNzOiBcImNvbC1zbS02XCIgLCA9PlxuICAgICAgICAgIEBsYWJlbCAncGFzc3dvcmQnXG4gICAgICAgICAgQGN1cnJlbnRCdWlsZGVyLnRhZyAnYXRvbS10ZXh0LWVkaXRvcicsIG91dGxldDogXCJwYXNzXCIsIGlkOiBcInF1aWNrLXF1ZXJ5LXBhc3NcIiwgY2xhc3M6ICdlZGl0b3InLCBtaW5pOiAnbWluaSdcbiAgICAgIEBkaXYgY2xhc3M6IFwicXEtYWR2YW5jZWQtaW5mby10b2dnbGVyIHJvd1wiLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiBcImNvbC1zbS0xMlwiLCA9PlxuICAgICAgICAgIEBidXR0b24gb3V0bGV0OlwiYWR2YW5jZWRfdG9nZ2xlXCIsIGNsYXNzOiBcImFkdmFuY2UtdG9nZ2xlXCIsIHRhYmluZGV4OiBcIi0xXCIsIHRpdGxlOlwidG9nZ2xlIGFkdmFuY2VkIG9wdGlvbnNcIiw9PlxuICAgICAgICAgICAgQGkgIGNsYXNzOiBcImljb24gaWNvbi1jaGV2cm9uLWxlZnRcIlxuICAgICAgQGRpdiBjbGFzczogXCJxcS1hZHZhbmNlZC1pbmZvIHJvd1wiLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiBcImNvbC1zbS0xMlwiICwgPT5cbiAgICAgICAgICBAbGFiZWwgJ2RlZmF1bHQgZGF0YWJhc2UgKG9wdGlvbmFsKSdcbiAgICAgICAgICBAY3VycmVudEJ1aWxkZXIudGFnICdhdG9tLXRleHQtZWRpdG9yJyxvdXRsZXQ6IFwiZGF0YWJhc2VcIiwgaWQ6IFwicXVpY2stcXVlcnktZGF0YWJhc2VcIiwgY2xhc3M6ICdlZGl0b3InLCBtaW5pOiAnbWluaScsIHR5cGU6ICdzdHJpbmcnXG4gICAgICBAZGl2IGNsYXNzOiBcImNvbC1zbS0xMlwiICwgPT5cbiAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6XCJjb25uZWN0XCIsIGlkOlwicXVpY2stcXVlcnktY29ubmVjdFwiLCBjbGFzczogXCJidG4gYnRuLWRlZmF1bHQgaWNvbiBpY29uLXBsdWdcIiAsIHRhYmluZGV4OiBcIjdcIiAsIFwiQ29ubmVjdFwiXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZWxlbWVudC5yZW1vdmUoKVxuICBmb2N1c0ZpcnN0OiAtPlxuICAgIEBmaXhUYWJpbmRleCgpXG4gICAgQHByb3RvY29sLmZvY3VzKClcblxuICBzaG93TG9jYWxJbmZvOiAtPlxuICAgIEBmaW5kKFwiLnFxLWxvY2FsLWluZm9cIikuc2hvdygpXG4gICAgQGZpbmQoXCIucXEtcmVtb3RlLWluZm9cIikuaGlkZSgpXG5cbiAgc2hvd1JlbW90ZUluZm86IC0+XG4gICAgQGZpbmQoXCIucXEtcmVtb3RlLWluZm9cIikuc2hvdygpXG4gICAgQGZpbmQoXCIucXEtbG9jYWwtaW5mb1wiKS5oaWRlKClcblxuICBvbldpbGxDb25uZWN0OiAoY2FsbGJhY2spLT5cbiAgICBAYmluZCAncXVpY2tRdWVyeS5jb25uZWN0JywgKGUsY29ubmVjdGlvblByb21pc2UpIC0+XG4gICAgICBjYWxsYmFjayhjb25uZWN0aW9uUHJvbWlzZSlcblxuICBvbkNvbm5lY3Rpb25TdGFibGlzaGVkOiAoY2FsbGJhY2spLT5cbiAgICBAYmluZCAncXVpY2tRdWVyeS5jb25uZWN0ZWQnLCAoZSxjb25uZWN0aW9uKSAtPlxuICAgICAgY2FsbGJhY2soY29ubmVjdGlvbilcbiJdfQ==
