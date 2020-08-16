///<reference types='nodom'/>
/**
 * panel 插件
 */
class UITab extends nodom.Plugin{
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
     * 模块id
     */
    moduleId:number;

    /**
     * 附加数据项modelId
     */
    extraModelId:number;

    /**
     * 绑定数据的数据项名
     */
    listName:string;
    /**
     * tab对象 [{title:tab1,name:tab1,active:true},...] 用于激活显示tab
     */
    tabs = [];

    /**
     * bodydom的key
     */
    bodyKey:string;

    /**
     * body 高度
     */
    bodyHeight:number;

    init(el:HTMLElement):nodom.Element{
        let me = this;
        //生成id
        this.extraDataName = '$ui_tab_' + nodom.Util.genId();
        
        let rootDom:nodom.Element = new nodom.Element();
        nodom.Compiler.handleAttributes(rootDom,el);
        nodom.Compiler.handleChildren(rootDom,el);
        this.name = rootDom.getProp('name');
        
        rootDom.tagName = 'div';
        
        UITool.handleUIParam(rootDom,this,
            ['position','allowclose|bool','listField','height|number'],
            ['position','allowClose','listName','bodyHeight'],
            ['top',null,'',0]);
        
        rootDom.addClass('nd-tab');    
        if(this.position === 'left' || this.position === 'right'){
            rootDom.addClass('nd-tab-horizontal');
        }
        
        let headDom:nodom.Element = new nodom.Element('div');
        headDom.addClass('nd-tab-head');

        let bodyDom:nodom.Element = new nodom.Element('div');
        this.bodyKey = bodyDom.key;
        bodyDom.addClass('nd-tab-body');

        if(this.bodyHeight > 0){
            bodyDom.assets.set('style','height:' + this.bodyHeight + 'px');
        }
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
            contentDom.addDirective(new nodom.Directive('show',this.extraDataName + '.' + tabName,contentDom));
            bodyDom.add(contentDom);

            if(itemDom){
                continue;
            }

            c.tagName = 'div';
            c.delProp(['title','active','name']);
            c.addClass('nd-tab-item');
            
            let txt:nodom.Element = new nodom.Element();
            txt.expressions = [new nodom.Expression('title')];
            c.children = [txt];
            //close
            if(this.allowClose){
                let b:nodom.Element = new nodom.Element('b');
                b.addClass('nd-tab-close');
                //click禁止冒泡
                b.addEvent(new nodom.NodomEvent('click',':nopopo',(dom,model,module)=>{
                    me.delTab(model.data.name,module);
                }));
                c.add(b);
            }
            c.addDirective(new nodom.Directive('repeat',this.extraDataName + '.datas',c));
            c.addDirective(new nodom.Directive('class',"{'nd-tab-item-active':'active'}",c));

            c.addEvent(new nodom.NodomEvent('click',(dom,model,module)=>{
                me.setActive(model.data.name,module);
            }));
            itemDom = c;
        }
        headDom.add(itemDom);
        // 设置默认active tab
        if(activeIndex === 0 && this.tabs.length>0){
            this.tabs[0].active = true;
        }
        if(this.position === 'top' || this.position === 'left'){
            rootDom.children = [headDom,bodyDom];
        }else{
            rootDom.children = [bodyDom,headDom];
        }
        
        rootDom.plugin = this;
        return rootDom;
    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        super.beforeRender(module,dom);
        //uidom model
        let pmodel:nodom.Model;
        //附加数据model
        if(this.needPreRender){
            this.moduleId = module.id;
            this.modelId = dom.modelId;
            pmodel = module.modelFactory.get(this.modelId);

            let data = {
                datas:this.tabs
            }
            //用于body显示
            for(let d of this.tabs){
                data[d.name] = d.active;
            }
            this.bodyKey = dom.children[1].key;
            this.extraModelId = pmodel.set(this.extraDataName,data).id;
        }
    }

    /**
     * 添加tab
     * @param cfg {}
     *          title:      tab 标题
     *          name:       tab 名(模块内唯一)
     *          content:    显示内容(和module二选一)
     *          module:     模块类名
     *          moduleName: 模块名
     *          data:       模块数据或url(module定义后可用) 
     *          active:     是否激活
     *          index:      tab在全局索引的位置，默认添加到最后
     */
    addTab(cfg:any){
        let module:nodom.Module = nodom.ModuleFactory.get(this.moduleId);
        if(!module){
            return;
        }

        let model:nodom.Model = module.modelFactory.get(this.extraModelId);
        
        //设置索引
        let index:number = nodom.Util.isNumber(cfg.index)?cfg.index:model.data.datas.length;
        //tab名
        let tabName:string = cfg.name || ('Tab'+nodom.Util.genId())
        model.data.datas.splice(index,0,{
            title:cfg.title,
            name:tabName,
            active:false
        });
        model.set(tabName,false);
        //需要添加到virtualDom中，否则再次clone会丢失
        let bodyDom:nodom.Element = module.virtualDom.query(this.bodyKey);
        let dom:nodom.Element;
        //内容串    
        if(cfg.content){
            dom = nodom.Compiler.compile(cfg.content,true);
        }else if(cfg.module){ //引用模块
            dom = new nodom.Element('div');
            let mdlStr:string = cfg.module;
            if(cfg.moduleName){
                mdlStr += '|' + cfg.moduleName;
            }
            dom.addDirective(new nodom.Directive('module',mdlStr,dom));
            if(cfg.data){
                dom.setProp('data',cfg.data);
            }
        }
        dom.addDirective(new nodom.Directive('show',this.extraDataName + '.' + tabName,dom));
        bodyDom.children.splice(index,0,dom);
        //设置激活
        if(cfg.active){
            this.setActive(tabName,module);
        }
    }

    /**
     * 删除tab
     * @param tabName   tab名
     * @param module    模块
     */
    delTab(tabName:string,module?:nodom.Module){
        if(!module){
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        let pmodel:nodom.Model = module.modelFactory.get(this.extraModelId);
        let datas  = pmodel.data.datas;
        let activeIndex:number;
        //最后一个不删除
        if(datas.length === 1){
            return;
        }
        for(let i=0;i<datas.length;i++){
            if(datas[i].name === tabName){
                //如果当前删除为active，设定active index
                //如果不为最后，则取下一个，否则取0 
                if(datas[i].active){
                    if(i<datas.length-1){
                        activeIndex = i;
                    }else{                  
                        activeIndex = 0;
                    }
                }
                //删除tab中的对象
                datas.splice(i,1);
                //删除show绑定数据
                
                pmodel.del(tabName);
                //删除body 中的对象，需要从原始虚拟dom中删除
                let bodyDom:nodom.Element = module.virtualDom.query(this.bodyKey);
                bodyDom.children.splice(i,1);
                break;
            }
        }  
        //设置active tab
        if(activeIndex !== undefined){
            this.setActive(datas[activeIndex].name,module);
        }
    }

    /**
     * 设置激活
     * @param tabName   tab名
     * @param module    模块
     */
    setActive(tabName:string,module?:nodom.Module){
        if(!module){
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        let pmodel:nodom.Model = module.modelFactory.get(this.extraModelId);
        let datas  = pmodel.data.datas;
        
        let activeData;
        //之前的激活置为不激活
        for(let o of datas){
            if(o.active){
                pmodel.data[o.name] = false;
                o.active = false;
            }
            if(o.name === tabName){
                activeData = o;
            }
        }
        //tab active
        activeData.active = true;
        //body active
        pmodel.data[tabName] = true;
    }
}

nodom.PluginManager.add('UI-TAB',UITab);