///<reference types='nodom'/>
/**
 * checkbox
 */
class UIFile implements nodom.IDefineElement{
    tagName:string = 'UI-FILE';
    /**
     * 绑定字段名
     */
    fieldName:string;

    /**
     * 多选方式
     *   single:一次选一个
     *   multi: 一次选多个
     */
    multiple:string;

    /**
     * 保存给dataName的值，一般是两个如'id,url',给dataName的值格式是{id:**,url:**}或[{id:**,url:**},...](multiple 方式)
     */
    valueFields:string[];

    /**
     * 服务器返回的数据字段，
     *  如 id,url,result.rows，则返回格式为{result:{rows:[{id:**,url:**}]}}
     *  如 id,url,result，则返回格式为{result:[{id:**,url:**}]}
     *  如 id,url，则返回格式为[{id:**,url:**}]
     *  其中"[]"当multiple=multi时有效，其它情况一律不要"[]"
     */
    returnFields:string[];

    /**
     * 上传类型，如果为image，上传成功后显示缩略图，否则显示文件名
     */
    type:string;

    init(el:HTMLElement):nodom.Element{
        let fileDom:nodom.Element = new nodom.Element('span');
        nodom.Compiler.handleAttributes(fileDom,el);
        UITool.handleUIParam(fileDom,this,
            ['field','valuefields|array','returnfields|array','multiple'],
            ['fieldName','valueFields','returnFields','multiple'],
            [null,null,null,'']);
        
        fileDom.tagName = 'div';
        fileDom.addClass('nd-file');

        //文件
        let fDom:nodom.Element = new nodom.Element('input');
        fDom.setProp('type','file');
        //多文件
        if(this.multiple === 'multi'){
            fDom.setProp('multiple','multiple');
        }
        fDom.addClass('nd-file-input');
        

        
        fileDom.defineElement = this;
        return fileDom;
    }
}

nodom.DefineElementManager.add('UI-FILE',UIFile);