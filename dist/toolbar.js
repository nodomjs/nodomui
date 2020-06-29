///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIToolbar extends nodom.DefineElement {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-TOOLBAR';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let oe = new nodom.Element();
        oe.tagName = 'DIV';
        nodom.Compiler.handleAttributes(oe, el);
        nodom.Compiler.handleChildren(oe, el);
        oe.addClass('nd-toolbar');
        oe.defineElement = this;
        return oe;
    }
}
nodom.DefineElementManager.add('UI-TOOLBAR', UIToolbar);
//# sourceMappingURL=toolbar.js.map