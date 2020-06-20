///<reference types='nodom'/>
/**
 * checkbox
 */
class UIRadio implements nodom.IDefineElement{
    tagName:string = 'UI-RADIO';
    init(el:HTMLElement){
        let radioDom:nodom.Element = new nodom.Element('span');
        nodom.Compiler.handleAttributes(radioDom,el);
        nodom.Compiler.handleChildren(radioDom,el);
        radioDom.addClass('nd-radio');
        let dataName:string = radioDom.getProp('field');

        // 新的孩子节点
        for(let c of radioDom.children){
            if(c.tagName){
                let icon:nodom.Element = new nodom.Element('b');
                icon.addClass('nd-icon-radio');
                icon.addDirective(new nodom.Directive('class',"{'nd-icon-radio-active':'" + dataName + "==\""+ c.getProp('value') +"\"'}",icon));
                c.children.unshift(icon);
                //点击事件
                c.addEvent(new nodom.NodomEvent('click',
                    (dom,model,module)=>{
                        let v = model.data[dataName];
                        model.set(dataName,dom.getProp('value'));
                    }
                ));
            }
        }
        
        radioDom.delProp('field');
        radioDom.defineElement = this;
        return radioDom;
    }
}

nodom.DefineElementManager.add('UI-RADIO',UIRadio);