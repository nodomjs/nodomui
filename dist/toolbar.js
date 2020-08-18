///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIToolbar extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-TOOLBAR';
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
        }
        rootDom.tagName = 'div';
        rootDom.addClass('nd-toolbar');
        rootDom.plugin = this;
        this.element = rootDom;
    }
}
nodom.PluginManager.add('UI-TOOLBAR', UIToolbar);
//# sourceMappingURL=toolbar.js.map