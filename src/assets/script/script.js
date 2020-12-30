let addTaskDiv = document.querySelector('.emptyList');
let addFormDiv = document.querySelector('.addForm');
let listDiv = document.querySelector('.listTask');

let listTask;

function getlistTask() {
    return localStorage.getItem('listTask') ? JSON.parse(localStorage.getItem('listTask')) : [];
}

function saveStorageTodo(task) {
    if (localStorage.getItem('listTask') === null) {
        listTask = [];
    } else {
        listTask = JSON.parse(localStorage.getItem('listTask'));
    }
    listTask.push(task);
    localStorage.setItem('listTask', JSON.stringify(listTask));
}

function startInit() {
    listTask = getlistTask();

    if (listTask.length === 0) {
        addTaskDiv.classList.remove('_hidden');
    } else {
        listDiv.classList.remove('_hidden');
        renderListTask();
    }

}

window.addEventListener('click', (event) => {
    let classEvent = event.target.className;
    if (classEvent === "emptyList__button") {
        addFormDiv.classList.remove('_hidden');
        addTaskDiv.classList.add('_hidden');
    } else if (classEvent === "addForm__add-bnt") {
        saveStorageTodo(event.target.form.elements.input.value);
        debugger
        console.log(listDiv);
        if (listDiv.classList.contains('_hidden')) {
            listDiv.classList.remove('_hidden');
        }
        let taskDiv = generateTaskForm(event.target.form.elements.input.value);
        event.target.form.reset();
        listDiv.insertAdjacentHTML('beforeEnd', taskDiv);
        console.log(listDiv);
    }
})

function generateTaskForm(text) {
    let block = `<div class="listTask__item task">
        <label class="task__name"
            ><input
            class="task__checkbox"
            type="checkbox"
            name="option${listTask.length - 1 }"
            value="${listTask.length - 1 }"
            />${text}</label
        >
        <button class="task__delete">Удалить задачу</button>
    </div>`;
    return block;
}

function renderListTask() {
    let content = '';
    listTask.map(item => {
        content += generateTaskForm(item);

    });
    listDiv.insertAdjacentHTML('beforeEnd', content);
}

startInit();