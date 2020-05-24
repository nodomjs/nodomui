///<reference types='nodom'/>

/**
 * panel 插件
 */
export default class UIToolbar implements nodom.IDefineElement{
    tagName:string = 'NUI:TOOLBAR';
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement){
        let data = {
            $uidata:{
                title:el.getAttribute('title'),
                showHead:el.getAttribute('showHead'),
                showHeaderbar:el.getAttribute('showHeaderbar'),
                showMin:el.getAttribute('showMin'),
                showMax:el.getAttribute('showMax'),
                showClose:el.getAttribute('showClose')
            }
        }
        el.removeAttribute('title');
        el.removeAttribute('showHead');
        el.removeAttribute('showHeaderbar');
        el.removeAttribute('showMin');
        el.removeAttribute('showMax');
        el.removeAttribute('showClose');
        const str:string = `
        <div class='nd-toolbar'>
            ` 
            + el.innerHTML +
            `</div>
        </div>`
    
        let oe:nodom.Element = nodom.Compiler.compile(str);
        oe.tagName = 'DIV';
        oe.extraData = data;
        return oe;
    }
}

nodom.DefineElementManager.add(new UIPanel());