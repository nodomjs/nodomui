const NUITipWords = {
    uploading: '上传中...',
    total: '共',
    record: '条',
    NO: '第',
    page: '页',
    emptySelect: '请选择...',
    weekday: {
        sunday: '日',
        monday: '一',
        tuesday: '二',
        wednesday: '三',
        thursday: '四',
        friday: '五',
        saturday: '六'
    },
    buttons: {
        ok: '确定',
        cancel: '取消',
        close: '关闭',
        yes: '是',
        no: '否',
        today: '今天',
        now: '此时'
    }
};
document.oncontextmenu = function (e) {
    e.preventDefault();
};
class UITool {
    static clearSpace(src) {
        if (src && typeof src === 'string') {
            return src.replace(/\s+/g, '');
        }
    }
    static adjustPosAndSize(module, key, x, y, distance, bodyHeight, changeSize) {
        let el = module.getNode(key);
        if (!el) {
            setTimeout(() => {
                UITool.adjustPosAndSize(module, key, x, y, distance, document.body.scrollHeight, changeSize);
            }, 0);
        }
        else {
            let scTop = document.documentElement.scrollTop || document.body.scrollTop;
            y += scTop;
            let height = bodyHeight > window.innerHeight ? bodyHeight : window.innerHeight;
            if (changeSize) {
                el.style.maxHeight = (window.innerHeight - 50) + 'px';
            }
            distance = distance || 0;
            if (y + el.offsetHeight > height && y > el.offsetHeight + distance) {
                el.style.transform = 'translate(0,' + -(el.offsetHeight + distance) + 'px)';
            }
            else {
                el.style.transform = 'translate(0,0)';
            }
        }
    }
    static handleUIParam(dom, defDom, paramArr, props, defaultValues) {
        let error = false;
        for (let i = 0; i < paramArr.length; i++) {
            let pName = props[i];
            let p = paramArr[i];
            let type;
            let pa;
            if (p.includes('|')) {
                pa = p.split('|');
                p = pa[0];
                type = pa[1];
            }
            let v = dom.getProp(p);
            if (v) {
                v = this.clearSpace(v);
                if (v !== '') {
                    switch (type) {
                        case 'number':
                            if (!nodom.Util.isNumberString(v)) {
                                error = true;
                            }
                            else {
                                defDom[pName] = parseInt(v);
                            }
                            break;
                        case 'array':
                            let va = v.split(',');
                            if (pa.length === 3) {
                                if (nodom.Util.isNumberString(pa[2])) {
                                    if (parseInt(pa[2]) > va.length) {
                                        error = true;
                                    }
                                }
                                else {
                                    if (pa[2] === 'number') {
                                        for (let i = 0; i < va.length; i++) {
                                            let v1 = va[i];
                                            if (!nodom.Util.isNumberString(v1)) {
                                                error = true;
                                                break;
                                            }
                                            va[i] = parseInt(v1);
                                        }
                                    }
                                }
                            }
                            if (!error) {
                                defDom[pName] = va;
                            }
                            break;
                        case 'bool':
                            if (v === 'true') {
                                defDom[pName] = true;
                            }
                            break;
                        default:
                            defDom[pName] = v;
                    }
                }
            }
            if (!v || v === '') {
                if (defaultValues && defaultValues[i] !== null) {
                    defDom[pName] = defaultValues[i];
                }
                else {
                    if (type === 'bool') {
                        if (dom.hasProp(p)) {
                            defDom[pName] = true;
                        }
                        else {
                            defDom[pName] = false;
                        }
                    }
                    else {
                        error = true;
                    }
                }
            }
            dom.delProp(p);
            if (error) {
                throw new nodom.NodomError('config1', defDom.tagName, p);
            }
        }
    }
}
class UIEventRegister {
    static addEvent(eventName, moduleId, domKey, handler) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
            window.addEventListener(eventName, (e) => {
                let target = e.target;
                let key = target.getAttribute('key');
                let evts = this.listeners.get(eventName);
                for (let evt of evts) {
                    let module = nodom.ModuleFactory.get(evt.module);
                    let dom = module.getElement(evt.dom);
                    if (!dom) {
                        continue;
                    }
                    let inOrOut = dom.key === key || dom.query(key) ? true : false;
                    if (typeof evt.handler === 'function') {
                        evt.handler.apply(dom, [module, dom, inOrOut, e]);
                    }
                }
            }, false);
        }
        let arr = this.listeners.get(eventName);
        let find = arr.find(item => item.dom === domKey);
        if (find) {
            return;
        }
        arr.push({
            module: moduleId,
            dom: domKey,
            handler: handler
        });
    }
}
UIEventRegister.listeners = new Map();
function request(cfg) {
    return nodom.request(cfg);
}
class UIAccordion extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-ACCORDION';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    if (o === 'children') {
                        if (Array.isArray(params[o])) {
                            for (let c of params[o]) {
                                if (typeof c !== 'object') {
                                    continue;
                                }
                                let d = new nodom.Element(c.tagName || 'div');
                                for (let p in c) {
                                    if (p === 'tagName') {
                                        continue;
                                    }
                                    d.setProp(p, c[p]);
                                }
                                rootDom.add(d);
                            }
                        }
                    }
                    else {
                        this[o] = params[o];
                    }
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        rootDom.addClass('nd-accordion');
        let firstDom = new nodom.Element();
        let secondDom = new nodom.Element();
        firstDom.tagName = 'DIV';
        secondDom.tagName = 'DIV';
        firstDom.addClass('nd-accordion-item');
        let activeName1;
        let activeName2;
        for (let i = 0; i < rootDom.children.length; i++) {
            let item = rootDom.children[i];
            if (!item.tagName) {
                continue;
            }
            if (item.hasProp('first')) {
                firstDom.addDirective(new nodom.Directive('repeat', item.getProp('data'), firstDom), true);
                item.addClass('nd-accordion-first');
                let methodId = '$nodomGenMethod' + nodom.Util.genId();
                item.addEvent(new nodom.NodomEvent('click', methodId));
                this.method1 = methodId;
                activeName1 = item.getProp('activename') || 'active';
                this.active1 = activeName1;
                firstDom.add(item);
                let span = new nodom.Element('span');
                span.children = item.children;
                item.children = [span];
                if (item.hasProp('icon')) {
                    span.addClass('nd-icon-' + item.getProp('icon'));
                }
                this.field1 = item.getProp('data');
                let icon = new nodom.Element('b');
                icon.addClass('nd-accordion-icon nd-icon-right');
                icon.directives.push(new nodom.Directive('class', "{'nd-accordion-open':'" + activeName1 + "'}", icon));
                item.add(icon);
                item.delProp(['activename', 'first']);
            }
            else if (item.hasProp('second')) {
                activeName2 = item.getProp('activename') || 'active';
                this.active2 = activeName2;
                item.addDirective(new nodom.Directive('repeat', item.getProp('data'), item));
                this.field2 = item.getProp('data');
                item.addClass('nd-accordion-second');
                if (item.hasProp('itemclick')) {
                    item.addEvent(new nodom.NodomEvent('click', item.getProp('itemclick')));
                }
                item.addDirective(new nodom.Directive('class', "{'nd-accordion-selected':'" + activeName2 + "'}", item));
                secondDom.addClass('nd-accordion-secondct');
                secondDom.add(item);
                secondDom.addDirective(new nodom.Directive('class', "{'nd-accordion-hide':'!" + activeName1 + "'}", secondDom), true);
            }
            item.delProp(['data', 'second']);
        }
        firstDom.add(secondDom);
        rootDom.children = [firstDom];
    }
    beforeRender(module, uidom) {
        const me = this;
        super.beforeRender(module, uidom);
        if (this.needPreRender) {
            module.addMethod(this.method1, (dom, model, module, e) => {
                let pmodel = module.getModel(uidom.modelId);
                let data = pmodel.query(me.field1);
                let f = me.active1;
                for (let d of data) {
                    if (d[f] === true) {
                        d[f] = false;
                    }
                }
                model.set(f, true);
            });
            module.addMethod(this.method2, (dom, model, module, e) => {
                let pmodel = module.getModel(uidom.modelId);
                let data = pmodel.data[me.field1];
                let f = me.active2;
                for (let d of data) {
                    for (let d1 of d[me.field2]) {
                        if (d1[f] === true) {
                            d1[f] = false;
                        }
                    }
                }
                model.set(f, true);
            });
        }
    }
}
nodom.PluginManager.add('UI-ACCORDION', UIAccordion);
class UIButton extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-BUTTON';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['size', 'icon', 'iconpos', 'theme', 'nobg|bool'], ['size', 'icon', 'iconPos', 'theme', 'nobg'], ['normal', '', 'left', '', null]);
                this.text = params.innerHTML.trim();
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'button';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        let clsArr = ['nd-btn'];
        clsArr.push('nd-btn-' + this.size);
        if (this.icon !== '') {
            clsArr.push('nd-btn-' + this.iconPos);
        }
        if (this.nobg) {
            clsArr.push('nd-btn-nobg');
        }
        else if (this.theme !== '') {
            clsArr.push('nd-btn-' + this.theme);
        }
        if (this.text === '') {
            clsArr.push('nd-btn-notext');
        }
        rootDom.addClass(clsArr.join(' '));
        let txt = new nodom.Element();
        txt.textContent = this.text;
        let children = [txt];
        if (this.icon !== '') {
            let img = new nodom.Element('b');
            img.addClass('nd-icon-' + this.icon);
            switch (this.iconPos) {
                case 'left':
                    children.unshift(img);
                    break;
                case 'top':
                    children.unshift(img);
                    img.addClass('nd-btn-vert');
                    break;
                case 'right':
                    children.push(img);
                    break;
                case 'bottom':
                    children.push(img);
                    img.addClass('nd-btn-vert');
                    break;
            }
        }
        rootDom.children = children;
    }
}
nodom.PluginManager.add('UI-BUTTON', UIButton);
class UIButtonGroup extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-BUTTONGROUP';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    if (o === 'children') {
                        if (Array.isArray(params[o])) {
                            for (let c of params[o]) {
                                if (typeof c !== 'object') {
                                    continue;
                                }
                                rootDom.add(new UIButton(c).element);
                            }
                        }
                    }
                    else {
                        this[o] = params[o];
                    }
                }
            }
        }
        rootDom.addClass('nd-buttongroup');
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
}
nodom.PluginManager.add('UI-BUTTONGROUP', UIButtonGroup);
class UICheckbox extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-CHECKBOX';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['yesvalue', 'novalue'], ['yesValue', 'noValue'], ['true', 'false']);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'span';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        const me = this;
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
        }
        let icon = new nodom.Element('b');
        icon.addClass('nd-checkbox-uncheck');
        icon.addDirective(new nodom.Directive('class', "{'nd-checkbox-checked':'" + this.dataName + "==\"" + this.yesValue + "\"'}", icon));
        rootDom.children.unshift(icon);
        rootDom.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            let v = model.data[me.dataName];
            if (v == me.yesValue) {
                model.set(me.dataName, me.noValue);
            }
            else {
                model.set(me.dataName, me.yesValue);
            }
        }));
    }
}
nodom.PluginManager.add('UI-CHECKBOX', UICheckbox);
class UIDatetime extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-DATETIME';
        this.msecond = 0;
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['type', 'showms|bool'], ['type', 'showMs'], ['date', null]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        let me = this;
        rootDom.addClass('nd-datetime');
        let fieldDom = new nodom.Element('div');
        fieldDom.addClass('nd-datetime-field');
        let dateIco = new nodom.Element('b');
        dateIco.addClass(this.type === 'time' ? 'nd-datetime-time' : 'nd-datetime-date');
        let directive = rootDom.getDirective('field');
        if (directive) {
            this.dataName = directive.value;
            rootDom.removeDirectives(['field']);
        }
        let input = new nodom.Element('input');
        if (this.dataName) {
            input.addDirective(new nodom.Directive('field', this.dataName, input));
            input.setProp('value', new nodom.Expression(this.dataName), true);
        }
        fieldDom.add(input);
        fieldDom.add(dateIco);
        fieldDom.addEvent(new nodom.NodomEvent('click', (dom, model, module, e, el) => {
            me.showPicker(dom, model, module, e, el);
        }));
        this.extraDataName = '$ui_datetime_' + nodom.Util.genId();
        let pickerDom = new nodom.Element('div');
        pickerDom.addClass('nd-datetime-picker');
        pickerDom.addDirective(new nodom.Directive('model', this.extraDataName, pickerDom));
        pickerDom.addDirective(new nodom.Directive('show', 'show', pickerDom));
        let tblCt = new nodom.Element('div');
        tblCt.addClass('nd-datetime-tbl');
        pickerDom.add(tblCt);
        if (this.type === 'date' || this.type === 'datetime') {
            tblCt.add(this.genDatePicker());
        }
        if (this.type === 'time' || this.type === 'datetime') {
            tblCt.add(this.genTimePicker());
        }
        let btnCt = new nodom.Element('div');
        btnCt.addClass('nd-datetime-btnct');
        if (this.type === 'date') {
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
            let btn = new nodom.Element('button');
            btn.assets.set('innerHTML', NUITipWords.buttons.now);
            btn.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
                e.preventDefault();
                let nda = new Date();
                let value = nda.getFullYear() + '-' + (nda.getMonth() + 1) + '-' + nda.getDate() + ' '
                    + nda.getHours() + ':' + nda.getMinutes() + ':' + nda.getSeconds();
                if (this.showMs) {
                    value += '.' + nda.getMilliseconds();
                }
                me.setValue(module, value);
            }));
            btnCt.add(btn);
        }
        let btnOk = new nodom.Element('button');
        btnOk.addClass('nd-btn-active');
        btnOk.assets.set('innerHTML', NUITipWords.buttons.ok);
        btnCt.add(btnOk);
        btnOk.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            e.preventDefault();
            model.set('show', false);
            let pmodel = module.getModel(me.modelId);
            pmodel.set(this.dataName, me.genValueStr());
        }));
        pickerDom.add(btnCt);
        rootDom.children = [fieldDom, pickerDom];
    }
    beforeRender(module, uidom) {
        let me = this;
        super.beforeRender(module, uidom);
        this.listKey = uidom.children[1].key;
        let model = module.getModel(uidom.modelId);
        if (this.needPreRender) {
            model.set(this.extraDataName, {
                show: false,
                year: 2020,
                month: 1,
                date: 1,
                hour: 0,
                minute: 0,
                second: 0,
                time: '00:00:00',
                days: []
            });
            this.pickerModelId = model.get(this.extraDataName).id;
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
            UIEventRegister.addEvent('click', module.id, uidom.children[1].key, (module, dom, inOrOut, e) => {
                if (!inOrOut) {
                    model.query(me.extraDataName).show = false;
                }
            });
        }
        else {
            this.pickerModelId = model.get(this.extraDataName).id;
        }
    }
    genDatePicker() {
        let me = this;
        let pickerDom = new nodom.Element('div');
        pickerDom.addClass('nd-datetime-datetbl');
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
        daySpan.addDirective(new nodom.Directive('repeat', 'days', daySpan));
        daySpan.addDirective(new nodom.Directive('class', "{'nd-datetime-today':'today','nd-datetime-disable':'disable','nd-datetime-selected':'selected'}", daySpan));
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression('date')];
        daySpan.add(txt);
        daySpan.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
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
    genTimePicker() {
        let me = this;
        let pickerDom = new nodom.Element('div');
        pickerDom.addClass('nd-datetime-timetbl');
        let showDom = new nodom.Element('input');
        showDom.addClass('nd-datetime-timeinput');
        showDom.setProp('value', new nodom.Expression('time'), true);
        pickerDom.add(showDom);
        let itemCt = new nodom.Element('div');
        itemCt.addClass('nd-datetime-timect');
        pickerDom.add(itemCt);
        let hourDom = new nodom.Element('div');
        let item = new nodom.Element('div');
        item.addClass('nd-datetime-timeitem');
        item.addDirective(new nodom.Directive('repeat', 'hours', item));
        item.addDirective(new nodom.Directive('class', "{'nd-datetime-itemselect':'selected'}", item));
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression('v')];
        item.setProp('role', 'hour');
        item.add(txt);
        hourDom.add(item);
        item.addEvent(new nodom.NodomEvent('click', (dom, model, module, e, el) => {
            me.selectTime(module, dom, model);
        }));
        let minuteDom = hourDom.clone(true);
        let secondDom = hourDom.clone(true);
        minuteDom.children[0].getDirective('repeat').value = 'minutes';
        minuteDom.children[0].setProp('role', 'minute');
        secondDom.children[0].getDirective('repeat').value = 'seconds';
        secondDom.children[0].setProp('role', 'second');
        itemCt.children = [hourDom, minuteDom, secondDom];
        if (this.showMs) {
            let msDom = hourDom.clone(true);
            msDom.children[0].getDirective('repeat').value = 'mseconds';
            msDom.children[0].setProp('role', 'msecond');
            itemCt.add(msDom);
        }
        return pickerDom;
    }
    genDates(module, year, month) {
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
        let wd = date.getDay();
        let lastMonthDays = this.cacMonthDays(year, month, -1);
        for (let d = lastMonthDays, i = 0; i < wd; i++, d--) {
            dayArr.unshift({
                disable: true,
                selected: false,
                date: d
            });
        }
        for (let i = 1; i <= days; i++) {
            dayArr.push({
                date: i,
                selected: this.year === year && this.month === month && this.date === i,
                today: cy === year && cm === month && cd === i
            });
        }
        date = new Date(year + '-' + month + '-' + days);
        wd = date.getDay();
        for (let i = wd + 1; i <= 6; i++) {
            dayArr.push({
                disable: true,
                selected: false,
                date: i - wd
            });
        }
        let model = module.getModel(this.pickerModelId);
        model.set('year', year);
        model.set('month', month);
        model.set('days', dayArr);
    }
    genTimes(module) {
        let model = module.getModel(this.pickerModelId);
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
        if (this.showMs) {
            let mseconds = [];
            for (let i = 0; i < 999; i++) {
                let v = i + '';
                if (i < 10) {
                    v = '00' + i;
                }
                else if (i < 100) {
                    v = '0' + i;
                }
                else {
                    v = i + '';
                }
                mseconds.push({
                    v: v,
                    selected: i === 0 ? true : false
                });
            }
            model.set('mseconds', mseconds);
        }
    }
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
    changeMonth(module, distance) {
        let model = module.getModel(this.pickerModelId);
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
    setValue(module, str) {
        if (str && str !== '') {
            str = str.trim();
            if (str === '') {
                return;
            }
            let model = module.getModel(this.modelId);
            if (this.type === 'date' || this.type === 'datetime') {
                let date = new Date(str);
                if (date.toTimeString() !== 'Invalid Date') {
                    this.year = date.getFullYear();
                    this.month = date.getMonth() + 1;
                    this.date = date.getDate();
                    this.genDates(module, this.year, this.month);
                    if (this.type === 'datetime') {
                        this.setTime(module, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
                    }
                }
                else {
                    model.set(this.dataName, this.genValueStr());
                }
            }
            else if (this.type === 'time') {
                if (/^\d{1,2}:\d{1,2}(:\d{1,2})?(\.\d{1,3})?$/.test(str)) {
                    let sa = str.split(':');
                    let h = parseInt(sa[0]);
                    let m = parseInt(sa[1]);
                    let s = 0, ms = 0;
                    if (sa.length > 2) {
                        let a = sa[2].split('.');
                        s = parseInt(a[0]);
                        if (a.length > 1) {
                            ms = parseInt(a[1]);
                        }
                    }
                    this.setTime(module, h, m, s, ms);
                }
            }
        }
    }
    setTime(module, hour, minute, second, msecond) {
        let model1 = module.getModel(this.pickerModelId);
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.msecond = msecond;
        model1.set('time', this.genValueStr('time'));
        this.setTimeSelect(module);
    }
    selectDate(module, model) {
        let pmodel = module.getModel(this.pickerModelId);
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
    selectTime(module, dom, model) {
        let pmodel = module.getModel(this.pickerModelId);
        let role = dom.getProp('role');
        if (pmodel) {
            let datas = pmodel.query(role + 's');
            for (let d of datas) {
                if (d.selected) {
                    d.selected = false;
                    break;
                }
            }
        }
        if (!model) {
            model = module.getModel(dom.modelId);
        }
        if (model) {
            model.set('selected', true);
        }
        this[role] = parseInt(model.query('v'));
        pmodel.set('time', this.genValueStr('time'));
    }
    showPicker(dom, model, module, e, el) {
        let data = model.query(this.extraDataName);
        if (data) {
            if (data.show) {
                return;
            }
            data.show = true;
        }
        let pDom = dom.tagName === 'input' ? dom.getParent(module) : dom;
        this.setValue(module, model.query(this.dataName));
        model.set('show', true);
        let height = el.offsetHeight;
        let y = e.clientY + el.offsetHeight - e.offsetY;
        UITool.adjustPosAndSize(module, this.listKey, e.clientX, y, height, null, false);
    }
    setTimeSelect(module) {
        let me = this;
        let model = module.getModel(this.pickerModelId);
        let data = [this.hour, this.minute, this.second, this.msecond];
        ['hours', 'minutes', 'seconds', 'mseconds'].forEach((item, i) => {
            let datas = model.query(item);
            if (!datas) {
                return;
            }
            for (let d of datas) {
                if (d.selected) {
                    d.selected = false;
                    break;
                }
            }
            datas[data[i]].selected = true;
        });
        setTimeout(scroll, 0);
        function scroll() {
            let uidom = me.element;
            let timeCt;
            if (uidom.children.length === 1) {
                setTimeout(scroll, 0);
                return;
            }
            if (me.type === 'datetime') {
                timeCt = uidom.children[1].children[0].children[1].children[1];
            }
            else if (me.type === 'time') {
                timeCt = uidom.children[1].children[0].children[0].children[1];
            }
            data.forEach((item, i) => {
                let el = module.getNode(timeCt.children[i].key);
                el.scrollTo(0, data[i] * 30);
            });
        }
    }
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
        let retValue;
        switch (type || this.type) {
            case 'datetime':
                retValue = [this.year, this.month < 10 ? '0' + this.month : this.month, this.date < 10 ? '0' + this.date : this.date].join('-') +
                    ' ' +
                    [this.hour < 10 ? '0' + this.hour : this.hour, this.minute < 10 ? '0' + this.minute : this.minute, this.second < 10 ? '0' + this.second : this.second].join(':');
                break;
            case 'time':
                retValue = [this.hour < 10 ? '0' + this.hour : this.hour, this.minute < 10 ? '0' + this.minute : this.minute, this.second < 10 ? '0' + this.second : this.second].join(':');
                break;
            default:
                retValue = [this.year, this.month < 10 ? '0' + this.month : this.month, this.date < 10 ? '0' + this.date : this.date].join('-');
        }
        if (this.showMs && this.type !== 'date') {
            let v;
            if (this.msecond < 10) {
                v = '00' + this.msecond;
            }
            else if (this.msecond < 100) {
                v = '0' + this.msecond;
            }
            else {
                v = this.msecond;
            }
            retValue += '.' + v;
        }
        return retValue;
    }
}
nodom.PluginManager.add('UI-DATETIME', UIDatetime);
class UIDialog extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-DIALOG';
        let rootDom = new nodom.Element();
        if (params) {
            let panel = new UIPanel(params);
            this.generate(rootDom, panel);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom, panel) {
        const me = this;
        this.dataName = '$ui_dialog_' + nodom.Util.genId();
        rootDom.addClass('nd-dialog');
        let panelDom = panel.element;
        rootDom.setProp('name', panelDom.getProp('name'));
        this.autoOpen = panelDom.hasProp('autoopen');
        this.onClose = panelDom.getProp('onclose');
        this.onOpen = panelDom.getProp('onopen');
        panelDom.delProp(['name', 'autoopen']);
        panel.addHeadBtn('cross', () => {
            me.close();
        });
        rootDom.addDirective(new nodom.Directive('show', this.dataName, rootDom));
        panelDom.addClass('nd-dialog-body');
        let coverDom = new nodom.Element('div');
        coverDom.addClass('nd-dialog-cover');
        rootDom.add(coverDom);
        rootDom.add(panelDom);
    }
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        if (this.needPreRender) {
            if (this.autoOpen) {
                this.open();
            }
        }
    }
    open() {
        let module = nodom.ModuleFactory.get(this.moduleId);
        if (module) {
            let model = module.getModel(this.modelId);
            if (model) {
                model.set(this.dataName, true);
            }
            if (this.onOpen) {
                let foo = module.getMethod(this.onOpen);
                if (foo) {
                    nodom.Util.apply(foo, model, [model, module]);
                }
            }
        }
    }
    close() {
        let module = nodom.ModuleFactory.get(this.moduleId);
        if (module) {
            let model = module.getModel(this.modelId);
            if (model) {
                model.set(this.dataName, false);
            }
            if (this.onClose) {
                let foo = module.getMethod(this.onClose);
                if (foo) {
                    nodom.Util.apply(foo, model, [model, module]);
                }
            }
        }
    }
}
nodom.PluginManager.add('UI-DIALOG', UIDialog);
class UIFile extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-FILE';
        this.state = 0;
        this.maxCount = 1;
        this.count = 0;
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['valuefield', 'displayfield', 'urlfield', 'multiple|bool', 'filetype', 'maxcount|number', 'uploadurl', 'deleteurl', 'uploadname'], ['valueField', 'displayField', 'urlField', 'multiple', 'fileType', 'maxCount', 'uploadUrl', 'deleteUrl', 'uploadName'], [null, null, '', null, '', 1, null, '', 'file']);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'span';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        rootDom.addClass('nd-file');
        this.extraDataName = '$ui_file_' + nodom.Util.genId();
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
            rootDom.events.delete('change');
        }
        if (!this.multiple) {
            this.maxCount = 1;
        }
        rootDom.children = [this.genShowDom(), this.genUploadDom()];
        rootDom.plugin = this;
        return rootDom;
    }
    genUploadDom() {
        const me = this;
        let uploadDom = new nodom.Element('div');
        uploadDom.addClass('nd-file-uploadct');
        new nodom.Directive('show', this.dataName + '.length<' + this.maxCount, uploadDom);
        let fDom = new nodom.Element('input');
        fDom.setProp('type', 'file');
        fDom.addClass('nd-file-input');
        fDom.addEvent(new nodom.NodomEvent('change', (dom, model, module, e, el) => {
            if (!el.files) {
                return;
            }
            model.set(me.extraDataName + '.state', 1);
            model.set(me.extraDataName + '.uploading', NUITipWords.uploading);
            let form = new FormData();
            for (let f of el.files) {
                form.append(me.uploadName, f);
            }
            nodom.request({
                url: me.uploadUrl,
                method: 'POST',
                params: form,
                header: {
                    'Content-Type': 'multipart/form-data'
                },
                type: 'json'
            }).then((r) => {
                model.set(me.extraDataName + '.state', 0);
                model.query(me.dataName).push(r);
            });
        }));
        let uploadingDom = new nodom.Element('div');
        uploadingDom.addClass('nd-file-uploading');
        let span1 = new nodom.Element('span');
        span1.addClass('nd-file-add');
        new nodom.Directive('show', this.extraDataName + '.state==0', span1);
        uploadingDom.add(span1);
        let span2 = new nodom.Element('span');
        span2.addClass('nd-file-progress');
        new nodom.Directive('show', this.extraDataName + '.state==1', span2);
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression((this.extraDataName + '.uploading') || NUITipWords.uploading)];
        span2.add(txt);
        uploadingDom.add(span2);
        uploadDom.add(uploadingDom);
        uploadDom.add(fDom);
        return uploadDom;
    }
    genShowDom() {
        const me = this;
        let ctDom = new nodom.Element('div');
        ctDom.addClass('nd-file-showct');
        new nodom.Directive('repeat', this.dataName, ctDom);
        let showDom = new nodom.Element('a');
        showDom.addClass('nd-file-content');
        showDom.setProp('target', 'blank');
        let expr;
        if (this.urlField !== '') {
            expr = new nodom.Expression(this.urlField);
            showDom.setProp('href', expr, true);
        }
        else {
            expr = new nodom.Expression(this.displayField);
        }
        if (this.fileType === 'image') {
            let img = new nodom.Element('img');
            img.setProp('src', expr, true);
            showDom.add(img);
        }
        else {
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(this.displayField)];
            showDom.add(txt);
        }
        ctDom.add(showDom);
        let delDom = new nodom.Element('b');
        delDom.addClass('nd-file-del');
        ctDom.add(delDom);
        delDom.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            let params = {};
            let id = model.query(me.valueField);
            params[me.valueField] = id;
            if (this.deleteUrl !== '') {
                nodom.request({
                    url: me.deleteUrl,
                    params: params
                }).then((r) => {
                    me.removeFile(module, id);
                });
            }
            else {
                me.removeFile(module, id);
            }
        }));
        return ctDom;
    }
    removeFile(module, id) {
        let pm = module.getModel(this.modelId);
        let rows = pm.query(this.dataName);
        if (Array.isArray(rows)) {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i][this.valueField] === id) {
                    rows.splice(i, 1);
                    break;
                }
            }
        }
    }
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        if (this.needPreRender) {
            let model = module.getModel(this.modelId);
            if (model) {
                model.set(this.extraDataName, {
                    state: 0,
                    uploading: false
                });
            }
        }
    }
    reset(module) {
        let model = module.getModel(this.modelId);
        if (model) {
            model.set(this.extraDataName, {
                state: 0,
                uploading: false
            });
        }
    }
}
nodom.PluginManager.add('UI-FILE', UIFile);
class UIForm extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-FORM';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['labelwidth|number'], ['labelWidth'], [100]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'form';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        rootDom.addClass('nd-form');
        for (let c of rootDom.children) {
            if (c.tagName !== 'ROW') {
                continue;
            }
            c.tagName = 'DIV';
            c.addClass('nd-form-row');
            if (c.children) {
                for (let c1 of c.children) {
                    if (c1.tagName !== 'ITEM') {
                        continue;
                    }
                    c1.tagName = 'DIV';
                    c1.addClass('nd-form-item');
                    if (c1.children) {
                        for (let c2 of c1.children) {
                            if (c2.tagName === 'LABEL') {
                                c2.assets.set('style', 'width:' + this.labelWidth + 'px');
                            }
                            if (c2.tagName === 'UNIT') {
                                c2.tagName = 'span';
                                c2.addClass('nd-form-item-unit');
                            }
                        }
                    }
                }
            }
        }
    }
}
nodom.PluginManager.add('UI-FORM', UIForm);
class UILayout extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-LAYOUT';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        rootDom.addClass('nd-layout');
        this.extraDataName = '$ui_layout_' + nodom.Util.genId();
        let middleCt = new nodom.Element();
        middleCt.addClass('nd-layout-middle');
        middleCt.tagName = 'DIV';
        let items = {};
        let locs = ['north', 'west', 'center', 'east', 'south'];
        for (let i = 0; i < rootDom.children.length; i++) {
            let item = rootDom.children[i];
            if (!item.tagName) {
                continue;
            }
            for (let l of locs) {
                if (item.hasProp(l)) {
                    item.addClass('nd-layout-' + l);
                    items[l] = item;
                    if (l === 'west') {
                        this.handleEastAndWest(item, 0);
                    }
                    else if (l === 'east') {
                        this.handleEastAndWest(item, 1);
                    }
                    break;
                }
            }
        }
        rootDom.children = [];
        if (items['north']) {
            rootDom.children.push(items['north']);
        }
        if (items['west']) {
            middleCt.children.push(items['west']);
        }
        if (items['center']) {
            middleCt.children.push(items['center']);
        }
        if (items['east']) {
            middleCt.children.push(items['east']);
        }
        rootDom.children.push(middleCt);
        if (items['south']) {
            rootDom.children.push(items['south']);
        }
    }
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        if (this.needPreRender) {
            let model = module.getModel(dom.modelId);
            model.set(this.extraDataName, {
                openWest: true,
                openEast: true,
                westWidth: 0,
                eastWidth: 0
            });
        }
    }
    handleEastAndWest(dom, loc) {
        const me = this;
        if (dom.hasProp('title') || dom.hasProp('allowmin')) {
            let header = new nodom.Element('div');
            header.addClass('nd-layout-header');
            dom.children.unshift(header);
            let title;
            if (dom.hasProp('title')) {
                title = new nodom.Element('div');
                title.addClass('nd-layout-title');
                let txt = new nodom.Element();
                txt.textContent = dom.getProp('title');
                title.add(txt);
                header.add(title);
            }
            let icon;
            if (dom.hasProp('allowmin')) {
                icon = new nodom.Element('b');
                if (loc === 1) {
                    if (title) {
                        title.addDirective(new nodom.Directive('show', this.extraDataName + '.openEast', title));
                    }
                    icon.addDirective(new nodom.Directive('class', "{'nd-icon-arrow-right':'" + this.extraDataName + ".openEast','nd-icon-arrow-left':'!" + this.extraDataName + ".openEast'}", icon));
                    icon.addEvent(new nodom.NodomEvent('click', (dom, model, module, e, el) => {
                        let data = model.query(me.extraDataName);
                        let eastEl = el.parentNode.parentNode;
                        let compStyle = window.getComputedStyle(eastEl);
                        let width;
                        if (data.openEast) {
                            if (data.eastWidth === 0) {
                                data.eastWidth = compStyle.width;
                            }
                            width = '40px';
                        }
                        else {
                            width = data.eastWidth;
                        }
                        eastEl.style.width = width;
                        data.openEast = !data.openEast;
                    }));
                    header.children.unshift(icon);
                }
                else {
                    if (title) {
                        title.addDirective(new nodom.Directive('show', this.extraDataName + '.openWest', title));
                    }
                    icon.addDirective(new nodom.Directive('class', "{'nd-icon-arrow-left':'" + this.extraDataName + ".openWest','nd-icon-arrow-right':'!" + this.extraDataName + ".openWest'}", icon));
                    icon.addEvent(new nodom.NodomEvent('click', (dom, model, module, e, el) => {
                        let data = model.query(me.extraDataName);
                        let westEl = el.parentNode.parentNode;
                        let compStyle = window.getComputedStyle(westEl);
                        let width;
                        if (data.openWest) {
                            if (data.westWidth === 0) {
                                data.westWidth = compStyle.width;
                            }
                            width = '40px';
                        }
                        else {
                            width = data.westWidth;
                        }
                        westEl.style.width = width;
                        data.openWest = !data.openWest;
                    }));
                    header.add(icon);
                }
            }
        }
    }
}
nodom.PluginManager.add('UI-LAYOUT', UILayout);
class UIList extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-LIST';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['valuefield', 'displayfield', 'disablefield', 'listfield', 'type', 'itemclick', 'itemwidth|number', 'multiselect|bool'], ['valueField', 'displayField', 'disableName', 'listField', 'type', 'clickEvent', 'itemWidth', 'multiSelect'], ['', '', '', null, 'row', '', 0, null]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        let me = this;
        this.extraDataName = '$ui_list_' + nodom.Util.genId();
        rootDom.addDirective(new nodom.Directive('model', this.extraDataName, rootDom));
        if (this.type === 'row') {
            rootDom.addClass('nd-list');
        }
        else {
            rootDom.addClass('nd-list-horizontal');
        }
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
        }
        let itemDom;
        for (let c of rootDom.children) {
            if (!c.tagName) {
                continue;
            }
            itemDom = c;
            break;
        }
        if (!itemDom) {
            itemDom = new nodom.Element('div');
            if (this.displayField !== '') {
                let txt = new nodom.Element();
                txt.expressions = [new nodom.Expression(this.displayField)];
                itemDom.add(txt);
            }
        }
        itemDom.addClass('nd-list-item');
        itemDom.addDirective(new nodom.Directive('repeat', 'datas', itemDom));
        itemDom.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            if (me.disableName !== '' && model.query(me.disableName)) {
                return;
            }
            me.setValue(module, model);
        }));
        if (this.type === 'row') {
            let item = new nodom.Element('div');
            item.children = itemDom.children;
            item.addClass('nd-list-itemcontent');
            let icon = new nodom.Element('b');
            icon.addClass('nd-list-icon');
            itemDom.children = [item, icon];
        }
        if (this.disableName !== '') {
            itemDom.addDirective(new nodom.Directive('class', "{'nd-list-item-active':'selected','nd-list-item-disable':'" + this.disableName + "'}", itemDom));
        }
        else {
            itemDom.addDirective(new nodom.Directive('class', "{'nd-list-item-active':'selected'}", itemDom));
        }
        if (this.clickEvent) {
            itemDom.addEvent(new nodom.NodomEvent('click', this.clickEvent));
        }
        rootDom.children = [itemDom];
    }
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        let pmodel;
        let model;
        if (this.needPreRender) {
            pmodel = module.getModel(this.modelId);
            pmodel.set(this.extraDataName, {
                datas: []
            }).id;
        }
        if (!pmodel) {
            pmodel = module.getModel(this.modelId);
        }
        if (!model) {
            model = pmodel.get(this.extraDataName);
        }
        let data = model.data;
        if (this.listField && data.datas.length === 0 && pmodel.data[this.listField]) {
            let valueArr;
            if (this.dataName) {
                let value = pmodel.query(this.dataName);
                if (value && value !== '') {
                    valueArr = value.toString().split(',');
                }
            }
            let rows = pmodel.query(this.listField);
            if (rows && Array.isArray(rows)) {
                rows = nodom.Util.clone(rows);
                if (this.valueField !== '') {
                    for (let d of rows) {
                        if (valueArr && valueArr.includes(d[this.valueField] + '')) {
                            d.selected = true;
                        }
                        else {
                            d.selected = false;
                        }
                    }
                }
                model.set('datas', rows);
                this.setValue(module);
            }
        }
    }
    setValue(module, model) {
        let pmodel = module.getModel(this.modelId);
        let model1 = pmodel.get(this.extraDataName);
        let rows = model1.data['datas'];
        let valArr = [];
        if (this.multiSelect) {
            if (model) {
                model.set('selected', !model.data.selected);
            }
            if (this.valueField !== '' && this.dataName) {
                for (let d of rows) {
                    if (d.selected) {
                        valArr.push(d[this.valueField]);
                    }
                }
                pmodel.set(this.dataName, valArr.join(','));
            }
        }
        else {
            if (model) {
                for (let d of rows) {
                    if (d.selected) {
                        d.selected = false;
                        break;
                    }
                }
                model.set('selected', !model.data.selected);
            }
            for (let d of rows) {
                if (d.selected) {
                    if (this.valueField !== '' && this.dataName) {
                        pmodel.set(this.dataName, d[this.valueField]);
                    }
                    break;
                }
            }
        }
    }
}
nodom.PluginManager.add('UI-LIST', UIList);
class UIListTransfer extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-LISTTRANSFER';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['valuefield', 'displayfield', 'listfield'], ['valueField', 'displayField', 'listField']);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        let me = this;
        this.extraDataName = '$ui_listtransfer_' + nodom.Util.genId();
        rootDom.addDirective(new nodom.Directive('model', this.extraDataName, rootDom));
        rootDom.addClass('nd-listtransfer');
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
        }
        let listDom = new nodom.Element('div');
        listDom.addClass('nd-list');
        let itemDom;
        for (let c of rootDom.children) {
            if (!c.tagName) {
                continue;
            }
            itemDom = c;
            break;
        }
        if (!itemDom) {
            itemDom = new nodom.Element('div');
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(this.displayField)];
            itemDom.add(txt);
        }
        itemDom.addClass('nd-list-item');
        itemDom.addDirective(new nodom.Directive('repeat', 'datas', itemDom, "select:value:{isValue:false}"));
        itemDom.addDirective(new nodom.Directive('class', "{'nd-list-item-active':'selected'}", itemDom));
        itemDom.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            model.set('selected', !model.data.selected);
        }));
        let item = new nodom.Element('div');
        item.children = itemDom.children;
        item.addClass('nd-list-itemcontent');
        let icon = new nodom.Element('b');
        icon.addClass('nd-list-icon');
        itemDom.children = [item, icon];
        listDom.children = [itemDom];
        let listDom1 = listDom.clone(true);
        listDom1.children[0].getDirective('repeat').filters = [new nodom.Filter("select:value:{isValue:true}")];
        let btnGrp = new nodom.Element('div');
        btnGrp.addClass('nd-listtransfer-btngrp');
        let btn1 = new nodom.Element('b');
        btn1.addClass('nd-listtransfer-right2');
        let btn2 = new nodom.Element('b');
        btn2.addClass('nd-listtransfer-right1');
        let btn3 = new nodom.Element('b');
        btn3.addClass('nd-listtransfer-left1');
        let btn4 = new nodom.Element('b');
        btn4.addClass('nd-listtransfer-left2');
        btnGrp.children = [btn1, btn2, btn3, btn4];
        btn1.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            me.transfer(module, 1, true);
        }));
        btn2.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            me.transfer(module, 1, false);
        }));
        btn3.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            me.transfer(module, 2, false);
        }));
        btn4.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            me.transfer(module, 2, true);
        }));
        rootDom.children = [listDom, btnGrp, listDom1];
        rootDom.plugin = this;
        return rootDom;
    }
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        let pmodel = module.getModel(this.modelId);
        if (this.needPreRender) {
            let model = pmodel.set(this.extraDataName, {
                datas: []
            });
            this.extraModelId = model.id;
            let datas = pmodel.query(this.listField);
            model.set('datas', nodom.Util.clone(datas));
        }
        this.setValueSelected(module);
    }
    setValueSelected(module) {
        let pmodel = module.getModel(this.modelId);
        let model = module.getModel(this.extraModelId);
        let value = pmodel.query(this.dataName);
        let va = value.split(',');
        let rows = model.query('datas');
        for (let d of rows) {
            if (va && va.includes(d[this.valueField] + '')) {
                d.isValue = true;
            }
            else {
                d.isValue = false;
            }
        }
        model.set('datas', rows);
    }
    transfer(module, direction, all) {
        let model = module.getModel(this.extraModelId);
        let datas = model.data.datas;
        let isValue = direction === 1 ? true : false;
        for (let d of datas) {
            if (all) {
                d.isValue = isValue;
            }
            else if (d.selected) {
                d.isValue = isValue;
            }
            d.selected = false;
        }
        this.updateValue(module);
    }
    updateValue(module) {
        let pmodel = module.getModel(this.modelId);
        let model = module.getModel(this.extraModelId);
        let a = [];
        for (let d of model.data.datas) {
            if (d.isValue) {
                a.push(d[this.valueField]);
            }
        }
        pmodel.set(this.dataName, a.join(','));
    }
}
nodom.PluginManager.add('UI-LISTTRANSFER', UIListTransfer);
class UIMenu extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-MENU';
        this.menuHeight = 30;
        this.direction = 0;
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['popup|bool', 'position', 'listfield', 'maxlevel|number', 'menuwidth|number'], ['popupMenu', 'position', 'listField', 'maxLevel', 'menuWidth'], [null, 'top', null, 3, 150]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        let me = this;
        this.activeName = '$nui_menu_' + nodom.Util.genId();
        this.menuStyleName = '$nui_menu_' + nodom.Util.genId();
        rootDom.addClass('nd-menu');
        if (this.position === 'left' || this.position === 'right') {
            this.popupMenu = true;
        }
        let menuNode;
        for (let i = 0; i < rootDom.children.length; i++) {
            if (rootDom.children[i].tagName) {
                menuNode = rootDom.children[i];
                menuNode.addClass('nd-menu-node');
                let b = new nodom.Element('b');
                menuNode.children.unshift(b);
                if (menuNode.hasProp('icon')) {
                    b.setProp('class', ['nd-icon-', new nodom.Expression(menuNode.getProp('icon'))], true);
                    menuNode.delProp('icon');
                }
                break;
            }
        }
        rootDom.children = [];
        let parentCt = new nodom.Element('div');
        parentCt.addClass('nd-menu-subct');
        if (this.popupMenu) {
            if (this.position === 'left' || this.position === 'right') {
                rootDom.addClass('nd-menu-left');
                rootDom.addEvent(new nodom.NodomEvent('mouseleave', (dom, model, module, e) => {
                    dom.assets.set('style', 'width:30px');
                }));
                parentCt.addEvent(new nodom.NodomEvent('mouseenter', (dom, model, module, e) => {
                    dom.assets.set('style', 'width:' + me.menuWidth + 'px');
                }));
            }
            else {
                rootDom.addClass('nd-menu-popup');
                parentCt.addClass('nd-menu-first');
                parentCt.setProp('style', new nodom.Expression(this.menuStyleName), true);
                parentCt.addEvent(new nodom.NodomEvent('mouseleave', (dom, model, module, e) => {
                    let parent = dom.getParent(module);
                    let pmodel = module.getModel(parent.modelId);
                    pmodel.set(me.activeName, false);
                    if (dom.hasClass('nd-menu-first')) {
                        this.direction = 0;
                    }
                }));
                parentCt.addDirective(new nodom.Directive('show', this.activeName, parentCt));
            }
        }
        else {
            parentCt.addClass('nd-menu-first-nopop');
        }
        rootDom.add(parentCt);
        for (let i = 0; i < this.maxLevel; i++) {
            let itemCt = new nodom.Element('div');
            itemCt.directives.push(new nodom.Directive('repeat', this.listField, itemCt));
            itemCt.addClass('nd-menu-nodect');
            let item = menuNode.clone(true);
            itemCt.add(item);
            itemCt.setProp('level', i + 1);
            if (this.popupMenu || i > 0) {
                let icon1 = new nodom.Element('b');
                icon1.addDirective(new nodom.Directive('class', "{'nd-menu-subicon':'" + this.listField + "&&" + this.listField + ".length>0'}", icon1));
                item.add(icon1);
            }
            let openClose = this.initOpenAndClose();
            itemCt.addEvent(openClose[0]);
            itemCt.addEvent(openClose[1]);
            parentCt.add(itemCt);
            let subCt = new nodom.Element('div');
            subCt.addClass('nd-menu-subct');
            subCt.addEvent(new nodom.NodomEvent('mouseleave', (dom, model, module, e) => {
                let parent = dom.getParent(module);
                let pmodel = module.getModel(parent.modelId);
                pmodel.set(me.activeName, false);
            }));
            subCt.setProp('style', new nodom.Expression(this.menuStyleName), true);
            subCt.addDirective(new nodom.Directive('show', this.activeName, subCt));
            itemCt.add(subCt);
            parentCt = subCt;
        }
        rootDom.delProp(['listField', 'width', , 'maxlevels']);
    }
    beforeRender(module, uidom) {
        let me = this;
        super.beforeRender(module, uidom);
        if (this.needPreRender && this.popupMenu && this.position !== 'left' && this.position !== 'right') {
            UIEventRegister.addEvent('mousedown', module.id, uidom.key, (module, dom, inOrOut, e) => {
                if (e.button !== 2) {
                    return;
                }
                let x = e.clientX;
                let w = me.menuWidth;
                let model = module.getModel(uidom.modelId);
                let rows = model.query(me.listField);
                if (rows && rows.length > 0) {
                    let h = rows.length * me.menuHeight;
                    let loc = this.cacPos(null, e.clientX, e.clientY, this.menuWidth, h);
                    model.set(me.menuStyleName, 'width:' + me.menuWidth + 'px;left:' + loc[0] + 'px;top:' + loc[1] + 'px');
                    model.set(me.activeName, true);
                }
            });
        }
    }
    initOpenAndClose() {
        let me = this;
        let openEvent = new nodom.NodomEvent('mouseenter', (dom, model, module, e, el) => {
            if (model) {
                let rows = model.query(this.listField);
                if (!rows || rows.length === 0) {
                    return;
                }
                let firstNopop = dom.getProp('level') === 1 && !me.popupMenu;
                let h = rows.length * this.menuHeight;
                let w = this.menuWidth;
                let x, y;
                if (firstNopop) {
                    x = e.clientX - e.offsetX;
                    y = e.clientY - e.offsetY + h;
                }
                else {
                    x = e.clientX - e.offsetX + w;
                    y = e.clientY - e.offsetY;
                }
                let loc = this.cacPos(dom, x, y, w, h, el);
                model.set(this.menuStyleName, 'width:' + me.menuWidth + 'px;left:' + loc[0] + 'px;top:' + loc[1] + 'px');
                model.set(this.activeName, true);
            }
        });
        let closeEvent = new nodom.NodomEvent('mouseleave', (dom, model, module, e, el) => {
            if (model) {
                let rows = model.query(this.listField);
                if (rows && rows.length > 0) {
                    model.set(me.activeName, false);
                    if (this.direction === 1) {
                        let level = dom.getProp('level');
                        if (me.popupMenu) {
                            if (level === 2) {
                                this.direction = 0;
                            }
                        }
                        else if (level === 1) {
                            this.direction = 0;
                        }
                    }
                }
            }
        });
        return [openEvent, closeEvent];
    }
    cacPos(dom, x, y, w, h, el) {
        let firstNopop = dom && !this.popupMenu && dom.getProp('level') === 1;
        let widthOut = x + w > window.innerWidth;
        let heightOut = y + h > window.innerHeight;
        let top = dom ? 0 : y;
        let left = dom ? 0 : x;
        if (firstNopop) {
            top = this.menuHeight;
        }
        else if (heightOut) {
            if (dom) {
                top = -h + this.menuHeight;
            }
            else {
                top = window.innerHeight - h;
            }
        }
        if (widthOut) {
            this.direction = 1;
        }
        if (this.direction === 1) {
            if (firstNopop) {
                if (widthOut) {
                    left = el.offsetWidth - w;
                }
            }
            else if (dom) {
                left -= w + 1;
            }
            else if (widthOut) {
                left -= w + 3;
            }
        }
        else {
            if (dom && !firstNopop) {
                left = w;
            }
        }
        return [left, top + 1];
    }
}
nodom.PluginManager.add('UI-MENU', UIMenu);
class UIPagination extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-PAGINATION';
        this.minPage = 0;
        this.maxPage = 0;
        this.pageCount = 0;
        this.recordCount = 0;
        this.params = {};
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['totalname', 'pagesize|number', 'currentpage|number', 'showtotal|bool', 'showgo|bool', 'shownum|number', 'sizechange|array|number', 'steps|number', 'dataurl', 'pagename', 'sizename', 'onchange', 'onreq', 'onbeforereq'], ['totalName', 'pageSize', 'currentPage', 'showTotal', 'showGo', 'showNum', 'pageSizeData', 'steps', 'dataUrl', 'pageName', 'sizeName', 'onChange', 'onReq', 'onBeforeReq'], ['total', 10, 1, null, null, 10, [], 0, '', 'page', 'size', '', '', '']);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        let me = this;
        if (me.steps === 0) {
            me.steps = me.pageSize;
        }
        rootDom.addClass('nd-pagination');
        rootDom.children = [];
        this.extraDataName = '$ui_pagination_' + nodom.Util.genId();
        rootDom.addDirective(new nodom.Directive('model', this.extraDataName, rootDom));
        if (this.showTotal) {
            let totalDom = new nodom.Element('div');
            let txt = new nodom.Element();
            txt.textContent = NUITipWords.total;
            totalDom.add(txt);
            let span = new nodom.Element('span');
            span.addClass('nd-pagination-total');
            txt = new nodom.Element();
            txt.expressions = [new nodom.Expression('total')];
            span.add(txt);
            totalDom.add(span);
            txt = new nodom.Element();
            txt.textContent = NUITipWords.record;
            totalDom.add(txt);
            rootDom.add(totalDom);
        }
        if (this.pageSizeData && this.pageSizeData.length > 0) {
            let datas = [];
            for (let d of this.pageSizeData) {
                datas.push({
                    value: d,
                    text: d + NUITipWords.record + '/' + NUITipWords.page
                });
            }
            this.pageSizeDatas = datas;
            rootDom.add(new UISelect({
                dataName: 'pageSize',
                listField: 'sizeData',
                displayField: 'text',
                valueField: 'value'
            }).element);
        }
        let pageCt = new nodom.Element('div');
        pageCt.addClass('nd-pagination-pagect');
        let left1 = new nodom.Element('b');
        left1.addClass('nd-pagination-leftarrow1');
        left1.addDirective(new nodom.Directive('class', "{'nd-pagination-disable':'btnAllow===1'}", left1));
        pageCt.add(left1);
        let left = new nodom.Element('b');
        left.addClass('nd-pagination-leftarrow');
        left.addDirective(new nodom.Directive('class', "{'nd-pagination-disable':'btnAllow===1'}", left));
        pageCt.add(left);
        let page = new nodom.Element('span');
        page.addClass('nd-pagination-page');
        page.addDirective(new nodom.Directive('repeat', 'pages', page));
        page.addDirective(new nodom.Directive('class', "{'nd-pagination-active':'active'}", page), true);
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression('no')];
        page.add(txt);
        pageCt.add(page);
        let right = new nodom.Element('b');
        right.addClass('nd-pagination-rightarrow');
        right.addDirective(new nodom.Directive('class', "{'nd-pagination-disable':'btnAllow===2'}", right));
        pageCt.add(right);
        let right1 = new nodom.Element('b');
        right1.addClass('nd-pagination-rightarrow1');
        right1.addDirective(new nodom.Directive('class', "{'nd-pagination-disable':'btnAllow===2'}", right1));
        pageCt.add(right1);
        rootDom.add(pageCt);
        page.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            let model1 = module.getModel(this.extraModelId);
            model1.set('pageNo', model.data['no']);
        }));
        left.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            if (dom.hasClass('nd-pagination-disable')) {
                return;
            }
            if (this.currentPage === 1) {
                return;
            }
            model.set('pageNo', --this.currentPage);
        }));
        right.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            if (dom.hasClass('nd-pagination-disable')) {
                return;
            }
            if (this.currentPage === this.pageCount) {
                return;
            }
            model.set('pageNo', ++this.currentPage);
        }));
        left1.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            if (dom.hasClass('nd-pagination-disable')) {
                return;
            }
            let page = me.currentPage - me.steps;
            if (page < 1) {
                page = 1;
            }
            model.set('pageNo', page);
        }));
        right1.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            if (dom.hasClass('nd-pagination-disable')) {
                return;
            }
            let page = me.currentPage + me.steps;
            if (page > this.pageCount) {
                page = this.pageCount;
            }
            model.set('pageNo', page);
        }));
        if (this.showGo) {
            let goDom = new nodom.Element('div');
            goDom.addClass('nd-pagination-go');
            let txt = new nodom.Element();
            txt.textContent = NUITipWords.NO;
            goDom.add(txt);
            let input = new nodom.Element('input');
            input.setProp('type', 'number');
            input.addDirective(new nodom.Directive('field', 'pageNo', input));
            input.setProp('value', new nodom.Expression('pageNo'), true);
            goDom.add(input);
            txt = new nodom.Element();
            txt.textContent = NUITipWords.page;
            goDom.add(txt);
            rootDom.add(goDom);
        }
        rootDom.plugin = this;
        return rootDom;
    }
    cacMinMax(module) {
        let step = this.showNum / 2 | 0;
        this.minPage = this.currentPage - step;
        this.maxPage = this.currentPage + step;
        if (this.minPage < 1) {
            this.minPage = 1;
        }
        if (this.minPage > this.pageCount) {
            this.minPage = this.pageCount;
        }
        if (this.maxPage < 1) {
            this.maxPage = 1;
        }
        if (this.maxPage > this.pageCount) {
            this.maxPage = this.pageCount;
        }
        if (this.pageCount > this.showNum) {
            let d = this.maxPage + 1 - this.minPage - this.showNum;
            if (d < 0) {
                if (this.maxPage === this.pageCount) {
                    this.minPage += d;
                }
                else {
                    this.maxPage -= d;
                }
            }
            else if (d > 0) {
                if (this.maxPage === this.pageCount) {
                    this.minPage += d;
                }
                else {
                    this.maxPage -= d;
                }
            }
        }
    }
    addWatch(pmodel, model) {
        model.watch('pageNo', (module, field, value) => {
            if (typeof value === 'string') {
                value = parseInt(value);
            }
            this.currentPage = value;
            this.cacMinMax(module);
            this.changeParams(module);
            this.doChangeEvent(module);
            this.doReq(module);
        });
        model.watch('pageSize', (module, field, value) => {
            if (typeof value === 'string') {
                value = parseInt(value);
            }
            this.pageSize = value;
            this.pageCount = Math.ceil(this.recordCount / this.pageSize);
            this.cacMinMax(module);
            this.changeParams(module);
            this.doChangeEvent(module);
            this.doReq(module);
        });
        model.watch('total', (module, field, value) => {
            let old = this.pageCount;
            this.recordCount = value;
            this.pageCount = Math.ceil(this.recordCount / this.pageSize);
            this.cacMinMax(module);
            this.changeParams(module);
            if (this.currentPage > this.pageCount) {
                model.set('pageNo', this.pageCount);
            }
            if (this.pageCount > 0 && old === 0) {
                model.set('pageNo', 1);
            }
            pmodel.data[this.totalName] = value;
        });
        pmodel.watch(this.totalName, (module, field, value) => {
            if (typeof value === 'string') {
                value = parseInt(value);
            }
            model.set('total', value);
        });
    }
    beforeRender(module, uidom) {
        super.beforeRender(module, uidom);
        this.handleInit(uidom, module);
    }
    changeParams(module) {
        if (!module) {
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        let btnAllow = 0;
        let pageArr = [];
        for (let i = this.minPage; i <= this.maxPage; i++) {
            pageArr.push({
                no: i,
                active: i === this.currentPage ? true : false
            });
        }
        if (this.currentPage === 1) {
            btnAllow = 1;
        }
        else if (this.currentPage === this.pageCount) {
            btnAllow = 2;
        }
        let model = module.getModel(this.extraModelId);
        model.set('btnAllow', btnAllow);
        model.set('pages', pageArr);
    }
    handleInit(dom, module) {
        if (!this.needPreRender) {
            return;
        }
        let model = module.getModel(dom.modelId);
        let total = model.query(this.totalName) || 0;
        let model1 = model.set(this.extraDataName, {
            total: total,
            pageNum: 0,
            pageNo: 0,
            pageSize: this.pageSize,
            btnAllow: 0,
            pages: [],
            sizeData: this.pageSizeDatas || [10, 20, 30, 50]
        });
        this.pageCount = Math.ceil(total / this.pageSize);
        this.cacMinMax(module);
        this.extraModelId = model1.id;
        this.addWatch(model, model1);
        if (this.pageCount > 0 || this.dataUrl !== '') {
            this.setPage(1);
        }
    }
    setTotal(value) {
        let module = nodom.ModuleFactory.get(this.moduleId);
        let model = module.getModel(this.modelId);
        model.set(this.extraDataName + '.total', value);
        this.changeParams(module);
    }
    getTotal() {
        let model = this.getModel();
        if (model !== null) {
            model.query(this.extraDataName + '.total');
        }
        return 0;
    }
    getTotalName() {
        return this.totalName;
    }
    setPage(value) {
        let model = this.getModel();
        if (model !== null) {
            model.set(this.extraDataName + '.pageNo', value);
        }
    }
    getPage() {
        let model = this.getModel();
        if (model !== null) {
            return model.query(this.extraDataName + '.pageNo');
        }
        return 0;
    }
    setPageSize(value) {
        this.pageSize = value;
    }
    getPageSize() {
        return this.pageSize || 0;
    }
    setParam(name, value) {
        if (typeof name === 'object') {
            for (let p in name) {
                this.params[p] = name[p];
            }
        }
        else {
            this.params[name] = value;
        }
    }
    getParam(name) {
        return this.params[name];
    }
    removeParam(name) {
        if (Array.isArray(name)) {
            for (let n of name) {
                delete this.params[n];
            }
        }
        else {
            delete this.params[name];
        }
    }
    doReq(module) {
        if (this.readyReq || this.dataUrl === '') {
            return;
        }
        this.readyReq = true;
        if (!module) {
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        this.doBeforeReqEvent(module);
        let params = nodom.Util.clone(this.params);
        params[this.pageName] = this.currentPage;
        params[this.sizeName] = this.pageSize;
        setTimeout(() => {
            nodom.request({
                url: this.dataUrl,
                params: params,
                type: 'json'
            }).then(r => {
                this.readyReq = false;
                if (!r) {
                    return;
                }
                if (r.total) {
                    this.setTotal(r.total);
                }
                else if (Array.isArray(r)) {
                    this.setTotal(r.length);
                }
                this.doReqEvent(r, module);
            });
        }, 0);
    }
    doChangeEvent(module) {
        if (this.onChange === '') {
            return;
        }
        if (!module) {
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        let foo;
        if (typeof this.onChange === 'string') {
            this.onChange = module.getMethod(this.onChange);
            foo = this.onChange;
        }
        else if (nodom.Util.isFunction(this.onChange)) {
            foo = this.onChange;
        }
        if (foo) {
            foo.apply(this, [module, this.currentPage, this.pageSize]);
        }
    }
    doReqEvent(data, module) {
        if (this.onReq === '') {
            return;
        }
        if (!module) {
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        let foo;
        if (typeof this.onReq === 'string') {
            this.onReq = module.getMethod(this.onReq);
            foo = this.onReq;
        }
        else if (nodom.Util.isFunction(this.onReq)) {
            foo = this.onReq;
        }
        if (foo) {
            foo.apply(this, [module, data]);
        }
    }
    doBeforeReqEvent(module) {
        if (this.onBeforeReq === '') {
            return;
        }
        if (!module) {
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        let foo;
        if (typeof this.onBeforeReq === 'string') {
            this.onBeforeReq = module.getMethod(this.onBeforeReq);
            foo = this.onBeforeReq;
        }
        else if (nodom.Util.isFunction(this.onReq)) {
            foo = this.onBeforeReq;
        }
        if (foo) {
            foo.apply(this, [module, this]);
        }
    }
}
nodom.PluginManager.add('UI-PAGINATION', UIPagination);
class UIPanel extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-PANEL';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['title', 'buttons|array'], ['title', 'buttons'], ['', []]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        rootDom.addClass('nd-panel');
        this.handleBody(rootDom);
        if (this.title && this.title !== '' || this.buttons.length !== 0) {
            if (this.title === '') {
                this.title = 'panel';
            }
            let headerDom = new nodom.Element('div');
            headerDom.addClass('nd-panel-header');
            if (this.title) {
                let titleCt = new nodom.Element('span');
                titleCt.addClass('nd-panel-title');
                titleCt.assets.set('innerHTML', this.title);
                headerDom.add(titleCt);
            }
            let headbarDom = new nodom.Element('div');
            headbarDom.addClass('nd-panel-header-bar');
            this.headerBtnDom = headbarDom;
            headerDom.add(headbarDom);
            rootDom.children.unshift(headerDom);
            for (let btn of this.buttons) {
                let a = btn.split('|');
                this.addHeadBtn(a[0], a[1]);
            }
        }
    }
    handleBody(panelDom) {
        let bodyDom = new nodom.Element('div');
        bodyDom.addClass('nd-panel-body');
        let tbar;
        let btnGrp;
        for (let i = 0; i < panelDom.children.length; i++) {
            let item = panelDom.children[i];
            if (item.plugin) {
                if (item.plugin.tagName === 'UI-TOOLBAR') {
                    tbar = item;
                }
                else if (item.plugin.tagName === 'UI-BUTTONGROUP') {
                    btnGrp = item;
                }
                else {
                    bodyDom.add(item);
                }
            }
            else {
                bodyDom.add(item);
            }
        }
        panelDom.children = [];
        if (tbar) {
            panelDom.add(tbar);
        }
        panelDom.add(bodyDom);
        if (btnGrp) {
            panelDom.add(btnGrp);
        }
    }
    addHeadBtn(icon, handler) {
        let btn = new nodom.Element('b');
        btn.addClass('nd-icon-' + icon);
        btn.addClass('nd-canclick');
        if (this.headerBtnDom) {
            this.headerBtnDom.add(btn);
        }
        if (handler) {
            btn.addEvent(new nodom.NodomEvent('click', handler));
        }
    }
}
nodom.PluginManager.add('UI-PANEL', UIPanel);
class UIRadio extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-RADIO';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['valuefield', 'displayfield', 'listfield', 'itemmargin|number'], ['valueField', 'displayField', 'listField', 'itemMargin'], ['', '', '', 5]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'span';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        rootDom.addClass('nd-radio');
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
        }
        if (this.valueField !== '' && this.displayField !== '' && this.listField !== '') {
            this.checkName = '$ui_radio_' + nodom.Util.genId();
            let item = new nodom.Element('span');
            item.setProp('value', new nodom.Expression(this.valueField), true);
            let icon = new nodom.Element('b');
            icon.addClass('nd-radio-unactive');
            icon.addDirective(new nodom.Directive('class', "{'nd-radio-active':'" + this.checkName + "'}", icon));
            item.add(icon);
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(this.displayField)];
            item.add(txt);
            let directive = new nodom.Directive('repeat', this.listField, item);
            item.addDirective(directive);
            item.assets.set('style', 'margin:0 ' + this.itemMargin + 'px;');
            item.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
                let model1 = module.getModel(this.modelId);
                let datas = model1.query(this.listField);
                if (datas) {
                    for (let d of datas) {
                        d[this.checkName] = false;
                    }
                }
                model.set(this.checkName, true);
                model1.set(this.dataName, dom.getProp('value'));
            }));
            rootDom.children = [item];
        }
        else {
            for (let c of rootDom.children) {
                if (c.tagName) {
                    let icon = new nodom.Element('b');
                    icon.addClass('nd-radio-unactive');
                    icon.addDirective(new nodom.Directive('class', "{'nd-radio-active':'" + this.dataName + "==\"" + c.getProp('value') + "\"'}", icon));
                    c.children.unshift(icon);
                    c.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
                        model.set(this.dataName, dom.getProp('value'));
                    }));
                }
            }
        }
    }
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        let model = module.getModel(this.modelId);
        if (this.checkName) {
            let datas = model.query(this.listField);
            if (datas) {
                for (let d of datas) {
                    if (model.data[this.dataName] == d[this.valueField]) {
                        d[this.checkName] = true;
                    }
                    else {
                        d[this.checkName] = false;
                    }
                }
            }
        }
    }
}
nodom.PluginManager.add('UI-RADIO', UIRadio);
class UIRelationMap extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-RELATIONMAP';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['valuefield|array|1', 'displayfield|array|2', 'listfield|array|2'], ['valueField', 'displayField', 'listField'], [null, null, null]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'table';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        let me = this;
        rootDom.addClass('nd-relationmap');
        this.mapName = '$ui_relationmap_' + nodom.Util.genId();
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
        }
        let rowHead = new nodom.Element('tr');
        rowHead.addClass('nd-relationmap-head');
        rootDom.add(rowHead);
        let td = new nodom.Element('td');
        rowHead.add(td);
        td = new nodom.Element('td');
        td.addDirective(new nodom.Directive('repeat', this.listField[0], td));
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression(this.displayField[0])];
        td.add(txt);
        rowHead.add(td);
        let tr = new nodom.Element('tr');
        tr.addDirective(new nodom.Directive('repeat', '$$' + this.mapName, tr));
        tr.addClass('nd-relationmap-row');
        td = new nodom.Element('td');
        td.addClass('nd-relationmap-head');
        txt = new nodom.Element();
        txt.expressions = [new nodom.Expression('title')];
        td.add(txt);
        tr.add(td);
        td = new nodom.Element('td');
        td.addDirective(new nodom.Directive('repeat', 'cols', td));
        td.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            me.switchValue(module, dom, model);
        }));
        let b = new nodom.Element('b');
        b.addDirective(new nodom.Directive('class', "{'nd-relationmap-active':'active'}", b));
        td.add(b);
        tr.add(td);
        rootDom.children = [rowHead, tr];
    }
    beforeRender(module, uidom) {
        super.beforeRender(module, uidom);
        let model = module.getModel(uidom.modelId);
        let rowData = model.query(this.listField[1]);
        if (!rowData) {
            return;
        }
        let colData = model.query(this.listField[0]);
        if (!colData) {
            return;
        }
        let data = model.query(this.dataName);
        let idRow = this.valueField[1];
        let idCol = this.valueField[0];
        let mapData = [];
        let title;
        for (let d of rowData) {
            let a1 = [];
            let id1 = d[idRow];
            title = d[this.displayField[1]];
            for (let d1 of colData) {
                let active = false;
                if (data && data.length > 0) {
                    for (let da of data) {
                        if (da[idRow] === id1 && da[idCol] === d1[idCol]) {
                            active = true;
                            break;
                        }
                    }
                }
                a1.push({
                    id1: id1,
                    id2: d1[idCol],
                    active: active
                });
            }
            mapData.push({ title: title, cols: a1 });
        }
        module.model.set(this.mapName, mapData);
    }
    switchValue(module, dom, model) {
        let pmodel = module.getModel(this.modelId);
        let data = pmodel.query(this.dataName);
        let id1 = model.data['id1'];
        let id2 = model.data['id2'];
        let active = model.data['active'];
        let o = {};
        o[this.valueField[0]] = id2;
        o[this.valueField[1]] = id1;
        if (!data) {
            if (!active) {
                pmodel.set(this.dataName, [o]);
            }
        }
        else {
            if (!active) {
                data.push(o);
            }
            else {
                for (let i = 0; i < data.length; i++) {
                    let d = data[i];
                    if (d[this.valueField[0]] === id2 && d[this.valueField[1]] === id1) {
                        data.splice(i, 1);
                        break;
                    }
                }
            }
        }
        model.set('active', !active);
    }
}
nodom.PluginManager.add('UI-RELATIONMAP', UIRelationMap);
class UISelect extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-SELECT';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['valuefield', 'displayfield', 'multiselect|bool', 'listfield', 'listwidth|number', 'allowfilter|bool', 'onchange', 'showempty|bool'], ['valueField', 'displayField', 'multiSelect', 'listField', 'listWidth', 'allowFilter', 'onChange', 'showEmpty'], [null, null, null, null, 0, null, '', null]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        let me = this;
        this.extraDataName = '$ui_select_' + nodom.Util.genId();
        rootDom.addClass('nd-select');
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
            rootDom.events.delete('change');
        }
        rootDom.addDirective(new nodom.Directive('model', this.extraDataName, rootDom));
        let listDom = new nodom.Element('div');
        listDom.addClass('nd-select-list');
        if (this.listWidth) {
            listDom.assets.set('style', 'width:' + this.listWidth + 'px');
        }
        listDom.addDirective(new nodom.Directive('show', 'show', listDom));
        let itemDom;
        for (let c of rootDom.children) {
            if (!c.tagName) {
                continue;
            }
            itemDom = c;
            break;
        }
        if (!itemDom) {
            itemDom = new nodom.Element('div');
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(this.displayField)];
            itemDom.add(txt);
        }
        let item = new nodom.Element('div');
        item.children = itemDom.children;
        item.addClass('nd-select-itemcontent');
        itemDom.addClass('nd-select-item');
        let directive = new nodom.Directive('repeat', 'datas', itemDom);
        itemDom.addDirective(directive);
        itemDom.addDirective(new nodom.Directive('class', "{'nd-select-selected':'selected'}", itemDom));
        let icon = new nodom.Element('b');
        icon.addClass('nd-select-itemicon');
        itemDom.children = [item, icon];
        itemDom.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
            let name = this.name || this.dataName;
            let plugin = this.moduleId ? this : module.getPlugin(name);
            if (!this.multiSelect) {
                if (plugin) {
                    this.hideList.apply(plugin);
                }
                else {
                    this.hideList();
                }
            }
            if (plugin) {
                this.select.apply(plugin, [model]);
            }
            else {
                this.select(model);
            }
        }));
        let showDom = new nodom.Element('div');
        showDom.addClass('nd-select-inputct');
        let input = new nodom.Element('input');
        input.addClass('nd-select-show');
        if (this.multiSelect) {
            input.setProp('readonly', true);
        }
        input.setProp('value', new nodom.Expression('display'), true);
        showDom.add(input);
        icon = new nodom.Element('b');
        showDom.addEvent(new nodom.NodomEvent('click', (dom, model, module, e, el) => {
            if (model.data.show) {
                me.hideList(model);
            }
            else {
                model.set('show', true);
                let height = el.offsetHeight;
                let y = e.clientY + el.offsetHeight - e.offsetY;
                UITool.adjustPosAndSize(module, this.listKey, e.clientX, y, height, null, true);
            }
        }));
        if (this.allowFilter) {
            this.filterMethodId = '$$nodom_method_' + nodom.Util.genId();
            let filter = new nodom.Filter(['select', 'func', this.filterMethodId]);
            directive.filters = [filter];
            input.assets.set('readonly', 'true');
            let queryDom = new nodom.Element('input');
            queryDom.addClass('nd-select-search');
            queryDom.addDirective(new nodom.Directive('field', 'query', queryDom));
            queryDom.addDirective(new nodom.Directive('class', "{'nd-select-search-active':'show'}", queryDom));
            showDom.add(queryDom);
        }
        showDom.add(icon);
        listDom.children = [itemDom];
        rootDom.children = [showDom, listDom];
    }
    beforeRender(module, dom) {
        let me = this;
        super.beforeRender(module, dom);
        this.listKey = dom.children[1].key;
        let pmodel;
        let model;
        if (this.needPreRender) {
            pmodel = module.getModel(this.modelId);
            let model = pmodel.set(this.extraDataName, {
                show: false,
                display: '',
                query: '',
                datas: []
            });
            this.extraModelId = model.id;
            module.addMethod(this.filterMethodId, function () {
                let model = this.getModel(me.extraModelId);
                let rows = model.query('datas');
                if (rows) {
                    return rows.filter((item) => {
                        return model.data.query === '' || item[me.displayField].indexOf(model.data.query) !== -1;
                    });
                }
                return [];
            });
            UIEventRegister.addEvent('click', module.id, dom.key, (module, dom, inOrout, e) => {
                let model = module.getModel(me.extraModelId);
                if (!inOrout && model.data.show) {
                    me.hideList(model);
                }
            });
        }
        model = module.getModel(this.extraModelId);
        if (!pmodel) {
            pmodel = module.getModel(this.modelId);
        }
        if (!model) {
            model = module.getModel(this.extraModelId);
        }
        let data = model.data;
        if (this.listField && data.datas.length === 0 && pmodel.data[this.listField]) {
            let rows = pmodel.query(this.listField);
            if (this.showEmpty) {
                let d = {};
                d[this.displayField] = NUITipWords.emptySelect;
                d['selected'] = false;
                rows.unshift(d);
            }
            model.set('datas', rows);
        }
        this.setValue(pmodel.query(this.dataName));
    }
    setValue(value) {
        if (!this.dataName) {
            return;
        }
        if (this.multiSelect && !Array.isArray(value)) {
            value = [value];
        }
        let module = nodom.ModuleFactory.get(this.moduleId);
        let pmodel = module.getModel(this.modelId);
        let value1 = pmodel.query(this.dataName);
        if (value !== value1) {
            pmodel.set(this.dataName, value);
            if (this.onChange !== '') {
                let foo;
                let tp = typeof this.onChange;
                if (tp === 'string') {
                    foo = module.getMethod(this.onChange);
                }
                else if (tp === 'function') {
                    foo = this.onChange;
                }
                if (foo) {
                    foo.apply(null, [pmodel, module, value, this.value]);
                }
            }
        }
        this.value = value;
        this.genSelectedAndDisplay();
    }
    select(model) {
        let v = model.data[this.valueField];
        if (this.multiSelect) {
            if (!this.value) {
                this.value = [];
            }
            if (model.data.___selected) {
                let ind = this.value.indexOf(v);
                if (ind !== -1) {
                    this.value.splice(ind, 1);
                }
            }
            else {
                this.value.push(v);
            }
        }
        else {
            if (!model.data.___selected) {
                this.value = v;
            }
        }
        this.setValue(this.value);
    }
    genSelectedAndDisplay() {
        if (!this.dataName) {
            return;
        }
        let module = nodom.ModuleFactory.get(this.moduleId);
        let model = module.getModel(this.extraModelId);
        let text;
        if (this.multiSelect) {
            let ta = [];
            if (!this.value) {
                return;
            }
            for (let d of model.data.datas) {
                d.___selected = this.value.includes(d[this.valueField]);
                if (d.___selected) {
                    ta.push(d[this.displayField]);
                }
            }
            text = ta.join(',');
        }
        else {
            for (let d of model.data.datas) {
                if (this.value === d[this.valueField]) {
                    text = d[this.displayField];
                    d.___selected = true;
                }
                else {
                    d.___selected = false;
                }
            }
        }
        model.set('display', text);
    }
    hideList(model) {
        if (!model) {
            let module = nodom.ModuleFactory.get(this.moduleId);
            model = module.getModel(this.extraModelId);
        }
        model.set('show', false);
        model.set('query', '');
    }
}
nodom.PluginManager.add('UI-SELECT', UISelect);
class UITab extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-TAB';
        this.tabs = [];
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['position', 'allowclose|bool', 'listField', 'height|number'], ['position', 'allowClose', 'listField', 'bodyHeight'], ['top', null, '', 0]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        let me = this;
        this.extraDataName = '$ui_tab_' + nodom.Util.genId();
        this.name = rootDom.getProp('name');
        rootDom.addClass('nd-tab');
        if (this.position === 'left' || this.position === 'right') {
            rootDom.addClass('nd-tab-horizontal');
        }
        let headDom = new nodom.Element('div');
        headDom.addClass('nd-tab-head');
        let bodyDom = new nodom.Element('div');
        this.bodyKey = bodyDom.key;
        bodyDom.addClass('nd-tab-body');
        if (this.bodyHeight > 0) {
            bodyDom.assets.set('style', 'height:' + this.bodyHeight + 'px');
        }
        let index = 1;
        let activeIndex = 0;
        let itemDom;
        for (let c of rootDom.children) {
            if (!c.tagName) {
                continue;
            }
            let tabName = 'Tab' + index++;
            let title = c.getProp('title') || tabName;
            let active = c.getProp('active') || false;
            if (active) {
                activeIndex = index;
            }
            this.tabs.push({ title: title, name: tabName, active: active });
            let contentDom = new nodom.Element('div');
            contentDom.children = c.children;
            contentDom.addDirective(new nodom.Directive('show', this.extraDataName + '.' + tabName, contentDom));
            bodyDom.add(contentDom);
            if (itemDom) {
                continue;
            }
            c.tagName = 'div';
            c.delProp(['title', 'active', 'name']);
            c.addClass('nd-tab-item');
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression('title')];
            c.children = [txt];
            if (this.allowClose) {
                let b = new nodom.Element('b');
                b.addClass('nd-tab-close');
                b.addEvent(new nodom.NodomEvent('click', ':nopopo', (dom, model, module) => {
                    me.delTab(model.data.name, module);
                }));
                c.add(b);
            }
            c.addDirective(new nodom.Directive('repeat', this.extraDataName + '.datas', c));
            c.addDirective(new nodom.Directive('class', "{'nd-tab-item-active':'active'}", c));
            c.addEvent(new nodom.NodomEvent('click', (dom, model, module) => {
                me.setActive(model.data.name, module);
            }));
            itemDom = c;
        }
        headDom.add(itemDom);
        if (activeIndex === 0 && this.tabs.length > 0) {
            this.tabs[0].active = true;
        }
        if (this.position === 'top' || this.position === 'left') {
            rootDom.children = [headDom, bodyDom];
        }
        else {
            rootDom.children = [bodyDom, headDom];
        }
    }
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        let pmodel;
        if (this.needPreRender) {
            pmodel = module.getModel(this.modelId);
            let data = {
                datas: this.tabs
            };
            for (let d of this.tabs) {
                data[d.name] = d.active;
            }
            this.bodyKey = dom.children[1].key;
            this.extraModelId = pmodel.set(this.extraDataName, data).id;
        }
    }
    addTab(cfg) {
        let module = nodom.ModuleFactory.get(this.moduleId);
        if (!module) {
            return;
        }
        let model = module.getModel(this.extraModelId);
        let index = nodom.Util.isNumber(cfg.index) ? cfg.index : model.data.datas.length;
        let tabName = cfg.name || ('Tab' + nodom.Util.genId());
        model.data.datas.splice(index, 0, {
            title: cfg.title,
            name: tabName,
            active: false
        });
        model.set(tabName, false);
        let bodyDom = module.virtualDom.query(this.bodyKey);
        let dom;
        if (cfg.content) {
            dom = nodom.Compiler.compile(cfg.content);
        }
        else if (cfg.module) {
            dom = new nodom.Element('div');
            let mdlStr = cfg.module;
            if (cfg.moduleName) {
                mdlStr += '|' + cfg.moduleName;
            }
            dom.addDirective(new nodom.Directive('module', mdlStr, dom));
            if (cfg.data) {
                dom.setProp('data', cfg.data);
            }
        }
        dom.addDirective(new nodom.Directive('show', this.extraDataName + '.' + tabName, dom));
        bodyDom.children.splice(index, 0, dom);
        if (cfg.active) {
            this.setActive(tabName, module);
        }
    }
    delTab(tabName, module) {
        if (!module) {
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        let pmodel = module.getModel(this.extraModelId);
        let datas = pmodel.data.datas;
        let activeIndex;
        if (datas.length === 1) {
            return;
        }
        for (let i = 0; i < datas.length; i++) {
            if (datas[i].name === tabName) {
                if (datas[i].active) {
                    if (i < datas.length - 1) {
                        activeIndex = i;
                    }
                    else {
                        activeIndex = 0;
                    }
                }
                datas.splice(i, 1);
                pmodel.del(tabName);
                let bodyDom = module.virtualDom.query(this.bodyKey);
                bodyDom.children.splice(i, 1);
                break;
            }
        }
        if (activeIndex !== undefined) {
            this.setActive(datas[activeIndex].name, module);
        }
    }
    setActive(tabName, module) {
        if (!module) {
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        let pmodel = module.getModel(this.extraModelId);
        let datas = pmodel.data.datas;
        let activeData;
        for (let o of datas) {
            if (o.active) {
                pmodel.data[o.name] = false;
                o.active = false;
            }
            if (o.name === tabName) {
                activeData = o;
            }
        }
        activeData.active = true;
        pmodel.data[tabName] = true;
    }
}
nodom.PluginManager.add('UI-TAB', UITab);
class UITip extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-TIP';
        this.needCheck = false;
        this.containers = {
            top: undefined,
            right: undefined,
            bottom: undefined,
            left: undefined
        };
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        rootDom.tagName = 'div';
        this.extraDataName = '$ui_tip_manager';
        rootDom.setProp('name', this.extraDataName);
        rootDom.addDirective(new nodom.Directive('model', this.extraDataName, rootDom));
        for (let loc of ['top', 'right', 'bottom', 'left']) {
            let ct = new nodom.Element('div');
            ct.addClass('nd-tip nd-tip-' + loc);
            ct.add(this.createTipDom(loc));
            rootDom.add(ct);
        }
    }
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        if (this.needPreRender) {
            let model = module.model;
            if (!model.get(this.extraDataName)) {
                let mdl = model.set(this.extraDataName, {
                    top: [],
                    left: [],
                    bottom: [],
                    right: []
                });
                this.modelId = mdl.id;
            }
        }
    }
    createTipDom(loc) {
        let me = this;
        let dom = new nodom.Element('div');
        dom.addDirective(new nodom.Directive('repeat', loc, dom));
        dom.setProp('class', new nodom.Expression("'nd-tip-item nd-box-' + theme"), true);
        let close = new nodom.Element('b');
        close.addClass('nd-tip-close');
        close.addDirective(new nodom.Directive('show', 'allowClose', close));
        close.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
            model.set('close', true);
            me.check(true);
        }));
        let contentDom = new nodom.Element('div');
        contentDom.addClass('nd-tip-content');
        let icon = new nodom.Element('b');
        icon.setProp('class', new nodom.Expression("'nd-icon-' + icon"), true);
        icon.addDirective(new nodom.Directive('show', 'icon', icon));
        let txt = new nodom.Element();
        txt.expressions = [new nodom.Expression('content')];
        contentDom.children = [txt];
        dom.children = [icon, contentDom, close];
        return dom;
    }
    check(force) {
        let me = this;
        if (force) {
            this.needCheck = true;
        }
        if (!this.needCheck || !this.modelId) {
            return;
        }
        let needCheck = false;
        let model = nodom.ModuleFactory.getMain().getModel(this.modelId);
        let ct = new Date().getTime();
        for (let loc of ['top', 'right', 'bottom', 'left']) {
            let data = model.data[loc];
            for (let i = 0; i < data.length; i++) {
                let d = data[i];
                if (d.close || !d.allowClose && d.start + d.time <= ct) {
                    data.splice(i--, 1);
                }
                else if (!d.allowClose && d.start + d.time > ct) {
                    needCheck = true;
                }
            }
        }
        this.needCheck = needCheck;
        if (this.needCheck) {
            setTimeout(() => { me.check(); }, 100);
        }
    }
    show(config) {
        if (!nodom.Util.isObject(config)) {
            return;
        }
        let model = nodom.ModuleFactory.getMain().model.get(this.extraDataName);
        if (!model) {
            return;
        }
        let loc = config.loc || 'top';
        let allowClose = config.allowClose || false;
        let datas = model.data[loc];
        let data = {
            content: config.content || 'message',
            time: config.time || 3000,
            start: new Date().getTime(),
            allowClose: allowClose,
            icon: config.icon,
            theme: config.theme || 'black'
        };
        if (config.exclusive) {
            for (let d of datas) {
                datas.pop();
            }
            datas.push(data);
        }
        else {
            datas.push(data);
        }
        if (!allowClose) {
            this.check(true);
        }
    }
}
nodom.PluginManager.add('UI-TIP', UITip);
var nodom;
(function (nodom) {
    function tip(config) {
        let module = nodom.ModuleFactory.getMain();
        if (!module) {
            return null;
        }
        let manager = module.getPlugin('$ui_tip_manager');
        if (manager) {
            manager.show(config);
        }
    }
    nodom.tip = tip;
})(nodom || (nodom = {}));
class UIToolbar extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-TOOLBAR';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
        }
        rootDom.tagName = 'div';
        rootDom.addClass('nd-toolbar');
        rootDom.plugin = this;
        this.element = rootDom;
    }
}
nodom.PluginManager.add('UI-TOOLBAR', UIToolbar);
class UIText extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-TEXT';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['icon', 'iconpos'], ['icon', 'iconPos'], ['', 'left']);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        rootDom.addClass('nd-text');
        let field = rootDom.getDirective('field');
        let input = new nodom.Element('input');
        input.setProp('type', 'text');
        rootDom.add(input);
        input.addDirective(new nodom.Directive('field', field.value, input));
        let vProp = rootDom.getProp('value');
        if (!vProp) {
            vProp = rootDom.getProp('value', true);
            input.setProp('value', vProp, true);
        }
        else {
            input.setProp('value', vProp);
        }
        rootDom.removeDirectives(['field']);
        rootDom.events.clear();
        if (this.icon !== '') {
            let icon = new nodom.Element('b');
            icon.addClass('nd-icon-' + this.icon);
            if (this.iconPos === 'left') {
                icon.addClass('nd-text-iconleft');
                rootDom.children.unshift(icon);
            }
            else {
                rootDom.add(icon);
            }
        }
    }
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
    }
}
nodom.PluginManager.add('UI-TEXT', UIText);
class UITree extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-TREE';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['valuefield', 'displayfield', 'listfield', 'itemclick', 'checkname', 'maxlevel|number', 'icons|array|2'], ['valueField', 'displayField', 'listField', 'itemClick', 'checkName', 'maxLevel', 'iconArr'], ['', null, null, '', '', 3, []]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        const me = this;
        rootDom.addClass('nd-tree');
        this.activeName = '$ui_tree_' + nodom.Util.genId();
        this.checkedChdNumName = '$ui_tree_' + nodom.Util.genId();
        let methodId = '$nodomGenMethod' + nodom.Util.genId();
        this.arrowClickId = methodId;
        let closeOpenEvent = new nodom.NodomEvent('click', methodId);
        let itemClickEvent;
        if (this.itemClick !== '') {
            itemClickEvent = new nodom.NodomEvent('click', this.itemClick);
        }
        let parentCt = rootDom;
        let item;
        for (let i = 0; i < this.maxLevel; i++) {
            let itemCt = new nodom.Element();
            itemCt.tagName = 'div';
            itemCt.directives.push(new nodom.Directive('repeat', this.listField, itemCt));
            itemCt.addClass('nd-tree-nodect');
            item = new nodom.Element();
            item.addClass('nd-tree-node');
            item.tagName = 'DIV';
            if (itemClickEvent) {
                item.addEvent(itemClickEvent);
            }
            let icon1 = new nodom.Element();
            icon1.tagName = 'SPAN';
            icon1.addClass('nd-tree-icon');
            icon1.addDirective(new nodom.Directive('class', "{'nd-tree-node-open':'" + this.activeName + "'," +
                "'nd-icon-right':'" + this.listField + "&&" + this.listField + ".length>0'}", icon1));
            icon1.addEvent(closeOpenEvent);
            itemCt.add(icon1);
            if (this.iconArr.length > 0) {
                let a = [];
                a.push("'nd-icon-" + this.iconArr[0] + "':'" + this.listField + "&&" + this.listField + ".length>0'");
                if (this.iconArr.length > 1) {
                    a.push("'nd-icon-" + this.iconArr[1] + "':'!" + this.listField + "||" + this.listField + ".length===0'");
                }
                let icon = new nodom.Element();
                icon.tagName = 'SPAN';
                icon.addClass('nd-tree-icon');
                let cls = '{' + a.join(',') + '}';
                icon.directives.push(new nodom.Directive('class', cls, icon));
                itemCt.add(icon);
            }
            if (this.checkName !== '') {
                let cb = new nodom.Element('b');
                cb.addClass('nd-tree-uncheck');
                cb.addDirective(new nodom.Directive('class', "{'nd-tree-checked':'" + this.checkName + "'}", cb));
                itemCt.add(cb);
                cb.addEvent(new nodom.NodomEvent('click', (dom, model, module, e) => {
                    me.handleCheck(model, module);
                }));
            }
            itemCt.add(item);
            let txt = new nodom.Element();
            txt.expressions = [new nodom.Expression(this.displayField)];
            item.add(txt);
            let subCt = new nodom.Element();
            subCt.addClass('nd-tree-subct');
            subCt.tagName = 'DIV';
            subCt.addDirective(new nodom.Directive('class', "{'nd-tree-show':'" + this.activeName + "'}", subCt));
            itemCt.add(subCt);
            parentCt.add(itemCt);
            parentCt = subCt;
        }
        rootDom.plugin = this;
        return rootDom;
    }
    beforeRender(module, uidom) {
        const me = this;
        super.beforeRender(module, uidom);
        if (this.needPreRender) {
            module.addMethod(me.arrowClickId, (dom, model, module, e) => {
                let pmodel = module.getModel(dom.modelId);
                let rows = pmodel.data[me.listField];
                if (!rows || rows.length === 0) {
                    return;
                }
                model.set(me.activeName, !model.data[me.activeName]);
            });
        }
    }
    handleCheck(model, module) {
        let checked = !model.data[this.checkName];
        model.set(this.checkName, checked);
        this.handleSubCheck(model, module, checked);
        this.handleParentCheck(model, module, checked);
    }
    handleSubCheck(model, module, checked) {
        let rows = model.data[this.listField];
        if (!rows) {
            return;
        }
        if (checked) {
            model.set(this.checkedChdNumName, rows.length);
        }
        else {
            model.set(this.checkedChdNumName, 0);
        }
        for (let d of rows) {
            let m = module.getModel(d.$modelId);
            m.set(this.checkName, checked);
            this.handleSubCheck(m, module, checked);
        }
    }
    handleParentCheck(model, module, checked) {
        let pmodel = model.parent;
        if (!pmodel || pmodel === module.model) {
            return;
        }
        pmodel = pmodel.parent;
        if (!pmodel || pmodel === module.model) {
            return;
        }
        let data = pmodel.data;
        if (data[this.checkedChdNumName] === undefined) {
            pmodel.set(this.checkedChdNumName, 0);
        }
        if (checked) {
            data[this.checkedChdNumName]++;
        }
        else {
            data[this.checkedChdNumName]--;
        }
        let chk = data[this.checkName];
        if (data[this.checkedChdNumName] === 0) {
            pmodel.set(this.checkName, false);
        }
        else {
            pmodel.set(this.checkName, true);
        }
        if (chk !== data[this.checkName]) {
            this.handleParentCheck(pmodel, module, checked);
        }
    }
    getValue() {
        const me = this;
        if (this.valueField === '') {
            return;
        }
        let va = [];
        let module = nodom.ModuleFactory.get(this.moduleId);
        let model = module.getModel(this.modelId);
        getChecked(model.data[this.listField]);
        return va;
        function getChecked(rows) {
            if (Array.isArray(rows)) {
                for (let d of rows) {
                    if (d[me.checkName] === true) {
                        va.push(d[me.valueField]);
                    }
                    getChecked(d[me.listField]);
                }
            }
        }
    }
}
nodom.PluginManager.add('UI-TREE', UITree);
class UILoading extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-LOADING';
        this.openCount = 0;
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                UITool.handleUIParam(rootDom, this, ['startangle|number', 'movecircle|number'], ['startAngle', 'moveCircle'], [Math.PI / 2, 40]);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        rootDom.setProp('name', '$ui-loading');
        this.dataName = '$ui_loading_' + nodom.Util.genId();
        rootDom.addClass('nd-loading');
        rootDom.addDirective(new nodom.Directive('class', "{'nd-loading-hide':'!" + this.dataName + "'}", rootDom));
        let coverDom = new nodom.Element('div');
        coverDom.addClass('nd-loading-cover');
        rootDom.add(coverDom);
        let body = new nodom.Element('div');
        body.addClass('nd-loading-body');
        let canvas = new nodom.Element('canvas');
        canvas.setProp('width', 100);
        canvas.setProp('height', 100);
        body.add(canvas);
        rootDom.add(body);
    }
    open() {
        const me = this;
        me.openCount++;
        nodom.ModuleFactory.getMain().model.set(this.dataName, true);
        let canvas = document.querySelector("[key='" + this.element.children[1].children[0].key + "']");
        let width = canvas.offsetWidth;
        let circleCount = 6;
        me.showFlag = true;
        setTimeout(() => {
            loop();
        }, 500);
        function loop() {
            if (!me.showFlag) {
                return;
            }
            let ctx = canvas.getContext('2d');
            let centerx = width / 2;
            let centery = width / 2;
            let radius1 = 6;
            let radius = me.moveCircle;
            let angle = me.startAngle;
            let circleArr = [];
            loop1();
            setTimeout(loop, 1500);
            function loop1() {
                if (!me.showFlag) {
                    return;
                }
                ctx.clearRect(0, 0, width, width);
                ctx.fillStyle = 'gold';
                if (circleArr.length < circleCount) {
                    circleArr.push(true);
                }
                angle += Math.PI / 8;
                let overNum = 0;
                for (let i = 0; i < circleArr.length; i++) {
                    let a = angle - i * Math.PI / 8;
                    if (a > Math.PI * 2 + me.startAngle) {
                        overNum++;
                        a = Math.PI * 2 + me.startAngle;
                    }
                    let r = radius1 - i;
                    ctx.beginPath();
                    ctx.arc(centerx - radius * Math.cos(a), centery - radius * Math.sin(a), r, 0, 360);
                    ctx.closePath();
                    ctx.fill();
                }
                if (overNum < circleCount) {
                    setTimeout(loop1, 60);
                }
            }
        }
    }
    close() {
        if (--this.openCount === 0) {
            nodom.ModuleFactory.getMain().model.set(this.dataName, false);
            this.showFlag = false;
        }
    }
}
nodom.PluginManager.add('UI-LOADING', UILoading);
var nodom;
(function (nodom) {
    function showLoading() {
        let manager = nodom.ModuleFactory.getMain().getPlugin('$ui-loading');
        if (manager) {
            manager.open();
        }
    }
    nodom.showLoading = showLoading;
    function closeLoading(config) {
        let module = nodom.ModuleFactory.getMain();
        if (!module) {
            return null;
        }
        let manager = module.getPlugin('$ui-loading');
        if (manager) {
            manager.close();
        }
    }
    nodom.closeLoading = closeLoading;
})(nodom || (nodom = {}));
class UIFloatBox extends nodom.Plugin {
    constructor(params) {
        super(params);
        this.tagName = 'UI-FLOATBOX';
        let rootDom = new nodom.Element();
        if (params) {
            if (params instanceof HTMLElement) {
                nodom.Compiler.handleAttributes(rootDom, params);
                nodom.Compiler.handleChildren(rootDom, params);
            }
            else if (typeof params === 'object') {
                for (let o in params) {
                    this[o] = params[o];
                }
            }
            rootDom.setProp('name', '$ui_floatbox');
            this.generate(rootDom);
        }
        rootDom.tagName = 'div';
        rootDom.plugin = this;
        this.element = rootDom;
    }
    generate(rootDom) {
        this.dataName = '$ui_floatbox' + nodom.Util.genId();
        rootDom.addClass('nd-floatbox');
        new nodom.Directive('show', this.dataName + '.show', rootDom);
        rootDom.setProp('style', ['left:', new nodom.Expression(this.dataName + '.left'),
            'px;top:', new nodom.Expression(this.dataName + '.top'), 'px;'], true);
        let innerCt = new nodom.Element('div');
        rootDom.add(innerCt);
    }
    beforeRender(module, dom) {
        super.beforeRender(module, dom);
        if (this.needPreRender) {
            let model = module.model;
            model.set(this.dataName, {
                left: 0,
                top: 0,
                show: false
            });
        }
    }
    show(evt, loc) {
        let module = nodom.ModuleFactory.getMain();
        if (!module) {
            return;
        }
        if (module) {
            let model = module.model;
            model.set(this.dataName, {
                show: true,
                left: 0,
                top: 0
            });
            if (model) {
                model.set(this.dataName, {
                    show: true,
                    left: 0,
                    top: 0
                });
                this.updateLoc(module, evt, loc);
            }
        }
    }
    updateLoc(module, evt, loc) {
        let ex = evt.pageX;
        let ey = evt.pageY;
        let eox = evt.offsetX;
        let eoy = evt.offsetY;
        let ow = evt.target.offsetWidth;
        let oh = evt.target.offsetHeight;
        let x = ex - eox - 3;
        let y = ey - eoy + oh - 15;
        let el = module.getNode(this.element.key);
        if (!el) {
            setTimeout(() => {
                this.updateLoc(module, evt, loc);
            }, 0);
            return;
        }
        let width = el.offsetWidth;
        let height = el.offsetHeight;
        if (x + width > window.innerWidth) {
            x = window.innerWidth - width;
        }
        if (y + height > window.innerHeight) {
            if (y - height - oh > 0) {
                y -= height + oh;
            }
        }
        module.model.set(this.dataName + '.left', x);
        module.model.set(this.dataName + '.top', y);
    }
}
var nodom;
(function (nodom) {
    function floatbox(dom, evt, loc) {
        let module = nodom.ModuleFactory.getMain();
        if (!module) {
            return null;
        }
        let floatBox = module.getPlugin('$ui_floatbox');
        let vDom = module.getElement(floatBox.element.key, true);
        vDom.children[0].children = [dom];
        if (floatBox) {
            floatBox.show(evt, loc);
        }
    }
    nodom.floatbox = floatbox;
})(nodom || (nodom = {}));
nodom.PluginManager.add('UI-FLOATBOX', UIFloatBox);
//# sourceMappingURL=nodomui.js.map