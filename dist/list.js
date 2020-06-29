///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIList extends nodom.DefineElement {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-LIST';
    }
    init(el) {
        let me = this;
        //生成id
        let gid = nodom.Util.genId();
        let listDom = new nodom.Element();
        nodom.Compiler.handleAttributes(listDom, el);
        nodom.Compiler.handleChildren(listDom, el);
        listDom.tagName = 'div';
        UITool.handleUIParam(listDom, this, ['listfield', 'displayfield|array', 'listtype', 'itemclick'], ['listName', 'displayName', 'listType', 'clickEvent'], [null, null, 'row', null]);
        if (this.listType === 'row') {
            listDom.addClass('nd-list');
        }
        else {
            listDom.addClass('nd-list-horizontal');
        }
        // 列表节点
        let itemDom = new nodom.Element('div');
        itemDom.addClass('nd-list-item');
        itemDom.addDirective(new nodom.Directive('repeat', this.listName, itemDom));
        for (let i = 0; i < this.displayName.length; i++) {
            let f = this.displayName[i];
            let subCt = new nodom.Element('div');
            let subItem;
            let fa = f.split('|');
            if (fa.length > 2) {
                switch (fa[2]) {
                    case 'icon': //文字图标
                        subItem = new nodom.Element('b');
                        subItem.setProp('class', ['nd-icon-', new nodom.Expression(fa[0])], true);
                        break;
                    case 'image': //图片
                        subItem = new nodom.Element('img');
                        subItem.setProp('src', new nodom.Expression(fa[0]), true);
                }
            }
            if (!subItem) {
                subItem = new nodom.Element('span');
                let txt = new nodom.Element();
                txt.expressions = [new nodom.Expression(fa[0])];
                subItem.add(txt);
            }
            subCt.addClass('nd-list-item-col');
            subCt.assets.set('style', 'flex:' + fa[1]);
            subCt.add(subItem);
            itemDom.add(subCt);
        }
        //点击事件
        if (this.clickEvent) {
            itemDom.addEvent(new nodom.NodomEvent('click', this.clickEvent));
        }
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
    }
}
nodom.DefineElementManager.add('UI-LIST', UIList);
//# sourceMappingURL=list.js.map