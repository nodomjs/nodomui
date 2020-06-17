///<reference types='nodom'/>

/**
 * panel 插件
 */
class UIButton implements nodom.IDefineElement{
    tagName:string = 'UI-BUTTON';
    /**
     * 编译后执行代码
     */
    init(el:HTMLElement){
        let oe:nodom.Element = new nodom.Element('button');
        nodom.Compiler.handleAttributes(oe,el);
        nodom.Compiler.handleChildren(oe,el);
        //图标
        let icon:string;
        if(oe.props['icon']){
            icon = oe.props['icon'];
        } 
        
        //图标大小
        let arr = ['small','normal','big'];
        let size:string;
        for(let l of arr){
            if(oe.props.hasOwnProperty(l)){
                size = l;
                delete oe.props[l];
                break;
            }
        }
        
        //默认normal
        if(!size){
            size = 'normal';
        }

        //图位置
        let loc:string;
        arr = ['left','top','right','bottom'];
        for(let l of arr){
            if(oe.props.hasOwnProperty(l)){
                loc = l;
                delete oe.props[l];
                break;
            }
        }
        
        //默认normal
        if(!loc){
            loc = 'left';
        }
        
        let bg:string;
            
        if(oe.props.hasOwnProperty('nobg')){
            bg = 'nd-btn-nobg';
            delete oe.props['nobg'];
        }else{
            //背景色
            arr = ['warn','active','emphasis'];
            for(let l of arr){
                if(oe.props.hasOwnProperty(l)){
                    bg = 'nd-bg-' + l;
                    delete oe.props[l];
                    break;
                }
            }
            //默认灰色
            if(!bg){
                bg = 'nd-bg-grey';    
            }
        }
        //是否无文本
        let notext:string = icon && el.innerHTML.trim() === ''?'nd-btn-notext':'';

        let cls:string = 'nd-btn ' + notext + ' nd-btn-' + size + ' ' + bg;
        
        //把btn类加入到class
        oe.addClass(cls);

        //图标element
        let img:nodom.Element = new nodom.Element();
        img.tagName = 'B';
        img.addClass('nd-icon-' + icon + ' nd-icon-' + size);
        switch(loc){
            case 'left':
                oe.children.unshift(img);
                break;
            case 'top':
                oe.children.unshift(img);
                img.addClass('nd-btn-vert');
                break;
            case 'right':
                oe.children.push(img);
                break;
            case 'bottom':
                oe.children.push(img);
                img.addClass('nd-btn-vert');
                break;    
        }
        
        oe.defineElement=this;
        return oe;
    }
}

nodom.DefineElementManager.add('UI-BUTTON',UIButton);