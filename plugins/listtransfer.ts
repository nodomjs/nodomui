///<reference types='nodom'/>
/**
 * list元素移动插件
 */
class UIListTransfer implements nodom.IDefineElement{
    tagName:string = 'UI-LISTTRANSFER';
    /**
     * 显示数据name(在model中新增)
     */
    displayName:string;
    
    /**
     * 绑定的数据字段名
     */
    fieldName:string;

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
    showName:string;
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
     * 多选
     */
    multi:boolean;

    /**
     * 显示字段集合
     */
    fields:string[];
    
    

    init(el:HTMLElement):nodom.Element{
        let me = this;
        //生成check id
        this.checkName = '$ui_listtransfer_' + nodom.Util.genId();
        this.selectedName = '$ui_listtransfer_' + nodom.Util.genId();

        let transferDom:nodom.Element = new nodom.Element();
        nodom.Compiler.handleAttributes(transferDom,el);
        transferDom.tagName = 'div';
        transferDom.addClass('nd-listtransfer');
        this.fieldName = transferDom.getProp('field');
        this.valueName = transferDom.getProp('idField');
        this.showName = transferDom.getProp('showfield');
        this.listName = transferDom.getProp('data');
        
        transferDom.delProp(['field','idfield','showfield']);
        
        //左列表
        let listDom:nodom.Element = new nodom.Element('div');
        listDom.addClass('nd-nd-listtransfer-box');
        // 列表节点
        let itemDom:nodom.Element = new nodom.Element('div');
        itemDom.addClass('nd-listtransfer-item');
        // itemDom.addDirective(new nodom.Directive('repeat',this.listName,itemDom,"select:value:{'"+ this.selectedName + "':false}"));
        itemDom.addDirective(new nodom.Directive('repeat',this.listName,itemDom));
        listDom.add(itemDom);
        
        //复选框
        let icon:nodom.Element = new nodom.Element('b');
        icon.addClass('nd-listtransfer-uncheck');
        icon.addDirective(new nodom.Directive('class',"{'nd-listtransfer-checked':'" + this.checkName + "'}",icon));
        itemDom.add(icon);
        let txt:nodom.Element = new nodom.Element();
        txt.expressions = [new nodom.Expression(this.showName)];
        itemDom.add(txt);
        
        //右列表
        let listDom1:nodom.Element = new nodom.Element('div');
        listDom1.addClass('nd-nd-listtransfer-box');
        // 列表节点
        let itemDom1:nodom.Element = new nodom.Element('div');
        itemDom1.addClass('nd-listtransfer-item');
        // itemDom1.addDirective(new nodom.Directive('repeat',this.listName,itemDom1,"select:value:{'"+ this.selectedName + "':true}"));
        itemDom1.addDirective(new nodom.Directive('repeat',this.listName,itemDom1));
        listDom1.add(itemDom1);

        //复选框
        let icon1:nodom.Element = new nodom.Element('b');
        icon1.addClass('nd-listtransfer-uncheck');
        icon1.addDirective(new nodom.Directive('class',"{'nd-listtransfer-checked':'" + this.checkName + "'}",icon1));
        itemDom1.add(icon1);

        let txt1:nodom.Element = new nodom.Element();
        txt1.expressions = [new nodom.Expression(this.showName)];
        itemDom1.add(txt1);

        //点击事件
        itemDom.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                model.set(this.checkName,!model.data[this.checkName]);
            }
        ));
        
        itemDom1.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                model.set(this.checkName,!model.data[this.checkName]);
            }
        ));

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

        transferDom.children = [listDom,btnGrp,listDom1];
        transferDom.defineElement = this;
        return transferDom;
    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        let model:nodom.Model = module.modelFactory.get(dom.modelId);
        let value = model.query(this.fieldName);
        let datas = model.query(this.listName);
        console.log(value,datas);
        if(value){
            for(let v of value){
                for(let d of datas){
                    if(d[this.fieldName] === v){
                        d[this.checkName] = true;
                    }
                }
            }
        }
    }
    
}

nodom.DefineElementManager.add('UI-LISTTRANSFER',UIListTransfer);