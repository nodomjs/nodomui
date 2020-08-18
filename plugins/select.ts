///<reference types='nodom'/>
/**
 * panel 插件
 * 
 */
class UISelect extends nodom.Plugin{
    tagName:string = 'UI-SELECT';
    /**
     * 附加数据项名
     */
    extraDataName:string;
    /**
     * select绑定的数据字段名
     */
    dataName:string;

    /**
     * 列表数据名
     */
    listName:string;

    /**
     * 下拉框宽度
     */
    listWidth:number;

    /**
     * 列表值数据name
     */
    valueName:string;

    /**
     * 显示内容
     */
    displayName:string;

    /**
     * 允许过滤
     */
    allowFilter:boolean;

    /**
     * select 对象的modelId
     */
    modelId:number;

    /**
     * select 附加数据项modelId
     */
    extraModelId:number;
    /**
     * 多选
     */
    multi:boolean;

    /**
     * 过滤器方法id
     */
    filterMethodId:string;
    
    init(el:HTMLElement):nodom.Element{
        let me = this;
        //生成id
        this.extraDataName = '$ui_select_' + nodom.Util.genId();
        
        let rootDom:nodom.Element = new nodom.Element();
        nodom.Compiler.handleAttributes(rootDom,el);
        nodom.Compiler.handleChildren(rootDom,el);

        UITool.handleUIParam(rootDom,this,
            ['valuefield','displayfield','multiselect|bool','listfield','listwidth|number','allowfilter|bool'],
            ['valueName','displayName','multi','listName','listWidth','allowFilter'],
            [null,null,null,null,0,null]
        );

        rootDom.tagName = 'div';
        rootDom.addClass('nd-select');

        let field = rootDom.getDirective('field');
        this.dataName = field.value;
        
        //修改model
        rootDom.addDirective(new nodom.Directive('model',this.extraDataName,rootDom));
            
        //下拉框
        let listDom:nodom.Element = new nodom.Element('div');
        listDom.addClass('nd-select-list');
        if(this.listWidth){
            listDom.assets.set('style','width:' + this.listWidth + 'px');
        }
        listDom.addDirective(new nodom.Directive('show','show',listDom));
        let itemDom:nodom.Element;
        // 如果有，则表示自定义
        for(let c of rootDom.children){
            if(!c.tagName){
                continue;
            }
            itemDom = c;
            break;
        }
        //非自定义，则新建默认对象
        if(!itemDom){
            itemDom = new nodom.Element('div');
            let txt:nodom.Element = new nodom.Element();
            txt.expressions = [new nodom.Expression(this.displayName)];
            itemDom.add(txt);
        }
        //item文本显示内容
        let item:nodom.Element = new nodom.Element('div');
        item.children = itemDom.children;
        item.addClass('nd-select-itemcontent');
        itemDom.addClass('nd-select-item');
        let directive:nodom.Directive = new nodom.Directive('repeat','datas',itemDom);
        itemDom.addDirective(directive);
        itemDom.addDirective(new nodom.Directive('class',"{'nd-select-selected':'selected'}",itemDom));

        let icon:nodom.Element = new nodom.Element('b');
        icon.addClass('nd-select-itemicon');
        itemDom.children = [item,icon];
        //点击事件
        itemDom.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                me.setValue(module,model);
            }
        ));

        //显示框
        let showDom:nodom.Element = new nodom.Element('div');
        showDom.addClass('nd-select-inputct');
        let input:nodom.Element = new nodom.Element('input');
        input.addClass('nd-select-show');
        
        //多选择，不允许输入
        if(this.multi){
            input.setProp('readonly',true);
        }
        input.setProp('value', new nodom.Expression('display'),true);
        showDom.add(input);
        icon = new nodom.Element('b');
        //点击展开或收拢
        showDom.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                if(model.data.show){
                    me.hideList(module,model);
                }else{
                    model.set('show',true);
                }
            }
        ));
        
        if(this.allowFilter){
            //给repeat增加filter
            this.filterMethodId = '$$nodom_method_' + nodom.Util.genId();
            let filter:nodom.Filter = new nodom.Filter(['select','func',this.filterMethodId]);
            directive.filters = [filter];

            input.assets.set('readonly','true');
            //input上覆盖一个query input
            let queryDom:nodom.Element = new nodom.Element('input');
            queryDom.addClass('nd-select-search');
            queryDom.addDirective(new nodom.Directive('field','query',queryDom));
            queryDom.addDirective(new nodom.Directive('class',"{'nd-select-search-active':'show'}",queryDom));
            showDom.add(queryDom);
        }
        showDom.add(icon);

        listDom.children = [itemDom];
        rootDom.children = [showDom,listDom];
        rootDom.plugin = this;
        return rootDom;
    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        let me = this;
        //uidom model
        let pmodel:nodom.Model;
        //附加数据model
        let model:nodom.Model;
        if(!this.modelId){
            this.modelId = dom.modelId;
            pmodel = module.modelFactory.get(this.modelId);
            let model:nodom.Model = pmodel.set(this.extraDataName,{
                show:false,     //下拉框显示
                display:'',     //显示内容
                query:'',       //查询串
                datas:[]        //下拉框数据
            });

            this.extraModelId = model.id;
        
            //增加过滤器方法
            module.methodFactory.add(this.filterMethodId,function(){
                let model:nodom.Model = this.modelFactory.get(me.extraModelId);
                let rows = model.query('datas');
                if(rows){
                    return rows.filter( (item)=> {
                        return model.data.query==='' || item[me.displayName].indexOf(model.data.query) !== -1;
                    });
                }
                return [];
            });
            //注册click事件到全局事件管理器
            UIEventRegister.addEvent('click',module.id,dom.key,
                (module:nodom.Module,dom:nodom.Element,inOrout:boolean,e:Event)=>{
                    let model:nodom.Model = module.modelFactory.get(me.extraModelId);
                    //外部点击则关闭
                    if(!inOrout && model.data.show){
                        me.hideList(module,model);
                    }
                }
            );

            model = module.modelFactory.get(this.extraModelId);
        }

        if(!pmodel){
            pmodel = module.modelFactory.get(this.modelId);
        }
        
        if(!model){
            model = module.modelFactory.get(this.extraModelId);
        }
        
        let data = model.data;
        //下拉值初始化
        if(this.listName && data.datas.length === 0 && pmodel.data[this.listName]){

            let value = pmodel.query(this.dataName);
            let valueArr:string[];
            if(value && value!==''){
                valueArr = value.toString().split(',');
            }
            let txtArr:string[] = [];
            let rows = pmodel.query(this.listName);
            //复制新数据
            if(rows && Array.isArray(rows)){
                rows = nodom.Util.clone(rows);
            
                //初始化选中状态
                for(let d of rows){
                    if(valueArr && valueArr.includes(d[this.valueName]+'')){
                        d.selected = true;
                        txtArr.push(d[this.displayName]);
                    }else{
                        d.selected = false;
                    }
                }
                
                //设置下拉数据
                model.set('datas',rows);
                this.setValue(module);
            }
        }
    }
    
    /**
     * 设置数据
     * @param module    模块
     * @param value     值
     */
    setValue(module:nodom.Module,model?:nodom.Model){
        //原model
        let pmodel = module.modelFactory.get(this.modelId);
        //附加数据model
        let model1:nodom.Model = module.modelFactory.get(this.extraModelId);
        let rows  = model1.data['datas'];
        //显示数组
        let txtArr:string[] = [];
        //值数组
        let valArr:string[] = [];
        if(this.multi){
            //反选
            if(model){
                model.set('selected',!model.data.selected);
            }
            
            for(let d of rows){
                if(d.selected){
                    valArr.push(d[this.valueName]);
                    txtArr.push(d[this.displayName]);
                }
            }
            pmodel.set(this.dataName,valArr.join(','));
            model1.set('display',txtArr.join(','));
        }else{
            //如果model不存在，则直接取选中值
            if(model){
                //取消选择
                for(let d of rows){
                    if(d.selected){
                        d.selected = false;
                        break;
                    }
                }
                //设置选择
                model.set('selected',!model.data.selected);
            }

            //设置选中
            for(let d of rows){
                if(d.selected){
                    pmodel.set(this.dataName,d[this.valueName]);
                    model1.set('display',d[this.displayName]);
                    this.hideList(module,model1);
                    break;
                }
            }
            
        }
    }

    /**
     * 隐藏下拉list
     * @param module module
     * @param model  附加model   
     */
    hideList(module:nodom.Module,model?:nodom.Model){
        if(!model){
            model = module.modelFactory.get(this.extraModelId);
        }
        model.set('show',false);
        model.set('query','');
    }
}

nodom.PluginManager.add('UI-SELECT',UISelect);