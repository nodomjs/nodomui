///<reference types='nodom'/>
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
        let showMin = false;
        let showMax = false;
        let showClose = false;
        let showHead = false;
        let showHeaderbar = false;
        if (el.hasAttribute('title')) {
            title = el.getAttribute('title');
            el.removeAttribute('title');
        }
        if (el.hasAttribute('buttons')) {
            let buttons = el.getAttribute('buttons').split(',');
            if (buttons.includes('min')) {
                showMin = true;
            }
            if (buttons.includes('max')) {
                showMax = true;
            }
            if (buttons.includes('close')) {
                showClose = true;
            }
            el.removeAttribute('buttons');
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
                <ui-button x-if='$uidata.showMin' small nobg icon='minus'></ui-button>
                <ui-button x-if='$uidata.showMax' small nobg icon='plus'></ui-button>
                <ui-button x-if='$uidata.showClose' small nobg icon='close'></ui-button>
            </div>
            </div>
        </div>`;
        let parentDom = nodom.Compiler.compile(str);
        let panel = parentDom.children[1];
        let oe = new nodom.Element();
        nodom.Compiler.handleAttributes(oe, el);
        nodom.Compiler.handleChildren(oe, el);
        //合并属性
        Object.getOwnPropertyNames(oe.props).forEach((p) => {
            panel.props[p] = oe.props[p];
        });
        panel.addClass('nd-panel');
        Object.getOwnPropertyNames(oe.exprProps).forEach((p) => {
            panel.exprProps[p] = oe.exprProps[p];
        });
        let tbar;
        //button group，，放在panel body后
        let btnGrp;
        //toolbar，放在panel body前
        for (let i = 0; i < oe.children.length && (!tbar || !btnGrp); i++) {
            let item = oe.children[i];
            if (item.defineType === 'UI-TOOLBAR') {
                tbar = item;
                oe.children.splice(i--, 1);
            }
            else if (item.defineType === 'UI-BUTTONGROUP') {
                btnGrp = item;
                oe.children.splice(i--, 1);
            }
        }
        panel.children.push(tbar);
        for (let b of oe.children) {
            if (b.tagName) {
                panel.children.push(b);
                b.addClass('nd-panel-body');
                break;
            }
        }
        panel.children.push(btnGrp);
        panel.tagName = 'DIV';
        panel.extraData = data;
        panel.defineType = 'UI-PANEL';
        return panel;
    }
}
nodom.DefineElementManager.add(new UIPanel());
//# sourceMappingURL=panel.js.map