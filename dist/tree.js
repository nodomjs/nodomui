///<reference types='nodom'/>
/**
 * panel 插件
 */
class UITree {
    constructor() {
        this.tagName = 'UI-TREE';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let ct = new nodom.Element();
        //增加暂存数据
        ct.tmpData = {};
        ct.tagName = 'DIV';
        nodom.Compiler.handleAttributes(ct, el);
        ct.addClass('nd-tree');
        //数据字段名
        let dataName = ct.props['data'];
        //图标数组
        let icons;
        //显示字段名
        let showName = ct.props['showname'];
        //激活字段名
        let activeName = ct.props['activename'];
        if (ct.props['icon']) {
            icons = ct.props['icon'].trim().replace(/\s+/g, '').split(',');
        }
        //最大级数，默认5
        let maxLevels = ct.props['maxlevels'] ? parseInt(ct.props['maxlevels']) : 5;
        //展开收拢事件
        let methodId = '$nodomGenMethod' + nodom.Util.genId();
        let closeOpenEvent = new nodom.NodomEvent('click', methodId);
        //暂存数据
        ct.tmpData = {
            dataName: dataName,
            activeName: activeName,
            closeOpenMid: methodId
        };
        //item click 事件
        let itemClickEvent;
        if (ct.props['itemclick']) {
            itemClickEvent = new nodom.NodomEvent('click', ct.props['itemclick'] + ':delg');
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
            if (icons && icons.length > 0) {
                let a = [];
                a.push("'nd-icon-" + icons[0] + "':'" + dataName + "&&" + dataName + ".length>0 && " + activeName + "'");
                if (icons.length > 1) {
                    a.push("'nd-icon-" + icons[1] + "':'" + dataName + "&&" + dataName + ".length>0 && !" + activeName + "'");
                }
                //叶子节点图标
                if (icons.length === 3) {
                    a.push("'nd-icon-" + icons[2] + "':'!" + dataName + "||" + dataName + ".length===0'");
                }
                let icon = new nodom.Element();
                icon.tagName = 'B';
                icon.addClass('nd-tree-icon');
                let cls = '{' + a.join(',') + '}';
                icon.directives.push(new nodom.Directive('class', cls, item));
                //绑定展开收起事件
                icon.addEvent(closeOpenEvent);
                itemCt.add(icon);
            }
            itemCt.add(item);
            //显示文本
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(showName)];
            item.add(txt);
            //子节点容器
            let subCt = new nodom.Element();
            subCt.props['class'] = 'nd-tree-subct';
            subCt.tagName = 'DIV';
            subCt.directives.push(new nodom.Directive('class', "{'nd-tree-show':'" + activeName + "'}", item));
            itemCt.add(subCt);
            parentCt.add(itemCt);
            parentCt = subCt;
        }
        delete ct.props['data'];
        delete ct.props['icon'];
        delete ct.props['check'];
        delete ct.props['activename'];
        delete ct.props['itemclick'];
        delete ct.props['maxlevels'];
        ct.defineType = this.tagName;
        return ct;
    }
    /**
     * 渲染前执行
     * @param module
     */
    beforeRender(module, uidom) {
        //展开收拢事件
        module.methodFactory.add(uidom.tmpData['closeOpenMid'], (dom, model, module, e) => {
            let pmodel = module.modelFactory.get(dom.modelId);
            let rows = pmodel.data[uidom.tmpData['dataName']];
            //叶子节点不处理
            if (!rows || rows.length === 0) {
                return;
            }
            //选中字段名
            let f = uidom.tmpData['activeName'];
            model.set(f, !model.data[f]);
        });
    }
}
nodom.DefineElementManager.add(new UITree());
//# sourceMappingURL=tree.js.map