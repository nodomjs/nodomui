///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIButtonGroup extends nodom.Plugin {
    constructor() {
        super(...arguments);
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
        oe.addClass('nd-buttongroup');
        oe.plugin = this;
        return oe;
    }
}
nodom.PluginManager.add('UI-BUTTONGROUP', UIButtonGroup);
//# sourceMappingURL=buttongroup.js.map