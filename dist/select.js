///<reference types='nodom'/>
/**
 * panel 插件
 */
class UISelect {
    constructor() {
        this.tagName = 'UI-SELECT';
    }
    init(el) {
        let selectDom = new nodom.Element();
        nodom.Compiler.handleAttributes(selectDom, el);
        nodom.Compiler.handleChildren(selectDom, el);
        selectDom.tagName = 'div';
        selectDom.addClass('nd-select');
        let dataName = selectDom.props['field'];
        let showName = selectDom.props['show'];
        //显示框
        let content = new nodom.Element('div');
        content.addClass('nd-select-content');
        //显示内容
        let input = new nodom.Element('input');
        input.exprProps['value'] = [new nodom.Expression(showName)];
        content.add(input);
        let icon = new nodom.Element('b');
        icon.addClass('nd-icon-arrow-down');
        //点击展开或收拢
        icon.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            model.set('$show', !model.data['$show']);
        }));
        content.add(icon);
        //下拉框
        let list = new nodom.Element('div');
        list.addClass('nd-select-list');
        list.addDirective(new nodom.Directive('show', '$show', list));
        // 新的孩子节点
        for (let c of selectDom.children) {
            if (!c.tagName) {
                continue;
            }
            let icon = new nodom.Element('b');
            icon.addClass('nd-icon-checkbox');
            icon.addDirective(new nodom.Directive('class', "{'nd-icon-checked':'" + dataName + "==\"" + c.props['value'] + "\"'}", icon));
            c.children.unshift(icon);
            //点击事件
            c.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
                let p = dom.getParent(module);
                let pmodel = module.modelFactory.get(p.modelId);
                pmodel.set(dataName, dom.props['value']);
                pmodel.set('$show', false);
                console.log(pmodel.data);
            }));
            list.add(c);
        }
        selectDom.children = [content, list];
        delete selectDom.props['field'];
        selectDom.defineElement = this;
        return selectDom;
    }
}
nodom.DefineElementManager.add('UI-SELECT', UISelect);
//# sourceMappingURL=select.js.map