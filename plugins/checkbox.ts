///<reference types='nodom'/>
/**
 * checkbox
 */
class UICheckbox implements nodom.IDefineElement{
    tagName:string = 'UI-CHECKBOX';
    init(el:HTMLElement){
        let checkDom:nodom.Element = new nodom.Element('span');
        nodom.Compiler.handleAttributes(checkDom,el);
        nodom.Compiler.handleChildren(checkDom,el);
        checkDom.addClass('nd-combo');

        let dataName:string = checkDom.props['field'];
        let yesValue:string = checkDom.props['yes-value'];
        let noValue:string = checkDom.props['no-value'];
        
        delete checkDom.props['field'];
        delete checkDom.props['yes-value'];
        delete checkDom.props['no-value'];

        let icon:nodom.Element = new nodom.Element('b');
        icon.addClass('nd-icon-checkbox');
        icon.addDirective(new nodom.Directive('class',"{'nd-icon-checked':'" + dataName + "==\""+ yesValue +"\"'}",icon));
        checkDom.children.unshift(icon);

        //点击事件
        checkDom.addEvent(new nodom.NodomEvent('click',
            (dom,model,module)=>{
                let v = model.data[dataName];
                if(v == yesValue){
                    model.set(dataName,noValue);
                }else{
                    model.set(dataName,yesValue);
                }
            }
        ));
        checkDom.defineElement = this;
        return checkDom;
    }
}

nodom.DefineElementManager.add('UI-CHECKBOX',UICheckbox);