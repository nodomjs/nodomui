///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIDialog extends UIPanel{
    tagName:string = 'UI-DIALOG';
    dataName:string;
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement):nodom.Element{
        el.setAttribute('buttons','close');
        let panelDom:nodom.Element = super.init(el);
        
        this.dataName = panelDom.getProp('data') || '$showDialog';
        
        let dialogDom:nodom.Element = new nodom.Element('div');
        dialogDom.addClass('nd-dialog');
        // dialogDom.addDirective(new nodom.Directive('class',"{'nd-dialog-hide':'!showdlg'}",dialogDom));
        dialogDom.addDirective(new nodom.Directive('show','showdlg',dialogDom));
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
}

//添加到元素库
nodom.PluginManager.add('UI-DIALOG',UIDialog);