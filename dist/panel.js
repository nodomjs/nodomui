///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIPanel extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-PANEL';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['title', 'buttons|array'], ['title', 'buttons'], ['Panel', []]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    generate(rootDom) {
        let me = this;
        rootDom.addClass('nd-panel');
        //处理body
        this.handleBody(rootDom);
        //处理头部
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
        let headbarDom = new nodom.Element('div');
        headbarDom.addClass('nd-panel-header-bar');
        this.headerBtnDom = headbarDom;
        headerDom.add(headbarDom);
        rootDom.children.unshift(headerDom);
        //头部按钮
        for (let btn of this.buttons) {
            let a = btn.split('|');
            this.addHeadBtn(a[0], a[1]);
        }
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
     * 添加头部图标
     * @param icon      icon名
     * @param handler   处理函数
     */
    addHeadBtn(icon, handler) {
        let btn = new nodom.Element('b');
        btn.addClass('nd-icon-' + icon);
        btn.addClass('nd-canclick');
        this.headerBtnDom.add(btn);
        if (handler) {
            btn.addEvent(new nodom.NodomEvent('click', handler));
        }
    }
}
nodom.PluginManager.add('UI-PANEL', UIPanel);
//# sourceMappingURL=panel.js.map