///<reference types='nodom'/>
/**
 * panel 插件
 */
class UISelectList {
    constructor() {
        this.tagName = 'UI-SELECTLIST';
    }
    init(el) {
        let me = this;
        //生成id
        let gid = nodom.Util.genId();
        this.checkName = '$nui_checked_' + gid;
        let listDom = new nodom.Element();
        nodom.Compiler.handleAttributes(listDom, el);
        nodom.Compiler.handleChildren(listDom, el);
        listDom.tagName = 'div';
        UITool.handleUIParam(listDom, this, ['field', 'valuefield', 'displayfield|array', 'listfield', 'listtype'], ['fieldName', 'valueName', 'displayName', 'listName', 'listType'], [null, null, null, null, 'row']);
        if (this.listType === 'row') {
            listDom.addClass('nd-selectlist');
        }
        else {
            listDom.addClass('nd-selectlist-horizontal');
        }
        // 列表节点
        let itemDom = new nodom.Element('div');
        itemDom.addClass('nd-selectlist-item');
        itemDom.addDirective(new nodom.Directive('repeat', this.listName, itemDom));
        //复选框
        let icon = new nodom.Element('b');
        icon.addClass('nd-uncheck');
        icon.addDirective(new nodom.Directive('class', "{'nd-checked':'" + this.checkName + "'}", icon));
        itemDom.add(icon);
        for (let i = 0; i < this.displayName.length; i++) {
            let f = this.displayName[i];
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
        listDom.children = [itemDom];
        listDom.delProp('field');
        listDom.defineElement = this;
        return listDom;
    }
    /**
     * 后置渲染
     * @param module
     * @param dom
     */
    beforeRender(module, dom) {
        this.modelId = dom.modelId;
        let pmodel = module.modelFactory.get(this.modelId);
        let value = pmodel.query(this.fieldName);
        let valueArr;
        if (!this.initDataFlag && this.listName) {
            if (value && value !== '') {
                valueArr = value.toString().split(',');
            }
            let rows = pmodel.query(this.listName);
            for (let d of rows) {
                if (valueArr && valueArr.includes(d[this.valueName] + '')) {
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
        if (!this.modelId || !this.listName) {
            return;
        }
        let pmodel = module.modelFactory.get(this.modelId);
        let rows = pmodel.query(this.listName);
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
        let value = pmodel.query(this.fieldName);
        let v = model.query(this.valueName);
        //多选
        if (value) {
            let a = value.toString().split(',');
            if (a.includes(v)) {
                return;
            }
            a.push(v);
            pmodel.set(this.fieldName, a.join(','));
        }
        else {
            pmodel.set(this.fieldName, v);
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
        let value = pmodel.query(this.fieldName);
        let v = model.query(this.valueName);
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
        pmodel.set(this.fieldName, a.join(','));
    }
}
nodom.DefineElementManager.add('UI-SELECTLIST', UISelectList);
//# sourceMappingURL=selectlist.js.map