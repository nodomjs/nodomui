"use strict";
///<reference types='nodom'/>
// Object.defineProperty(exports, "__esModule", { value: true });
/**
 * panel 插件
 */
class UIPanel {
    constructor() {
        this.tagName = 'UI-PANEL';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let title;
        let showMin;
        let showMax;
        let showClose;
        let showHead;
        let showHeaderbar;
        if (el.hasAttribute('title')) {
            title = el.getAttribute('title');
            el.removeAttribute('title');
        }
        if (el.hasAttribute('min')) {
            showMin = true;
            el.removeAttribute('min');
        }
        if (el.hasAttribute('max')) {
            showMax = true;
            el.removeAttribute('max');
        }
        if (el.hasAttribute('close')) {
            showClose = true;
            el.removeAttribute('close');
        }
        showHeaderbar = showMax || showMin || showClose;
        showHead = title !== undefined && title !== '' || showHeaderbar;
        let data = {
            $uidata: {
                title: title,
                showHead: showHead,
                showMin: showMin,
                showMax: showMax,
                showClose: showClose,
                showHeaderbar: showHeaderbar
            }
        };
        const str = `
        <div class='nd-panel'>
            <div class='nd-panel-header'>
            <span class='nd-panel-title' x-if='$uidata.showHead'>{{$uidata.title}}</span>
            <div class='nd-panel-header-bar' x-if='$uidata.showHeaderbar'>
                <ui-button x-if='$uidata.showMin' small nobg icon='min'></ui-button>
                <ui-button x-if='$uidata.showMax' small nobg icon='max'></ui-button>
                <ui-button x-if='$uidata.showClose' small nobg icon='close'></ui-button>
            </div>
            </div>
        </div>`;
        let oe = nodom.Compiler.compile(str);
        let panel = oe.children[1];
        for (let i = 0; i < el.children.length; i++) {
            if (el.children[i].tagName === 'UI-TOOLBAR') {
                let tbar = nodom.Compiler.compile(el.children[i].outerHTML);
                console.log(tbar);
                panel.children.push(tbar.children[0]);
                nodom.Util.remove(el.children[i]);
            }
            else if (el.children[i].tagName === 'UI-BUTTONGROUP') {
            }
        }
        let body = nodom.Compiler.compile("<div class='nd-panel-body'>" + el.innerHTML + '</div>');
        for (let b of body.children) {
            panel.children.push(b);
        }
        oe.tagName = 'DIV';
        oe.extraData = data;
        return oe;
    }
}
// exports.default = UIPanel;
nodom.DefineElementManager.add(new UIPanel());
//# sourceMappingURL=panel.js.map