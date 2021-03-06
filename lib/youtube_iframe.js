// Generated by CoffeeScript 1.7.1

/*
 * ----------------------------------------------
 * Authors:
 *   Emil Löfquist (emil.lofquist@mynewsdesk.com)
 *   Zoee Silcock (zoee.silcock@mynewsdesk.com)
 *
 * API docs:
 *   https://developers.google.com/youtube/iframe_api_reference
 * ----------------------------------------------
 */

(function() {
  var IframeResizer, PlayerQueue, YouTubeIframePlayer, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  IframeResizer = (function() {
    var isZeroOrEmpty;

    function IframeResizer() {}

    IframeResizer.prototype.calculateNewHeight = function(originalWidth, originalHeight, newWidth) {
      return Math.round(originalHeight / originalWidth * newWidth);
    };

    isZeroOrEmpty = function(val) {
      return val === "0" || val === "";
    };

    IframeResizer.prototype.resizeIframe = function(iframe) {
      var height, newHeight, parent, parentWidth, width;
      width = iframe.width;
      height = iframe.height;
      parent = iframe.parentNode;
      parentWidth = parent.clientWidth;
      newHeight = this.calculateNewHeight(width, height, parentWidth);
      iframe.style.width = "" + parentWidth + "px";
      return iframe.style.height = "" + newHeight + "px";
    };

    return IframeResizer;

  })();

  PlayerQueue = (function() {
    var Privates, instance;

    function PlayerQueue() {}

    instance = null;

    Privates = (function() {
      function Privates() {
        var firstScriptTag, script;
        script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
      }

      Privates.prototype.queue = [];

      Privates.prototype.addToQueue = function(player) {
        if (typeof YT === "undefined" || YT === null) {
          return this.queue.push(player);
        } else {
          return player.insertPlayer();
        }
      };

      Privates.prototype.insertQueuedPlayers = function() {
        var p, _i, _len, _ref;
        _ref = this.queue;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          p = _ref[_i];
          p.insertPlayer();
        }
        return this.queue = [];
      };

      return Privates;

    })();

    PlayerQueue.get = function() {
      return instance != null ? instance : instance = new Privates();
    };

    return PlayerQueue;

  })();

  root.onYouTubeIframeAPIReady = function() {
    return PlayerQueue.get().insertQueuedPlayers();
  };

  YouTubeIframePlayer = (function() {
    function YouTubeIframePlayer(playerContainerId, videoId, width, height, playerVars, responsiveIframe, resizeTimeout) {
      if (width == null) {
        width = 560;
      }
      if (height == null) {
        height = 315;
      }
      if (playerVars == null) {
        playerVars = {};
      }
      if (responsiveIframe == null) {
        responsiveIframe = false;
      }
      if (resizeTimeout == null) {
        resizeTimeout = 500;
      }
      this.respondToResize = __bind(this.respondToResize, this);
      this.playerContainerId = playerContainerId;
      this.videoId = videoId;
      this.width = width;
      this.height = height;
      this.playerVars = playerVars;
      this.responsiveIframe = responsiveIframe;
      this.resizeTimeout = resizeTimeout;
      if (this.responsiveIframe) {
        this.resizer = new IframeResizer();
      }
      this.player = null;
      this.eventListeners = [];
      PlayerQueue.get().addToQueue(this);
    }

    YouTubeIframePlayer.prototype.play = function() {
      return this.player.playVideo();
    };

    YouTubeIframePlayer.prototype.pause = function() {
      return this.player.pauseVideo();
    };

    YouTubeIframePlayer.prototype.mute = function() {
      return this.player.mute();
    };

    YouTubeIframePlayer.prototype.unMute = function() {
      return this.player.unMute();
    };

    YouTubeIframePlayer.prototype.insertPlayer = function() {
      return this.player = new YT.Player(this.playerContainerId, {
        width: this.width,
        height: this.height,
        videoId: this.videoId,
        playerVars: this.playerVars,
        events: {
          onReady: (function(_this) {
            return function() {
              _this.notifyNewEvent('ready');
              if (_this.responsiveIframe) {
                return _this.respondToResize();
              }
            };
          })(this),
          onError: (function(_this) {
            return function(e) {
              var message;
              switch (e.data) {
                case 2:
                  message = "Incorrect parameter value.";
                  break;
                case 5:
                  message = "Content cannot be played in a HTML5 player or a HTML5 player related error has occured.";
                  break;
                case 100:
                  message = "The video requested cannot be found.";
                  break;
                case 101:
                case 150:
                  message = "The owner of the requested video does not allow it to be played in embedded players.";
              }
              return _this.notifyNewEvent('error', {
                code: e.data,
                message: message
              });
            };
          })(this),
          onPlaybackRateChange: (function(_this) {
            return function(e) {
              return _this.notifyNewEvent('playbackRateChange', e.data);
            };
          })(this),
          onPlaybackQualityChange: (function(_this) {
            return function(e) {
              return _this.notifyNewEvent('playbackQualityChange', e.data);
            };
          })(this),
          onApiChange: (function(_this) {
            return function(e) {
              return _this.notifyNewEvent('apiChange', e.data);
            };
          })(this),
          onStateChange: (function(_this) {
            return function(e) {
              switch (e.data) {
                case YT.PlayerState.UNSTARTED:
                  return _this.notifyNewEvent('unstarted', e.data);
                case YT.PlayerState.ENDED:
                  return _this.notifyNewEvent('ended', e.data);
                case YT.PlayerState.PLAYING:
                  return _this.notifyNewEvent('playing', e.data);
                case YT.PlayerState.PAUSED:
                  return _this.notifyNewEvent('paused', e.data);
                case YT.PlayerState.BUFFERING:
                  return _this.notifyNewEvent('buffering', e.data);
                case YT.PlayerState.CUED:
                  return _this.notifyNewEvent('cued', e.data);
              }
            };
          })(this)
        }
      });
    };

    YouTubeIframePlayer.prototype.on = function(to, onNewEvent) {
      return this.eventListeners.push({
        item: to,
        callback: onNewEvent
      });
    };

    YouTubeIframePlayer.prototype.notifyNewEvent = function(item, data) {
      var subscriber, _i, _len, _ref, _results;
      if (data == null) {
        data = {};
      }
      _ref = this.eventListeners;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        subscriber = _ref[_i];
        if (subscriber.item === item) {
          _results.push(subscriber.callback(this.player, data));
        }
      }
      return _results;
    };

    YouTubeIframePlayer.prototype.respondToResize = function() {
      var iframe, parent, parentWidth, timer;
      iframe = this.player.getIframe();
      parent = iframe.parentNode;
      parentWidth = 0;
      return (timer = (function(_this) {
        return function() {
          var pw;
          pw = parent.clientWidth;
          if (pw !== parentWidth) {
            _this.resizer.resizeIframe(iframe);
            parentWidth = pw;
          }
          return setTimeout(timer, _this.resizeTimeout);
        };
      })(this))();
    };

    return YouTubeIframePlayer;

  })();

  if (typeof Testing !== "undefined" && Testing !== null) {
    root.IframeResizer = IframeResizer;
  }

  if (typeof Testing !== "undefined" && Testing !== null) {
    root.PlayerQueue = PlayerQueue;
  }

  root.YouTubeIframePlayer = YouTubeIframePlayer;

}).call(this);
