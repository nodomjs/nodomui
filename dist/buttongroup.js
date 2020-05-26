///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIButtonGroup {
    constructor() {
        this.tagName = 'UI-BUTTONGROUP';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let oe = new nodom.Element();
        oe.tagName = 'DIV';
        nodom.Compiler.handleAttributes(oe, el);
        nodom.Compiler.handleChildren(oe, el);
        const cls = 'nd-buttongroup';
        oe.props['class'] = oe.props['class'] ? oe.props['class'] + ' ' + cls : cls;
        oe.defineType = 'buttongroup';
        return oe;
    }
}
nodom.DefineElementManager.add(new UIButtonGroup());
//# sourceMappingURL=buttongroup.js.map