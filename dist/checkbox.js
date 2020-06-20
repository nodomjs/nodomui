///<reference types='nodom'/>
/**
 * checkbox
 */
class UICheckbox {
    constructor() {
        this.tagName = 'UI-CHECKBOX';
    }
    init(el) {
        let checkDom = new nodom.Element('span');
        nodom.Compiler.handleAttributes(checkDom, el);
        nodom.Compiler.handleChildren(checkDom, el);
        checkDom.addClass('nd-combo');
        let dataName = checkDom.getProp('field');
        let yesValue = checkDom.getProp('yes-value');
        let noValue = checkDom.getProp('no-value');
        checkDom.delProp(['field', 'yes-value', 'no-value']);
        let icon = new nodom.Element('b');
        icon.addClass('nd-icon-checkbox');
        icon.addDirective(new nodom.Directive('class', "{'nd-icon-checked':'" + dataName + "==\"" + yesValue + "\"'}", icon));
        checkDom.children.unshift(icon);
        //点击事件
        checkDom.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            let v = model.data[dataName];
            if (v == yesValue) {
                model.set(dataName, noValue);
            }
            else {
                model.set(dataName, yesValue);
            }
        }));
        checkDom.defineElement = this;
        return checkDom;
    }
}
nodom.DefineElementManager.add('UI-CHECKBOX', UICheckbox);
//# sourceMappingURL=checkbox.js.map