class UISelectSlider extends nodom.DefineElement{
    tagName:string = 'UI-SELECTSLIDER';

    init(el:HTMLElement):nodom.Element{
        let rootDom:nodom.Element = new nodom.Element('div');

        rootDom.defineElement = this;
        return rootDom;
    }
}

nodom.DefineElementManager.add('UI-SELECTSLIDER',UISelectSlider);