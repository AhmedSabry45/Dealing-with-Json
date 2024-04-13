let thead = document.getElementById('thead');
let tbody = document.getElementById('tbody');
let newthead = document.getElementById('newthead');
let newtbody = document.getElementById('newtbody');
let ApiInput = document.getElementById('ApiInput');
let btnConvert = document.getElementById('btnConvert');
let convertTable = document.getElementById('convertTable');
let newTable = document.getElementById('newTable');
let HeaderKeyInput = document.getElementById('HeaderKeyInput');
let HeaderKeyLbl = document.getElementById('HeaderKeyLbl');
let btnSaveHeader = document.getElementById('btnSaveHeader');
let PostInput = document.getElementById('PostInput');
let HeaderKey = '';
let NewObj = {};
let finalObj = {};
let NewHeaders = [];
let NewArry = [];
let finalArry = [];


function LoadApiData() {
    if (!ApiInput.value) {
        alert('Please Enter API URL');
        return;
    }

    fetch(ApiInput.value).then(res => res.json()).then(data => {
        ResetData();
        if (data instanceof Array)
            data.forEach(item => {
                CreateNewArry(item);
                NewArry.push(NewObj);
                NewObj = {};
            });
        else {
            Object.values(data).forEach(item => {
                if (item instanceof Array)
                    item.forEach(item => {
                        CreateNewArry(item);
                        NewArry.push(NewObj);
                        NewObj = {};
                    });
            });
        }

        Object.keys(NewArry[0]).forEach(i => NewHeaders.push({ name: i, eleId: i + '_' + 'Input', isChecked: false }));
        btnConvert.hidden = false;
        CreateTableNewArry();
    });
}

function ResetData() {
    NewArry = [];
    NewHeaders = [];
    NewObj = {};
    HeaderKeyInput.hidden = true;
    HeaderKeyLbl.hidden = true;
    btnSaveHeader.hidden = true;
    convertTable.hidden = false;
    newTable.hidden = true;
    btnConvert.hidden = true;
    thead.innerHTML = '';
    tbody.innerHTML = '';
    newtbody.innerHTML = '';
    newthead.innerHTML = '';
    ApiInput.value = '';
    PostInput.value = '';
}

function CreateNewArry(data, parentKey = null) {
    let type = Array.isArray(data);
    if (type)
        return;
    if (data && data instanceof Object)
        Object.keys(data).forEach(key => {
            this.CreateNewArry(data[key], parentKey ? `${parentKey}_${key}` : key);
        });
    else
        NewObj[parentKey] = data ? data : '';
}

function CreateTableNewArry() {
    let TH = '';
    NewHeaders.map(header => {
        let newHeader = header.name.split('_');
        if (newHeader.length > 1) {
            newHeader = newHeader.map(i => i = i.charAt(0).toUpperCase() + i.substring(1)).join(' ');
        } else {
            newHeader = newHeader[0].charAt(0).toUpperCase() + newHeader[0].substring(1);
        }
        TH += `
            <th scope="col" style="width: 150px;">
            <label for="${header.eleId}" class="me-2">${newHeader}</label>
            <input class="form-check-input" type="checkbox" id="${header.eleId}" onchange="InputChange('${header.eleId}')">
            </th>
        `;
    });

    thead.innerHTML = `<tr>${TH}</tr>`;

    for (const item of NewArry) {
        let tr = document.createElement('tr');
        let td = '';
        NewHeaders.map(i => td += `<td>${item[i.name] ?? ''}</td>`).join('');
        tr.innerHTML += td;
        tbody.innerHTML += tr.innerHTML;
    }
}

function InputChange(headerEle) {
    let checkedEle = document.getElementById(headerEle);
    NewHeaders.find(i => i.eleId == headerEle).isChecked = checkedEle.checked;
}

function ConvertToNewArry() {
    let newHeader = NewHeaders.filter(i => i.isChecked);
    if (newHeader.length == 0) {
        alert('Please Select Column');
        return;
    }
    convertTable.hidden = true;
    btnConvert.hidden = true;
    let keys = newHeader.map(i => i.name);
    NewArry.forEach(item => {
        keys.forEach(key => {
            finalObj[key] = item[key];
        });
        finalArry.push(finalObj);
        finalObj = {};
    });
    newTable.hidden = false;
    CreateFinalTable(keys);
}

function CreateFinalTable(Keys) {
    newthead.innerHTML = '';
    newtbody.innerHTML = '';
    let TH = '';
    Keys.map(header => {
        let newHeader = header.split('_');
        if (newHeader.length > 1) {
            newHeader = newHeader.map(i => i = i.charAt(0).toUpperCase() + i.substring(1)).join(' ');
        } else {
            newHeader = newHeader[0].charAt(0).toUpperCase() + newHeader[0].substring(1);
        }
        TH += `
            <th scope="col" class="cursor-pointer" onclick="ChangeHeaderName('${header}')">
            ${newHeader}
            </th>
        `;
    });

    newthead.innerHTML = `<tr>${TH}</tr>`;

    for (const item of finalArry) {
        let tr = document.createElement('tr');
        let td = '';
        Keys.map(i => td += `<td>${item[i] ?? ''}</td>`).join('');
        tr.innerHTML += td;
        newtbody.innerHTML += tr.innerHTML;
    }
}

function ChangeHeaderName(headerKey) {
    HeaderKeyInput.hidden = false;
    HeaderKeyLbl.hidden = false;
    btnSaveHeader.hidden = false;
    HeaderKey = headerKey;
    let header = Object.keys(finalArry[0]).find(i => i == headerKey);
    HeaderKeyInput.value = header;
}

function SaveNewHeader() {
    finalArry.forEach(item => {
        item[HeaderKeyInput.value] = item[HeaderKey];
        if (HeaderKeyInput.value != HeaderKey)
            delete item[HeaderKey];
    });

    let keys = Object.keys(finalArry[0]);
    CreateFinalTable(keys);
    HeaderKeyInput.value = '';
    HeaderKeyInput.hidden = true;
    HeaderKeyLbl.hidden = true;
    btnSaveHeader.hidden = true;
}

function HeaderKeyWriter(value) {
    var regexp = /^\S*$/;
    let result = regexp.test(value);
    if (!result)
        HeaderKeyInput.value = value.replace(' ', '');
}

function PostData() {
    if (!PostInput.value) {
        alert('Please Enter API URL');
        return;
    }

    for (const item of finalArry) {
        fetch(PostInput.value, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(item)
        });
    }

    Object.keys(finalArry[0]).forEach((key, i) => {
        if (key.toLocaleLowerCase() == 'id'.toLocaleLowerCase())
            return;

        let columnName = key.split('_');
        if (columnName.length > 1)
            columnName = columnName.map(i => i = i.charAt(0).toUpperCase() + i.substring(1)).join(' ');
        else
            columnName = columnName[0].charAt(0).toUpperCase() + columnName[0].substring(1);

        let tableObj = {
            columnName: columnName,
            propertyKey: key,
            isVisible: true,
            displayOrder: i + 1
        }

        fetch('http://localhost:3000/tables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(tableObj)
        });
    });

    HeaderKeyInput.hidden = true;
    HeaderKeyLbl.hidden = true;
    btnSaveHeader.hidden = true;
    convertTable.hidden = false;
    newTable.hidden = true;
    btnConvert.hidden = true;
    thead.innerHTML = '';
    tbody.innerHTML = '';
    newtbody.innerHTML = '';
    newthead.innerHTML = '';
    ApiInput.value = '';
    PostInput.value = '';

}