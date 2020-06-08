///<reference types='nodom'/>

/**
 * panel 插件
 */
class UIAccordion implements nodom.IDefineElement{
    tagName:string = 'UI-ACCORDION';
    /**
     * accordion 实例map
     */
    instanceMap:Map<string,object> = new Map();
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement){
        let ct:nodom.Element = new nodom.Element();
        ct.tagName = 'DIV';  
        nodom.Compiler.handleAttributes(ct,el);
        nodom.Compiler.handleChildren(ct,el);
        ct.props['class'] = ct.props['class']?'nd-accordion ' + ct.props['class']:'nd-accordion';

        let firstDom:nodom.Element = new nodom.Element();
        let secondDom:nodom.Element = new nodom.Element();   
        firstDom.tagName = 'DIV';
        secondDom.tagName = 'DIV';
        let activeName:string;
        for(let i=0;i<ct.children.length;i++){
            let item = ct.children[i];
            if(!item.tagName){
                continue;
            }
            
            if(item.props.hasOwnProperty('first')){
                //添加repeat指令
                firstDom.directives.push(new nodom.Directive('repeat',item.props['data'],firstDom));
                item.props['class'] = item.props['class']?'nd-accordion-first ' + item.props['class']:'nd-accordion-first';
                //增加事件
                let methodId = '$nodomGenMethod' + nodom.Util.genId();
                this.instanceMap.set(item.key, {
                    methodId:methodId,
                    dataKey:item.props['data'],
                    activeName:item.props['activename']
                });
                activeName = item.props['activename'] || 'active';
                item.events['click'] = new nodom.NodomEvent('click', methodId);
                firstDom.children.push(item);

                //图标
                if(item.props['icon']){
                    let cls = item.props['icon'].trim();
                    //去掉多余空格
                    cls = cls.replace(/\s+/,' ');
                    let arr:string = cls.split(' ');
                    let iconDown = 'nd-ico-' + arr[0];
                    let iconUp = 'nd-ico-' + arr[1];
                    item.directives.push(new nodom.Directive('class',"{'" + iconUp + "':'"+ activeName +"','"
                        + iconDown + "':'!"+ activeName +"'}",item));
                }
                delete item.props['data']; 
                delete item.props['activename']; 
                delete item.props['icon'];
                delete item.props['first'];
            }else if(item.props.hasOwnProperty('second')){
                item.directives.push(new nodom.Directive('repeat',item.props['data'],item));
                item.props['class'] = item.props['class']?'nd-accordion-second ' + item.props['class']:'nd-accordion-second';
                secondDom.props['class'] = 'nd-accordion-secondct';
                secondDom.directives.push(new nodom.Directive('class',"{'nd-accordion-hide':'!"+ activeName +"'}",secondDom));
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
        ct.defineType='UI-ACCORDION';      
        return ct;
    }
    /**
     * 渲染前执行
     * @param module 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        let firstDom:nodom.Element = dom.children[0].children[0];
        const instance = this.instanceMap.get(firstDom.key);
        //添加click事件
        module.methodFactory.add(instance['methodId'],
            (e, module, view,dom) => {
                let model = module.modelFactory.get(dom.modelId);
                model.set(instance['activeName'],!model.data[instance['activeName']]);
            }
        );
    }

    

}

nodom.DefineElementManager.add(new UIAccordion());