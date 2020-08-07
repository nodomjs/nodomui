///<reference types='nodom'/>
/**
 * list元素移动插件
 */
class UIListTransfer extends nodom.DefineElement{
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
    listName:string;

    /**
     * 列表值数据name
     */
    valueName:string;

    /**
     * 列表项显示字段名（显示在content输入框）
     */
    displayName:string;
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

    init(el:HTMLElement):nodom.Element{
        let me = this;
        this.extraDataName = '$ui_listtransfer_' + nodom.Util.genId();
        let rootDom:nodom.Element = new nodom.Element();
        
        //更改model
        rootDom.addDirective(new nodom.Directive('model',this.extraDataName,rootDom));
        nodom.Compiler.handleAttributes(rootDom,el);
        nodom.Compiler.handleChildren(rootDom,el);
        UITool.handleUIParam(rootDom,this,
            ['valuefield','displayfield','listfield'],
            ['valueName','displayName','listName']);
        rootDom.tagName = 'div';
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
            txt.expressions = [new nodom.Expression(this.displayName)];
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
            pmodel.set(this.extraDataName,{
                //数据
                datas:[]
            });

            let data = pmodel.query(this.extraDataName);
            this.extraModelId = data.$modelId;
            let value = pmodel.query(this.dataName);
            let datas = pmodel.query(this.listName);
            let model:nodom.Model = module.modelFactory.get(this.extraModelId);
            
            let rows = [];
            if(Array.isArray(datas)){
                let va = [];
                if(value){
                    va = value.split(',');
                }
                rows = nodom.Util.clone(datas);
                for(let d of rows){
                    d.selected = false;
                    d.isValue = false;
                    if(va && va.includes(d[this.valueName]+'')){
                        d.isValue = true;
                    }
                }
            }
            model.set('datas',rows);
        }
    }


    /**
     * 移动数据
     * @param module    模块
     * @param direction 移动方向 1右移 2左移
     * @param all       true 全部移动  false 移动选中的项
     */
    transfer(module:nodom.Module,direction:number,all:boolean){
        let model:nodom.Model = module.modelFactory.get(this.extraModelId);
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
    updateValue(module:nodom.Module){
        let pmodel:nodom.Model = module.modelFactory.get(this.modelId);
        let model:nodom.Model = module.modelFactory.get(this.extraModelId);
        let a = [];
        for(let d of model.data.datas){
            if(d.isValue){
                a.push(d[this.valueName]);
            }
        }
        pmodel.set(this.dataName,a.join(','));
    }
}

nodom.DefineElementManager.add('UI-LISTTRANSFER',UIListTransfer);