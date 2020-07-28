///<reference types='nodom'/>
/**
 * panel 插件
 */
class UIDatetime extends nodom.DefineElement {
    constructor() {
        super(...arguments);
        this.tagName = 'UI-DATETIME';
    }
    /**
     * 编译后执行代码
     */
    init(el) {
        let me = this;
        let rootDom = new nodom.Element('div');
        nodom.Compiler.handleAttributes(rootDom, el);
        nodom.Compiler.handleChildren(rootDom, el);
        rootDom.addClass('nd-datetime');
        UITool.handleUIParam(rootDom, this, ['type'], ['type'], ['date']);
        let fieldDom = new nodom.Element('div');
        fieldDom.addClass('nd-datetime-field');
        let dateIco = new nodom.Element('b');
        dateIco.addClass(this.type === 'time' ? 'nd-datetime-time' : 'nd-datetime-date');
        let input = new nodom.Element('input');
        let directive = rootDom.getDirective('field');
        input.addDirective(directive);
        input.setProp('value', new nodom.Expression(directive.value), true);
        this.fieldName = directive.value;
        rootDom.removeDirectives(['field']);
        fieldDom.add(input);
        fieldDom.add(dateIco);
        //点击事件
        fieldDom.addEvent(new nodom.NodomEvent('click', (dom, model, module, e, el) => {
            me.showPicker(dom, model, module, el);
        }));
        // input.addEvent(new nodom.NodomEvent('focus',(dom,model,module,e,el)=>{
        //     me.showPicker(dom,model,module,el);
        // }));
        this.extraDataName = '$ui_datetime_' + nodom.Util.genId();
        let pickerDom = new nodom.Element('div');
        pickerDom.addClass('nd-datetime-picker');
        pickerDom.addDirective(new nodom.Directive('model', this.extraDataName));
        pickerDom.addDirective(new nodom.Directive('show', 'show'));
        //日期和时间容器
        let tblCt = new nodom.Element('div');
        tblCt.addClass('nd-datetime-tbl');
        pickerDom.add(tblCt);
        //日期面板
        if (this.type === 'date' || this.type === 'datetime') {
            tblCt.add(this.genDatePicker());
        }
        //时间面板
        if (this.type === 'time' || this.type === 'datetime') {
            tblCt.add(this.genTimePicker());
        }
        //按钮
        let btnCt = new nodom.Element('div');
        btnCt.addClass('nd-datetime-btnct');
        if (this.type === 'date') {
            //当天按钮
            let btnToday = new nodom.Element('button');
            btnToday.assets.set('innerHTML', NUITipWords.buttons.today);
            btnToday.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
                e.preventDefault();
                let nda = new Date();
                me.setValue(module, nda.getFullYear() + '-' + (nda.getMonth() + 1) + '-' + nda.getDate());
            }));
            btnCt.add(btnToday);
        }
        else if (this.type === 'datetime' || this.type === 'time') {
            //此刻按钮
            let btn = new nodom.Element('button');
            btn.assets.set('innerHTML', NUITipWords.buttons.now);
            btn.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
                e.preventDefault();
                let nda = new Date();
                me.setValue(module, nda.getFullYear() + '-' + (nda.getMonth() + 1) + '-' + nda.getDate() + ' '
                    + nda.getHours() + ':' + nda.getMinutes() + ':' + nda.getSeconds());
            }));
            btnCt.add(btn);
        }
        let btnOk = new nodom.Element('button');
        btnOk.assets.set('innerHTML', NUITipWords.buttons.ok);
        btnCt.add(btnOk);
        //确定按钮
        btnOk.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            e.preventDefault();
            model.set('show', false);
            let pmodel = module.modelFactory.get(me.modelId);
            pmodel.set(this.fieldName, me.genValueStr());
        }));
        pickerDom.add(btnCt);
        rootDom.children = [fieldDom, pickerDom];
        rootDom.defineElement = this;
        return rootDom;
    }
    /**
     * 渲染前置方法
     * @param module
     * @param uidom
     */
    beforeRender(module, uidom) {
        let me = this;
        this.modelId = uidom.modelId;
        let model = module.modelFactory.get(uidom.modelId);
        if (!this.initFlag) {
            this.initFlag = true;
            //设置附加数据项
            model.set(this.extraDataName, {
                show: false,
                year: 2020,
                month: 1,
                date: 1,
                hour: 0,
                minute: 0,
                second: 0,
                days: []
            });
            this.pickerModelId = model.query(this.extraDataName).$modelId;
            if (this.type === 'date') {
                this.genDates(module);
            }
            else if (this.type === 'time') {
                this.genTimes(module);
            }
            else {
                this.genDates(module);
                this.genTimes(module);
            }
            //增加外部点击隐藏
            UIEventRegister.addEvent('click', module.name, uidom.children[1].key, (module, dom, inOrOut, e) => {
                if (!inOrOut) {
                    model.query(me.extraDataName).show = false;
                }
            });
        }
        else {
            this.pickerModelId = model.query(this.extraDataName).$modelId;
        }
    }
    /**
     * 生成datepicker
     */
    genDatePicker() {
        let me = this;
        let pickerDom = new nodom.Element('div');
        pickerDom.addClass('nd-datetime-datetbl');
        //年月
        let ymDom = new nodom.Element('div');
        ymDom.addClass('nd-datetime-ymct');
        pickerDom.add(ymDom);
        let leftDom1 = new nodom.Element('b');
        leftDom1.addClass('nd-datetime-leftarrow1');
        let leftDom = new nodom.Element('b');
        leftDom.addClass('nd-datetime-leftarrow');
        let rightDom = new nodom.Element('b');
        rightDom.addClass('nd-datetime-rightarrow');
        let rightDom1 = new nodom.Element('b');
        rightDom1.addClass('nd-datetime-rightarrow1');
        let contentDom = new nodom.Element('span');
        contentDom.addClass('nd-datetime-ym');
        let txtDom = new nodom.Element();
        txtDom.expressions = [new nodom.Expression('year'), '/', new nodom.Expression('month')];
        contentDom.add(txtDom);
        leftDom1.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.changeMonth(module, -12);
        }));
        leftDom.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.changeMonth(module, -1);
        }));
        rightDom.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.changeMonth(module, 1);
        }));
        rightDom1.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.changeMonth(module, 12);
        }));
        ymDom.children = [leftDom1, leftDom, contentDom, rightDom, rightDom1];
        //周
        let weekDom = new nodom.Element('div');
        weekDom.addClass('nd-datetime-weekdays');
        let days = Object.getOwnPropertyNames(NUITipWords.weekday);
        for (let d of days) {
            let span = new nodom.Element('span');
            let txt = new nodom.Element();
            txt.textContent = NUITipWords.weekday[d];
            span.add(txt);
            weekDom.add(span);
        }
        pickerDom.add(weekDom);
        let dateDom = new nodom.Element('div');
        dateDom.addClass('nd-datetime-dates');
        let daySpan = new nodom.Element('span');
        daySpan.addDirective(new nodom.Directive('repeat', 'days'));
        daySpan.addDirective(new nodom.Directive('class', "{'nd-datetime-today':'today','nd-datetime-disable':'disable','nd-datetime-selected':'selected'}"));
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression('date')];
        daySpan.add(txt);
        //日期点击事件
        daySpan.addEvent(new nodom.NodomEvent('click', ':delg', (dom, model, module) => {
            let data = model.data;
            if (data.disable) {
                return;
            }
            me.selectDate(module, model);
        }));
        dateDom.add(daySpan);
        pickerDom.add(dateDom);
        return pickerDom;
    }
    /**
     * 生成timepicker
     * @param picker
     */
    genTimePicker() {
        let pickerDom = new nodom.Element('div');
        pickerDom.addClass('nd-datetime-timetbl');
        let showDom = new nodom.Element('input');
        showDom.addClass('nd-datetime-timeinput');
        showDom.addDirective(new nodom.Directive('field', 'time'));
        pickerDom.add(showDom);
        let itemCt = new nodom.Element('div');
        itemCt.addClass('nd-datetime-timect');
        pickerDom.add(itemCt);
        let hourDom = new nodom.Element('div');
        let item = new nodom.Element('div');
        item.addClass('nd-datetime-timeitem');
        item.addDirective(new nodom.Directive('repeat', 'hours'));
        item.addDirective(new nodom.Directive('class', "{'nd-datetime-itemselect':'selected'}"));
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression('v')];
        item.add(txt);
        hourDom.add(item);
        let minuteDom = hourDom.clone(true);
        let secondDom = hourDom.clone(true);
        minuteDom.children[0].getDirective('repeat').value = 'minutes';
        secondDom.children[0].getDirective('repeat').value = 'seconds';
        itemCt.children = [hourDom, minuteDom, secondDom];
        return pickerDom;
    }
    /**
     * 产生日期数组
     * @param module    模块
     * @param year      年
     * @param month     月
     */
    genDates(module, year, month) {
        //获取当日
        let cda = new Date();
        let cy = cda.getFullYear();
        let cm = cda.getMonth() + 1;
        let cd = cda.getDate();
        if (!year || !month) {
            year = cy;
            month = cm;
        }
        let days = this.cacMonthDays(year, month);
        let dayArr = [];
        let date = new Date(year + '-' + month + '-1');
        //周几
        let wd = date.getDay();
        let lastMonthDays = this.cacMonthDays(year, month, -1);
        //补充1号对应周前几天日期
        for (let d = lastMonthDays, i = 0; i < wd; i++, d--) {
            dayArr.unshift({
                disable: true,
                selected: false,
                date: d
            });
        }
        //当月日期
        for (let i = 1; i <= days; i++) {
            dayArr.push({
                date: i,
                selected: this.year === year && this.month === month && this.date === i,
                today: cy === year && cm === month && cd === i
            });
        }
        //下月日期
        date = new Date(year + '-' + month + '-' + days);
        //周几
        wd = date.getDay();
        for (let i = wd + 1; i <= 6; i++) {
            dayArr.push({
                disable: true,
                selected: false,
                date: i - wd
            });
        }
        let model = module.modelFactory.get(this.pickerModelId);
        model.set('year', year);
        model.set('month', month);
        model.set('days', dayArr);
    }
    /**
     * 生成时间数据
     * @param module
     */
    genTimes(module) {
        let model = module.modelFactory.get(this.pickerModelId);
        let hours = [];
        let minutes = [];
        let seconds = [];
        for (let i = 0; i < 60; i++) {
            let selected = i === 0 ? true : false;
            if (i < 24) {
                hours.push({
                    v: i < 10 ? '0' + i : i,
                    selected: selected,
                });
            }
            minutes.push({
                v: i < 10 ? '0' + i : i,
                selected: selected
            });
            seconds.push({
                v: i < 10 ? '0' + i : i,
                selected: selected
            });
        }
        model.set('hours', hours);
        model.set('minutes', minutes);
        model.set('seconds', seconds);
    }
    /**
     * 计算一个月的天数
     * @param year      年
     * @param month     月
     * @param disMonth  相差月数
     */
    cacMonthDays(year, month, disMonth) {
        if (disMonth) {
            month += disMonth;
        }
        if (month <= 0) {
            year--;
            month += 12;
        }
        else if (month > 12) {
            year++;
            month -= 12;
        }
        if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
            return 31;
        }
        else if (month !== 2) {
            return 30;
        }
        else if (year % 400 === 0 || year % 4 === 0 && year % 100 !== 0) {
            return 29;
        }
        else {
            return 28;
        }
    }
    /**
     * 修改月份
     * @param module
     * @param distance
     */
    changeMonth(module, distance) {
        let model = module.modelFactory.get(this.pickerModelId);
        let year = model.query('year');
        let month = model.query('month');
        month += distance;
        if (month <= 0) {
            year--;
            month += 12;
        }
        else if (month > 12) {
            year++;
            month -= 12;
        }
        if (month <= 0) {
            year--;
            month += 12;
        }
        else if (month > 12) {
            year++;
            month -= 12;
        }
        this.genDates(module, year, month);
    }
    /**
     * 设置日期或时间
     * @param module    模块
     * @param str       待设置值
     */
    setValue(module, str) {
        if (str && str !== '') {
            str = str.trim();
            if (str === '') {
                return;
            }
            let model = module.modelFactory.get(this.modelId);
            let model1 = module.modelFactory.get(this.pickerModelId);
            if (this.type === 'date' || this.type === 'datetime') {
                let date = new Date(str);
                if (date.toTimeString() !== 'Invalid Date') {
                    this.year = date.getFullYear();
                    this.month = date.getMonth() + 1;
                    this.date = date.getDate();
                    this.genDates(module, this.year, this.month);
                    //datetime 需要设置时间
                    if (this.type === 'datetime') {
                        this.hour = date.getHours();
                        this.minute = date.getMinutes();
                        this.second = date.getSeconds();
                        model1.set('time', this.genValueStr('time'));
                    }
                }
                else { //日期格式不对，则直接设置插件当前日期时间值
                    model.set(this.fieldName, this.genValueStr());
                }
            }
            else if (this.type === 'time') {
                if (/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(str)) {
                    let sa = str.split(':');
                    this.hour = parseInt(sa[0]);
                    this.minute = parseInt(sa[1]);
                    this.second = sa.length > 2 ? parseInt(sa[2]) : 0;
                    model1.set('time', this.genValueStr('time'));
                }
            }
        }
    }
    /**
     * 选中日期
     * @param module
     * @param model     被点击dom绑定的model
     */
    selectDate(module, model) {
        //把selected的项置false
        let pmodel = module.modelFactory.get(this.pickerModelId);
        if (pmodel) {
            let days = pmodel.query('days');
            for (let d of days) {
                if (d.selected) {
                    d.selected = false;
                    break;
                }
            }
            this.year = pmodel.query('year');
            this.month = pmodel.query('month');
        }
        if (model) {
            model.set('selected', true);
            this.date = model.query('date');
        }
    }
    /**
     * 初始化并显示picker
     * @param dom       input或inputct
     * @param model     数据模型
     * @param module    模块
     * @param el        当前el
     */
    showPicker(dom, model, module, el) {
        let data = model.query(this.extraDataName);
        console.log(data);
        if (data) {
            if (data.show) {
                return;
            }
            data.show = true;
        }
        //父dom
        let pDom = dom.tagName === 'input' ? dom.getParent(module) : dom;
        this.setValue(module, model.query(this.fieldName));
        pDom.children[0].assets.set('style', 'left:0px;' + 'top:' + (el.offsetHeight + 3) + 'px');
    }
    /**
     * 生成日期时间串
     */
    genValueStr(type) {
        if (!this.year) {
            this.year = 2020;
        }
        if (!this.month) {
            this.month = 1;
        }
        if (!this.date) {
            this.date = 1;
        }
        if (!this.hour) {
            this.hour = 0;
        }
        if (!this.minute) {
            this.minute = 0;
        }
        if (!this.second) {
            this.second = 0;
        }
        switch (type || this.type) {
            case 'datetime':
                return [this.year, this.month < 10 ? '0' + this.month : this.month, this.date < 10 ? '0' + this.date : this.date].join('-') +
                    ' ' +
                    [this.hour < 10 ? '0' + this.hour : this.hour, this.minute < 10 ? '0' + this.minute : this.minute, this.second < 10 ? '0' + this.second : this.second].join(':');
            case 'time':
                return [this.hour < 10 ? '0' + this.hour : this.hour, this.minute < 10 ? '0' + this.minute : this.minute, this.second < 10 ? '0' + this.second : this.second].join(':');
            default:
                return [this.year, this.month < 10 ? '0' + this.month : this.month, this.date < 10 ? '0' + this.date : this.date].join('-');
        }
    }
}
nodom.DefineElementManager.add('UI-DATETIME', UIDatetime);
//# sourceMappingURL=datetime.js.map