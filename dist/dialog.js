///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIDialog extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-DIALOG';
        let rootDom = new nodom.Element();
        if (params) {
            let panel = new UIPanel(params);
            this.generate(rootDom, panel);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    generate(rootDom, panel) {
        const me = this;
        this.dataName = '$ui_dialog_' + nodom.Util.genId();
        rootDom.addClass('nd-dialog');
        let panelDom = panel.element;
        //删除panel plugin
        // delete panelDom.plugin;
        //获取插件名
        rootDom.setProp('name', panelDom.getProp('name'));
        //autoopen
        this.autoOpen = panelDom.hasProp('autoopen');
        //事件名
        this.onClose = panelDom.getProp('onclose');
        this.onOpen = panelDom.getProp('onopen');
        panelDom.delProp(['name', 'autoopen']);
        panel.addHeadBtn('close', () => {
            me.close();
        });
        rootDom.addDirective(new nodom.Directive('show', this.dataName, rootDom));
        //body
        let dialogBody = new nodom.Element('div');
        dialogBody.addClass('nd-dialog-body');
        dialogBody.add(panelDom);
        //蒙版
        let coverDom = new nodom.Element('div');
        coverDom.addClass('nd-dialog-cover');
        rootDom.add(coverDom);
        rootDom.add(dialogBody);
    }
    /**
     * 渲染前事件
     * @param module
     * @param dom
     */
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        if (this.needPreRender) {
            if (this.autoOpen) {
                this.open();
            }
        }
    }
    /**
     * 打开dialog
     * @param module
     */
    open() {
        let module = nodom.ModuleFactory.get(this.moduleId);
        if (module) {
            let model = module.modelFactory.get(this.modelId);
            if (model) {
                model.set(this.dataName, true);
            }
            //onopen事件
            if (this.onOpen) {
                let foo = module.methodFactory.get(this.onOpen);
                if (foo) {
                    nodom.Util.apply(foo, model, [model, module]);
                }
            }
        }
    }
    /**
     * 关闭dialog
     * @param module
     */
    close() {
        let module = nodom.ModuleFactory.get(this.moduleId);
        if (module) {
            let model = module.modelFactory.get(this.modelId);
            if (model) {
                model.set(this.dataName, false);
            }
            console.log(model.data);
            //onClose事件
            if (this.onClose) {
                let foo = module.methodFactory.get(this.onClose);
                if (foo) {
                    nodom.Util.apply(foo, model, [model, module]);
                }
            }
        }
    }
}
//添加到元素库
nodom.PluginManager.add('UI-DIALOG', UIDialog);
//# sourceMappingURL=dialog.js.map