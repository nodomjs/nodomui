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
        let oe = new nodom.Element();
        nodom.Compiler.handleAttributes(oe, el);
        nodom.Compiler.handleChildren(oe, el);
        let title = oe.props['title'];
        //设置默认title
        title = title ? title.trim() : '';
        title = title !== '' ? title : 'Panel';
        let showMin = false;
        let showMax = false;
        let showClose = false;
        if (oe.props['buttons']) {
            let buttons = oe.props['buttons'].split(',');
            if (buttons.includes('min')) {
                showMin = true;
            }
            if (buttons.includes('max')) {
                showMax = true;
            }
            if (buttons.includes('close')) {
                showClose = true;
            }
        }
        delete oe.props['title'];
        delete oe.props['buttons'];
        //panel dom
        let panelDom = new nodom.Element('div');
        //拷贝属性
        Object.getOwnPropertyNames(oe.props).forEach((p) => {
            panelDom.props[p] = oe.props[p];
        });
        Object.getOwnPropertyNames(oe.exprProps).forEach((p) => {
            panelDom.exprProps[p] = oe.exprProps[p];
        });
        panelDom.addClass('nd-panel');
        //处理头部
        this.handleHead(panelDom, title, showMin, showMax, showClose);
        //处理body
        this.handleBody(panelDom, oe);
        panelDom.defineElement = this;
        return panelDom;
    }
    /**
     * 处理头部
     * @param panelDom  panel dom
     * @param title     标题
     * @param showMin   显示最小化按钮
     * @param showMax   显示最大化按钮
     * @param showClose 显示关闭按钮
     */
    handleHead(panelDom, title, showMin, showMax, showClose) {
        if ((!title || title === '') && !showMin && !showMax && !showClose) {
            return;
        }
        //header
        let headerDom = new nodom.Element('div');
        headerDom.addClass('nd-panel-header');
        if (title && title !== '') {
            //title
            let titleCt = new nodom.Element('span');
            titleCt.addClass('nd-panel-title');
            titleCt.assets.set('innerHTML', title);
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
        panelDom.add(headerDom);
    }
    /**
     * 处理body
     * @param panelDom  panel dom
     * @param oe        原始dom
     */
    handleBody(panelDom, oe) {
        //panel body
        let bodyDom = new nodom.Element('div');
        bodyDom.addClass('nd-panel-body');
        //toolbar，放在panel body前
        let tbar;
        //button group，，放在panel body后
        let btnGrp;
        for (let i = 0; i < oe.children.length; i++) {
            let item = oe.children[i];
            if (item.defineElement) {
                if (item.defineElement.tagName === 'UI-TOOLBAR') {
                    tbar = item;
                }
                else if (item.defineElement.tagName === 'UI-BUTTONGROUP') {
                    btnGrp = item;
                }
            }
            else { //普通节点，放入panelbody
                bodyDom.add(item);
            }
        }
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
nodom.DefineElementManager.add('UI-PANEL', UIPanel);
//# sourceMappingURL=panel.js.map