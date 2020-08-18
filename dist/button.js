///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIButton extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-BUTTON';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['size', 'icon', 'iconpos', 'theme', 'nobg|bool'], ['size', 'icon', 'iconPos', 'theme', 'nobg'], ['normal', '', 'left', '', null]);
                this.text = params.innerHTML.trim();
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'button';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    generate(rootDom) {
        let clsArr = ['nd-btn'];
        //图标大小
        clsArr.push('nd-btn-' + this.size);
        //图标位置
        if (this.icon !== '') {
            clsArr.push('nd-btn-' + this.iconPos);
        }
        if (this.nobg) {
            clsArr.push('nd-btn-nobg');
        }
        else if (this.theme !== '') {
            clsArr.push('nd-btn-' + this.theme);
        }
        //是否无文本
        if (this.text === '') {
            clsArr.push('nd-btn-notext');
        }
        //把btn类加入到class
        rootDom.addClass(clsArr.join(' '));
        //只要文本
        let txt = new nodom.Element();
        txt.textContent = this.text;
        let children = [txt];
        //图标element
        if (this.icon !== '') {
            let img = new nodom.Element('b');
            img.addClass('nd-icon-' + this.icon);
            switch (this.iconPos) {
                case 'left':
                    children.unshift(img);
                    break;
                case 'top':
                    children.unshift(img);
                    img.addClass('nd-btn-vert');
                    break;
                case 'right':
                    children.push(img);
                    break;
                case 'bottom':
                    children.push(img);
                    img.addClass('nd-btn-vert');
                    break;
            }
        }
        rootDom.children = children;
    }
}
nodom.PluginManager.add('UI-BUTTON', UIButton);
//# sourceMappingURL=button.js.map