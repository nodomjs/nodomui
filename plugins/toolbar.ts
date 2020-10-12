///<reference types='nodomjs'/>

/**
 * panel 插件
 */
class UIToolbar extends nodom.Plugin{
    tagName:string = 'UI-TOOLBAR';
    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
            }else if(typeof params === 'object'){
                for(let o in params){
                    this[o] = params[o];
                }
            }
        }
        rootDom.tagName = 'div';
        rootDom.addClass('nd-toolbar');
        rootDom.plugin = this;
        this.element = rootDom;
    }
}

nodom.PluginManager.add('UI-TOOLBAR',UIToolbar);