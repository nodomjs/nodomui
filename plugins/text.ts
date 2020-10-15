///<reference types='nodomjs'/>
/**
 * panel 插件
 * 
 */
class UIText extends nodom.Plugin{
    tagName:string = 'UI-TEXT';
    
    /**
     * select绑定的数据字段名
     */
    dataName:string;
    
    /**
     * 图标
     */
    icon:string;
    /**
     * 图标位置 left,right
     */
    iconPos:string;

    
    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['icon','iconpos'],
                    ['icon','iconPos'],
                    ['','left']
                );
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

        rootDom.addClass('nd-text');

        //生成id
        let field = rootDom.getDirective('field');
        
        let input:nodom.Element = new nodom.Element('input');
        input.setProp('type','text');

        //替换directive到input
        input.addDirective(new nodom.Directive('field',field.value,input));
        
        rootDom.add(input);
        //事件转移到input
        input.events = rootDom.events;

        let vProp = rootDom.getProp('value');
        if(!vProp){
            vProp = rootDom.getProp('value',true);
            input.setProp('value',vProp,true);
        }else{
            input.setProp('value',vProp);
        }
        
        //清除rootDom的指令和事件
        rootDom.removeDirectives(['field']);
        rootDom.events.clear();

        if(this.icon !== ''){
            let icon:nodom.Element = new nodom.Element('b');
            icon.addClass('nd-icon-' + this.icon);
            if(this.iconPos === 'left'){
                icon.addClass('nd-text-iconleft');
                rootDom.children.unshift(icon);
            }else{
                rootDom.add(icon);
            }
        }
    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        let me = this;
        super.beforeRender(module,dom);
    }
}

nodom.PluginManager.add('UI-TEXT',UIText);