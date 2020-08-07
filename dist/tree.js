///<reference types='nodom'/>
/**
 * panel 插件
 */
class UITree extends nodom.DefineElement {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-TREE';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let ct = new nodom.Element('div');
        //增加暂存数据
        nodom.Compiler.handleAttributes(ct, el);
        ct.addClass('nd-tree');
        //数据字段名
        let dataName = ct.getProp('data');
        this.dataName = dataName;
        //图标数组
        let icons;
        //显示字段名
        let showName = ct.getProp('showname');
        //激活字段名
        let activeName = ct.getProp('activename');
        this.activeName = activeName;
        //checkbox绑定name，如果存在，则显示checkbox
        let checkName = ct.getProp('checkname');
        if (ct.hasProp('icon')) {
            icons = ct.getProp('icon').trim().replace(/\s+/g, '').split(',');
        }
        //最大级数，默认3
        let maxLevels = ct.getProp('maxlevels') ? parseInt(ct.getProp('maxlevels')) : 3;
        //展开收拢事件
        let methodId = '$nodomGenMethod' + nodom.Util.genId();
        this.arrowClickId = methodId;
        let closeOpenEvent = new nodom.NodomEvent('click', methodId + ':delg');
        //item click 事件
        let itemClickEvent;
        if (ct.hasProp('itemclick')) {
            itemClickEvent = new nodom.NodomEvent('change', ct.getProp('itemclick') + ':delg');
        }
        let parentCt = ct;
        let item;
        for (let i = 0; i < maxLevels; i++) {
            let itemCt = new nodom.Element();
            itemCt.tagName = 'div';
            itemCt.directives.push(new nodom.Directive('repeat', dataName, itemCt));
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
            icon1.addDirective(new nodom.Directive('class', "{'nd-tree-node-open':'" + activeName + "'," +
                "'nd-icon-right':'" + dataName + "&&" + dataName + ".length>0'}", icon1));
            //绑定展开收起事件
            icon1.addEvent(closeOpenEvent);
            itemCt.add(icon1);
            //folder和叶子节点图标
            if (icons && icons.length > 0) {
                let a = [];
                a.push("'nd-icon-" + icons[0] + "':'" + dataName + "&&" + dataName + ".length>0'");
                //叶子节点图标
                if (icons.length > 1) {
                    a.push("'nd-icon-" + icons[1] + "':'!" + dataName + "||" + dataName + ".length===0'");
                }
                let icon = new nodom.Element();
                icon.tagName = 'SPAN';
                icon.addClass('nd-tree-icon');
                let cls = '{' + a.join(',') + '}';
                icon.directives.push(new nodom.Directive('class', cls, icon));
                itemCt.add(icon);
            }
            if (checkName) {
                let cb = new nodom.Element('input');
                cb.setProp('type', 'checkbox');
                cb.addDirective(new nodom.Directive('field', checkName, cb));
                cb.setProp('yes-value', 'true');
                cb.setProp('no-value', 'false');
                itemCt.add(cb);
                cb.addEvent(new nodom.NodomEvent('change', (dom, model, module, e) => {
                    handleCheck(model.data, module);
                }));
            }
            itemCt.add(item);
            //显示文本
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(showName)];
            item.add(txt);
            //子节点容器
            let subCt = new nodom.Element();
            subCt.addClass('nd-tree-subct');
            subCt.tagName = 'DIV';
            subCt.addDirective(new nodom.Directive('class', "{'nd-tree-show':'" + activeName + "'}", subCt));
            itemCt.add(subCt);
            parentCt.add(itemCt);
            parentCt = subCt;
        }
        ct.delProp(['data', 'icon', 'checkname', 'dataname', 'activename', 'itemclick', 'maxlevels']);
        ct.defineElement = this;
        return ct;
        /**
         * 处理子孙节点check状态
         * @param data      当前dom的数据
         * @param module    模块
         */
        function handleCheck(data, module) {
            let rows = data[dataName];
            if (!rows) {
                return;
            }
            //当前是选中状态
            for (let d of rows) {
                let b = data[checkName] === 'true' || data[checkName] === true ? true : false;
                if (!d.hasOwnProperty(checkName)) {
                    let m = module.modelFactory.get(d.$modelId);
                    m.set(checkName, b);
                }
                else {
                    d[checkName] = b;
                }
                handleCheck(d, module);
            }
        }
    }
    /**
     * 渲染前执行
     * @param module
     */
    beforeRender(module, uidom) {
        let me = this;
        //展开收拢事件
        module.methodFactory.add(me.arrowClickId, (dom, model, module, e) => {
            let pmodel = module.modelFactory.get(dom.modelId);
            let rows = pmodel.data[me.dataName];
            //叶子节点不处理
            if (!rows || rows.length === 0) {
                return;
            }
            //选中字段名
            let f = me.activeName;
            model.set(f, !model.data[f]);
        });
    }
}
nodom.DefineElementManager.add('UI-TREE', UITree);
//# sourceMappingURL=tree.js.map