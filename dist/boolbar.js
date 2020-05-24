"use strict";
///<reference types='nodom'/>
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * panel 插件
 */
class UIToolbar {
    constructor() {
        this.tagName = 'NUI:TOOLBAR';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let data = {
            $uidata: {
                title: el.getAttribute('title'),
                showHead: el.getAttribute('showHead'),
                showHeaderbar: el.getAttribute('showHeaderbar'),
                showMin: el.getAttribute('showMin'),
                showMax: el.getAttribute('showMax'),
                showClose: el.getAttribute('showClose')
            }
        };
        el.removeAttribute('title');
        el.removeAttribute('showHead');
        el.removeAttribute('showHeaderbar');
        el.removeAttribute('showMin');
        el.removeAttribute('showMax');
        el.removeAttribute('showClose');
        const str = `
        <div class='nd-toolbar'>
            `
            + el.innerHTML +
            `</div>
        </div>`;
        let oe = nodom.Compiler.compile(str);
        oe.tagName = 'DIV';
        oe.extraData = data;
        return oe;
    }
}
exports.default = UIToolbar;
nodom.DefineElementManager.add(new UIPanel());
//# sourceMappingURL=boolbar.js.map