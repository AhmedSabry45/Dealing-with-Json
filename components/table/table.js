const tableApi = 'http://localhost:3000/tables';
let InputColumnName = document.getElementById('InputColumnName');
let InputPropertyKey = document.getElementById('InputPropertyKey');
let InputIsVisible = document.getElementById('InputIsVisible');
let InputDisplayOrder = document.getElementById('InputDisplayOrder');
let btnAddColumn = document.getElementById("btnAddColumn");
let btnUpdateColumn = document.getElementById("btnUpdateColumn");
let tbody = document.getElementById("tbody");
let ColumnsArry = [];
ColumnObj = {};

function GetTableData() {
    btnUpdateColumn.hidden = true;
    ColumnsArry = [];
    tbody.innerHTML = '';
    fetch(tableApi).then(res => res.json()).then(json => {
        ColumnsArry = json;
        ColumnsArry = ColumnsArry.sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));
        ColumnsArry.map(data => {
            tbody.append(td_fun(data));
        });
        btnAddColumn.hidden = false;
        InputColumnName.value = '';
        InputPropertyKey.value = '';
        InputIsVisible.checked = false;
        InputDisplayOrder.value = '';
    });
}

function AddNewColumn() {
    if (!InputColumnName.value || !InputPropertyKey.value || !InputDisplayOrder.value) {
        alert('Please Enter All Fields');
        return;
    }

    let filterObj = {
        columnName: InputColumnName.value,
        propertyKey: InputPropertyKey.value,
        isVisible: InputIsVisible.checked,
        displayOrder: InputDisplayOrder.value,
    }

    fetch(tableApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(filterObj)
    }).then(res => res.json()).then(data => {
        GetTableData();
        InputColumnName.value = '';
        InputPropertyKey.value = '';
        InputIsVisible.checked = false;
        InputDisplayOrder.value = '';
    });
}

function SaveUpdateColumn() {
    if (!InputColumnName.value || !InputPropertyKey.value || !InputDisplayOrder.value) {
        alert('Please Enter All Fields');
        return;
    }

    let columnObj = {
        id: ColumnObj.id,
        columnName: InputColumnName.value,
        propertyKey: InputPropertyKey.value,
        isVisible: InputIsVisible.checked,
        displayOrder: InputDisplayOrder.value,
    }

    fetch(tableApi + '/' + columnObj.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(columnObj)
    }).then(res => res.json()).then(data => {
        GetTableData();
        btnAddColumn.hidden = false;
        InputColumnName.value = '';
        InputPropertyKey.value = '';
        InputIsVisible.checked = false;
        InputDisplayOrder.value = '';
    });
}

function DeleteColumn(columnId, propertyKey) {
    fetch(tableApi + '/' + columnId, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()).then(data => {
        GetTableData();
        RemoveKeyObjectFromData(propertyKey);
        btnAddColumn.hidden = false;
        InputIsVisible.checked = false;
        InputColumnName.value = '';
        InputPropertyKey.value = '';
        InputDisplayOrder.value = '';
    });
}

function RemoveKeyObjectFromData(propertyKey) {
    debugger;
}

function UpdateColumn(columnId) {
    btnAddColumn.hidden = true;
    btnUpdateColumn.hidden = false;
    ColumnObj = ColumnsArry.find(i => i.id == columnId);
    if (ColumnObj) {
        InputColumnName.value = ColumnObj.columnName;
        InputPropertyKey.value = ColumnObj.propertyKey;
        InputIsVisible.checked = ColumnObj.isVisible;
        InputDisplayOrder.value = ColumnObj.displayOrder;
    }
}

function td_fun({ id, columnName, propertyKey, isVisible, displayOrder }) {
    let td = document.createElement('tr');
    td.innerHTML = `
    <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
                <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                        ${columnName}
                    </div>
                </div>
        </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
                <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                        ${propertyKey}
                    </div>
                </div>
        </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
                <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                        ${isVisible}
                    </div>
                </div>
        </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
    <div class="flex items-center">
            <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">
                    ${displayOrder}
                </div>
            </div>
    </div>
</td>
    <td class="whitespace-nowrap">
        <button class="btn btn-success" onclick="UpdateColumn('${id}')">Update</button>
        <button class="btn btn-danger" onclick="DeleteColumn('${id}','${propertyKey}')">Delete</button>
    </td>
    `;
    return td;
}

GetTableData();