///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIMenu {
    constructor() {
        this.tagName = 'UI-MENU';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let me = this;
        let menuDom = new nodom.Element();
        //增加暂存数据
        nodom.Compiler.handleAttributes(menuDom, el);
        menuDom.tagName = ('div');
        menuDom.addClass('nd-menu');
        //数据字段名
        this.dataName = menuDom.getProp('data');
        //显示字段名
        let showName = menuDom.getProp('showname');
        //激活字段名
        this.activeName = '$nui_menu_' + nodom.Util.genId();
        this.menuStyleName = '$nui_menu_' + nodom.Util.genId();
        //最大级数，默认3
        let maxLevels = menuDom.hasProp('maxlevels') ? parseInt(menuDom.getProp('maxlevels')) : 3;
        //宽度
        let menuWidth = menuDom.getProp('width') || '200px';
        //展开收拢事件
        let methodId = '$nodomGenMethod' + nodom.Util.genId();
        let closeOpenEvent = new nodom.NodomEvent('mouseover', (dom, model, module, e, el) => {
            if (model) {
                model.set(me.activeName, true);
                let compStyle;
                if (window.getComputedStyle) {
                    compStyle = window.getComputedStyle(el, null);
                }
                if (!compStyle) {
                    return null;
                }
                let w = el.offsetWidth;
                let left = el.offsetLeft;
                let top = el.offsetTop;
                console.log(w, left, top);
                model.set(me.menuStyleName, 'width:' + menuWidth + ';left:' + (w) + 'px;top:' + top + 'px');
            }
        });
        //item click 事件
        let itemClickEvent;
        if (menuDom.hasProp('itemclick')) {
            itemClickEvent = new nodom.NodomEvent('click', menuDom.getProp('itemclick') + ':delg');
        }
        let parentCt = new nodom.Element('div');
        parentCt.addClass('nd-menu-subct');
        if (menuDom.hasProp('showfirst')) {
            parentCt.addClass('nd-menu-first');
        }
        menuDom.add(parentCt);
        let item;
        for (let i = 0; i < maxLevels; i++) {
            parentCt.addDirective(new nodom.Directive('class', "{'nd-menu-show':'" + this.activeName + "'}", item));
            let itemCt = new nodom.Element('div');
            itemCt.directives.push(new nodom.Directive('repeat', this.dataName, itemCt));
            itemCt.addClass('nd-menu-nodect');
            item = new nodom.Element('div');
            item.addClass('nd-menu-node');
            //显示文本
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(showName)];
            item.add(txt);
            //绑定item click事件
            if (itemClickEvent) {
                item.addEvent(itemClickEvent);
            }
            itemCt.add(item);
            //子菜单箭头图标
            let icon1 = new nodom.Element('b');
            icon1.addDirective(new nodom.Directive('class', "{'nd-menu-subicon':'" + this.dataName + "&&" + this.dataName + ".length>0'}", icon1));
            item.add(icon1);
            //绑定展开收起事件
            item.addEvent(closeOpenEvent);
            parentCt.add(itemCt);
            let subCt = new nodom.Element('div');
            subCt.addClass('nd-menu-subct');
            subCt.addEvent(new nodom.NodomEvent('mouseleave', (dom, model, module, e) => {
                let parent = dom.getParent(module);
                let pmodel = module.modelFactory.get(parent.modelId);
                pmodel.set(me.activeName, false);
            }));
            subCt.tmpData = { width: menuWidth };
            subCt.exprProps['style'] = new nodom.Expression(this.menuStyleName);
            itemCt.add(subCt);
            parentCt = subCt;
        }
        menuDom.delProp(['data', 'icon', 'checkname', 'dataname', 'activename', 'itemclick', 'maxlevels']);
        menuDom.defineElement = this;
        return menuDom;
    }
    /**
     * 渲染前执行
     * @param module
     */
    beforeRender(module, uidom) {
        let me = this;
        // function gen
        // //注册click事件到全局事件管理器
        // UIEventRegister.addEvent('mousemove',module.name,subCt.key,
        //     (module:nodom.Module,dom:nodom.Element,inOrout:boolean,e:Event)=>{
        //         let model:nodom.Model = module.modelFactory.get(dom.modelId);
        //         //外部点击则关闭
        //         if(!inOrout && model.data[me.switchName]){
        //             pmodel.set(me.switchName,false);
        //         }
        //     }
        // );
    }
}
nodom.DefineElementManager.add('UI-MENU', UIMenu);
//# sourceMappingURL=menu.js.map