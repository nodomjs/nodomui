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
        //第一级active field name
        let activeName1;
        //第二级active field name
        let activeName2;
        for (let i = 0; i < ct.children.length; i++) {
            let item = ct.children[i];
            if (!item.tagName) {
                continue;
            }
            if (item.props.hasOwnProperty('first')) {
                //添加repeat指令
                firstDom.addDirective(new nodom.Directive('repeat', item.props['data'], firstDom));
                item.addClass('nd-accordion-first');
                //增加事件
                let methodId = '$nodomGenMethod' + nodom.Util.genId();
                item.addEvent(new nodom.NodomEvent('click', methodId + ':delg'));
                ct.tmpData['firstLevelMid'] = methodId;
                activeName1 = item.props['activename'] || 'active';
                //存激活field name
                ct.tmpData['activeName1'] = activeName1;
                firstDom.add(item);
                //替换children
                let span = new nodom.Element();
                span.tagName = 'span';
                span.children = item.children;
                item.children = [span];
                //图标
                if (item.props['icon']) {
                    span.addClass('nd-icon-' + item.props['icon']);
                }
                //保存第一级field
                ct.tmpData['field1'] = item.props['data'];
                //展开图标
                let icon = new nodom.Element();
                icon.tagName = 'B';
                icon.addClass('nd-accordion-icon nd-icon-right');
                icon.directives.push(new nodom.Directive('class', "{'nd-accordion-open':'" + activeName1 + "'}", item));
                item.add(icon);
                delete item.props['activename'];
                delete item.props['first'];
            }
            else if (item.props.hasOwnProperty('second')) {
                activeName2 = item.props['activename'] || 'active';
                //存激活field name
                ct.tmpData['activeName2'] = activeName2;
                item.directives.push(new nodom.Directive('repeat', item.props['data'], item));
                //保存第二级field
                ct.tmpData['field2'] = item.props['data'];
                item.addClass('nd-accordion-second');
                let methodId = '$nodomGenMethod' + nodom.Util.genId();
                item.addEvent(new nodom.NodomEvent('click', methodId + ':delg'));
                item.directives.push(new nodom.Directive('class', "{'nd-accordion-selected':'" + activeName2 + "'}", item));
                ct.tmpData['secondLevelMid'] = methodId;
                secondDom.addClass('nd-accordion-secondct');
                secondDom.tmpData = {};
                secondDom.add(item);
                secondDom.directives.push(new nodom.Directive('class', "{'nd-accordion-hide':'!" + activeName1 + "'}", secondDom));
                if (item.props['icon']) {
                    item.addClass('nd-icon-' + item.props['icon']);
                }
                delete item.props['second'];
            }
            delete item.props['data'];
            delete item.props['icon'];
        }
        //指令按优先级排序
        firstDom.directives.sort((a, b) => {
            return nodom.DirectiveManager.getType(a.type).prio - nodom.DirectiveManager.getType(b.type).prio;
        });
        secondDom.directives.sort((a, b) => {
            return nodom.DirectiveManager.getType(a.type).prio - nodom.DirectiveManager.getType(b.type).prio;
        });
        firstDom.add(secondDom);
        ct.children = [firstDom];
        ct.defineElement = this;
        return ct;
    }
    /**
     * 渲染前执行
     * @param module
     */
    beforeRender(module, uidom) {
        //添加第一层click事件
        module.methodFactory.add(uidom.tmpData['firstLevelMid'], (dom, model, module, e) => {
            let pmodel = module.modelFactory.get(uidom.modelId);
            let data = pmodel.data[uidom.tmpData['field1']];
            //选中字段名
            let f = uidom.tmpData['activeName1'];
            //取消之前选中
            for (let d of data) {
                if (d[f] === true) {
                    d[f] = false;
                }
            }
            model.set(f, true);
        });
        //添加第二层click事件
        module.methodFactory.add(uidom.tmpData['secondLevelMid'], (dom, model, module, e) => {
            let pmodel = module.modelFactory.get(uidom.modelId);
            let data = pmodel.data[uidom.tmpData['field1']];
            //选中字段名
            let f = uidom.tmpData['activeName2'];
            //取消之前选中
            for (let d of data) {
                for (let d1 of d[uidom.tmpData['field2']]) {
                    if (d1[f] === true) {
                        d1[f] = false;
                    }
                }
            }
            model.set(f, true);
        });
    }
}
nodom.DefineElementManager.add('UI-ACCORDION', UIAccordion);
//# sourceMappingURL=accordion.js.map