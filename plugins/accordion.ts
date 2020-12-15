///<reference types='nodomjs'/>

/**
 * panel 插件
 */
class UIAccordion extends nodom.Plugin{
    tagName:string = 'UI-ACCORDION';
    /**
     * 第一级字段名
     */
    active1:string;
    /**
     * 第二级字段名
     */
    active2:string;
    /**
     * 第一级事件名
     */
    method1:string;

    /**
     * 第一级事件名
     */
    method2:string;

    //第一级数据字段名
    field1:string;

    //第二级数据字段名
    field2:string;
    
    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
            }else if(typeof params === 'object'){
                for(let o in params){
                    //处理孩子节点
                    if(o === 'children'){
                        if(Array.isArray(params[o])){
                            for(let c of params[o]){
                                if(typeof c !== 'object'){
                                    continue;
                                }
                                let d:nodom.Element = new nodom.Element(c.tagName||'div');
                                for(let p in c){
                                    if(p === 'tagName'){
                                        continue;
                                    }
                                    d.setProp(p,c[p]);
                                }
                                rootDom.add(d);
                            }
                        }
                    }else{
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
    private generate(rootDom:nodom.Element){
        rootDom.addClass('nd-accordion');
        let firstDom:nodom.Element = new nodom.Element();
        let secondDom:nodom.Element = new nodom.Element();   
        firstDom.tagName = 'DIV';
        secondDom.tagName = 'DIV';
        firstDom.addClass('nd-accordion-item');
        //第一级active field name
        let activeName1:string;
        //第二级active field name
        let activeName2:string;
        for(let i=0;i<rootDom.children.length;i++){
            let item = rootDom.children[i];
            if(!item.tagName){
                continue;
            }
            if(item.hasProp('first')){
                //添加repeat指令
                firstDom.addDirective(new nodom.Directive('repeat',item.getProp('data'),firstDom),true);
                item.addClass('nd-accordion-first');
                //增加事件
                let methodId = '$nodomGenMethod' + nodom.Util.genId();
                item.addEvent(new nodom.NodomEvent('click', methodId+':delg'));
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
                if(item.hasProp('icon')){
                    span.addClass('nd-icon-' + item.getProp('icon'));
                }
                //保存第一级field
                this.field1 = item.getProp('data');
                //展开图标
                let icon:nodom.Element = new nodom.Element('b');
                icon.addClass('nd-accordion-icon nd-icon-right');
                icon.directives.push(new nodom.Directive('class',"{'nd-accordion-open':'"+ activeName1 + "'}",icon));
                item.add(icon);
                item.delProp(['activename','first']); 
            }else if(item.hasProp('second')){
                activeName2 = item.getProp('activename') || 'active';
                //存激活field name
                this.active2 = activeName2;
                item.addDirective(new nodom.Directive('repeat',item.getProp('data'),item));
                //保存第二级field
                this.field2 = item.getProp('data');
                item.addClass('nd-accordion-second');
                if(item.hasProp('itemclick')){
                    item.addEvent(new nodom.NodomEvent('click', item.getProp('itemclick')+':delg'));
                }
                item.addDirective(new nodom.Directive('class',"{'nd-accordion-selected':'"+ activeName2 +"'}",item));
                secondDom.addClass('nd-accordion-secondct');
                secondDom.add(item);
                secondDom.addDirective(new nodom.Directive('class',"{'nd-accordion-hide':'!"+ activeName1 +"'}",secondDom),true);
            }
            item.delProp(['data','second']);
        }
        
        firstDom.add(secondDom);
        rootDom.children = [firstDom];
    }
    /**
     * 渲染前执行
     * @param module 
     * @param uidom
     */
    beforeRender(module:nodom.Module,uidom:nodom.Element){
        const me = this;
        super.beforeRender(module,uidom);
        //添加第一层click事件
        if(this.needPreRender){

            module.methodFactory.add(this.method1,
                (dom,model,module,e) => {
                    let pmodel:nodom.Model = module.modelFactory.get(uidom.modelId);
                    let data = pmodel.query(me.field1);
                    //选中字段名
                    let f:string = me.active1;
                    //取消之前选中
                    for(let d of data){
                        if(d[f] === true){
                            d[f] = false;
                        }
                    }
                    model.set(f,true);
                }
            );

            //添加第二层click事件
            module.methodFactory.add(this.method2,
                (dom,model,module,e) => {
                    let pmodel:nodom.Model = module.modelFactory.get(uidom.modelId);
                    let data = pmodel.data[me.field1];
                    //选中字段名
                    let f:string = me.active2;
                    //取消之前选中
                    for(let d of data){
                        for(let d1 of d[me.field2]){
                            if(d1[f] === true){
                                d1[f] = false;
                            }
                        }
                    }
                    model.set(f,true);
                }
            );
        }
    }
}

nodom.PluginManager.add('UI-ACCORDION',UIAccordion);