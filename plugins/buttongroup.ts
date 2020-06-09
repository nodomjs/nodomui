///<reference types='nodom'/>

/**
 * panel 插件
 */
class UIButtonGroup implements nodom.IDefineElement{
    tagName:string = 'UI-BUTTONGROUP';
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement){
        let oe:nodom.Element = new nodom.Element();
        oe.tagName = 'DIV';
        nodom.Compiler.handleAttributes(oe,el);
        nodom.Compiler.handleChildren(oe,el);
        oe.addClass('nd-buttongroup');
        oe.defineType='UI-BUTTONGROUP';
        return oe;
    }
}

nodom.DefineElementManager.add(new UIButtonGroup());