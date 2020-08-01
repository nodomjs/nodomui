///<reference types='nodom'/>
/**
 * panel 插件
 */
class UITab extends nodom.DefineElement{
    tagName:string = 'UI-TAB';

    /**
     * 附加数据项名
     */
    extraDataName:string;
    
    /**
     * tab位置 top left right bottom
     */
    position:string;

    /**
     * 允许关闭
     */
    allowClose:boolean;
    /**
     * 对象的modelId
     */
    modelId:number;

    /**
     * 附加数据项modelId
     */
    extraModelId:number;

    /**
     * tab对象 [{title:tab1,name:tab1,active:true},...] 用于激活显示tab
     */
    tabs = [];

    init(el:HTMLElement):nodom.Element{
        let me = this;
        //生成id
        this.extraDataName = '$ui_tab_' + nodom.Util.genId();
        
        let rootDom:nodom.Element = new nodom.Element();
        nodom.Compiler.handleAttributes(rootDom,el);
        nodom.Compiler.handleChildren(rootDom,el);
        rootDom.tagName = 'div';
        rootDom.addClass('nd-tab');
        //增加附加model
        rootDom.addDirective(new nodom.Directive('model',this.extraDataName));

        UITool.handleUIParam(rootDom,this,
            ['position','allowclose|bool'],
            ['position','allowClose'],
            ['top',null]);

        let headDom:nodom.Element = new nodom.Element('div');
        headDom.addClass('nd-tab-head');

        let bodyDom:nodom.Element = new nodom.Element('div');
        bodyDom.addClass('nd-tab-body');

        // 如果有，则表示自定义
        let index = 1;
        let activeIndex:number = 0;
        let itemDom:nodom.Element;
        for(let c of rootDom.children){
            if(!c.tagName){
                continue;
            }
            //tab name
            let tabName:string = 'Tab' + index++;
            //获取或设置默认title
            let title:string = c.getProp('title') || tabName;
            //存储状态
            let active:boolean = c.getProp('active') || false;
            if(active){
                activeIndex = index;
            }

            this.tabs.push({title:title,name:tabName,active:active});

            //tab 内容
            let contentDom:nodom.Element = new nodom.Element('div');
            contentDom.children = c.children;
            //show 指令
            contentDom.addDirective(new nodom.Directive('show',tabName));
            bodyDom.add(contentDom);

            if(itemDom){
                continue;
            }

            c.tagName = 'div';
            c.delProp(['title','active']);
            c.addClass('nd-tab-item');
            
            let txt:nodom.Element = new nodom.Element();
            txt.expressions = [new nodom.Expression('title')];
            c.children = [txt];
            //close
            if(this.allowClose){
                let b:nodom.Element = new nodom.Element('b');
                b.addClass('nd-tab-close');
                b.addEvent(new nodom.NodomEvent('click',(dom,model,module)=>{
                    let pmodel = module.modelFactory.get(this.extraModelId);
                    let datas = pmodel.data.datas;

                    for(let i=0;i<datas.length;i++){
                        if(datas[i].name === model.data.name){
                            //删除tab中的对象
                            datas.splice(i,1);
                            //删除show绑定数据
                            delete pmodel.data[model.data.name];
                            //删除body 中的对象
                            bodyDom.children.splice(i,1);
                            //设置active
                            if(i<datas.length){

                            }
                            break;
                        }
                    }    
                }));
                c.add(b);
            }
            c.addDirective(new nodom.Directive('repeat','datas'));
            c.addDirective(new nodom.Directive('class',"{'nd-tab-item-active':'active'}"));

            c.addEvent(new nodom.NodomEvent('click',(dom,model,module)=>{
                let pmodel = module.modelFactory.get(this.extraModelId);
                let datas  = pmodel.data.datas;
                //之前的激活置为不激活
                for(let o of datas){
                    if(o.active){
                        pmodel.data[o.name] = false;
                        o.active = false;
                        break;
                    }
                }
                //tab active
                model.data.active = true;
                //body active
                pmodel.data[model.data.name] = true;
            }));

            itemDom = c;
     
        }
        headDom.add(itemDom);
        // 设置默认active tab
        if(activeIndex === 0 && this.tabs.length>0){
            this.tabs[0].active = true;
        }
        
        rootDom.children = [headDom,bodyDom];
        rootDom.defineElement = this;
        return rootDom;
    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        //uidom model
        let pmodel:nodom.Model;
        //附加数据model
        let model:nodom.Model;
        if(!this.modelId){
            this.modelId = dom.modelId;
            pmodel = module.modelFactory.get(this.modelId);

            let data = {
                datas:this.tabs
            }
            //用于body显示
            for(let d of this.tabs){
                data[d.name] = d.active;
            }
            pmodel.set(this.extraDataName,data);
            this.extraModelId = pmodel.query(this.extraDataName).$modelId;
        }
    }
}

nodom.DefineElementManager.add('UI-TAB',UITab);