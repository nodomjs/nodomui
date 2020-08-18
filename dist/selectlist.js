///<reference types='nodom'/>
/**
 * panel 插件
 */
class UISelectList extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-SELECTLIST';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['valuefield', 'displayfield|array', 'listfield', 'listtype'], ['valueField', 'displayField', 'listField', 'listType'], [null, null, null, null, 'row']);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    generate(rootDom) {
        let me = this;
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
        }
        //生成id
        let gid = nodom.Util.genId();
        this.checkName = '$nui_checked_' + gid;
        if (this.listType === 'row') {
            rootDom.addClass('nd-selectlist');
        }
        else {
            rootDom.addClass('nd-selectlist-horizontal');
        }
        // 列表节点
        let itemDom = new nodom.Element('div');
        itemDom.addClass('nd-selectlist-item');
        itemDom.addDirective(new nodom.Directive('repeat', this.listField, itemDom));
        //复选框
        let icon = new nodom.Element('b');
        icon.addClass('nd-uncheck');
        icon.addDirective(new nodom.Directive('class', "{'nd-checked':'" + this.checkName + "'}", icon));
        itemDom.add(icon);
        for (let i = 0; i < this.displayField.length; i++) {
            let f = this.displayField[i];
            //带类型
            let subItem;
            let fa = f.split('|');
            if (fa.length > 2) {
                switch (fa[2]) {
                    case 'icon':
                        subItem = new nodom.Element('b');
                        subItem.setProp('class', ['nd-icon-', new nodom.Expression(fa[0])], true);
                        break;
                }
            }
            if (!subItem) {
                subItem = new nodom.Element('span');
                let txt = new nodom.Element();
                txt.expressions = [new nodom.Expression(fa[0])];
                subItem.add(txt);
            }
            subItem.addClass('nd-selectlist-item-col');
            subItem.assets.set('style', 'flex:' + fa[1]);
            itemDom.add(subItem);
        }
        //点击事件
        itemDom.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.switchValue(module, model);
        }));
        rootDom.children = [itemDom];
    }
    /**
     * 后置渲染
     * @param module
     * @param dom
     */
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        let pmodel = module.modelFactory.get(this.modelId);
        let value = pmodel.query(this.dataName);
        let valueArr;
        if (this.needPreRender && this.listField) {
            if (value && value !== '') {
                valueArr = value.toString().split(',');
            }
            let rows = pmodel.query(this.listField);
            for (let d of rows) {
                if (valueArr && valueArr.includes(d[this.valueField] + '')) {
                    d[this.checkName] = true;
                }
                else {
                    d[this.checkName] = false;
                }
            }
        }
    }
    /**
     * 全部反选
     * @param module    module
     */
    unseleceAll(module) {
        if (!this.modelId || !this.listField) {
            return;
        }
        let pmodel = module.modelFactory.get(this.modelId);
        let rows = pmodel.query(this.listField);
        for (let d of rows) {
            d[this.checkName] = false;
        }
    }
    /**
     * 添加数据
     * @param module    模块
     * @param model     数据model
     */
    switchValue(module, model) {
        let checked = model.query(this.checkName);
        if (checked) {
            this.removeValue(module, model);
            model.set(this.checkName, false);
        }
        else {
            this.addValue(module, model);
            model.set(this.checkName, true);
        }
    }
    /**
     * 添加数据
     * @param module    模块
     * @param model     数据model
     */
    addValue(module, model) {
        let pmodel = module.modelFactory.get(this.modelId);
        //值串
        let value = pmodel.query(this.dataName);
        let v = model.query(this.valueField);
        //多选
        if (value) {
            let a = value.toString().split(',');
            if (a.includes(v)) {
                return;
            }
            a.push(v);
            pmodel.set(this.dataName, a.join(','));
        }
        else {
            pmodel.set(this.dataName, v);
        }
    }
    /**
     * 添加数据
     * @param module    模块
     * @param model     数据项
     */
    removeValue(module, model) {
        let pmodel = module.modelFactory.get(this.modelId);
        //值串
        let value = pmodel.query(this.dataName);
        let v = model.query(this.valueField);
        model.set(this.checkName, false);
        if (!value || value === '') {
            return;
        }
        let a = value.toString().split(',');
        v = v.toString();
        if (!a.includes(v)) {
            return;
        }
        let ind = a.indexOf(v);
        a.splice(ind, 1);
        pmodel.set(this.dataName, a.join(','));
    }
}
nodom.PluginManager.add('UI-SELECTLIST', UISelectList);
//# sourceMappingURL=selectlist.js.map