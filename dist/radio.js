///<reference types='nodom'/>
/**
 * checkbox
 */
class UIRadio extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-RADIO';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'span';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    generate(rootDom) {
        rootDom.addClass('nd-radio');
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
        }
        // 新的孩子节点
        for (let c of rootDom.children) {
            if (c.tagName) {
                let icon = new nodom.Element('b');
                icon.addClass('nd-icon-radio');
                icon.addDirective(new nodom.Directive('class', "{'nd-radio-active':'" + this.dataName + "==\"" + c.getProp('value') + "\"'}", icon));
                c.children.unshift(icon);
                //点击事件
                c.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
                    let v = model.data[this.dataName];
                    model.set(this.dataName, dom.getProp('value'));
                }));
            }
        }
    }
}
nodom.PluginManager.add('UI-RADIO', UIRadio);
//# sourceMappingURL=radio.js.map