///<reference types='nodom'/>
/**
 * panel 插件
 */
class UISelect extends nodom.DefineElement {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-SELECT';
    }
    //设置显示内容
    init(el) {
        let me = this;
        //生成id
        let gid = nodom.Util.genId();
        this.switchName = '$nui_switch_' + gid;
        this.displayName = '$nui_display_' + gid;
        this.checkName = '$nui_checked_' + gid;
        let selectDom = new nodom.Element();
        nodom.Compiler.handleAttributes(selectDom, el);
        nodom.Compiler.handleChildren(selectDom, el);
        selectDom.tagName = 'div';
        selectDom.addClass('nd-select');
        this.dataName = selectDom.getProp('name');
        this.valueName = selectDom.getProp('valuefield');
        this.showName = selectDom.getProp('displayfield');
        this.multi = selectDom.hasProp('multiselect');
        selectDom.delProp(['name', 'valuefield', 'multiselect']);
        //显示框
        let showDom = new nodom.Element('div');
        showDom.addClass('nd-select-content');
        //下拉框
        let listDom = new nodom.Element('div');
        listDom.addClass('nd-select-list');
        listDom.addDirective(new nodom.Directive('show', me.switchName, listDom));
        //显示框
        let firstDom = new nodom.Element('div');
        firstDom.addClass('nd-select-firstct');
        let input = new nodom.Element('input');
        input.addClass('nd-select-show');
        //多选择，不允许输入
        if (this.multi) {
            input.setProp('readonly', true);
        }
        input.setProp('value', new nodom.Expression(me.displayName), true);
        firstDom.add(input);
        let icon = new nodom.Element('b');
        icon.addClass('nd-icon-arrow-down');
        //点击展开或收拢
        firstDom.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            model.set(me.switchName, !model.data[me.switchName]);
        }));
        firstDom.add(icon);
        showDom.add(firstDom);
        // 下拉孩子节点
        for (let c of selectDom.children) {
            if (!c.tagName) {
                continue;
            }
            //保存list数据名
            if (c.hasDirective('model')) {
                let d = c.getDirective('model');
                this.listName = d.value[0];
            }
            let icon = new nodom.Element('b');
            icon.addClass('nd-uncheck');
            icon.addDirective(new nodom.Directive('class', "{'nd-checked':'" + this.checkName + "'}", icon));
            c.children.unshift(icon);
            //点击事件
            c.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
                me.switchValue(module, model, dom.getProp('show'));
            }));
            listDom.add(c);
        }
        showDom.add(listDom);
        selectDom.children = [showDom];
        selectDom.delProp('field');
        selectDom.defineElement = this;
        return selectDom;
    }
    /**
     * 后置渲染
     * @param module
     * @param dom
     */
    beforeRender(module, dom) {
        let me = this;
        this.modelId = dom.modelId;
        let pmodel = module.modelFactory.get(this.modelId);
        let value = pmodel.query(this.dataName);
        let valueArr;
        if (!this.initDataFlag && this.listName) {
            if (value && value !== '') {
                valueArr = value.toString().split(',');
            }
            let txtArr = [];
            let rows = pmodel.query(this.listName);
            for (let d of rows) {
                if (valueArr && valueArr.includes(d[this.valueName] + '')) {
                    d[this.checkName] = true;
                    txtArr.push(d[this.showName]);
                }
                else {
                    d[this.checkName] = false;
                }
            }
            if (txtArr.length > 0) {
                pmodel.set(this.displayName, txtArr.join(','));
            }
            //注册click事件到全局事件管理器
            UIEventRegister.addEvent('click', module.name, dom.key, (module, dom, inOrout, e) => {
                let model = module.modelFactory.get(dom.modelId);
                //外部点击则关闭
                if (!inOrout && model.data[me.switchName]) {
                    pmodel.set(me.switchName, false);
                }
            });
            this.initDataFlag = true;
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
     * @param txt       显示文本
     */
    switchValue(module, model, txt) {
        let checked = model.query(this.checkName);
        if (checked) {
            this.removeValue(module, model);
            model.set(this.checkName, false);
        }
        else {
            this.addValue(module, model, txt);
            model.set(this.checkName, true);
        }
    }
    /**
     * 添加数据
     * @param module    模块
     * @param model     数据model
     * @param txt       显示文本
     */
    addValue(module, model, txt) {
        let pmodel = module.modelFactory.get(this.modelId);
        //值串
        let value = pmodel.query(this.dataName);
        //显示串
        let display = pmodel.query(this.displayName);
        let v = model.query(this.valueName);
        //多选
        if (this.multi) {
            if (value) {
                let a = value.toString().split(',');
                if (a.includes(v)) {
                    return;
                }
                a.push(v);
                pmodel.set(this.dataName, a.join(','));
                pmodel.set(this.displayName, display + ',' + txt);
            }
            else {
                pmodel.set(this.dataName, v);
                pmodel.set(this.displayName, txt);
            }
        }
        else {
            this.unseleceAll(module);
            pmodel.set(this.valueName, v);
            pmodel.set(this.displayName, txt);
            pmodel.set(this.switchName, false);
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
        //显示串
        let display = pmodel.query(this.displayName);
        let v = model.query(this.valueName);
        model.set(this.checkName, false);
        if (!value || value === '') {
            return;
        }
        //多选
        if (this.multi) {
            let a = value.toString().split(',');
            v = v.toString();
            if (!a.includes(v)) {
                return;
            }
            let ind = a.indexOf(v);
            a.splice(ind, 1);
            let a1 = display.split(',');
            a1.splice(ind, 1);
            pmodel.set(this.dataName, a.join(','));
            pmodel.set(this.displayName, a1.join(','));
        }
        else {
            pmodel.set(this.dataName, '');
            pmodel.set(this.displayName, '');
            pmodel.set(this.switchName, false);
        }
    }
}
nodom.DefineElementManager.add('UI-SELECT', UISelect);
//# sourceMappingURL=select.js.map