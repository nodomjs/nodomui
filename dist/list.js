///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIList extends nodom.Plugin {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-LIST';
    }
    init(el) {
        let me = this;
        //生成id
        this.extraDataName = '$ui_list_' + nodom.Util.genId();
        let rootDom = new nodom.Element();
        nodom.Compiler.handleAttributes(rootDom, el);
        nodom.Compiler.handleChildren(rootDom, el);
        rootDom.tagName = 'div';
        //增加附加model
        rootDom.addDirective(new nodom.Directive('model', this.extraDataName, rootDom));
        UITool.handleUIParam(rootDom, this, ['valuefield', 'displayfield', 'disablefield', 'listfield', 'type', 'itemclick', 'itemwidth|number', 'multiselect|bool'], ['valueName', 'displayName', 'disableName', 'listName', 'type', 'clickEvent', 'itemWidth', 'multi'], ['', '', '', null, 'row', '', 0, null]);
        if (this.type === 'row') {
            rootDom.addClass('nd-list');
        }
        else {
            rootDom.addClass('nd-list-horizontal');
        }
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
        }
        // 列表节点
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
            if (this.displayName !== '') {
                let txt = new nodom.Element();
                txt.expressions = [new nodom.Expression(this.displayName)];
                itemDom.add(txt);
            }
        }
        itemDom.addClass('nd-list-item');
        itemDom.addDirective(new nodom.Directive('repeat', 'datas', itemDom));
        //点击事件
        itemDom.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            if (me.disableName !== '' && model.query(me.disableName)) {
                return;
            }
            me.setValue(module, model);
        }));
        //列表方式，需要设置不同元素
        if (this.type === 'row') {
            //item文本显示内容
            let item = new nodom.Element('div');
            item.children = itemDom.children;
            item.addClass('nd-list-itemcontent');
            let icon = new nodom.Element('b');
            icon.addClass('nd-list-icon');
            itemDom.children = [item, icon];
        }
        if (this.disableName !== '') {
            itemDom.addDirective(new nodom.Directive('class', "{'nd-list-item-active':'selected','nd-list-item-disable':'" + this.disableName + "'}", itemDom));
        }
        else {
            itemDom.addDirective(new nodom.Directive('class', "{'nd-list-item-active':'selected'}", itemDom));
        }
        //点击事件
        if (this.clickEvent) {
            itemDom.addEvent(new nodom.NodomEvent('click', this.clickEvent));
        }
        rootDom.children = [itemDom];
        rootDom.plugin = this;
        return rootDom;
    }
    /**
     * 后置渲染
     * @param module
     * @param dom
     */
    beforeRender(module, dom) {
        //uidom model
        let pmodel;
        //附加数据model
        let model;
        if (!this.modelId) {
            this.modelId = dom.modelId;
            pmodel = module.modelFactory.get(this.modelId);
            this.extraModelId = pmodel.set(this.extraDataName, {
                datas: [] //下拉框数据
            }).id;
        }
        if (!pmodel) {
            pmodel = module.modelFactory.get(this.modelId);
        }
        if (!model) {
            model = module.modelFactory.get(this.extraModelId);
        }
        let data = model.data;
        //下拉值初始化
        if (this.listName && data.datas.length === 0 && pmodel.data[this.listName]) {
            let valueArr;
            if (this.dataName) {
                let value = pmodel.query(this.dataName);
                if (value && value !== '') {
                    valueArr = value.toString().split(',');
                }
            }
            let rows = pmodel.query(this.listName);
            //复制新数据
            if (rows && Array.isArray(rows)) {
                rows = nodom.Util.clone(rows);
                //初始化选中状态
                if (this.valueName !== '') {
                    for (let d of rows) {
                        if (valueArr && valueArr.includes(d[this.valueName] + '')) {
                            d.selected = true;
                        }
                        else {
                            d.selected = false;
                        }
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
        if (!this.dataName || this.valueName === '') {
            return;
        }
        //原model
        let pmodel = module.modelFactory.get(this.modelId);
        //附加数据model
        let model1 = module.modelFactory.get(this.extraModelId);
        let rows = model1.data['datas'];
        //显示数组
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
                }
            }
            pmodel.set(this.dataName, valArr.join(','));
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
                    break;
                }
            }
        }
    }
}
nodom.PluginManager.add('UI-LIST', UIList);
//# sourceMappingURL=list.js.map