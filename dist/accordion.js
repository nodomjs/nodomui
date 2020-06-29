///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIAccordion extends nodom.DefineElement {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-ACCORDION';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let ct = new nodom.Element('div');
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
            if (item.hasProp('first')) {
                //添加repeat指令
                firstDom.addDirective(new nodom.Directive('repeat', item.getProp('data'), firstDom));
                item.addClass('nd-accordion-first');
                //增加事件
                let methodId = '$nodomGenMethod' + nodom.Util.genId();
                item.addEvent(new nodom.NodomEvent('click', methodId + ':delg'));
                this.method1 = methodId;
                activeName1 = item.getProp('activename') || 'active';
                //存激活field name
                this.active1 = activeName1;
                firstDom.add(item);
                //替换children
                let span = new nodom.Element('span');
                span.children = item.children;
                item.children = [span];
                //图标
                if (item.hasProp('icon')) {
                    span.addClass('nd-icon-' + item.getProp('icon'));
                }
                //保存第一级field
                this.field1 = item.getProp('data');
                //展开图标
                let icon = new nodom.Element('b');
                icon.addClass('nd-accordion-icon nd-icon-right');
                icon.directives.push(new nodom.Directive('class', "{'nd-accordion-open':'" + activeName1 + "'}", item));
                item.add(icon);
                item.delProp(['activename', 'first']);
            }
            else if (item.hasProp('second')) {
                activeName2 = item.getProp('activename') || 'active';
                //存激活field name
                this.active2 = activeName2;
                item.directives.push(new nodom.Directive('repeat', item.getProp('data'), item));
                //保存第二级field
                this.field2 = item.getProp('data');
                item.addClass('nd-accordion-second');
                let methodId = '$nodomGenMethod' + nodom.Util.genId();
                item.addEvent(new nodom.NodomEvent('click', methodId + ':delg'));
                item.directives.push(new nodom.Directive('class', "{'nd-accordion-selected':'" + activeName2 + "'}", item));
                this.method2 = methodId;
                secondDom.addClass('nd-accordion-secondct');
                secondDom.add(item);
                secondDom.directives.push(new nodom.Directive('class', "{'nd-accordion-hide':'!" + activeName1 + "'}", secondDom));
                if (item.hasProp('icon')) {
                    item.addClass('nd-icon-' + item.getProp('icon'));
                }
            }
            item.delProp(['data', 'icon', 'second']);
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
        let me = this;
        //添加第一层click事件
        module.methodFactory.add(this.method1, (dom, model, module, e) => {
            let pmodel = module.modelFactory.get(uidom.modelId);
            let data = pmodel.data[me.field1];
            //选中字段名
            let f = me.active1;
            //取消之前选中
            for (let d of data) {
                if (d[f] === true) {
                    d[f] = false;
                }
            }
            model.set(f, true);
        });
        //添加第二层click事件
        module.methodFactory.add(this.method2, (dom, model, module, e) => {
            let pmodel = module.modelFactory.get(uidom.modelId);
            let data = pmodel.data[me.field1];
            //选中字段名
            let f = me.active2;
            //取消之前选中
            for (let d of data) {
                for (let d1 of d[me.field2]) {
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