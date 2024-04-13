const inputApi = 'http://localhost:3000/inputs';
let InputPropertyKey = document.getElementById('InputPropertyKey');
let InputBodyId = document.getElementById('InputBodyId');
let InputPlaceHolder = document.getElementById('InputPlaceHolder');
let InputValidationId = document.getElementById('InputValidationId');
let InputIsVisible = document.getElementById('InputIsVisible');
let InputIsRequired = document.getElementById('InputIsRequired');
let InputDisplayOrder = document.getElementById('InputDisplayOrder');
let btnAddInput = document.getElementById("btnAddInput");
let btnUpdateInput = document.getElementById("btnUpdateInput");
let tbody = document.getElementById("tbody");
let InputsArry = [];
InputObj = {};

function GetInputData() {
    btnUpdateInput.hidden = true;
    InputsArry = [];
    tbody.innerHTML = '';
    fetch(inputApi).then(res => res.json()).then(json => {
        InputsArry = json;
        json.map(data => {
            tbody.append(td_fun(data));
        });
        btnAddInput.hidden = false;
        InputPropertyKey.value = '';
        InputBodyId.value = '';
        InputPlaceHolder.value = '';
        InputValidationId.value = '';
        InputDisplayOrder.value = '';
        InputIsVisible.checked = false;
        InputIsRequired.checked = false;
    });
}

function AddNewInput() {
    if (!InputPropertyKey.value || !InputBodyId.value || !InputPlaceHolder.value || !InputValidationId.value) {
        alert('Please Enter All Fields');
        return;
    }

    let inputObj = {
        propertyKey: InputPropertyKey.value,
        bodyId: InputBodyId.value,
        placeHolder: InputPlaceHolder.value,
        validationId: InputValidationId.value,
        displayOrder: InputDisplayOrder.value,
        isVisible: InputIsVisible.checked,
        isRequired: InputIsRequired.checked,
    }

    fetch(inputApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(inputObj)
    }).then(res => res.json()).then(data => {
        GetInputData();
        InputPropertyKey.value = '';
        InputBodyId.value = '';
        InputPlaceHolder.value = '';
        InputValidationId.value = '';
        InputDisplayOrder.value = '';
        InputIsVisible.checked = false;
        InputIsRequired.checked = false;
    });
}

function SaveUpdateInput() {
    if (!InputPropertyKey.value || !InputBodyId.value || !InputPlaceHolder.value) {
        alert('Please Enter All Fields');
        return;
    }

    let inputObj = {
        id: InputObj.id,
        propertyKey: InputPropertyKey.value,
        bodyId: InputBodyId.value,
        placeHolder: InputPlaceHolder.value,
        validationId: InputValidationId.value,
        displayOrder: InputDisplayOrder.value,
        isVisible: InputIsVisible.checked,
        isRequired: InputIsRequired.checked,
    }

    fetch(inputApi + '/' + inputObj.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputObj)
    }).then(res => res.json()).then(data => {
        GetInputData();
        btnAddInput.hidden = false;
        InputPropertyKey.value = '';
        InputBodyId.value = '';
        InputPlaceHolder.value = '';
        InputValidationId.value = '';
        InputDisplayOrder.value = '';
        InputIsVisible.checked = false;
        InputIsRequired.checked = false;
    });
}

function DeleteInput(inputId) {
    fetch(inputApi + '/' + inputId, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()).then(data => {
        GetInputData();
        btnAddInput.hidden = false;
        InputPropertyKey.value = '';
        InputBodyId.value = '';
        InputPlaceHolder.value = '';
        InputValidationId.value = '';
        InputDisplayOrder.value = '';
        InputIsVisible.checked = false;
        InputIsRequired.checked = false;
    });
}

function UpdateInput(inputId) {
    btnAddInput.hidden = true;
    btnUpdateInput.hidden = false;
    InputObj = InputsArry.find(i => i.id == inputId);
    if (InputObj) {
        InputPropertyKey.value = InputObj.propertyKey;
        InputBodyId.value = InputObj.bodyId;
        InputPlaceHolder.value = InputObj.placeHolder;
        InputValidationId.value = InputObj.validationId;
        InputDisplayOrder.value = InputObj.displayOrder;
        InputIsVisible.checked = InputObj.isVisible;
        InputIsRequired.checked = InputObj.isRequired;

    }
}

function td_fun({ id, propertyKey, validationId, displayOrder, bodyId, placeHolder, isVisible, isRequired }) {
    let td = document.createElement('tr');
    td.innerHTML = `
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
                        ${placeHolder}
                    </div>
                </div>
        </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
                <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                        ${validationId}
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
                    ${isRequired}
                </div>
            </div>
    </div>
</td>
    <td class="whitespace-nowrap">
        <button class="btn btn-success" onclick="UpdateInput('${id}')">Update</button>
        <button class="btn btn-danger" onclick="DeleteInput('${id}')">Delete</button>
    </td>
    `;
    return td;
}

GetInputData();