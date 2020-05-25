///<reference types='nodom'/>

/**
 * panel 插件
 */
export default class UIPanel implements nodom.IDefineElement{
    tagName:string = 'UI-PANEL';
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement){
        let title:string; 
        let showMin:boolean;
        let showMax:boolean;
        let showClose:boolean;
        let showHead:boolean;
        let showHeaderbar:boolean;
        
        if(el.hasAttribute('title')){
            title = el.getAttribute('title');
            el.removeAttribute('title');
        }

        if(el.hasAttribute('min')){
            showMin = true;
            el.removeAttribute('min');
        }
        
        if(el.hasAttribute('max')){
            showMax = true;
            el.removeAttribute('max');
        }

        if(el.hasAttribute('close')){
            showClose = true;
            el.removeAttribute('close');
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
        
        const str:string = `
        <div class='nd-panel'>
            <div class='nd-panel-header'>
            <span class='nd-panel-title' x-if='$uidata.showHead'>{{$uidata.title}}</span>
            <div class='nd-panel-header-bar' x-if='$uidata.showHeaderbar'>
                <ui-button x-if='$uidata.showMin' small nobg icon='min'></ui-button>
                <ui-button x-if='$uidata.showMax' small nobg icon='max'></ui-button>
                <ui-button x-if='$uidata.showClose' small nobg icon='close'></ui-button>
            </div>
            </div>
        </div>`;
        
        let oe:nodom.Element = nodom.Compiler.compile(str);
        let panel:nodom.Element = oe.children[1];
        for(let i=0;i<el.children.length;i++){
            if(el.children[i].tagName === 'UI-TOOLBAR'){
                let tbar = nodom.Compiler.compile(el.children[i].outerHTML);
                console.log(tbar);
                panel.children.push(tbar.children[0]);
                nodom.Util.remove(el.children[i]);
            }else if(el.children[i].tagName === 'UI-BUTTONGROUP'){

            }
        }
        let body:nodom.Element = nodom.Compiler.compile("<div class='nd-panel-body'>" + el.innerHTML + '</div>');
        for(let b of body.children){
            panel.children.push(b);
        }
        
        oe.tagName = 'DIV';
        oe.extraData = data;
        return oe;
    }
}

nodom.DefineElementManager.add(new UIPanel());