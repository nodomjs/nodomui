///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIDialog extends UIPanel {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-DIALOG';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        el.setAttribute('buttons', 'close');
        let panelDom = super.init(el);
        //删除 panelDom的plugin
        delete panelDom.plugin;
        this.dataName = '$ui_dialog_' + nodom.Util.genId();
        let dialogDom = new nodom.Element('div');
        dialogDom.addClass('nd-dialog');
        dialogDom.setProp('name', panelDom.getProp('name'));
        //autoopen
        this.autoOpen = panelDom.hasProp('autoopen');
        panelDom.delProp(['name', 'autoopen']);
        dialogDom.addDirective(new nodom.Directive('show', this.dataName, dialogDom));
        //body
        let dialogBody = new nodom.Element('div');
        dialogBody.addClass('nd-dialog-body');
        dialogBody.add(panelDom);
        //蒙版
        let coverDom = new nodom.Element('div');
        coverDom.addClass('nd-dialog-cover');
        dialogDom.add(coverDom);
        dialogDom.add(dialogBody);
        dialogDom.plugin = this;
        return dialogDom;
    }
    /**
     * 渲染前事件
     * @param module
     * @param dom
     */
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        if (this.needPreRender) {
            this.modelId = dom.modelId;
            this.moduleId = module.id;
            if (this.autoOpen) {
                this.open();
            }
        }
    }
    /**
     * 设置关闭事件
     * @param foo
     */
    setCloseHandler(btn) {
        let me = this;
        btn.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            model.set(me.dataName, false);
        }));
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
                console.log(model.data);
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
                console.log(model.data);
            }
        }
    }
}
//添加到元素库
nodom.PluginManager.add('UI-DIALOG', UIDialog);
//# sourceMappingURL=dialog.js.map