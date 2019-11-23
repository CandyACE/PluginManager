/*
 * @Description: 插件管理器，控制插件的加载和管理
 * @Author: Tang Weitian
 * @Date: 2019-05-29 15:17:53
 * @LastEditors: Tang Weitian
 * @LastEditTime: 2019-11-23 17:59:04
 */
(function () {

    var debug = false;

    var root = this;

    var PluginManager = function (obj) {
        if (obj instanceof PluginManager) return obj;
        if (!(this instanceof PluginManager)) return new PluginManager(obj);
        this.PluginManagerwrapped = obj;
    }

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports.module.exports = PluginManager;
        }
        exports.PluginManager = PluginManager;
    } else {
        root.PluginManager = PluginManager;
    }

    // 此插件相对路径的获取方法
    var baseUrl;
    ! function () {
        var scriptList = document.scripts,
            thisPath = scriptList[scriptList.length - 1].src;
        baseUrl = thisPath.substring(0, thisPath.lastIndexOf('/') + 1);
    }();

    var _plugins = {};
    var _loadingList = []
    var _loadingSystemList = []
    var _isLoaded = false;
    var _initData = undefined;

    /**
     * @description: 初始化统一参数
     * @return: initData
     */
    Object.defineProperty(PluginManager, "initData", {
        get: function () {
            return _initData;
        }
    })

    /**
     * @description: 获取已经加载的插件集合
     * @return: 获取已经加载的插件集合
     */
    Object.defineProperty(PluginManager, "Plugins", {
        get: function () {
            return _plugins;
        }
    })

    Object.defineProperty(PluginManager, "baseUrl", {
        get: function () {
            return baseUrl;
        }
    })

    /**
     * @description: 添加一个插件，插入到指定的地方，如果index为undefined，则插入到最后
     * @param {Function} e 插件方法
     * @param {String} desc 插件描述
     * @param {int} 优先级，0为最高，如果为undefined，则插入到最后
     * @returns {Boolean} 是否成功插入
     */
    PluginManager.addPlugin = function (e, desc, index) {
        if (e == undefined || typeof e !== "function") {
            console.error(`【PluginManager】 参数为空 或者 类型不是Function e:${e}`)
            return false;
        } S
        e.PluginDescription = desc;
        e.prototype.PluginDescription = desc;
        if (!e.PluginName)
            e.PluginName = e.name
        e.prototype.PluginName = e.name;
        if (index == undefined) {
            _loadingList.push(e)
        } else {
            _loadingList.splice(index, 0, e)
        }
        return true;
    }

    PluginManager.addSystemPlugin = function (e, desc, index) {
        if (e == undefined || typeof e !== "function") {
            console.error(`【PluginManager】 参数为空 或者 类型不是Function e:${e}`)
            return false;
        }
        e.PluginDescription = desc;
        e.prototype.PluginDescription = desc;
        if (!e.PluginName)
            e.PluginName = e.name
        e.prototype.PluginName = e.name;
        if (index == undefined) {
            _loadingSystemList.push(e)
        } else {
            _loadingSystemList.splice(index, 0, e)
        }
        return true;
    }

    /**
     * @description: 启动加载
     * @param {type} 
     * @return: 
     */
    PluginManager.LoadPlugins = function (initData) {
        if (_isLoaded) {
            console.error(`【PluginManager】已经加载过插件，不能重复加载`)
            return;
        }
        _initData = initData;
        // 添加系统插件
        _loadPlugins(_loadingSystemList, window, _initData, '【PluginManager】【系统】')

        // 添加业务插件
        _loadPlugins(_loadingList, _plugins, _initData, '【PluginManager】')
        _isLoaded = true;
    }

    function _loadPlugins(pluginList, root, initData, consoleHead) {
        let count = 0;
        // 添加系统插件
        for (let i = 0, length = pluginList.length; i < length; i++) {
            const e = pluginList[i];
            if (root[e.PluginName]) {
                let have = root[e.PluginName]
                console.error(`${consoleHead}要添加的插件 ${e.PluginName} ${e.PluginDescription == undefined ? "" : "(" + e.PluginDescription + ")"} 与已经存在的插件 ${have.PluginName} ${have.PluginDescription == undefined ? "" : "(" + have.PluginDescription + ")"} 冲突！`)
                continue;
            }
            root[e.PluginName] = new e(initData)
            if (!root[e.PluginName].init()) {
                console.error(`${consoleHead}插件 ${e.PluginName} ${e.PluginDescription == undefined ? "" : "(" + e.PluginDescription + ")"} 初始化失败！ `)
                continue;
            }
            count++
            console.info(`${consoleHead}添加插件【${count}】 ${e.PluginName} ${e.PluginDescription == undefined ? "" : "(" + e.PluginDescription + ")"}`)
        }
        console.info(`${consoleHead}一共添加 ${count} 个插件`)
    }

    /**
     * @description: 获得默认值
     * @param {type} 
     * @return: 
     */
    PluginManager.defaultValue = function (data, defaultValue) {
        return void 0 !== data && null !== data ? data : defaultValue;
    }
    /**
     * @description: 序列化json，支持序列化Function
     * @param {type} 
     * @return: 
     */
    PluginManager.JSONStringifyWithFun = function (obj) {
        return JSON.stringify(btns, function (key, val) {
            if (typeof val == "function") {
                return val + '';
            }
            return val;
        }, 2)
    }
    /**
     * @description: 反序列化为对象，支持反序列化Function
     * @param {type} 
     * @return: 
     */
    PluginManager.JSONParseWithFun = function (string) {
        return JSON.parse(string, function (k, v) {
            if (v.indexOf && v.indexOf('function') > -1) {
                return eval("(function(){return " + v + " })()")
            }
            return v;
        })
    }
    /**
     * @description: 克隆对象
     * @param {type} 
     * @return: 
     */
    PluginManager.cloneObj = function (obj) {
        var o;
        if (typeof obj == 'object') {
            if (obj === null) {
                o = null;
            } else {
                if (obj instanceof Array) {
                    o = [];
                    for (var i = 0, len = obj.length; i < len; i++) {
                        o.push(this.cloneObj(obj[i]));
                    }
                } else {
                    o = {};
                    for (var j in obj) {
                        o[j] = this.cloneObj(obj[j]);
                    }
                }
            }
        } else {
            o = obj;
        }
        return o;
    }


    if (typeof define === 'function' && define.amd) {
        define('pluginmanager-js', [], function () {
            return PluginManager;
        })
    }
}.call(this));