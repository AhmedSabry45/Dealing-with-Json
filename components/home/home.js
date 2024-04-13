let PageSize = 25;
let PageNum = 1;
const pagingApi = `http://localhost:3000/users?_page=${PageNum}&_per_page=${PageSize}`;
const usersapi = `http://localhost:3000/users`;
const filterApi = 'http://localhost:3000/filters';
const tableApi = 'http://localhost:3000/tables';
const inputApi = 'http://localhost:3000/inputs';
let tbody = document.getElementById("tbody");
let thead = document.getElementById("thead");
let InputFields = document.getElementById("InputFields");
let btnAddUser = document.getElementById("btnAddUser");
let btnUpdateUser = document.getElementById("btnUpdateUser");
let InputImage = document.getElementById("InputImage");
let FilterBody = document.getElementById("FilterBody");
let FilterTags = document.getElementById("FilterTags");
let btn_ImageField = document.getElementById("btn_ImageField");
let PaginationEle = document.getElementById("PaginationEle");
let ImagePath;
let PagingObj = {};
let InputObj = {};
let arry = [];
let UsersArry = [];
let FiltersArry = [];
let ColumnsArry = [];
let InputsArry = [];
let InputArryOfObject = [];


function GetData() {
    btnUpdateUser.hidden = true;
    UsersArry = [];
    tbody.innerHTML = '';
    thead.innerHTML = '';
    fetch(pagingApi).then(res => res.json()).then(json => {
        PagingObj = { next: json.next, prev: json.prev, totalCount: json.items, totalPages: json.pages };
        UsersArry = json.data;
        CreatePaginationEle();
        GetFilterData();
        GetInputData();
        ResetInputs();
    });
}

function GetFilterData() {
    fetch(filterApi).then(res => res.json()).then(json => {
        FiltersArry = json;
        CreateFilters(json);
    });
}

function GetTableData() {
    fetch(tableApi).then(res => res.json()).then(json => {
        ColumnsArry = json;
        CreateTable(UsersArry);
    });
}

function GetInputData() {
    fetch(inputApi).then(res => res.json()).then(json => {
        InputsArry = json;
        btn_ImageField.hidden = InputsArry.length > 0 ? false : true;
        CreateInput();
        GetTableData();
    });
}

function CreateInput() {
    InputFields.innerHTML = '';
    InputsArry = InputsArry.sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));
    for (const item of InputsArry.filter(i => i.isVisible)) {
        let input =
            `
        <div class="col-2">
            <input type="text" class="form-control me-2" placeholder="${item.placeHolder}" id="${item.bodyId}" oninput="RemoveValidationMessage('${item.bodyId}')" style="width: 135px;">
            <small class="text-danger" id="${item.validationId}" hidden>
            ${item.placeHolder} Is Required.
            </small>
        </div>
         `
        InputFields.innerHTML += input;
    }

    InputsArry.filter(i => i.isVisible).forEach(item => {
        let obj = {
            [item['propertyKey']]: '',
        }
        InputArryOfObject.push(obj);
    });

    InputObj = Object.assign({}, ...InputArryOfObject);
}

function CreateTable(ArryData) {
    let columnSorting = ColumnsArry.sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));
    let headers = columnSorting.filter(x => x.isVisible).map(i => i.columnName);
    let th = headers.map(i => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase  tracking-wider">${i}</th>`).join('');
    if (InputsArry.length > 0)
        th += '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase  tracking-wider">Action</th>'
    let row =
        `
    <tr>
        ${th}
    </tr>
    `
    thead.innerHTML += row;
    for (const item of ArryData) {
        let tr = document.createElement('tr');
        let imageObj = columnSorting.filter(i => i.isVisible).find(i => i.columnName.toLocaleLowerCase() == 'image'.toLocaleLowerCase());
        if (imageObj) {
            let imgRow = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex-shrink-0 h-10 w-10">
                <img src="${item[imageObj.propertyKey]}" class="h-10 w-10 rounded-full" alt="">
                </div>
            </td>
        `;
            tr.innerHTML = imgRow;
        }
        let td = '';
        columnSorting.filter(x => x.isVisible && x.columnName.toLocaleLowerCase() != 'image'.toLocaleLowerCase()).map(i => {
            td += `<td class="px-6 py-4 whitespace-nowrap"><span class="text-sm">${item[i.propertyKey] ?? ''}</span></td>`;
        }).join('');

        if (InputsArry.length > 0)
            td += `
            <td class="whitespace-nowrap">
                <button class="btn btn-success" onclick="UpdateUser('${item['id']}')">Update</button>
                <button class="btn btn-danger" onclick="DeleteUser('${item['id']}')">Delete</button>
            </td>
            `
        tr.innerHTML += td;
        tbody.innerHTML += tr.innerHTML;
    }
}

function RemoveValidationMessage(bodyId) {
    let inputObj = InputsArry.find(i => i.bodyId == bodyId);
    if (!inputObj.isRequired)
        return;
    let inputEle = document.getElementById(inputObj.bodyId);
    let validationEle = document.getElementById(inputObj.validationId);
    if (inputEle.value) {
        inputEle.classList.remove('is-invalid');
        validationEle.hidden = true;
    }
    else {
        inputEle.classList.add('is-invalid');
        validationEle.hidden = false;
    }
}

function AddNewUser() {
    Object.keys(InputObj).forEach(key => {
        let bodyId = InputsArry.find(i => i.propertyKey == key)?.bodyId;
        if (bodyId) {
            InputObj[key] = document.getElementById(bodyId).value;
        }
    });

    if (!CheckObjectProperty(InputObj))
        return;

    InputObj.image = !ImagePath ? '../../assets/defaultImage.jpg' : ImagePath;
    PostData(usersapi, InputObj);
}

function PostData(apiUrl, Obj) {
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(Obj)
    }).then(res => res.json()).then(data => {
        GetData();
        ResetInputs();
    });
}

function UpdateUser(userId) {
    btnAddUser.hidden = true;
    btnUpdateUser.hidden = false;
    let userObj = UsersArry.find(i => i.id == userId);
    if (userObj) {
        InputsArry.filter(i => i.isVisible).forEach(item => {
            let inputField = document.getElementById(item.bodyId);
            inputField.value = userObj[item.propertyKey];
            InputObj = userObj;
        });
    }
}

function SaveUpdateUser() {
    Object.keys(InputObj).forEach(key => {
        let bodyId = InputsArry.find(i => i.propertyKey == key)?.bodyId;
        if (bodyId) {
            InputObj[key] = document.getElementById(bodyId).value;
        }
    });

    if (!CheckObjectProperty(InputObj))
        return;

    InputObj.image = !ImagePath ? '../../assets/defaultImage.jpg' : ImagePath;

    PutData(usersapi, InputObj);
}

function PutData(apiUrl, Obj) {
    fetch(apiUrl + '/' + Obj.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Obj)
    }).then(res => res.json()).then(data => {
        GetData();
        ResetInputs();
    });
}

function DeleteUser(userId) {
    fetch(usersapi + '/' + userId, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()).then(data => {
        GetData();
        ResetInputs();
    });
}

function ResetInputs() {
    btnAddUser.hidden = false;
    InputImage.value = '';
    ImagePath = '';
    Object.values(InputObj).forEach(key => key = '');
}

function UploadImage() {
    ImagePath = '../../assets/' + InputImage.files[0].name;
}

function CreateFilters(filterArry) {
    FilterBody.innerHTML = '';
    if (UsersArry.length == 0)
        return;
    let SearchTextFilter = filterArry.find(i => i.filterName.toLowerCase() == 'searchtext'.toLowerCase());
    if (SearchTextFilter) {
        let placeHolder = SearchTextFilter.propertyKey.charAt(0).toUpperCase() + SearchTextFilter.propertyKey.substring(1);
        FilterBody.innerHTML =
            `
        <div class="col-3">
            <input type="text" class="form-control" placeholder="Search By ${placeHolder}" oninput="OnInputSearchChange(this.value,'${SearchTextFilter.propertyKey}')">
        </div>`
    }

    filterArry = filterArry.sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));
    for (const key of filterArry.filter(i => i.filterName.toLowerCase() != 'searchtext'.toLowerCase())) {
        debugger;
        let disValue = [...new Set(UsersArry.map(x => x[key.propertyKey]))];
        let options = disValue.filter(x => x).map(i => `<option value="${key.propertyKey}/${i}">${i}</option>`).join('');
        let row =
            `
            <div class="col-3 mb-2">
                <select class="form-control" onchange="OnFilterChange(this.value)" id="${key.bodyId}">
                    <option selected disabled>Select ${key.filterName}</option>
                    ${options}
                </select>
            </div>
      
      `
        FilterBody.innerHTML += row;
    }
}

function OnInputSearchChange(searchText, propertyKey) {
    let ArrySearch = UsersArry.filter(i => i[propertyKey].toLowerCase().includes(searchText.toLowerCase()));
    tbody.innerHTML = '';
    thead.innerHTML = '';
    CreateTable(ArrySearch);
}

function OnFilterChange(filterValue) {
    PageNum = 1;
    let apiURL = 'http://localhost:3000/users?';
    let key = filterValue.split('/');
    let checked = arry.find(i => i.value == key[1]);
    if (!checked) {
        arry.push({ key: key[0], value: key[1] });
        FilterTags.innerHTML = '';
        arry.forEach(item => {
            FilterTags.innerHTML += `
            <span class="badge text-bg-primary cursor-pointer me-2" onclick="ClearFilterTags('${item.value}')">${item.key} : ${item.value}</span>
            `
        });
    }

    if (arry.length == 1) {
        apiURL += arry[0].key + '=' + arry[0].value;
    } else {
        arry.forEach((obj, i) => {
            apiURL += obj.key + '=' + obj.value + '&&';
            if (i == arry.length - 1)
                apiURL = apiURL.slice(0, -2);
        });
    }
    UsersArry = [];
    tbody.innerHTML = '';
    thead.innerHTML = '';
    GetUsersData(apiURL);
}

function GetUsersData(apiUrl) {
    fetch(apiUrl).then(res => res.json()).then(json => {
        UsersArry = json;
        CreateTable(UsersArry);
    });
}

function ClearFilterTags(filterValue) {
    FilterTags.innerHTML = '';
    arry = arry.filter(i => i.value != filterValue);
    if (arry.length == 0)
        FilterTags.innerHTML = '';
    else {
        arry.forEach(item => {
            FilterTags.innerHTML += `
            <span class="badge text-bg-primary cursor-pointer me-2" onclick="ClearFilterTags('${item.value}')">${item.key} : ${item.value}</span>
            `
        });
    }
    let apiURL = 'http://localhost:3000/users?';

    if (arry.length == 0) {
        pageNum = 1;
        apiURL = usersapi;
        FiltersArry.filter(i => i.filterName.toLowerCase() != 'searchtext'.toLocaleLowerCase()).forEach(item => {
            let filterBody = document.getElementById(item.bodyId);
            filterBody.value = 'Select ' + item.filterName;
        });
        GetData();
        return;

    }
    else if (arry.length == 1) {
        apiURL += arry[0].key + '=' + arry[0].value;
        let filter = [...new Set(arry.map(i => i.key))]
        filter.forEach(item => {
            let filterExist = FiltersArry.filter(x => x.propertyKey != item);
            filterExist.forEach(fil => {
                let filterBody = document.getElementById(fil.bodyId);
                filterBody.value = 'Select ' + fil.filterName;
            })
        })
    } else {
        arry.forEach((obj, i) => {
            apiURL += obj.key + '=' + obj.value + '&&';
            if (i == arry.length - 1)
                apiURL = apiURL.slice(0, -2);
        });
    }

    UsersArry = [];
    tbody.innerHTML = '';
    thead.innerHTML = '';
    GetUsersData(apiURL);
}

function CheckObjectProperty(obj) {
    let Checked = true;
    for (var o in obj) {
        let inputObj = InputsArry.find(i => i.propertyKey == o);
        if (!obj[o] && inputObj.isRequired) {
            Checked = false;
            let inputEle = document.getElementById(inputObj.bodyId);
            let validationEle = document.getElementById(inputObj.validationId);
            inputEle.classList.add('is-invalid');
            validationEle.hidden = false;
        }
    }
    return Checked;
}

function CreatePaginationEle() {
    if (UsersArry.length == 0)
        return;
    let li = '';
    for (let index = 1; index <= PagingObj.totalPages; index++) {
        if (index == 1)
            li += `<li class="page-item active" id="NumOfPage_${index}" onclick="PagingNumClick(${index})"><a class="page-link">${index}</a></li>`
        else
            li += `<li class="page-item" id="NumOfPage_${index}" onclick="PagingNumClick(${index})"><a class="page-link">${index}</a></li>`
    }
    let Ele =
        `
    <li class="page-item" onclick="PreviousClick()" id="PreviousEle"><a class="page-link">Previous</a></li>
    ${li}
    <li class="page-item" onclick="NextClick()" id="NextEle"><a class="page-link">Next</a></li>
    `
    PaginationEle.innerHTML = Ele;
    let PrevEle = document.getElementById('PreviousEle');
    let NextEle = document.getElementById('NextEle');
    if (PagingObj.prev == null)
        PrevEle.classList.add('disabled');
    if (PagingObj.next == null)
        NextEle.classList.add('disabled');
}

function PagingNumClick(pageNum) {
    if (PagingObj.prev == null && PagingObj.next == null)
        return;
    let currentPageBtnEle = document.getElementById('NumOfPage_' + PageNum);
    currentPageBtnEle.classList.remove('active');
    PageNum = pageNum;
    let pageBtnEle = document.getElementById('NumOfPage_' + PageNum);
    pageBtnEle.classList.add('active');
    let api = `http://localhost:3000/users?_page=${PageNum}&_per_page=${PageSize}`;
    fetch(api).then(res => res.json()).then(json => {
        PagingObj = { next: json.next, prev: json.prev, totalCount: json.items, totalPages: json.pages };
        UsersArry = json.data;
        thead.innerHTML = '';
        tbody.innerHTML = '';
        CreateTable(UsersArry);
        let PrevEle = document.getElementById('PreviousEle');
        let NextEle = document.getElementById('NextEle');
        if (PagingObj.prev == null)
            PrevEle.classList.add('disabled');
        else
            PrevEle.classList.remove('disabled');

        if (PagingObj.next == null)
            NextEle.classList.add('disabled');
        else
            NextEle.classList.remove('disabled');
    });
}

function PreviousClick() {
    if (PagingObj.prev == null)
        return;
    let currentPageBtnEle = document.getElementById('NumOfPage_' + PageNum);
    currentPageBtnEle.classList.remove('active');
    let pageNum = --PageNum;
    let pageBtnEle = document.getElementById('NumOfPage_' + pageNum);
    pageBtnEle.classList.add('active');
    let api = `http://localhost:3000/users?_page=${PageNum}&_per_page=${PageSize}`;
    fetch(api).then(res => res.json()).then(json => {
        PagingObj = { next: json.next, prev: json.prev, totalCount: json.items, totalPages: json.pages };
        UsersArry = json.data;
        thead.innerHTML = '';
        tbody.innerHTML = '';
        CreateTable(UsersArry);
        let PrevEle = document.getElementById('PreviousEle');
        let NextEle = document.getElementById('NextEle');
        if (PagingObj.prev == null)
            PrevEle.classList.add('disabled');
        else
            PrevEle.classList.remove('disabled');

        if (PagingObj.next == null)
            NextEle.classList.add('disabled');
        else
            NextEle.classList.remove('disabled');
    });
}

function NextClick() {
    if (PagingObj.next == null)
        return;
    let currentPageBtnEle = document.getElementById('NumOfPage_' + PageNum);
    currentPageBtnEle.classList.remove('active');
    let pageNum = ++PageNum;
    let pageBtnEle = document.getElementById('NumOfPage_' + pageNum);
    pageBtnEle.classList.add('active');
    let api = `http://localhost:3000/users?_page=${PageNum}&_per_page=${PageSize}`;
    fetch(api).then(res => res.json()).then(json => {
        PagingObj = { next: json.next, prev: json.prev, totalCount: json.items, totalPages: json.pages };
        UsersArry = json.data;
        thead.innerHTML = '';
        tbody.innerHTML = '';
        CreateTable(UsersArry);
        let PrevEle = document.getElementById('PreviousEle');
        let NextEle = document.getElementById('NextEle');
        if (PagingObj.prev == null)
            PrevEle.classList.add('disabled');
        else
            PrevEle.classList.remove('disabled');

        if (PagingObj.next == null)
            NextEle.classList.add('disabled');
        else
            NextEle.classList.remove('disabled');
    });
}

GetData();