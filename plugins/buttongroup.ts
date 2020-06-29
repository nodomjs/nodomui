///<reference types='nodom'/>

/**
 * panel 插件
 */
class UIButtonGroup extends nodom.DefineElement{
    tagName:string = 'UI-BUTTONGROUP';
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement):nodom.Element{
        let oe:nodom.Element = new nodom.Element();
        oe.tagName = 'DIV';
        nodom.Compiler.handleAttributes(oe,el);
        nodom.Compiler.handleChildren(oe,el);
        oe.addClass('nd-buttongroup');
        oe.defineElement=this;
        return oe;
    }
}

nodom.DefineElementManager.add('UI-BUTTONGROUP',UIButtonGroup);