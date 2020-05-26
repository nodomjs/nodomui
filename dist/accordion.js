///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIAccordion {
    constructor() {
        this.tagName = 'UI-ACCORDION';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        //收回后按钮图
        let iconDown = '';
        //展开后按钮图
        let iconUp = '';
        if (el.hasAttribute('iconDown')) {
            iconDown = "<span class='nd-accordion-icon nd-ico-" + el.getAttribute('iconDown') + "'></span>";
            el.removeAttribute('iconDown');
        }
        if (el.hasAttribute('iconUp')) {
            iconUp = 'nd-ico-' + el.getAttribute('iconUp');
            el.removeAttribute('iconUp');
        }
        console.log(iconDown);
        // let data = {
        //     $uidata:{
        //         title:title,
        //         showHead:showHead,
        //         showMin:showMin,
        //         showMax:showMax,
        //         showClose:showClose,
        //         showHeaderbar:showHeaderbar
        //     }
        // }
        const str = `
        <div class='nd-accordion'>
            <div x-repeat='rows'>
                <div class='nd-accordion-first' e-click='' >
                    <span>{{title}}</span>`
            + iconDown +
            `</div>
                <div>
                    <div x-repeat='rows'  class='nd-accordion-second'>{{name}}</div>
                </div>
            </div>
        </div>`;
        console.log(str);
        // //添加click事件
        // let method = '$nodomGenMethod' + Util.genId();
        // module.methodFactory.add(method,
        //    async (e, module, view,dom) => {
        //         let path:string = dom.props['path'];
        //         if (Util.isEmpty(path)) {
        //             return;
        //         }
        //         Router.addPath(path);
        //     }
        // );
        // dom.events['click'] = new NodomEvent('click', method);
        let parentDom = nodom.Compiler.compile(str);
        let panel = parentDom.children[1];
        console.log(panel);
        let oe = new nodom.Element();
        nodom.Compiler.handleAttributes(oe, el);
        //合并属性
        Object.getOwnPropertyNames(oe.props).forEach((p) => {
            panel.props[p] = oe.props[p];
        });
        panel.props['class'] = panel.props['class'] ? 'nd-panel ' + panel.props['class'] : 'nd-panel';
        Object.getOwnPropertyNames(oe.exprProps).forEach((p) => {
            panel.exprProps[p] = oe.exprProps[p];
        });
        panel.tagName = 'DIV';
        // panel.extraData = data;
        panel.defineType = 'accordion';
        return panel;
    }
}
nodom.DefineElementManager.add(new UIAccordion());
//# sourceMappingURL=accordion.js.map