///<reference types='nodomjs'/>
/**
 * panel 插件
 */
class UIList extends nodom.Plugin{
    tagName:string = 'UI-LIST';

    /**
     * 绑定数据域名
     */
    dataName:string;
    /**
     * 附加数据项名
     */
    extraDataName:string;
    /**
     * 显示数据项名
     */
    displayField:string;
    
    /**
     * 值数据项名
     */
    valueField:string;

    /**
     * disable数据项名
     */
    disableName:string;
    /**
     * 列表数据名
     */
    listField:string;

    /**
     * 类型
     */
    type:string;

    /**
     * item宽度
     */
    itemWidth:number;

    /**
     * click 事件名
     */
    clickEvent:string;

    /**
     * 是否多选
     */
    multiSelect:boolean;

    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['valuefield','displayfield','disablefield','listfield','type','itemclick','itemwidth|number','multiselect|bool'],
                    ['valueField','displayField','disableName','listField','type','clickEvent','itemWidth','multiSelect'],
                    ['','','',null,'row','',0,null]);
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
        this.extraDataName = '$ui_list_' + nodom.Util.genId();
        
        //增加附加model
        rootDom.addDirective(new nodom.Directive('model',this.extraDataName,rootDom));
        if(this.type === 'row'){
            rootDom.addClass('nd-list');
        }else{
            rootDom.addClass('nd-list-horizontal');
        }

        let field = rootDom.getDirective('field');
        if(field){
            this.dataName = field.value;
        }
        
        // 列表节点
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
            if(this.displayField !== ''){
                let txt:nodom.Element = new nodom.Element();
                txt.expressions = [new nodom.Expression(this.displayField)];
                itemDom.add(txt);
            }
        }
        itemDom.addClass('nd-list-item');
        itemDom.addDirective(new nodom.Directive('repeat','datas',itemDom));
        //点击事件
        itemDom.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                if(me.disableName !== '' && model.query(me.disableName)){
                    return;
                }
                me.setValue(module,model);
            }
        ));
        //列表方式，需要设置不同元素
        if(this.type==='row'){
            //item文本显示内容
            let item:nodom.Element = new nodom.Element('div');
            item.children = itemDom.children;
            item.addClass('nd-list-itemcontent');
            
            let icon:nodom.Element = new nodom.Element('b');
            icon.addClass('nd-list-icon');
            itemDom.children = [item,icon];
        }
        
        if(this.disableName !== ''){
            itemDom.addDirective(new nodom.Directive('class',"{'nd-list-item-active':'selected','nd-list-item-disable':'"+this.disableName+ "'}",itemDom));
        }else{
            itemDom.addDirective(new nodom.Directive('class',"{'nd-list-item-active':'selected'}",itemDom));
        }
        
        //点击事件
        if(this.clickEvent){
            itemDom.addEvent(new nodom.NodomEvent('click',this.clickEvent));
        }
        rootDom.children = [itemDom];
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
        let model:nodom.Model;
        if(this.needPreRender){
            pmodel = module.modelFactory.get(this.modelId);
            pmodel.set(this.extraDataName,{
                datas:[]        //下拉框数据
            }).id;
        }

        
        if(!pmodel){
            pmodel = module.modelFactory.get(this.modelId);
        }
        
        if(!model){
            model = pmodel.get(this.extraDataName);
        }
        
        let data = model.data;
        //下拉值初始化
        if(this.listField && data.datas.length === 0 && pmodel.data[this.listField]){
            let valueArr:string[];
            if(this.dataName){
                let value = pmodel.query(this.dataName);
                if(value && value!==''){
                    valueArr = value.toString().split(',');
                }
            }
            
            let rows = pmodel.query(this.listField);
            //复制新数据
            if(rows && Array.isArray(rows)){
                rows = nodom.Util.clone(rows);
            
                //初始化选中状态
                if(this.valueField !== ''){
                    for(let d of rows){
                        if(valueArr && valueArr.includes(d[this.valueField]+'')){
                            d.selected = true;
                        }else{
                            d.selected = false;
                        }
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
        let model1:nodom.Model = pmodel.get(this.extraDataName);
        let rows  = model1.data['datas'];
        //显示数组
        //值数组
        let valArr:string[] = [];
        if(this.multiSelect){
            //反选
            if(model){
                model.set('selected',!model.data.selected);
            }
            
            if(this.valueField!=='' && this.dataName){
                for(let d of rows){
                    if(d.selected){
                        valArr.push(d[this.valueField]);
                    }
                }
                pmodel.set(this.dataName,valArr.join(','));
            }
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
                    if(this.valueField!=='' && this.dataName){
                        pmodel.set(this.dataName,d[this.valueField]);
                    }
                    break;
                }
            }
        }
    }
}

nodom.PluginManager.add('UI-LIST',UIList);