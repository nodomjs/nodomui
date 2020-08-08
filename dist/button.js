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
        let oe = new nodom.Element('button');
        nodom.Compiler.handleAttributes(oe, el);
        nodom.Compiler.handleChildren(oe, el);
        //图标
        let icon;
        if (oe.hasProp('icon')) {
            icon = oe.getProp('icon');
        }
        //图标大小
        let arr = ['small', 'normal', 'big'];
        let size;
        for (let l of arr) {
            if (oe.hasProp(l)) {
                size = l;
                oe.delProp(l);
                break;
            }
        }
        //默认normal
        if (!size) {
            size = 'normal';
        }
        //图位置
        let loc;
        arr = ['left', 'top', 'right', 'bottom'];
        for (let l of arr) {
            if (oe.hasProp(l)) {
                loc = l;
                oe.delProp(l);
                break;
            }
        }
        //默认normal
        if (!loc) {
            loc = 'left';
        }
        let bg;
        if (oe.hasProp('nobg')) {
            bg = 'nd-btn-nobg';
            oe.delProp('nobg');
        }
        else {
            //背景色
            arr = ['warn', 'active', 'emphasis'];
            for (let l of arr) {
                if (oe.hasProp(l)) {
                    bg = 'nd-' + l;
                    oe.delProp(l);
                    break;
                }
            }
            //默认灰色
            if (!bg) {
                bg = 'nd-bg-grey';
            }
        }
        //是否无文本
        let notext = icon && el.innerHTML.trim() === '' ? 'nd-btn-notext' : '';
        let cls = 'nd-btn ' + notext + ' nd-btn-' + size + ' ' + bg;
        //把btn类加入到class
        oe.addClass(cls);
        //图标element
        let img = new nodom.Element();
        img.tagName = 'B';
        img.addClass('nd-icon-' + icon + ' nd-icon-' + size);
        switch (loc) {
            case 'left':
                oe.children.unshift(img);
                break;
            case 'top':
                oe.children.unshift(img);
                img.addClass('nd-btn-vert');
                break;
            case 'right':
                oe.children.push(img);
                break;
            case 'bottom':
                oe.children.push(img);
                img.addClass('nd-btn-vert');
                break;
        }
        oe.plugin = this;
        return oe;
    }
}
nodom.PluginManager.add('UI-BUTTON', UIButton);
//# sourceMappingURL=button.js.map