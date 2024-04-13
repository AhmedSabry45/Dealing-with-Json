const filterApi = 'http://localhost:3000/filters';
let InputFilterName = document.getElementById('InputFilterName');
let InputPropertyKey = document.getElementById('InputPropertyKey');
let InputFilterBodyId = document.getElementById('InputFilterBodyId');
let InputDisplayOrder = document.getElementById('InputDisplayOrder');
let btnAddFilter = document.getElementById("btnAddFilter");
let btnUpdateFilter = document.getElementById("btnUpdateFilter");
let tbody = document.getElementById("tbody");
let FiltersArry = [];
FilterObj = {};

function GetFilterData() {
    btnUpdateFilter.hidden = true;
    FiltersArry = [];
    tbody.innerHTML = '';
    fetch(filterApi).then(res => res.json()).then(json => {
        FiltersArry = json;
        json.map(data => {
            tbody.append(td_fun(data));
        });
        btnAddFilter.hidden = false;
        InputFilterName.value = '';
        InputPropertyKey.value = '';
        InputFilterBodyId.value = '';
        InputDisplayOrder.value = '';
    });
}

function AddNewFilter() {
    if (!InputFilterName.value || !InputPropertyKey.value || !InputDisplayOrder.value || !InputFilterBodyId.value) {
        alert('Please Enter All Fields');
        return;
    }

    let filterObj = {
        filterName: InputFilterName.value,
        propertyKey: InputPropertyKey.value,
        bodyId: InputFilterBodyId.value,
        displayOrder: InputDisplayOrder.value,
    }

    fetch(filterApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(filterObj)
    }).then(res => res.json()).then(data => {
        GetFilterData();
        InputFilterName.value = '';
        InputPropertyKey.value = '';
        InputFilterBodyId.value = '';
        InputDisplayOrder.value = '';
    });
}

function SaveUpdateFilter() {
    if (!InputFilterName.value || !InputPropertyKey.value || !InputDisplayOrder.value || !InputFilterBodyId.value) {
        alert('Please Enter All Fields');
        return;
    }

    let filterObj = {
        id: FilterObj.id,
        filterName: InputFilterName.value,
        propertyKey: InputPropertyKey.value,
        bodyId: InputFilterBodyId.value,
        displayOrder: InputDisplayOrder.value,
    }

    fetch(filterApi + '/' + filterObj.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterObj)
    }).then(res => res.json()).then(data => {
        GetFilterData();
        btnAddFilter.hidden = false;
        InputFilterName.value = '';
        InputPropertyKey.value = '';
        InputFilterBodyId.value = '';
        InputDisplayOrder.value = '';
    });
}

function DeleteFilter(filterId) {
    fetch(filterApi + '/' + filterId, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()).then(data => {
        GetFilterData();
        btnAddFilter.hidden = false;
        InputFilterName.value = '';
        InputPropertyKey.value = '';
        InputFilterBodyId.value = '';
        InputDisplayOrder.value = '';
    });
}

function UpdateFilter(filterId) {
    btnAddFilter.hidden = true;
    btnUpdateFilter.hidden = false;
    FilterObj = FiltersArry.find(i => i.id == filterId);
    if (FilterObj) {
        InputFilterName.value = FilterObj.filterName;
        InputPropertyKey.value = FilterObj.propertyKey;
        InputFilterBodyId.value = FilterObj.bodyId;
        InputDisplayOrder.value = FilterObj.displayOrder;
    }
}

function td_fun({ id, bodyId, filterName, propertyKey, displayOrder }) {
    let td = document.createElement('tr');
    td.innerHTML = `
    <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
                <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                        ${filterName}
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
                        ${bodyId}
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
        <button class="btn btn-success" onclick="UpdateFilter('${id}')">Update</button>
        <button class="btn btn-danger" onclick="DeleteFilter('${id}')">Delete</button>
    </td>
    `;
    return td;
}

GetFilterData();