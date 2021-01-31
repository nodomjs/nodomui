///<reference types='nodomjs'/>
/**
 * form 插件
 */
class UIForm extends nodom.Plugin{
    tagName:string = 'UI-FORM';
    /**
     * 附加数据项名
     */
    extraDataName:string;
    
    /**
     * label宽度，默认100
     */
    labelWidth:number;
    
    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                nodom.Compiler.handleAttributes(rootDom,params);
                nodom.Compiler.handleChildren(rootDom,params);
                UITool.handleUIParam(rootDom,this,
                    ['labelwidth|number'],
                    ['labelWidth'],
                    [100]);

            }else if(typeof params === 'object'){
                for(let o in params){
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'form';
        rootDom.plugin = this;
        this.element = rootDom;
    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private generate(rootDom:nodom.Element){
        rootDom.addClass('nd-form');    
        
        for(let c of rootDom.children){
            if(c.tagName !== 'ROW'){
                continue;
            }
            //row div
            c.tagName = 'DIV';
            c.addClass('nd-form-row');
            if(c.children){
                for(let c1 of c.children){
                    if(c1.tagName !== 'ITEM'){
                        continue;
                    }
                    //item div
                    c1.tagName = 'DIV';
                    c1.addClass('nd-form-item');
                    if(c1.children){
                        for(let c2 of c1.children){
                            //修改label width
                            if(c2.tagName === 'LABEL'){
                                c2.assets.set('style','width:' + this.labelWidth + 'px');
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}

nodom.PluginManager.add('UI-FORM',UIForm);