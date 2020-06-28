///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIList implements nodom.IDefineElement{
    tagName:string = 'UI-LIST';
    /**
     * 显示数据name
     */
    displayName:string;
    
    /**
     * 列表数据名
     */
    listName:string;

    /**
     * 类型
     */
    listType:string;

    /**
     * click 事件名
     */
    clickEvent:string;

    init(el:HTMLElement):nodom.Element{
        let me = this;
        //生成id
        let gid:number = nodom.Util.genId();
        
        let listDom:nodom.Element = new nodom.Element();
        nodom.Compiler.handleAttributes(listDom,el);
        nodom.Compiler.handleChildren(listDom,el);
        listDom.tagName = 'div';
        
        UITool.handleUIParam(listDom,this,
            ['listfield','displayfield|array','listtype','itemclick'],
            ['listName','displayName','listType','clickEvent'],
            [null,'row']);

        if(this.listType === 'row'){
            listDom.addClass('nd-list');
        }else{
            listDom.addClass('nd-list-horizontal');
        }
        
        // 列表节点
        let itemDom:nodom.Element = new nodom.Element('div');
        itemDom.addClass('nd-list-item');
        itemDom.addDirective(new nodom.Directive('repeat',this.listName,itemDom));
        
        for(let i=0;i<this.displayName.length;i++){
            let f = this.displayName[i];
            
            let subCt:nodom.Element = new nodom.Element('div'); 
            let subItem:nodom.Element;
            let fa = f.split('|');
            
            if(fa.length>2){
                switch(fa[2]){
                    case 'icon':  //文字图标
                        subItem = new nodom.Element('b');
                        subItem.setProp('class',['nd-icon-',new nodom.Expression(fa[0])],true);
                        break;
                    case 'image': //图片
                        subItem = new nodom.Element('img');
                        subItem.setProp('src',new nodom.Expression(fa[0]),true);
                }
            }
             
            if(!subItem){
                subItem = new nodom.Element('span');
                let txt:nodom.Element = new nodom.Element();
                txt.expressions = [new nodom.Expression(fa[0])];
                subItem.add(txt);
            }

            subCt.addClass('nd-list-item-col');
            subCt.assets.set('style','flex:'+fa[1]);
            subCt.add(subItem);
            itemDom.add(subCt);
        }
        
        //点击事件
        if(this.clickEvent){
            itemDom.addEvent(new nodom.NodomEvent('click',this.clickEvent));
        }
        
        listDom.children = [itemDom];
        listDom.delProp('field');
        listDom.defineElement = this;
        return listDom;
    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        
        
    }
    
}

nodom.DefineElementManager.add('UI-LIST',UIList);