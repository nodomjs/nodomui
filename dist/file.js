///<reference types='nodom'/>
/**
 * checkbox
 */
class UIFile {
    constructor() {
        this.tagName = 'UI-FILE';
    }
    init(el) {
        let fileDom = new nodom.Element('span');
        nodom.Compiler.handleAttributes(fileDom, el);
        fileDom.tagName = 'div';
        UITool.handleUIParam(fileDom, this, ['field', 'valuefields|array', 'returnfields|array', 'multiple'], ['fieldName', 'valueFields', 'returnFields', 'multiple'], [null, null, null, '']);
        console.log(fileDom);
        fileDom.defineElement = this;
        return fileDom;
    }
}
nodom.DefineElementManager.add('UI-FILE', UIFile);
//# sourceMappingURL=file.js.map