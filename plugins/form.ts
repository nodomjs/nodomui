///<reference types='nodom'/>
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
    /**
     * 对象的modelId
     */
    modelId:number;

    /**
     * 模块id
     */
    moduleId:number;
    init(el:HTMLElement):nodom.Element{
        
        let rootDom:nodom.Element = new nodom.Element();
        nodom.Compiler.handleAttributes(rootDom,el);
        nodom.Compiler.handleChildren(rootDom,el);
        rootDom.tagName = 'form';
        
        UITool.handleUIParam(rootDom,this,
            ['labelwidth|number'],
            ['labelWidth'],
            [100]);
        
        rootDom.addClass('nd-form');    
        
        for(let c of rootDom.children){
            if(!c.tagName){
                continue;
            }
            c.addClass('nd-form-item');
            if(c.children){
                for(let c1 of c.children){
                    //修改label width
                    if(c1.tagName === 'LABEL'){
                        c1.assets.set('style','width:' + this.labelWidth + 'px');
                        break;
                    }
                }
            }
        }
        rootDom.plugin = this;
        return rootDom;
    }
}

nodom.PluginManager.add('UI-FORM',UIForm);