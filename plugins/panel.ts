///<reference types='nodom'/>

import { Dirent } from "fs";

/**
 * panel 插件
 */
class UIPanel implements nodom.IDefineElement{
    tagName:string = 'UI-PANEL';
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement){
        
        let oe:nodom.Element = new nodom.Element();
        nodom.Compiler.handleAttributes(oe,el);
        nodom.Compiler.handleChildren(oe,el);
        

        let title:string = oe.props['title'];
        let showMin:boolean = false;
        let showMax:boolean = false;
        let showClose:boolean = false;
        let showHead:boolean = false;
        let showHeaderbar:boolean = false;
        
        if(oe.props['buttons']){
            let buttons = oe.props['buttons'].split(',');
            if(buttons.includes('min')){
                showMin = true;    
            }
            if(buttons.includes('max')){
                showMax = true;    
            }
            if(buttons.includes('close')){
                showClose = true;    
            }
        }
        
        showHeaderbar = showMax || showMin || showClose;
        showHead = title!==undefined && title !== '' || showHeaderbar;

        let data = {
            $uidata:{
                title:title,
                showHead:showHead,
                showMin:showMin,
                showMax:showMax,
                showClose:showClose,
                showHeaderbar:showHeaderbar
            }
        }
        delete oe.props['title'];
        delete oe.props['buttons'];

        // const str:string = `
        // <div class='nd-panel'>
        //     <div class='nd-panel-header'>
        //     <span class='nd-panel-title' x-if='$uidata.showHead'>{{$uidata.title}}</span>
        //     <div class='nd-panel-header-bar' x-if='$uidata.showHeaderbar'>
        //         <ui-button x-if='$uidata.showMin' small nobg icon='minus'></ui-button>
        //         <ui-button x-if='$uidata.showMax' small nobg icon='plus'></ui-button>
        //         <ui-button x-if='$uidata.showClose' small nobg icon='close'></ui-button>
        //     </div>
        //     </div>
        // </div>`;
        
        // let parentDom:nodom.Element = nodom.Compiler.compile(str);
        
        let parentDom:nodom.Element = new nodom.Element('div');
        
        //header
        let headerDom:nodom.Element = new nodom.Element('div');
        headerDom.addClass('nd-panel-header');

        //title
        let titleCt:nodom.Element = new nodom.Element('span');
        titleCt.addClass('nd-panel-title');
        titleCt.addDirective(new nodom.Directive('if','$uidata.showHead',titleCt));
        let titleDom:nodom.Element = new nodom.Element();
        titleDom.expressions = [new nodom.Expression('$uidata.title')];
        titleCt.add(titleDom);

        //title bar
        let headbarDom:nodom.Element = new nodom.Element('div');
        headbarDom.addClass('nd-panel-header-bar');
        headbarDom.addDirective(new nodom.Directive('if','$uidata.showHeaderbar',titleCt));
        //min max close按钮
        if(showMin){
            let btn:nodom.Element = new nodom.Element('BUTTON');
            btn.addClass('nd-btn nd-btn-notext nd-btn-nobg nd-icon-reduce');
            headbarDom.add(btn);
        }

        if(showMax){
            let btn:nodom.Element = new nodom.Element('BUTTON');
            btn.addClass('nd-btn nd-btn-notext nd-btn-nobg nd-icon-add');
            headbarDom.add(btn);
        }

        if(showClose){
            let btn:nodom.Element = new nodom.Element('BUTTON');
            btn.addClass('nd-btn nd-btn-notext nd-btn-nobg nd-icon-close');
            headbarDom.add(btn);
        }

        headerDom.add(titleCt);
        headerDom.add(headbarDom);

        //panel body
        let bodyDom:nodom.Element = new nodom.Element('div');
        bodyDom.addClass('nd-panel-body');
        //合并属性
        Object.getOwnPropertyNames(oe.props).forEach((p)=>{
            parentDom.props[p] = oe.props[p];
        });
        Object.getOwnPropertyNames(oe.exprProps).forEach((p)=>{
            parentDom.exprProps[p] = oe.exprProps[p];
        });

        parentDom.addClass('nd-panel');
        //toolbar，放在panel body前
        let tbar:nodom.Element;
        //button group，，放在panel body后
        let btnGrp:nodom.Element;
        
        for(let i=0;i<oe.children.length;i++){
            let item = oe.children[i];
            if(item.defineType === 'UI-TOOLBAR'){
                tbar = item;
            }else if(item.defineType === 'UI-BUTTONGROUP'){
                btnGrp = item;
            }else{ //普通节点，放入panelbody
                bodyDom.add(item);
            }
        }

        parentDom.add(headerDom);

        if(tbar){
            parentDom.add(tbar);
        }
        
        parentDom.add(bodyDom);

        if(btnGrp){
            parentDom.add(btnGrp);
        }
        
        parentDom.extraData = data;
        parentDom.defineType=this.tagName;        
        return parentDom;
    }
}

nodom.DefineElementManager.add(new UIPanel());