///<reference types='nodom'/>

/**
 * panel 插件
 */
export default class UIToolbar implements nodom.IDefineElement{
    tagName:string = 'UI-TOOLBAR';
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement){
        let oe:nodom.Element = new nodom.Element();
        oe.tagName = 'BUTTON';
        nodom.Compiler.handleAttributes(oe,el);
        nodom.Compiler.handleChildren(oe,el);
        const cls:string = 'nd-toolbar';
        oe.props['class'] = oe.props['class']?oe.props['class'] + ' ' + cls:cls;
        return oe;
    }
}

nodom.DefineElementManager.add(new UIToolbar());