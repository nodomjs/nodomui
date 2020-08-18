///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIAccordion extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-ACCORDION';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    //处理孩子节点
                    if (o === 'children') {
                        if (Array.isArray(params[o])) {
                            for (let c of params[o]) {
                                if (typeof c !== 'object') {
                                    continue;
                                }
                                let d = new nodom.Element(c.tagName || 'div');
                                for (let p in c) {
                                    if (p === 'tagName') {
                                        continue;
                                    }
                                    d.setProp(p, c[p]);
                                }
                                rootDom.add(d);
                            }
                        }
                    }
                    else {
                        this[o] = params[o];
                    }
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
        rootDom.addClass('nd-accordion');
        let firstDom = new nodom.Element();
        let secondDom = new nodom.Element();
        firstDom.tagName = 'DIV';
        secondDom.tagName = 'DIV';
        firstDom.addClass('nd-accordion-item');
        //第一级active field name
        let activeName1;
        //第二级active field name
        let activeName2;
        for (let i = 0; i < rootDom.children.length; i++) {
            let item = rootDom.children[i];
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
                icon.directives.push(new nodom.Directive('class', "{'nd-accordion-open':'" + activeName1 + "'}", icon));
                item.add(icon);
                item.delProp(['activename', 'first']);
            }
            else if (item.hasProp('second')) {
                activeName2 = item.getProp('activename') || 'active';
                //存激活field name
                this.active2 = activeName2;
                item.addDirective(new nodom.Directive('repeat', item.getProp('data'), item));
                //保存第二级field
                this.field2 = item.getProp('data');
                item.addClass('nd-accordion-second');
                let methodId = '$nodomGenMethod' + nodom.Util.genId();
                item.addEvent(new nodom.NodomEvent('click', methodId + ':delg'));
                item.addDirective(new nodom.Directive('class', "{'nd-accordion-selected':'" + activeName2 + "'}", item));
                this.method2 = methodId;
                secondDom.addClass('nd-accordion-secondct');
                secondDom.add(item);
                secondDom.addDirective(new nodom.Directive('class', "{'nd-accordion-hide':'!" + activeName1 + "'}", secondDom));
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
        rootDom.children = [firstDom];
    }
    /**
     * 渲染前执行
     * @param module
     * @param uidom
     */
    beforeRender(module, uidom) {
        const me = this;
        super.beforeRender(module, uidom);
        //添加第一层click事件
        if (this.needPreRender) {
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
}
nodom.PluginManager.add('UI-ACCORDION', UIAccordion);
//# sourceMappingURL=accordion.js.map