(function (manager, $, undefined) {
    /**
     * @description: 构造方法
     */
    function reportSupport(initData) {

    }

    /**
     * @description: 初始化插件
     */
    reportSupport.prototype.init = function () {
        return true;
    }

    // 添加到插件加载列表中去
    manager.addPlugin(reportSupport, "插件描述")

}(PluginManager, jQuery));