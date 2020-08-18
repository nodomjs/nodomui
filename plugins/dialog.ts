///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIDialog extends nodom.Plugin{
    tagName:string = 'UI-DIALOG';

    /**
     * 数据项名
     */
    dataName:string;
    
    /**
     * 自动打开
     */
    autoOpen:boolean;

    constructor(params:HTMLElement|object){
        super(params);
        let rootDom:nodom.Element = new nodom.Element();
        if(params){
            if(params instanceof HTMLElement){
                params.setAttribute('buttons','close');
            }
            let panel:UIPanel = new UIPanel(params);
            this.generate(rootDom,panel);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private generate(rootDom:nodom.Element,panel:UIPanel){
        const me = this;
        this.dataName = '$ui_dialog_' + nodom.Util.genId();
        rootDom.addClass('nd-dialog');
        
        let panelDom = panel.element;
        //删除panel plugin
        // delete panelDom.plugin;
        //获取插件名
        rootDom.setProp('name',panelDom.getProp('name'));
        //autoopen
        this.autoOpen = panelDom.hasProp('autoopen');
        panelDom.delProp(['name','autoopen']);
        panel.setCloseHandler(()=>{
            me.close();
        });
        
        rootDom.addDirective(new nodom.Directive('show',this.dataName,rootDom));

        //body
        let dialogBody:nodom.Element = new nodom.Element('div');
        dialogBody.addClass('nd-dialog-body');
        dialogBody.add(panelDom);

        //蒙版
        let coverDom:nodom.Element = new nodom.Element('div');
        coverDom.addClass('nd-dialog-cover');
        rootDom.add(coverDom);
        rootDom.add(dialogBody);
    }

    /**
     * 渲染前事件
     * @param module 
     * @param dom 
     */
    beforeRender(module:nodom.Module,dom:nodom.Element){
        super.beforeRender(module,dom);
        if(this.needPreRender){
            if(this.autoOpen){
                this.open();
            }
        }
    }
    /**
     * 设置关闭事件
     * @param foo 
     */
    setCloseHandler(btn:nodom.Element){
        let me = this;
        btn.addEvent(new nodom.NodomEvent('click',
            (dom,model,module,e)=>{
                model.set(me.dataName,false);
            }
        ))
    }

    /**
     * 打开dialog
     * @param module 
     */
    public open(){
        let module:nodom.Module = nodom.ModuleFactory.get(this.moduleId);
        if(module){
            let model:nodom.Model = module.modelFactory.get(this.modelId);
            if(model){
                model.set(this.dataName,true);
            }
        }
        
    }

    /**
     * 关闭dialog
     * @param module 
     */
    public close(){
        let module:nodom.Module = nodom.ModuleFactory.get(this.moduleId);
        if(module){
            let model:nodom.Model = module.modelFactory.get(this.modelId);
            if(model){
                model.set(this.dataName,false);
            }
        }
    }
}

//添加到元素库
nodom.PluginManager.add('UI-DIALOG',UIDialog);