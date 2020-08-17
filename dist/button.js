///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIButton extends nodom.Plugin {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-BUTTON';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let rootDom = new nodom.Element('button');
        nodom.Compiler.handleAttributes(rootDom, el);
        nodom.Compiler.handleChildren(rootDom, el);
        //图标
        let icon;
        if (rootDom.hasProp('icon')) {
            icon = rootDom.getProp('icon');
        }
        let clsArr = ['nd-btn'];
        //图标大小
        let arr = ['small', 'normal', 'big'];
        let size;
        for (let l of arr) {
            if (rootDom.hasProp(l)) {
                size = l;
                rootDom.delProp(l);
                break;
            }
        }
        clsArr.push('nd-btn-' + (size || 'normal'));
        //图位置
        let loc;
        arr = ['left', 'top', 'right', 'bottom'];
        for (let l of arr) {
            if (rootDom.hasProp(l)) {
                loc = l;
                rootDom.delProp(l);
                break;
            }
        }
        clsArr.push('nd-btn-' + (size || 'left'));
        let bg;
        if (rootDom.hasProp('nobg')) {
            bg = 'nd-btn-nobg';
            rootDom.delProp('nobg');
        }
        else {
            //背景色
            arr = ['warn', 'active', 'success', 'error'];
            for (let l of arr) {
                if (rootDom.hasProp(l)) {
                    bg = 'nd-btn-' + l;
                    rootDom.delProp(l);
                    break;
                }
            }
        }
        if (bg) {
            clsArr.push(bg);
        }
        //是否无文本
        if (icon && el.innerHTML.trim() === '') {
            clsArr.push('nd-btn-notext');
        }
        //把btn类加入到class
        rootDom.addClass(clsArr.join(' '));
        //图标element
        let img = new nodom.Element();
        img.tagName = 'B';
        img.addClass('nd-icon-' + icon + ' nd-icon-' + size);
        switch (loc) {
            case 'left':
                rootDom.children.unshift(img);
                break;
            case 'top':
                rootDom.children.unshift(img);
                img.addClass('nd-btn-vert');
                break;
            case 'right':
                rootDom.children.push(img);
                break;
            case 'bottom':
                rootDom.children.push(img);
                img.addClass('nd-btn-vert');
                break;
        }
        rootDom.plugin = this;
        return rootDom;
    }
}
nodom.PluginManager.add('UI-BUTTON', UIButton);
//# sourceMappingURL=button.js.map