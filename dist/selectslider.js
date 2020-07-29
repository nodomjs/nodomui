class UISelectSlider extends nodom.DefineElement {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-SELECTSLIDER';
    }
    init(el) {
        let rootDom = new nodom.Element('div');
        rootDom.defineElement = this;
        return rootDom;
    }
}
nodom.DefineElementManager.add('UI-SELECTSLIDER', UISelectSlider);
//# sourceMappingURL=selectslider.js.map