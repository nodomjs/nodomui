"use strict";
///<reference types='nodom'/>
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * panel 插件
 */
class UIPanel {
    constructor() {
        this.tagName = 'NUI:PANEL';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let data = {
            $uidata: {
                icon: el.getAttribute('icon'),
                title: el.getAttribute('title'),
                padding: el.getAttribute('padding')
            }
        };
        el.removeAttribute('title');
        el.removeAttribute('showHead');
        el.removeAttribute('showHeaderbar');
        el.removeAttribute('showMin');
        el.removeAttribute('showMax');
        el.removeAttribute('showClose');
        const str = `
        <div class='nd-panel'>
            <div class='nd-panel-header'>
            <span class='nd-panel-title' x-if='$uidata.showHead'>{{$uidata.title}}</span>
            <div class='nd-panel-header-bar' x-if='$uidata.showHeaderbar'>
                <span x-if='$uidata.showMin' class='nd-panel-header-bar-min'></span>
                <span x-if='$uidata.showMax' class='nd-panel-header-bar-max'></span>
                <span x-if='$uidata.showClose' class='nd-panel-header-bar-close'></span>
            </div>
            </div>
            <div class='nd-panel-body'> `
            + el.innerHTML +
            `</div>
        </div>`;
        let oe = nodom.Compiler.compile(str);
        oe.tagName = 'DIV';
        oe.extraData = data;
        return oe;
    }
}
exports.default = UIPanel;
nodom.DefineElementManager.add(new UIPanel());
//# sourceMappingURL=button.js.map