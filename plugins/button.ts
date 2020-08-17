///<reference types='nodom'/>

/**
 * panel 插件
 */
class UIButton extends nodom.Plugin{
    tagName:string = 'UI-BUTTON';

    /**
     * 编译后执行代码
     */
    init(el:HTMLElement):nodom.Element{
        let rootDom:nodom.Element = new nodom.Element('button');
        nodom.Compiler.handleAttributes(rootDom,el);
        nodom.Compiler.handleChildren(rootDom,el);
        //图标
        let icon:string;
        if(rootDom.hasProp('icon')){
            icon = rootDom.getProp('icon');
        }
        
        let clsArr:string[] = ['nd-btn'];
        //图标大小
        let arr = ['small','normal','big'];
        let size:string;
        for(let l of arr){
            if(rootDom.hasProp(l)){
                size = l;
                rootDom.delProp(l);
                break;
            }
        }
        clsArr.push('nd-btn-' + (size || 'normal'));
        
        //图位置
        let loc:string;
        arr = ['left','top','right','bottom'];
        for(let l of arr){
            if(rootDom.hasProp(l)){
                loc = l;
                rootDom.delProp(l);
                break;
            }
        }
        
        clsArr.push('nd-btn-' + (size || 'left'));
        
        let bg:string;
        if(rootDom.hasProp('nobg')){
            bg = 'nd-btn-nobg';
            rootDom.delProp('nobg');
        }else{
            //背景色
            arr = ['warn','active','success','error'];
            for(let l of arr){
                if(rootDom.hasProp(l)){
                    bg = 'nd-btn-' + l;
                    rootDom.delProp(l);
                    break;
                }
            }
        }

        if(bg){
            clsArr.push(bg);
        }
        
        //是否无文本
        if(icon && el.innerHTML.trim() === ''){
            clsArr.push('nd-btn-notext');
        }

        //把btn类加入到class
        rootDom.addClass(clsArr.join(' '));

        //图标element
        let img:nodom.Element = new nodom.Element();
        img.tagName = 'B';
        img.addClass('nd-icon-' + icon + ' nd-icon-' + size);
        switch(loc){
            case 'left':
                rootDom.children.unshift(img);
                break;
            case 'top':
                rootDom.children.unshift(img);
                img.addClass('nd-btn-vert');
                break;
            case 'right':
                rootDom.children.push(img);
                break;
            case 'bottom':
                rootDom.children.push(img);
                img.addClass('nd-btn-vert');
                break;    
        }
        rootDom.plugin=this;
        return rootDom;
    }
}

nodom.PluginManager.add('UI-BUTTON',UIButton);