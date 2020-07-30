///<reference types='nodom'/>
/**
 * panel 插件
 *
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
        this.extraDataName = '$ui_select_' + nodom.Util.genId();
        let rootDom = new nodom.Element();
        nodom.Compiler.handleAttributes(rootDom, el);
        nodom.Compiler.handleChildren(rootDom, el);
        UITool.handleUIParam(rootDom, this, ['valuefield', 'displayfield', 'multiselect|bool', 'listfield'], ['valueName', 'displayName', 'multi', 'listName']);
        rootDom.tagName = 'div';
        rootDom.addClass('nd-select');
        let field = rootDom.getDirective('field');
        this.dataName = field.value;
        //显示框
        let showDom = new nodom.Element('div');
        showDom.addClass('nd-select-content');
        //下拉框
        let listDom = new nodom.Element('div');
        listDom.addClass('nd-select-list');
        listDom.addDirective(new nodom.Directive('show', 'show'));
        //显示框
        let firstDom = new nodom.Element('div');
        firstDom.addClass('nd-select-firstct');
        let input = new nodom.Element('input');
        input.addClass('nd-select-show');
        //多选择，不允许输入
        if (this.multi) {
            input.setProp('readonly', true);
        }
        input.setProp('value', new nodom.Expression('display'), true);
        firstDom.add(input);
        let icon = new nodom.Element('b');
        //点击展开或收拢
        firstDom.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            model.set('show', !model.data['show']);
        }));
        firstDom.add(icon);
        showDom.add(firstDom);
        let itemDom;
        // 如果有，则表示自定义
        for (let c of rootDom.children) {
            if (!c.tagName) {
                continue;
            }
            itemDom = c;
            break;
        }
        //非自定义，则新建默认对象
        if (!itemDom) {
            itemDom = new nodom.Element('div');
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(this.displayName)];
            itemDom.add(txt);
        }
        itemDom.addClass('nd-select-itemcontent');
        //item容器包裹
        let itemCt = new nodom.Element('div');
        itemCt.add(itemDom);
        itemCt.addClass('nd-select-item');
        itemCt.addDirective(new nodom.Directive('repeat', 'datas'));
        itemCt.addDirective(new nodom.Directive('class', "{'nd-select-selected':'selected'}"));
        icon = new nodom.Element('b');
        icon.addClass('nd-select-itemicon');
        icon.addDirective(new nodom.Directive('show', 'selected'));
        itemCt.add(icon);
        //点击事件
        itemCt.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.setValue(module, model);
        }));
        listDom.children = [itemCt];
        showDom.add(listDom);
        //修改model
        showDom.addDirective(new nodom.Directive('model', this.extraDataName));
        rootDom.children = [showDom];
        rootDom.defineElement = this;
        return rootDom;
    }
    /**
     * 后置渲染
     * @param module
     * @param dom
     */
    beforeRender(module, dom) {
        let me = this;
        let pmodel;
        if (!this.modelId) {
            this.modelId = dom.modelId;
            pmodel = module.modelFactory.get(this.modelId);
            pmodel.set(this.extraDataName, {
                show: false,
                display: '',
                datas: []
            });
            let data = pmodel.query(this.extraDataName);
            this.extraModelId = data.$modelId;
            //注册click事件到全局事件管理器
            UIEventRegister.addEvent('click', module.name, dom.key, (module, dom, inOrout, e) => {
                let model = module.modelFactory.get(me.extraModelId);
                //外部点击则关闭
                if (!inOrout && model.data.show) {
                    model.set('show', false);
                }
            });
        }
        pmodel = module.modelFactory.get(this.modelId);
        let model = module.modelFactory.get(this.extraModelId);
        let data = model.data;
        //下拉值初始化
        if (this.listName && data.datas.length === 0 && pmodel.data[this.listName]) {
            let value = pmodel.query(this.dataName);
            let valueArr;
            if (value && value !== '') {
                valueArr = value.toString().split(',');
            }
            let txtArr = [];
            let rows = pmodel.query(this.listName);
            //复制新数据
            if (rows && Array.isArray(rows)) {
                rows = nodom.Util.clone(rows);
                //初始化选中状态
                for (let d of rows) {
                    if (valueArr && valueArr.includes(d[this.valueName] + '')) {
                        d.selected = true;
                        txtArr.push(d[this.displayName]);
                    }
                    else {
                        d.selected = false;
                    }
                }
                //设置下拉数据
                model.set('datas', rows);
                this.setValue(module);
            }
        }
    }
    /**
     * 设置数据
     * @param module    模块
     * @param value     值
     */
    setValue(module, model) {
        //原model
        let pmodel = module.modelFactory.get(this.modelId);
        //附加数据model
        let model1 = module.modelFactory.get(this.extraModelId);
        let rows = model1.data['datas'];
        //显示数组
        let txtArr = [];
        //值数组
        let valArr = [];
        if (this.multi) {
            //反选
            if (model) {
                model.set('selected', !model.data.selected);
            }
            for (let d of rows) {
                if (d.selected) {
                    valArr.push(d[this.valueName]);
                    txtArr.push(d[this.displayName]);
                }
            }
            pmodel.set(this.dataName, valArr.join(','));
            model1.set('display', txtArr.join(','));
        }
        else {
            //如果model不存在，则直接取选中值
            if (model) {
                //取消选择
                for (let d of rows) {
                    if (d.selected) {
                        d.selected = false;
                        break;
                    }
                }
                //设置选择
                model.set('selected', !model.data.selected);
            }
            //设置选中
            for (let d of rows) {
                if (d.selected) {
                    pmodel.set(this.dataName, d[this.valueName]);
                    model1.set('display', d[this.displayName]);
                    model1.set('show', false);
                    break;
                }
            }
        }
    }
}
nodom.DefineElementManager.add('UI-SELECT', UISelect);
//# sourceMappingURL=select.js.map