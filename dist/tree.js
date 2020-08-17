///<reference types='nodom'/>
/**
 * panel 插件
 */
class UITree extends nodom.Plugin {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-TREE';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        const me = this;
        let rootDom = new nodom.Element();
        //增加暂存数据
        nodom.Compiler.handleAttributes(rootDom, el);
        UITool.handleUIParam(rootDom, this, ['valuefield', 'displayfield', 'listfield', 'itemclick', 'checkname', 'maxlevel|number', 'icons|array|2'], ['valueName', 'displayName', 'listName', 'clickEvent', 'checkName', 'maxLevel', 'iconArr'], ['', null, null, '', '', 3, []]);
        rootDom.addClass('nd-tree');
        rootDom.tagName = 'div';
        this.activeName = '$ui_tree_' + nodom.Util.genId();
        this.checkedChdNumName = '$ui_tree_' + nodom.Util.genId();
        //展开收拢事件
        let methodId = '$nodomGenMethod' + nodom.Util.genId();
        this.arrowClickId = methodId;
        let closeOpenEvent = new nodom.NodomEvent('click', methodId + ':delg');
        //item click 事件
        let itemClickEvent;
        if (this.itemClick !== '') {
            itemClickEvent = new nodom.NodomEvent('click', this.itemClick + ':delg');
        }
        let parentCt = rootDom;
        let item;
        for (let i = 0; i < this.maxLevel; i++) {
            let itemCt = new nodom.Element();
            itemCt.tagName = 'div';
            itemCt.directives.push(new nodom.Directive('repeat', this.listName, itemCt));
            itemCt.addClass('nd-tree-nodect');
            item = new nodom.Element();
            item.addClass('nd-tree-node');
            item.tagName = 'DIV';
            //绑定item click事件
            if (itemClickEvent) {
                item.addEvent(itemClickEvent);
            }
            //icon处理
            //树形结构左边箭头图标
            let icon1 = new nodom.Element();
            icon1.tagName = 'SPAN';
            icon1.addClass('nd-tree-icon');
            icon1.addDirective(new nodom.Directive('class', "{'nd-tree-node-open':'" + this.activeName + "'," +
                "'nd-icon-right':'" + this.listName + "&&" + this.listName + ".length>0'}", icon1));
            //绑定展开收起事件
            icon1.addEvent(closeOpenEvent);
            itemCt.add(icon1);
            //folder和叶子节点图标
            if (this.iconArr.length > 0) {
                let a = [];
                a.push("'nd-icon-" + this.iconArr[0] + "':'" + this.listName + "&&" + this.listName + ".length>0'");
                //叶子节点图标
                if (this.iconArr.length > 1) {
                    a.push("'nd-icon-" + this.iconArr[1] + "':'!" + this.listName + "||" + this.listName + ".length===0'");
                }
                let icon = new nodom.Element();
                icon.tagName = 'SPAN';
                icon.addClass('nd-tree-icon');
                let cls = '{' + a.join(',') + '}';
                icon.directives.push(new nodom.Directive('class', cls, icon));
                itemCt.add(icon);
            }
            if (this.checkName !== '') {
                let cb = new nodom.Element('b');
                cb.addClass('nd-tree-uncheck');
                cb.addDirective(new nodom.Directive('class', "{'nd-tree-checked':'" + this.checkName + "'}", cb));
                itemCt.add(cb);
                cb.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
                    me.handleCheck(model, module);
                }));
            }
            itemCt.add(item);
            //显示文本
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(this.displayName)];
            item.add(txt);
            //子节点容器
            let subCt = new nodom.Element();
            subCt.addClass('nd-tree-subct');
            subCt.tagName = 'DIV';
            subCt.addDirective(new nodom.Directive('class', "{'nd-tree-show':'" + this.activeName + "'}", subCt));
            itemCt.add(subCt);
            parentCt.add(itemCt);
            parentCt = subCt;
        }
        rootDom.plugin = this;
        return rootDom;
    }
    /**
     * 渲染前执行
     * @param module
     */
    beforeRender(module, uidom) {
        const me = this;
        super.beforeRender(module, uidom);
        if (this.needPreRender) {
            //展开收拢事件
            module.methodFactory.add(me.arrowClickId, (dom, model, module, e) => {
                let pmodel = module.modelFactory.get(dom.modelId);
                let rows = pmodel.data[me.listName];
                //叶子节点不处理
                if (!rows || rows.length === 0) {
                    return;
                }
                //选中字段名
                model.set(me.activeName, !model.data[me.activeName]);
            });
        }
    }
    /**
    * 处理选中状态
    * @param data       当前dom的数据
    * @param module     模块
    */
    handleCheck(model, module) {
        let checked = !model.data[this.checkName];
        //取消会选中当前框
        model.set(this.checkName, checked);
        this.handleSubCheck(model, module, checked);
        this.handleParentCheck(model, module, checked);
    }
    /**
    * 处理子孙选中状态
    * @param data       当前dom的数据
    * @param module     模块
    * @param checked    值
    */
    handleSubCheck(model, module, checked) {
        let rows = model.data[this.listName];
        if (!rows) {
            return;
        }
        //修改子节点选中数
        if (checked) {
            model.set(this.checkedChdNumName, rows.length);
        }
        else {
            model.set(this.checkedChdNumName, 0);
        }
        //子孙节点
        for (let d of rows) {
            let m = module.modelFactory.get(d.$modelId);
            m.set(this.checkName, checked);
            this.handleSubCheck(m, module, checked);
        }
    }
    /**
    * 处理祖先节点选中状态
    * @param data       当前dom的数据
    * @param module     模块
    * @param checked    值
    */
    handleParentCheck(model, module, checked) {
        //数据向上走两级，因为第一级为数组，第二级才到数据
        let pmodel = model.parent;
        if (!pmodel || pmodel === module.model) {
            return;
        }
        pmodel = pmodel.parent;
        if (!pmodel || pmodel === module.model) {
            return;
        }
        let data = pmodel.data;
        if (data[this.checkedChdNumName] === undefined) {
            pmodel.set(this.checkedChdNumName, 0);
        }
        if (checked) {
            data[this.checkedChdNumName]++;
        }
        else {
            data[this.checkedChdNumName]--;
        }
        let chk = data[this.checkName];
        if (data[this.checkedChdNumName] === 0) {
            pmodel.set(this.checkName, false);
        }
        else {
            pmodel.set(this.checkName, true);
        }
        //状态改变，向上递归
        if (chk !== data[this.checkName]) {
            this.handleParentCheck(pmodel, module, checked);
        }
    }
    /**
     * 获取value
     */
    getValue() {
        if (this.valueName === '') {
            return;
        }
        let va = [];
        let module = nodom.ModuleFactory.get(this.moduleId);
        let model = module.modelFactory.get(this.modelId);
        getChecked(model.data[this.listName]);
        return va;
        function getChecked(rows) {
            if (Array.isArray(rows)) {
                for (let d of rows) {
                    if (d[this.checkName] === true) {
                        va.push(d);
                    }
                    getChecked(d[this.listName]);
                }
            }
        }
    }
}
nodom.PluginManager.add('UI-TREE', UITree);
//# sourceMappingURL=tree.js.map