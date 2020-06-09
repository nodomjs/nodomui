///<reference types='nodom'/>

/**
 * panel 插件
 */
class UITree implements nodom.IDefineElement{
    tagName:string = 'UI-TREE';
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement){
        let ct:nodom.Element = new nodom.Element();
        //增加暂存数据
        ct.tmpData = {};
        ct.tagName = 'DIV';
        nodom.Compiler.handleAttributes(ct,el);
        nodom.Compiler.handleChildren(ct,el);
        ct.addClass('nd-tree');

        let firstDom:nodom.Element = new nodom.Element();
        let secondDom:nodom.Element = new nodom.Element();   
        firstDom.tagName = 'DIV';
        secondDom.tagName = 'DIV';
        firstDom.addClass('nd-accordion-item');
        //第一级active field name
        let activeName1:string;
        //第二级active field name
        let activeName2:string;
        for(let i=0;i<ct.children.length;i++){
            let item = ct.children[i];
            if(!item.tagName){
                continue;
            }
            
            if(item.props.hasOwnProperty('first')){
                //添加repeat指令
                firstDom.directives.push(new nodom.Directive('repeat',item.props['data'],firstDom));
                item.addClass('nd-accordion-first');
                //增加事件
                let methodId = '$nodomGenMethod' + nodom.Util.genId();
                item.events['click'] = new nodom.NodomEvent('click', methodId);
                ct.tmpData['firstLevelMid'] = methodId;
                
                activeName1 = item.props['activename'] || 'active';
                //存激活field name
                ct.tmpData['activeName1'] = activeName1;

                firstDom.add(item);
                //保存第二级field
                ct.tmpData['field1'] = item.props['data'];
                //图标
                if(item.props['icon']){
                    let cls = item.props['icon'].trim();
                    //去掉多余空格
                    cls = cls.replace(/\s+/,' ');
                    let arr:string = cls.split(' ');
                    let iconDown = 'nd-icon-' + arr[0];
                    let iconUp = 'nd-icon-' + arr[1];
                    let icon:nodom.Element = new nodom.Element();
                    icon.tagName = 'B';
                    icon.directives.push(new nodom.Directive('class',"{'" + iconUp + "':'"+ activeName1 +"','"
                        + iconDown + "':'!"+ activeName1 +"'}",item));
                    item.children.push(icon);
                }
                
                delete item.props['data']; 
                delete item.props['activename']; 
                delete item.props['icon'];
                delete item.props['first'];
            }else if(item.props.hasOwnProperty('second')){
                activeName2 = item.props['activename'] || 'active';
                //存激活field name
                ct.tmpData['activeName2'] = activeName2;
                item.directives.push(new nodom.Directive('repeat',item.props['data'],item));
                //保存第二级field
                ct.tmpData['field2'] = item.props['data'];
                item.addClass('nd-accordion-second');
                let methodId = '$nodomGenMethod' + nodom.Util.genId();
                item.events['click'] = new nodom.NodomEvent('click', methodId);
                item.directives.push(new nodom.Directive('class',"{'nd-accordion-selected':'"+ activeName2 +"'}",item));
                ct.tmpData['secondLevelMid'] = methodId;
                secondDom.addClass('nd-accordion-secondct');
                secondDom.tmpData = {};
                secondDom.add(item);
                secondDom.directives.push(new nodom.Directive('class',"{'nd-accordion-hide':'!"+ activeName1 +"'}",secondDom));
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

        firstDom.add(secondDom);

        ct.children = [firstDom];
        ct.defineType=this.tagName;      
        return ct;
    }
    /**
     * 渲染前执行
     * @param module 
     */
    beforeRender(module:nodom.Module,uidom:nodom.Element){
        //添加第一层click事件
        module.methodFactory.add(uidom.tmpData['firstLevelMid'],
            (e, module, view,dom) => {
                let model:nodom.Model = module.modelFactory.get(uidom.modelId);
                let data = model.data[uidom.tmpData['field1']];
                //选中字段名
                let f:string = uidom.tmpData['activeName1'];
                //取消之前选中
                for(let d of data){
                    if(d[f] === true){
                        d[f] = false;
                    }
                }
                model = module.modelFactory.get(dom.modelId);
                model.set(f,true);
            }
        );

        //添加第二层click事件
        module.methodFactory.add(uidom.tmpData['secondLevelMid'],
            (e, module, view,dom) => {
                let model:nodom.Model = module.modelFactory.get(uidom.modelId);
                let data = model.data[uidom.tmpData['field1']];
                //选中字段名
                let f:string = uidom.tmpData['activeName2'];
                //取消之前选中
                for(let d of data){
                    for(let d1 of d[uidom.tmpData['field2']]){
                        if(d1[f] === true){
                            d1[f] = false;
                        }
                    }
                }

                model = module.modelFactory.get(dom.modelId);
                model.set(f,true);
                
                /*const an = '$active';
                let p:nodom.Element = dom.getParent(module);
                let model:nodom.Model;
                //清除之前的active
                if(p.tmpData['current']){
                    if(p.tmpData['current'] === dom.key){
                        return;
                    }
                    let old:nodom.Element = p.query(p.tmpData['current']);
                    console.log(old,dom);
                    if(old){
                        model = module.modelFactory.get(old.modelId);
                        if(model){
                            model.set(an,false);
                        }    
                    }
                    //设置active dom key
                    p.tmpData['current'] = dom.key;
                }
                model = module.modelFactory.get(dom.modelId);
                model.set(an,true); */
            }
        );
    }
}

nodom.DefineElementManager.add(new UIAccordion());