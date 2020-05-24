"use strict";
///<reference types='nodom'/>
// Object.defineProperty(exports, "__esModule", { value: true });
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
        <div class='nd-panel'>
            <div class='nd-panel-header'>
            <span class='nd-panel-title' x-if='$uidata.showHead'>{{$uidata.title}}</span>
            <div class='nd-panel-header-bar' x-if='$uidata.showHeaderbar'>
                <button x-if='$uidata.showMin' class='nd-btn nd-icon-nofont-small nd-ico-min nd-btn-nobg'></button>
                <button x-if='$uidata.showMax' class='nd-btn nd-icon-nofont-small nd-ico-max nd-btn-nobg'></button>
                <button x-if='$uidata.showClose' class='nd-btn nd-icon-nofont-small nd-ico-close nd-btn-nobg'></button>
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
// exports.default = UIPanel;
nodom.DefineElementManager.add(new UIPanel());
//# sourceMappingURL=panel.js.map