/*
 * creator: renyuan (yoyorens.ren@gmail.com)
 * 最新更新：2013-10-22
 */


var JL = (function() {"use strict";
  var URL = top.STATIC_URL;
  var WIN = window;
  var DOC = document;
  var loader = WIN.JL || {};

  //保存一个计时器的管理引用
  var timer = {};

  //import锁
  var locker = false;

  //import是单个线程 记录一个线程
  var pid = 0;

  //正在加载列表
  var loading = {};

  //需要加载列表
  var loadList = {};

  //追加依赖列表
  //var appendList = [];

  //依赖关系是否改变
  var changed = false;

  //维护一个已经加载的模块列表
  var loaded = {};

  //用于非模块化加载
  var loadedUrl = {};

  function isArray(it) {
    return Object.prototype.toString.call(it) === '[object Array]';
  }

  function isFunction(it) {
    return Object.prototype.toString.call(it) === '[object Function]';
  }

  function extend(pObj, pExtend) {
    for (var prop in pExtend) {
      if (pExtend.hasOwnProperty(prop)) {
        pObj[prop] = pExtend[prop];
      }
    }
  }


  top._versionTable = top._versionTable || {};

  extend(loader, {
    debugMode : false,

    _loadList : {},
    _modules : {},
    _versionTable : {},
    _config : {
      baseUrl : URL,
      baseDir : '',
      timeout : 0
    },

    _dependTable : {},

    //外部增加配置
    setConfig : function(c) {
      c = c || {};
      this._config.baseUrl = c.baseUrl||URL;
      this._config.baseDir = c.baseDir;
      this._config.timeout = c.timeout||_config.timeout;
	  this._config.proxyUrl = c.proxyUrl||_config.proxyUrl;
      return this;
    },

    addDepend : function(pNewDepend, pOverwrite) {
      for (var dep in pNewDepend) {
        if (pOverwrite) {
          this._dependTable[dep] = pNewDepend[dep];
        } else {
          if (!this._dependTable[dep]) {
            this._dependTable[dep] = pNewDepend[dep];
          } else {
            this._dependTable[dep] = this._dependTable[dep].concat(pNewDepend[dep]);
          }
        }
      }
      return this;
    },

    getDepend : function() {
      return this._dependTable;
    },

    _preLoad : function(pUrl) {
      var _img = new Image();
      _img.src = pUrl;
      _img.onerror = function() {

      };
    },

    _loadCss : function(pUrl) {
      var n = DOC.createElement('link');
      n.setAttribute('type', 'text/css');
      n.setAttribute('rel', 'stylesheet');
      n.setAttribute('href', pUrl);
      this._preLoad(pUrl);
      document.body.appendChild(n);
    },

    loadScript : function(url, callback, frist) {
      var _url = url.split('/');
      var _version = _url[4];
      var _mod = _url.slice(5, _url.length).join('.');
      top._versionTable[_mod] = _version;
      if (loadedUrl[_mod]) {
        if (frist) {
          frist();
        }
        callback();
        return;
      }

      loadedUrl[_mod] = true;
      if (frist) {
        frist();
      }

      if (this._enableCheck() && this._hasUsableCache(_mod, _version)) {
        this._executeCache(_mod);
        callback();

      } else {
        this._loadScript(url, callback);
        this.cache(_mod, url);
      }
    },

    loadScriptText : function(mod, callback) {
      var _self = this;

      var url = this._convertModuleToURL(mod);
      var _url = url.split('/');
      var _version = _url[4];
      var check = function() {
        if (_self._enableCheck() && _self._hasUsableCache(mod, _version)) {
          var code = _self._fetch(mod);
          callback(code);
        } else {
          setTimeout(function() {
            check();
          }, 200);
        }
      }
      if (this._enableCheck() && this._hasUsableCache(mod, _version)) {
        var code = this._fetch(mod);
        callback(code);
      } else {
        this.cache(mod, url);
        check();
      }
    },

    loadScriptInPage : function(url, scope) {
      var scope = scope || window;
      var _self = this;
      var _url = url.split('/');
      var _version = _url[4];
      var _mod = _url.slice(5, _url.length).join('.');
      top._versionTable[_mod] = _version;

      if (this._enableCheck() && this._hasUsableCache(_mod, _version)) {
        this._executeCache(_mod, scope);
      } else {
        setTimeout(function() {
          _self.cache(_mod, url);
        }, 5000);

        scope.document.write('<script src="' + url + '"></script>');
      }
    },

    _loadScript : function(pUrl, pCallback, pMod) {

      var n = DOC.createElement('script');
      n.setAttribute('type', 'text/javascript');
      n.setAttribute('src', pUrl);
      n.setAttribute('async', true);
      n.onerror = function() {
        pCallback(pMod);
        n.onerror = null;
      };

      n.onload = n.onreadystatechange = function() {
        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
          pCallback(pMod);
          n.onload = n.onreadystatechange = null;
        }
      };

      document.body.appendChild(n);
    },

    _load : function(pMod, pPid, pCallback) {
      var self = this;
      var _url = this._convertModuleToURL(pMod);
      //var hasDependMod = this._dependTable[pMod];
      pCallback = pCallback ||
      function() {
      };

      if (loaded[pMod]) {
        if (pPid > 0) {
          loading[pPid][pMod] = false;
        }
        pCallback(pMod);
        return true;
      } else {
        if (pPid < 0) {
          if (this._enableCheck() && this._hasUsableCache(pMod)) {
            loaded[pMod] = true;
            self._executeCache(pMod);
            pCallback(pMod);
          } else {
            this._loadScript(_url, function(m) {
              loaded[m] = true;
              pCallback(m);
            }, pMod);
            this.cache(pMod);
          }
        }
        return false;
      }

    },

    _convertModuleToURL : function(pMod) {
      var url;
      url = [this._config.baseUrl, this._config.baseDir, pMod.split('.').join('/'), this.debugMode ? '' : '', '.class.js'].join('');
      url = url.replace('{VERSION}', this._getVersion(pMod));
      return url;
    },

    //同步方式引入一个模块
    require : function(pMod) {
      return loader._modules[pMod];
    },

    _normalMod : function(pMod) {
      if (!isArray(pMod)) {
        pMod = pMod.split(',');
      }
      return pMod;
    },

    //检测当前加载的主模块的加载情况

    __done : function(pCallback) {
      var _modsArg = [];
      var _loadingTable = loading[pid];
      for (var mod in _loadingTable) {
        _modsArg.push(this._modules[mod]);
      }
      setTimeout(function() {
        clearTimeout(timer[pid]);
        pid++;
        locker = false;
        pCallback.apply(WIN, _modsArg);
      }, 20);
    },
    _checkLoading : function(pCallback) {
      var _loadingTable = loading[pid];
      var _loaded = true, _self = this;
      timer[pid] = setTimeout(function() {
        for (var file in _loadingTable) {
          if (!_self._modules[file]) {
            _loaded = false;
            break;
          }
        }

        if (!loadList[pid]) {
          _self._checkLoading(pCallback);
          return;
        }

        if (_loaded && loadList[pid].length === 0) {
          _self.__done(pCallback);
        } else {
          _self._checkLoading(pCallback);
        }
      }, 20);
    },

    _getVersion : function(pMod) {
      var _version = top._versionTable[pMod] || '{VERSION}';
      return _version;
    },

    setVersion : function(pVersionTable) {
      for (var v in pVersionTable) {
        top._versionTable[v] = pVersionTable[v];
      }

    },

    //异步的方式加载多个模块
    imports : function(pMod, pCallback) {
      var self = this;
      var _allLoaded = true;
      if (locker) {
        setTimeout(function() {
          self.imports(pMod, pCallback);
        }, 100);
        return;
      }

      locker = true;
      pMod = this._normalMod(pMod);

      //当前进程正在加载的模块
      loading[pid] = {};
      if (!loadList[pid]) {
        loadList[pid] = [pMod];
      }

      for (var i = 0; i < pMod.length; i++) {
        this._insertDepend(pMod[i]);
      }

      for ( i = 0; i < pMod.length; i++) {
        var _thisModule = pMod[i];
        loading[pid][_thisModule] = true;

        if (!this._load(_thisModule, pid)) {
          _allLoaded = false;
        }
      }

      if (_allLoaded) {
        this.__done(pCallback);
        return;
      }

      if (loadList[pid].length) {
        this._loadDepend(pMod[0], function(m) {
          loading[pid][m] = false;
        });
      }

      this._checkLoading(pCallback);
    },

    //创建加载队列
    _insertDepend : function(mod) {
      //var list = loadList[pid];
      var depMod = this._dependTable[mod];
      if (depMod) {
        depMod = this._normalMod(depMod);
        loadList[pid].push(depMod);
        for (var i = 0; i < depMod.length; i++) {
          this._insertDepend(depMod[i]);
        }
      }
    },

    //记录一个模块的 依赖模块的加载情况
    _depsLoading : {},

    //检查依赖模块的加载
    _checkLoadingDep : function(cb) {
      var self = this;
      var fail = false;
      for (var i in this._depsLoading) {
        if (!this._depsLoading[i]) {
          fail = true;
        }
      }
      if (fail) {
        setTimeout(function() {
          self._checkLoadingDep(cb);
        }, 20);
      } else {
        cb();
      }
    },

    _loadDepend : function(pMod, callback) {
      var _self = this;
      var _loadMods = loadList[pid][loadList[pid].length - 1];


      var _callback = function(m) {
        _self._depsLoading[m] = true;
      };
      for (var i = 0; i < _loadMods.length; i++) {
        var _cModule = _loadMods[i];

        if (!_self._modules[_cModule]) {
          _self._depsLoading[_cModule] = false;
        } else {
          _self._depsLoading[_cModule] = true;
        }

        this._load(_cModule, -1, _callback);
      }

      this._checkLoadingDep(function() {
        _self._depsLoading = {};
        loadList[pid].pop();
        if (loadList[pid].length) {
          _self._loadDepend(pMod, callback);
        } else {
          callback(pMod);
        }
      });
    },

    //组建模块定义
    define : function(pMod, pDep, pCallback) {
      var _done = pCallback, _self = this, hasDepend = true;

      //暂时不支持动态添加依赖关系
      if (isFunction(pDep)) {
        _done = pDep;
        hasDepend = false;
      }

      //为开发者扩展一些快捷方法
      extend(_done.prototype, {
        addExport : function(key, value) {
          this.exports[key] = value;
        },
        getModule : function(key) {
          return _self._modules[key];
        }
      });

      //是否有动态的依赖
      if (hasDepend) {
        pDep = this._normalMod(pDep);
        for (var i = 0; i < pDep.length; i++) {
          pDep[i] = _self._modules[pDep[i]];
        }

        /*
         this._dependTable[pMod] = this._dependTable[pMod].concat(pDep);
         if (!loadList[pid]) {
         loadList[pid] = [];
         }
         changed = true;
         appendList.push(pDep);
         */
      }

      _self._modules[pMod] = (new _done(this.require, hasDepend ? pDep : [])).exports;
      return;

      /* if (this._dependTable[pMod] && !loadList[pid]) {

       if (!this._dependTable[pMod]) {
       this._dependTable[pMod] = [];
       }
       */
      /*      if (!loadList[pid]) {
       loadList[pid] = [];
       }
       this._insertDepend(pMod);

       return;
       this._loadDepend(pMod, function(m) {
       _self._modules[m] = (new _done()).exports;
       loading[pid][m] = false;
       });
       } else {
       return;
       if (!hasDepend) {
       this._modules[pMod] = (new _done()).exports;
       loading[pid][pMod] = false;
       if (!loadList[pid]) {
       loadList[pid] = [];
       }
       }
       } */
    }
  });

  extend(loader, {
    _enableCheck : function() {
      return window.localStorage && window.postMessage;
    },
    _messagingFrame : null,
    _messagingFrameReady : false,
    _createMessagingFrame : function() {
      //var _iframe = document.getElementById('connect_iframe');
      var _iframe = document.createElement('iframe');
      var _self = this;
      _iframe.src = this._config.proxyUrl;
      _iframe.height = 0;
      _iframe.width = 0;
      _iframe.frameborder = '0';
      _iframe.style.cssText = 'border:none;position:absolute;top:0px;left:0px';
      _iframe.onload = function() {
        _self._messagingFrameReady = true;
        _self._messagingFrame = _iframe.contentWindow;
      };
      document.body.appendChild(_iframe);
    },

    _onMessagingEvent : function(e) {
      if (e.origin !== URL && (e.origin + '/') !== URL) {
        return;
      }
      var _data = e.data.split('&&&');
      var code = _data[0];
      var mod = _data[1];
      var exec = _data[2];
      loader._save(mod, code);
      //更新本地的缓存版本
      loader._setLocalVersion(mod, loader._getVersion(mod));
    },

    _bindMessagingEvent : function() {
      if ( typeof window.addEventListener != 'undefined') {
        window.addEventListener('message', this._onMessagingEvent, false);
      } else if ( typeof window.attachEvent != 'undefined') {
        window.attachEvent('onmessage', this._onMessagingEvent);
      }
    },
    _save : function(pMod, pCode) {
      try {
        localStorage.setItem(pMod, pCode);
      } catch(ex) {
        localStorage.clear();
      }
    },

    _fetch : function(key) {
      return localStorage.getItem(key);
    },

    _getLocalVersion : function(pMod) {
      return this._fetch(pMod + '_version');
    },

    _setLocalVersion : function(pMod, pVersion) {
      this._save(pMod + '_version', pVersion);
    },

    _expire : function(pMod, version) {
      if (version) {
        return this._getLocalVersion(pMod) === version ? false : true;
      }
      return this._getLocalVersion(pMod) === this._getVersion(pMod) ? false : true;
    },

    _hasUsableCache : function(pMod, version) {
      if (!this._expire(pMod, version) && this._fetch(pMod)) {
        return true;
      }
      return false;
    },

    _executeCache : function(pMod, scope) {
      var scope = scope || window;
      var code = this._fetch(pMod);
      var _eval = scope.eval || scope.execScript;
      _eval(code);
    },

    cacheInit : function() {
      this._createMessagingFrame();
      this._bindMessagingEvent();
    },

    cache : function(pMod, url, notExecute) {

      if (this._messagingFrame && this._enableCheck()) {
        var _url = url || this._convertModuleToURL(pMod);
        var data = [_url, pMod].join('&&&');
        if (notExecute) {
          data += '&&&false';
        }
        this._messagingFrame.postMessage(data, '*');

      }
    },
    clear : function() {
      localStorage.clear();
    }
  });

  loader.cacheInit();
  if (top.location.href.indexOf('debug') > -1) {
    loader.debugMode = true;
  }

  if (loader.debugMode) {
    loader.clear();
  }

  var _mem = {};
  var _new = function(func, data) {
    var _key = func.toString();
    _mem[_key] = {
      instance : new func(data)
    };
    return _mem[_key].instance;
  };
  var _singlton = function(func, data, solt) {
    var _key = func.toString();
    if (solt) {
      _key += solt;
    }
    if (_mem[_key]) {
      return _mem[_key].instance;
    }
    var _obj = new func(data);
    _mem[_key] = {
      instance : _obj
    };
    return _obj;
  };
  extend(loader, {
    _new : _new,
    singlton : _singlton
  });

  window.define = function() {
    loader.define.apply(loader, arguments);
  }

  window.require_current = function() {
    return loader.require.apply(loader, arguments);
  }
  //针对这个项目中使用iframe而增加的方法
  //优先使用iframe内部的模块定义 然后再使用iframe外部的模块定义
  window.require = window.Require = function(name) {
    var code = window.require_current(name);
    if (!code) {
      code = top.require_current(name);
    }
    return code;
  }
  return loader;
})();
