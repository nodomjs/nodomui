class UISelectSlider extends nodom.Plugin{
    tagName:string = 'UI-SELECTSLIDER';

    init(el:HTMLElement):nodom.Element{
        let rootDom:nodom.Element = new nodom.Element('div');

        rootDom.plugin = this;
        return rootDom;
    }
}

nodom.PluginManager.add('UI-SELECTSLIDER',UISelectSlider);