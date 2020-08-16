///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIPanel extends nodom.Plugin {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-PANEL';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let rootDom = new nodom.Element();
        nodom.Compiler.handleAttributes(rootDom, el);
        nodom.Compiler.handleChildren(rootDom, el);
        rootDom.tagName = 'div';
        UITool.handleUIParam(rootDom, this, ['title', 'buttons|array'], ['title', 'buttons'], ['Panel', ['close']]);
        rootDom.addClass('nd-panel');
        let showMin = false;
        let showMax = false;
        let showClose = false;
        if (this.buttons) {
            if (this.buttons.includes('min')) {
                showMin = true;
            }
            if (this.buttons.includes('max')) {
                showMax = true;
            }
            if (this.buttons.includes('close')) {
                showClose = true;
            }
        }
        //处理body
        this.handleBody(rootDom);
        //处理头部
        this.handleHead(rootDom, showMin, showMax, showClose);
        rootDom.plugin = this;
        return rootDom;
    }
    /**
     * 处理头部
     * @param panelDom  panel dom
     * @param showMin   显示最小化按钮
     * @param showMax   显示最大化按钮
     * @param showClose 显示关闭按钮
     */
    handleHead(panelDom, showMin, showMax, showClose) {
        if (!showMin && !showMax && !showClose) {
            return;
        }
        //header
        let headerDom = new nodom.Element('div');
        headerDom.addClass('nd-panel-header');
        if (this.title) {
            //title
            let titleCt = new nodom.Element('span');
            titleCt.addClass('nd-panel-title');
            titleCt.assets.set('innerHTML', this.title);
            headerDom.add(titleCt);
        }
        //title bar
        if (showMin || showMax || showClose) {
            let headbarDom = new nodom.Element('div');
            headbarDom.addClass('nd-panel-header-bar');
            //min max close按钮
            if (showMin) {
                let btn = new nodom.Element('BUTTON');
                btn.addClass('nd-btn nd-icon-minus nd-btn-nobg nd-btn-notext');
                headbarDom.add(btn);
                this.setMinHandler(btn);
            }
            if (showMax) {
                let btn = new nodom.Element('BUTTON');
                btn.addClass('nd-btn nd-icon-add nd-btn-nobg nd-btn-notext');
                headbarDom.add(btn);
                this.setMaxHandler(btn);
            }
            if (showClose) {
                let btn = new nodom.Element('BUTTON');
                btn.addClass('nd-btn nd-icon-close nd-btn-nobg nd-btn-notext');
                headbarDom.add(btn);
                this.setCloseHandler(btn);
            }
            headerDom.add(headbarDom);
        }
        panelDom.children.unshift(headerDom);
    }
    /**
     * 处理body
     * @param panelDom  panel dom
     * @param oe        原始dom
     */
    handleBody(panelDom) {
        //panel body
        let bodyDom = new nodom.Element('div');
        bodyDom.addClass('nd-panel-body');
        //toolbar，放在panel body前
        let tbar;
        //button group，，放在panel body后
        let btnGrp;
        for (let i = 0; i < panelDom.children.length; i++) {
            let item = panelDom.children[i];
            if (item.plugin) {
                if (item.plugin.tagName === 'UI-TOOLBAR') {
                    tbar = item;
                }
                else if (item.plugin.tagName === 'UI-BUTTONGROUP') {
                    btnGrp = item;
                }
            }
            else { //普通节点，放入panelbody
                bodyDom.add(item);
            }
        }
        panelDom.children = [];
        if (tbar) {
            panelDom.add(tbar);
        }
        panelDom.add(bodyDom);
        if (btnGrp) {
            panelDom.add(btnGrp);
        }
    }
    /**
     * 设置最小化事件
     * @param foo
     */
    setMinHandler(btn) {
    }
    /**
     * 设置最大化事件
     * @param foo
     */
    setMaxHandler(btn) {
    }
    /**
     * 设置关闭事件
     * @param foo
     */
    setCloseHandler(btn) {
    }
}
nodom.PluginManager.add('UI-PANEL', UIPanel);
//# sourceMappingURL=panel.js.map