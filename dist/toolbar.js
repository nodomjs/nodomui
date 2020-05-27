///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIToolbar {
    constructor() {
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
        const cls = 'nd-toolbar';
        oe.props['class'] = oe.props['class'] ? oe.props['class'] + ' ' + cls : cls;
        oe.defineType = 'UI-TOOLBAR';
        return oe;
    }
}
nodom.DefineElementManager.add(new UIToolbar());
//# sourceMappingURL=toolbar.js.map