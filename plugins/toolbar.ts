///<reference types='nodom'/>

/**
 * panel 插件
 */
class UIToolbar extends nodom.Plugin{
    tagName:string = 'UI-TOOLBAR';
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement):nodom.Element{
        let oe:nodom.Element = new nodom.Element();
        oe.tagName = 'DIV';
        nodom.Compiler.handleAttributes(oe,el);
        nodom.Compiler.handleChildren(oe,el);
        oe.addClass('nd-toolbar');
        oe.plugin=this;
        return oe;
    }
}

nodom.PluginManager.add('UI-TOOLBAR',UIToolbar);