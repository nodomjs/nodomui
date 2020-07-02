///<reference types='nodom'/>
class UITable extends HTMLElement {
    constructor() {
        super();
        this.tagName = 'UI-SELECT';
        this.attachShadow({ mode: 'open' });
        this.root = this.shadowRoot;
    }
    init(el) {
        let gridDom = new nodom.Element('div');
        nodom.Compiler.handleAttributes(gridDom, el);
        nodom.Compiler.handleChildren(gridDom, el);
        gridDom.addClass('nd-grid');
    }
}
//# sourceMappingURL=table.js.map