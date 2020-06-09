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
        let ct = new nodom.Element();
        //增加暂存数据
        ct.tmpData = {};
        ct.tagName = 'DIV';
        nodom.Compiler.handleAttributes(ct, el);
        nodom.Compiler.handleChildren(ct, el);
        ct.addClass('nd-accordion');
        let firstDom = new nodom.Element();
        let secondDom = new nodom.Element();
        firstDom.tagName = 'DIV';
        secondDom.tagName = 'DIV';
        firstDom.addClass('nd-accordion-item');
        let activeName;
        for (let i = 0; i < ct.children.length; i++) {
            let item = ct.children[i];
            if (!item.tagName) {
                continue;
            }
            if (item.props.hasOwnProperty('first')) {
                //添加repeat指令
                firstDom.directives.push(new nodom.Directive('repeat', item.props['data'], firstDom));
                item.addClass('nd-accordion-first');
                //增加事件
                let methodId = '$nodomGenMethod' + nodom.Util.genId();
                item.events['click'] = new nodom.NodomEvent('click', methodId);
                ct.tmpData['firstLevelMid'] = methodId;
                activeName = item.props['activename'] || 'active';
                firstDom.children.push(item);
                //图标
                if (item.props['icon']) {
                    let cls = item.props['icon'].trim();
                    //去掉多余空格
                    cls = cls.replace(/\s+/, ' ');
                    let arr = cls.split(' ');
                    let iconDown = 'nd-icon-' + arr[0];
                    let iconUp = 'nd-icon-' + arr[1];
                    let icon = new nodom.Element();
                    icon.tagName = 'B';
                    icon.directives.push(new nodom.Directive('class', "{'" + iconUp + "':'" + activeName + "','"
                        + iconDown + "':'!" + activeName + "'}", item));
                    item.children.push(icon);
                }
                //存激活field name
                item.tmpData = { activeName: activeName };
                delete item.props['data'];
                delete item.props['activename'];
                delete item.props['icon'];
                delete item.props['first'];
            }
            else if (item.props.hasOwnProperty('second')) {
                item.directives.push(new nodom.Directive('repeat', item.props['data'], item));
                item.addClass('nd-accordion-second');
                let methodId = '$nodomGenMethod' + nodom.Util.genId();
                item.events['click'] = new nodom.NodomEvent('click', methodId);
                ct.tmpData['secondLevelMid'] = methodId;
                secondDom.addClass('nd-accordion-secondct');
                secondDom.directives.push(new nodom.Directive('class', "{'nd-accordion-hide':'!" + activeName + "'}", secondDom));
                secondDom.children.push(item);
                delete item.props['data'];
                delete item.props['second'];
            }
        }
        //指令按优先级排序
        firstDom.directives.sort((a, b) => {
            return nodom.DirectiveManager.getType(a.type).prio - nodom.DirectiveManager.getType(b.type).prio;
        });
        secondDom.directives.sort((a, b) => {
            return nodom.DirectiveManager.getType(a.type).prio - nodom.DirectiveManager.getType(b.type).prio;
        });
        firstDom.children.push(secondDom);
        ct.children = [firstDom];
        ct.defineType = this.tagName;
        return ct;
    }
    /**
     * 渲染前执行
     * @param module
     */
    beforeRender(module, dom) {
        //添加第一层click事件
        module.methodFactory.add(dom.tmpData['firstLevelMid'], (e, module, view, dom) => {
            let model = module.modelFactory.get(dom.modelId);
            let an = dom.tmpData['activeName'];
            model.set(an, !model.data[an]);
        });
        //添加第二层click事件
        module.methodFactory.add(dom.tmpData['secondLevelMid'], (e, module, view, dom) => {
            let model = module.modelFactory.get(dom.modelId);
            // let an = dom.tmpData['activeName'];
            // model.set(an, !model.data[an]);
            console.log(dom);
        });
    }
}
nodom.DefineElementManager.add(new UIAccordion());
//# sourceMappingURL=accordion.js.map