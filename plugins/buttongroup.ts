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
        const cls:string = 'nd-buttongroup';
        oe.props['class'] = oe.props['class']?oe.props['class'] + ' ' + cls:cls;
        oe.defineType='UI-BUTTONGROUP';
        return oe;
    }
}

nodom.DefineElementManager.add(new UIButtonGroup());