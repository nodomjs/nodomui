///<reference types='nodom'/>

/**
 * panel 插件
 */
class UIButtonGroup extends nodom.Plugin{
    tagName:string = 'UI-BUTTONGROUP';

    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
        
            }else if(typeof params === 'object'){
                for(let o in params){
                    if(o === 'children'){
                        //处理子按钮
                        if(Array.isArray(params[o])){
                            for(let c of params[o]){
                                if(typeof c !== 'object'){
                                    continue;
                                }
                                rootDom.add(new UIButton(c).element);
                            }
                        }
                    }else{
                        this[o] = params[o];
                    }
                }
            }
        }
        rootDom.addClass('nd-buttongroup');
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
}

nodom.PluginManager.add('UI-BUTTONGROUP',UIButtonGroup);