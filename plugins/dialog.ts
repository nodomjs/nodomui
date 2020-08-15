///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIDialog extends UIPanel{
    tagName:string = 'UI-DIALOG';
    modelId:number;
    dataName:string;
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement):nodom.Element{
        el.setAttribute('buttons','close');
        let panelDom:nodom.Element = super.init(el);
        
        this.dataName = '$ui_dialog_' + nodom.Util.genId();
        
        //设置默认title
        // title = title?title.trim():'';
        // title = title!==''?title:'Dialog';
        
        
        let dialogDom:nodom.Element = new nodom.Element('div');
        dialogDom.addClass('nd-dialog');
        dialogDom.addDirective(new nodom.Directive('show',this.dataName,dialogDom));

        //body
        let dialogBody:nodom.Element = new nodom.Element('div');
        dialogBody.addClass('nd-dialog-body');
        dialogBody.add(panelDom);

        //蒙版
        let coverDom:nodom.Element = new nodom.Element('div');
        coverDom.addClass('nd-dialog-cover');
        dialogDom.add(coverDom);
        dialogDom.add(dialogBody);
        dialogDom.plugin=this;
        return dialogDom;
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
    public open(module:nodom.Module){
        if(!module){
            throw new nodom.NodomError('invoke1','dialog.open','0','Module');
        }
        let model:nodom.Model = module.modelFactory.get(this.modelId);
        if(model){
            model.set(this.dataName,true);
        }
    }

    /**
     * 关闭dialog
     * @param module 
     */
    public close(module:nodom.Module){
        if(!module){
            throw new nodom.NodomError('invoke1','dialog.open','0','Module');
        }
        let model:nodom.Model = module.modelFactory.get(this.modelId);
        if(model){
            model.set(this.dataName,false);
        }
    }
}

//添加到元素库
nodom.PluginManager.add('UI-DIALOG',UIDialog);