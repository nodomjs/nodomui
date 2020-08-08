class UISelectSlider extends nodom.Plugin {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-SELECTSLIDER';
    }
    init(el) {
        let rootDom = new nodom.Element('div');
        rootDom.plugin = this;
        return rootDom;
    }
}
nodom.PluginManager.add('UI-SELECTSLIDER', UISelectSlider);
//# sourceMappingURL=selectslider.js.map