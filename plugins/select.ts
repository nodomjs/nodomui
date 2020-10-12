///<reference types='nodomjs'/>
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
    listField:string;

    /**
     * 下拉框宽度
     */
    listWidth:number;

    /**
     * 列表值数据name
     */
    valueField:string;

    /**
     * 显示内容
     */
    displayField:string;

    /**
     * 允许过滤
     */
    allowFilter:boolean;

    /**
     * select 附加数据项modelId
     */
    extraModelId:number;
    /**
     * 多选
     */
    multiSelect:boolean;

    /**
     * 下拉框key
     */
    listKey:string;
    /**
     * 过滤器方法id
     */
    filterMethodId:string;

    /**
     * 值
     */
    value:string;

    /**
     * change 事件或事件名
     */
    onChange:string|Function;

    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['valuefield','displayfield','multiselect|bool','listfield','listwidth|number','allowfilter|bool','onchange'],
                    ['valueField','displayField','multiSelect','listField','listWidth','allowFilter','onChange'],
                    [null,null,null,null,0,null,'']
                );
            }else if(typeof params === 'object'){
                for(let o in params){
                    this[o] = params[o];
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
        let me = this;
        //生成id
        this.extraDataName = '$ui_select_' + nodom.Util.genId();
        rootDom.addClass('nd-select');

        let field = rootDom.getDirective('field');
        if(field){
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
            //移除事件
            rootDom.events.delete('change');
        }
        
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
            txt.expressions = [new nodom.Expression(this.displayField)];
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
        if(this.multiSelect){
            input.setProp('readonly',true);
        }
        input.setProp('value', new nodom.Expression('display'),true);
        showDom.add(input);
        icon = new nodom.Element('b');
        //点击展开或收拢
        showDom.addEvent(new nodom.NodomEvent('click',
            (dom,model,module,e,el)=>{
                if(model.data.show){
                    me.hideList(module,model);
                }else{
                    model.set('show',true);
                    let height = el.offsetHeight;
                    let y = e.clientY + el.offsetHeight - e.offsetY;
                    UITool.adjustPosAndSize(module,this.listKey,e.clientX,y,height,null,true);
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
    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        let me = this;
        super.beforeRender(module,dom);
        this.listKey = dom.children[1].key;
        //uidom model
        let pmodel:nodom.Model;
        //附加数据model
        let model:nodom.Model;
        if(this.needPreRender){
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
                        return model.data.query==='' || item[me.displayField].indexOf(model.data.query) !== -1;
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
        if(this.listField && data.datas.length === 0 && pmodel.data[this.listField] ){
            let valueArr:string[];
            
            if(this.dataName){
                let value = pmodel.query(this.dataName);
                if(value && value!==''){
                    valueArr = value.toString().split(',');
                }
            }
            let txtArr:string[] = [];
            let rows = pmodel.query(this.listField);
            //复制新数据
            if(rows && Array.isArray(rows)){
                rows = nodom.Util.clone(rows);
            
                //初始化选中状态
                for(let d of rows){
                    if(valueArr && valueArr.includes(d[this.valueField]+'')){
                        d.selected = true;
                        txtArr.push(d[this.displayField]);
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

        let value:string;
        if(this.multiSelect){
            //反选
            if(model){
                model.set('selected',!model.data.selected);
            }
            
            for(let d of rows){
                if(d.selected){
                    valArr.push(d[this.valueField]);
                    txtArr.push(d[this.displayField]);
                }
            }
            if(this.dataName){
                value = valArr.join(',');
                
            }
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
                    if(this.dataName){
                        value = d[this.valueField];
                    }
                    model1.set('display',d[this.displayField]);
                    this.hideList(module,model1);
                    break;
                }
            }
        }
        if(value !== this.value){
            pmodel.set(this.dataName,value);
            if(this.onChange !== ''){
                let foo;
                if(typeof this.onChange === 'string'){
                    foo = module.methodFactory.get(this.onChange);
                }else{
                    foo = this.onChange;
                }
                if(nodom.Util.isFunction(foo)){
                    foo.apply(null,[model,module,value,this.value]);
                }
            }
            this.value = value;
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