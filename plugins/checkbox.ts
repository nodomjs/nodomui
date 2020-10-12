///<reference types='nodomjs'/>
/**
 * checkbox
 */
class UICheckbox extends nodom.Plugin{
    tagName:string = 'UI-CHECKBOX';

    /**
     * 数据项字段名
     */
    dataName:string;

    /**
     * checkbox 选中值
     */
    yesValue:string;

    /**
     * checkbox 未选中值
     */
    noValue:string;

    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['yesvalue','novalue'],
                    ['yesValue','noValue'],
                    ['true','false']
                );
            }else if(typeof params === 'object'){
                for(let o in params){
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'span';
        rootDom.plugin = this;
        this.element = rootDom;
    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private generate(rootDom:nodom.Element){
        const me = this;
        let field = rootDom.getDirective('field');
        if(field){
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
        }
        
        let icon:nodom.Element = new nodom.Element('b');
        icon.addClass('nd-checkbox-uncheck');
        icon.addDirective(new nodom.Directive('class',"{'nd-checkbox-checked':'" + this.dataName + "==\""+ this.yesValue +"\"'}",icon));
        rootDom.children.unshift(icon);

        //点击事件
        rootDom.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                let v = model.data[me.dataName];
                if(v == me.yesValue){
                    model.set(me.dataName,me.noValue);
                }else{
                    model.set(me.dataName,me.yesValue);
                }
            }
        ));
    }
}

nodom.PluginManager.add('UI-CHECKBOX',UICheckbox);