///<reference types='nodomjs'/>
/**
 * list元素移动插件
 */
class UIListTransfer extends nodom.Plugin{
    tagName:string = 'UI-LISTTRANSFER';
    
    /**
     * 附加数据项名
     */
    extraDataName:string;
    /**
     * 绑定的数据字段名
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
     * 列表项显示字段名（显示在content输入框）
     */
    displayField:string;
    /**
     * 选中的数据name(在model中新增)
     */
    checkName:string;
    /**
     * selected name，添加到右侧list(在model中新增)
     */
    selectedName:string;
    /**
     * select 对象的modelId
     */
    modelId:number;

    /**
     * 附加数据项modelId
     */
    extraModelId:number;

    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['valuefield','displayfield','listfield'],
                    ['valueField','displayField','listField']);
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
        this.extraDataName = '$ui_listtransfer_' + nodom.Util.genId();
        
        //更改model
        rootDom.addDirective(new nodom.Directive('model',this.extraDataName,rootDom));
        
        rootDom.addClass('nd-listtransfer');
        //从field指令获取dataName
        let field = rootDom.getDirective('field');
        if(field){
            this.dataName = field.value;
        }
        //左列表
        let listDom:nodom.Element = new nodom.Element('div');
        listDom.addClass('nd-list');
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
            let txt:nodom.Element = new nodom.Element();
            txt.expressions = [new nodom.Expression(this.displayField)];
            itemDom.add(txt);
        }
        itemDom.addClass('nd-list-item');
        
        itemDom.addDirective(new nodom.Directive('repeat','datas',itemDom,"select:value:{isValue:false}"));
        itemDom.addDirective(new nodom.Directive('class',"{'nd-list-item-active':'selected'}",itemDom));
        //点击事件
        itemDom.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                model.set('selected',!model.data.selected);
            }
        ));
        //item文本显示内容
        let item:nodom.Element = new nodom.Element('div');
        item.children = itemDom.children;
        item.addClass('nd-list-itemcontent');
        
        //选中图标
        let icon:nodom.Element = new nodom.Element('b');
        icon.addClass('nd-list-icon');
        itemDom.children = [item,icon];
        listDom.children = [itemDom];

        //右列表(克隆来)
        let listDom1:nodom.Element = listDom.clone(true);
        //更改数据
        listDom1.children[0].getDirective('repeat').filters = [new nodom.Filter("select:value:{isValue:true}")];
        
        //按钮>>
        //按钮容器
        let btnGrp:nodom.Element = new nodom.Element('div');
        btnGrp.addClass('nd-listtransfer-btngrp');
        //按钮>>
        let btn1:nodom.Element = new nodom.Element('b');
        btn1.addClass('nd-listtransfer-right2');
        //按钮>
        let btn2:nodom.Element = new nodom.Element('b');
        btn2.addClass('nd-listtransfer-right1');
        //按钮<
        let btn3:nodom.Element = new nodom.Element('b');
        btn3.addClass('nd-listtransfer-left1');
        //按钮<<
        let btn4:nodom.Element = new nodom.Element('b');    
        btn4.addClass('nd-listtransfer-left2');
        btnGrp.children = [btn1,btn2,btn3,btn4];
            
        btn1.addEvent(new nodom.NodomEvent('click',(dom,model,module,e)=>{
            me.transfer(module,1,true);
        }));
        btn2.addEvent(new nodom.NodomEvent('click',(dom,model,module,e)=>{
            me.transfer(module,1,false);
        }));
        btn3.addEvent(new nodom.NodomEvent('click',(dom,model,module,e)=>{
            me.transfer(module,2,false);
        }));
        btn4.addEvent(new nodom.NodomEvent('click',(dom,model,module,e)=>{
            me.transfer(module,2,true);
        }));

        rootDom.children = [listDom,btnGrp,listDom1];
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
        let pmodel:nodom.Model = module.getModel(this.modelId);
        if(this.needPreRender){
            let model:nodom.Model = pmodel.set(this.extraDataName,{
                //数据
                datas:[]
            });
            this.extraModelId = model.id;
            let datas = pmodel.query(this.listField);
            model.set('datas',nodom.Util.clone(datas));
        }
        this.setValueSelected(module);
    }

    /**
     * 设置选中
     * @param module 
     */
    private setValueSelected(module:nodom.Module){
        let pmodel:nodom.Model = module.getModel(this.modelId);
        let model:nodom.Model = module.getModel(this.extraModelId);
        let value = pmodel.query(this.dataName);
        let va = value.split(',');
        let rows = model.query('datas');
        for(let d of rows){
            if(va && va.includes(d[this.valueField]+'')){
                d.isValue = true;
            }else{
                d.isValue = false;
            }
        }
        model.set('datas',rows);
    }
    /**
     * 移动数据
     * @param module    模块
     * @param direction 移动方向 1右移 2左移
     * @param all       true 全部移动  false 移动选中的项
     */
    private transfer(module:nodom.Module,direction:number,all:boolean){
        let model:nodom.Model = module.getModel(this.extraModelId);
        let datas = model.data.datas;
        let isValue:boolean = direction===1?true:false;
        for(let d of datas){
            if(all){
                d.isValue = isValue;
            }else if(d.selected){
                d.isValue = isValue;
            }
            d.selected = false;
        }
        this.updateValue(module);
    }

    /**
     * 更新字段值
     * @param module    模块
     */
    private updateValue(module:nodom.Module){
        let pmodel:nodom.Model = module.getModel(this.modelId);
        let model:nodom.Model = module.getModel(this.extraModelId);
        let a = [];
        for(let d of model.data.datas){
            if(d.isValue){
                a.push(d[this.valueField]);
            }
        }
        pmodel.set(this.dataName,a.join(','));
    }
}

nodom.PluginManager.add('UI-LISTTRANSFER',UIListTransfer);