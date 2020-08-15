///<reference types='nodom'/>
/**
 * tip 插件
 */
/**
 * tip 管理器
 * 此管理器作为全局插件，绑定到根模块
 *
 */
class UITip extends nodom.Plugin {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-TIP';
        /**
         * 是否需要检查tip列表
         */
        this.needCheck = false;
        /**
         * 一共四个tip容器，分为上右下左
         */
        this.containers = {
            top: undefined,
            right: undefined,
            bottom: undefined,
            left: undefined
        };
    }
    init(el) {
        let rootDom = new nodom.Element();
        nodom.Compiler.handleAttributes(rootDom, el);
        rootDom.tagName = 'div';
        this.extraDataName = '$ui_tip_manager';
        rootDom.setProp('name', this.extraDataName);
        //绑定model
        rootDom.addDirective(new nodom.Directive('model', this.extraDataName, rootDom));
        for (let loc of ['top', 'right', 'bottom', 'left']) {
            let ct = new nodom.Element('div');
            //增加css class
            ct.addClass('nd-tip nd-tip-' + loc);
            // 添加孩子节点 
            ct.add(this.createTipDom(loc));
            rootDom.add(ct);
        }
        rootDom.plugin = this;
        return rootDom;
    }
    /**
     * 后置渲染
     * @param module
     * @param dom
     */
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        if (!this.modelId) {
            let model = module.model;
            //构建tip数据模型
            if (!model.get(this.extraDataName)) {
                let mdl = model.set(this.extraDataName, {
                    top: [],
                    left: [],
                    bottom: [],
                    right: []
                });
                this.modelId = mdl.id;
            }
        }
    }
    /**
     * 创建tip节点
     * @param close
     */
    createTipDom(loc) {
        let me = this;
        let dom = new nodom.Element('div');
        dom.addDirective(new nodom.Directive('repeat', loc, dom));
        dom.setProp('class', new nodom.Expression("'nd-tip-item nd-box-' + theme"), true);
        let close = new nodom.Element('b');
        close.addClass('nd-tip-close');
        close.addDirective(new nodom.Directive('show', 'allowClose', close));
        close.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            //设置关闭
            model.set('close', true);
            //检查
            me.check(true);
        }));
        let contentDom = new nodom.Element('div');
        contentDom.addClass('nd-tip-content');
        let icon = new nodom.Element('b');
        icon.setProp('class', new nodom.Expression("'nd-icon-' + icon"), true);
        icon.addDirective(new nodom.Directive('show', 'icon', icon));
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression('content')];
        contentDom.children = [icon, txt];
        dom.children = [contentDom, close];
        return dom;
    }
    /**
     * 检查tip列表并结束tip
     * @param force 启用check
     */
    check(force) {
        let me = this;
        if (force) {
            this.needCheck = true;
        }
        if (!this.needCheck || !this.modelId) {
            return;
        }
        let needCheck = false;
        let model = nodom.ModuleFactory.getMain().modelFactory.get(this.modelId);
        let ct = new Date().getTime();
        for (let loc of ['top', 'right', 'bottom', 'left']) {
            let data = model.data[loc];
            for (let i = 0; i < data.length; i++) {
                let d = data[i];
                if (d.close || !d.allowClose && d.start + d.time <= ct) {
                    data.splice(i--, 1);
                }
                else if (!d.allowClose && d.start + d.time > ct) {
                    needCheck = true;
                }
            }
        }
        this.needCheck = needCheck;
        if (this.needCheck) {
            setTimeout(() => { me.check(); }, 100);
        }
    }
    /**
     * 显示tip
     * @param config        辅助配置{}
     *          content       显示内容
     *          time        number 显示时间(ms),默认3000
     *          loc         string 显示位置，top right bottom left，默认top
     *          icon        图标名
     *          allowClose  boolean 是否手动关闭，默认false
     *          exclusive   boolean 排它，即必须关闭同区域的其它tip
     *          theme       主题 active error warn info
     */
    show(config) {
        if (!nodom.Util.isObject(config)) {
            return;
        }
        let model = nodom.ModuleFactory.getMain().model.get(this.extraDataName);
        if (!model) {
            return;
        }
        let loc = config.loc || 'top';
        let allowClose = config.allowClose || false;
        let datas = model.data[loc];
        let data = {
            content: config.content || 'message',
            time: config.time || 3000,
            start: new Date().getTime(),
            allowClose: allowClose,
            icon: config.icon,
            theme: config.theme || 'default'
        };
        if (config.exclusive) {
            datas = [data];
        }
        else {
            datas.push(data);
        }
        if (!allowClose) {
            this.check(true);
        }
    }
}
nodom.PluginManager.add('UI-TIP', UITip);
var nodom;
(function (nodom) {
    /**
     * 显示tip
     * @param config        辅助配置{}
     *          content       显示内容
     *          time          number 显示时间(ms),默认3000
     *          loc           string 显示位置，top right bottom left，默认top
     *          allowClose   boolean 是否手动关闭，默认false
     *          exclusive     boolean 排它，即必须关闭同区域的其它tip
     *          theme       主题 active error warn info
     */
    function tip(config) {
        let module = nodom.ModuleFactory.getMain();
        if (!module) {
            return null;
        }
        let manager = module.getPlugin('$ui_tip_manager');
        //新建manager
        if (manager) {
            manager.show(config);
        }
    }
    nodom.tip = tip;
})(nodom || (nodom = {}));
//# sourceMappingURL=tip.js.map