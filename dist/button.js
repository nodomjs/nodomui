///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIButton {
    constructor() {
        this.tagName = 'UI-BUTTON';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        //图标
        let icon;
        if (el.hasAttribute('icon')) {
            icon = 'nd-ico-' + el.getAttribute('icon');
            el.removeAttribute('icon');
        }
        //图标位置
        let arr = ['left', 'top', 'right', 'bottom'];
        let loc;
        for (let l of arr) {
            if (el.hasAttribute(l)) {
                loc = l;
                el.removeAttribute(l);
                break;
            }
        }
        //默认左
        if (icon && !loc) {
            loc = 'left';
        }
        //图标大小
        arr = ['small', 'normal', 'big'];
        let size;
        for (let l of arr) {
            if (el.hasAttribute(l)) {
                size = l;
                el.removeAttribute(l);
                break;
            }
        }
        //默认normal
        if (!size) {
            size = 'normal';
        }
        //无背景色
        let nobg;
        //背景色
        let bg;
        if (el.hasAttribute('nobg')) {
            nobg = 'nd-btn-nobg';
            el.removeAttribute('nobg');
            bg = '';
        }
        else {
            //背景色
            arr = ['warn', 'active', 'emphasis'];
            for (let l of arr) {
                if (el.hasAttribute(l)) {
                    bg = 'nd-bg-' + l;
                    el.removeAttribute(l);
                    break;
                }
            }
            //默认灰色
            if (!bg) {
                bg = 'nd-bg-grey';
            }
            nobg = '';
        }
        //是否无文本
        let notext = el.innerHTML.trim() === '';
        let cls = '';
        if (icon) {
            if (notext) {
                cls = 'nd-icon-notext-' + size;
            }
            else {
                cls = 'nd-icon-' + loc + '-' + size;
            }
        }
        else {
            cls = 'nd-btn-' + size;
            icon = '';
        }
        cls = 'nd-btn ' + cls + ' ' + icon + ' ' + nobg + ' ' + bg;
        let oe = new nodom.Element();
        oe.tagName = 'BUTTON';
        nodom.Compiler.handleAttributes(oe, el);
        nodom.Compiler.handleChildren(oe, el);
        //把btn类加入到class
        oe.props['class'] = oe.props['class'] ? oe.props['class'] + ' ' + cls : cls;
        oe.defineType = 'UI_BUTTON';
        return oe;
    }
}
nodom.DefineElementManager.add(new UIButton());
//# sourceMappingURL=button.js.map