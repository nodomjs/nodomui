///<reference types='nodom'/>
/**
 * checkbox
 */
class UICheckbox extends nodom.Plugin{
    tagName:string = 'UI-CHECKBOX';
    init(el:HTMLElement):nodom.Element{
        let checkDom:nodom.Element = new nodom.Element('span');
        nodom.Compiler.handleAttributes(checkDom,el);
        nodom.Compiler.handleChildren(checkDom,el);
        checkDom.addClass('nd-combo');

        let dataName:string = checkDom.getProp('field');
        let yesValue:string = checkDom.getProp('yes-value');
        let noValue:string = checkDom.getProp('no-value');
        
        checkDom.delProp(['field','yes-value','no-value']);

        let icon:nodom.Element = new nodom.Element('b');
        icon.addClass('nd-uncheck');
        icon.addDirective(new nodom.Directive('class',"{'nd-checked':'" + dataName + "==\""+ yesValue +"\"'}",icon));
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
        checkDom.plugin = this;
        return checkDom;
    }
}

nodom.PluginManager.add('UI-CHECKBOX',UICheckbox);