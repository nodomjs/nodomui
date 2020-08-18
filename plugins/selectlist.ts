///<reference types='nodom'/>
/**
 * panel 插件
 */
class UISelectList extends nodom.Plugin{
    tagName:string = 'UI-SELECTLIST';
    /**
     * 显示数据name(在model中新增)
     */
    displayField:string;
    /**
     * 显示开关数据name(在model中新增)
     */
    switchName:string;
    /**
     * select绑定的数据字段名
     */
    dataName:string;

    /**
     * 列表数据名
     */
    listField:string;

    /**
     * 列表值数据name
     */
    valueField:string;

    
    /**
     * 选中的数据name(在model中新增)
     */
    checkName:string;

    /**
     * 类型
     */
    listType:string;
    

    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['valuefield','displayfield|array','listfield','listtype'],
                    ['valueField','displayField','listField','listType'],
                    [null,null,null,null,'row']);
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

        let field = rootDom.getDirective('field');
        if(field){
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
        }

        //生成id
        let gid:number = nodom.Util.genId();
        this.checkName = '$nui_checked_' + gid;

        if(this.listType === 'row'){
            rootDom.addClass('nd-selectlist');
        }else{
            rootDom.addClass('nd-selectlist-horizontal');
        }
        
        // 列表节点
        let itemDom:nodom.Element = new nodom.Element('div');
        itemDom.addClass('nd-selectlist-item');
        itemDom.addDirective(new nodom.Directive('repeat',this.listField,itemDom));
        //复选框
        let icon:nodom.Element = new nodom.Element('b');
        icon.addClass('nd-uncheck');
        icon.addDirective(new nodom.Directive('class',"{'nd-checked':'" + this.checkName + "'}",icon));
        itemDom.add(icon);

        for(let i=0;i<this.displayField.length;i++){
            let f = this.displayField[i];
            //带类型
            let subItem:nodom.Element;
            let fa = f.split('|');
            if(fa.length>2){
                switch(fa[2]){
                    case 'icon':
                    subItem = new nodom.Element('b');
                    subItem.setProp('class',['nd-icon-',new nodom.Expression(fa[0])],true);
                    break;
                }
            }
             
            if(!subItem){
                subItem = new nodom.Element('span');
                let txt:nodom.Element = new nodom.Element();
                txt.expressions = [new nodom.Expression(fa[0])];
                subItem.add(txt);
            }
            subItem.addClass('nd-selectlist-item-col');
            subItem.assets.set('style','flex:'+fa[1]);
            itemDom.add(subItem);
        }
        
        //点击事件
        itemDom.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                me.switchValue(module,model);
            }
        ));
        
        rootDom.children = [itemDom];
    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        super.beforeRender(module,dom);
        let pmodel:nodom.Model = module.modelFactory.get(this.modelId);
        let value = pmodel.query(this.dataName);
        let valueArr:string[];
        
        if(this.needPreRender && this.listField){
            if(value && value!==''){
                valueArr = value.toString().split(',');
            }
            let rows = pmodel.query(this.listField);
            for(let d of rows){
                if(valueArr && valueArr.includes(d[this.valueField]+'')){
                    d[this.checkName] = true;
                }else{
                    d[this.checkName] = false;
                }
            }
        }
    }
    /**
     * 全部反选
     * @param module    module 
     */
    unseleceAll(module:nodom.Module){
        if(!this.modelId || !this.listField){
            return;
        }
        let pmodel:nodom.Model = module.modelFactory.get(this.modelId);
        let rows = pmodel.query(this.listField);
        for(let d of rows){
            d[this.checkName] = false;    
        }
    }

    /**
     * 添加数据
     * @param module    模块
     * @param model     数据model
     */
    switchValue(module:nodom.Module,model:nodom.Model){
        let checked:boolean = model.query(this.checkName);
        if(checked){
            this.removeValue(module,model);
            model.set(this.checkName,false);
        }else{
            this.addValue(module,model);
            model.set(this.checkName,true);
        }
    }
    /**
     * 添加数据
     * @param module    模块
     * @param model     数据model
     */
    addValue(module:nodom.Module,model:nodom.Model){
        let pmodel = module.modelFactory.get(this.modelId);
        //值串
        let value:string = pmodel.query(this.dataName);
        let v = model.query(this.valueField);
        //多选
        if(value){
            let a = value.toString().split(',');
            if(a.includes(v)){
                return;
            }
            a.push(v);
            pmodel.set(this.dataName,a.join(','));
        }else{
            pmodel.set(this.dataName,v);
        }
    }

    /**
     * 添加数据
     * @param module    模块
     * @param model     数据项
     */
    removeValue(module:nodom.Module,model:nodom.Model){
        let pmodel = module.modelFactory.get(this.modelId);
        //值串
        let value:string = pmodel.query(this.dataName);
        let v = model.query(this.valueField);
        model.set(this.checkName,false);
        if(!value || value === ''){
            return;
        }
        let a = value.toString().split(',');
        v = v.toString();
        if(!a.includes(v)){
            return;
        }
        let ind = a.indexOf(v);
        a.splice(ind,1);
        pmodel.set(this.dataName,a.join(','));
    }
}

nodom.PluginManager.add('UI-SELECTLIST',UISelectList);