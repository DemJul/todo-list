let addTaskDiv = document.querySelector('.empty-list');
let addFormDiv = document.querySelector('.add-form');
let listDiv = document.querySelector('.list-task');
let checkElement = document.getElementsByClassName('.task__checkbox');

let btnAddTask = document.querySelector('.add-form__add-bnt');
let btnCancel = document.querySelector('.add-form__cancel-bnt');

let clearBtn = document.querySelector('.todo__delete-all');
//скролл всегда будет внизу
listDiv.scrollTop = listDiv.scrollHeight;

let todo;
let generateIdArr = [];
// id задается один раз, а sortId меняется каждый раз, если пользователь
//меняет порядок задач
function Task(name, id = undefined, sortId, done = false) {
    this.name = name;
    this.id = id;
    this.sortId = sortId;
    this.done = done;
}

function ListTask(listTask = []) {
    this.listTask = listTask;

    this.isCorrect = () => {
        this.listTask.forEach(item => {
            if (!item instanceof Task) throw new Error("Данные содержат ошибку");
        });
    }

    this.addTask = (task) => {
        if (!task instanceof Task) throw new Error("Данные не принадлежат Task");
        this.listTask.push(task);
        this.saveStorageTodo();
        console.log(this.listTask);
    }

    this.saveStorageTodo = () => {
        localStorage.setItem('listTask', JSON.stringify(listTask));
    }

    this.getListTask = () => {
        return this.listTask;
    }

    this.deleteTask = (idTask) => {
        let indexTask = this.listTask.findIndex(item => item.id === idTask);
        this.listTask.splice(indexTask, 1);
        this.saveStorageTodo();
    }

    this.getIdElement = (element) => {
        return element.querySelector('.task__checkbox').dataset.id;
    }

    this.getIndexTask = (id) => {
        return this.listTask.findIndex(item => item.id === id)
    }

    this.changeListTask = (activeElement, nextElement) => {
        let idActive = this.getIdElement(activeElement);
        let idNext = this.getIdElement(nextElement);

        let indexActive = this.getIndexTask(idActive);
        let indexNext = this.getIndexTask(idNext);

        let transformTask = this.listTask[indexActive];
        this.listTask.splice(indexActive, 1)
        if (indexActive > indexNext) {
            this.listTask.splice(indexNext, 0, transformTask)
        } else {
            this.listTask.splice(indexNext - 1, 0, transformTask)
        }

        this.saveStorageTodo();
    }

    this.clear = () => {
        this.listTask = [];
        localStorage.clear();
    }
}

const getStorage = () => {
    return localStorage.getItem('listTask') ? JSON.parse(localStorage.getItem('listTask')) : [];
}

function startInit() {
    todo = new ListTask(getStorage());

    if (todo.listTask.length === 0) {
        //удаляем список задач и кнопку очистить
        visibleList(false);
        addTaskDiv.classList.remove('_hidden');
    } else {
        //добавляем список задач и кнопку очистить
        visibleList(true);
        renderListTask();
        addFormDiv.classList.remove('_hidden');

    }
    console.log(todo);

}
//вместе с формой появляется/исчезает кнопка очистить
function visibleList(isVisible) {
    if (isVisible) {
        listDiv.classList.remove('_hidden');
        clearBtn.classList.remove('_hidden');
    } else {
        listDiv.classList.add('_hidden');
        clearBtn.classList.add('_hidden');
    }
}

function generateTaskForm(text, idTask) {
    let todoLength = todo.listTask.length;
    let block = `<div class="list-task__item task" draggable="true">
        <label class="task__name"
            ><input
            class="task__checkbox"
            type="checkbox"
            name="option${todoLength - 1 }"
            data-id="${idTask}"
            value="${todoLength - 1 }"
            />${text}</label
        >
    </div>`;
    return block;
}

function renderListTask() {
    let content = '';
    todo.listTask.map(item => {
        content += generateTaskForm(item.name, item.id);

    });
    listDiv.insertAdjacentHTML('beforeEnd', content);
}

function generateId() {
    let randNumber = Math.random().toString(36).substr(2, 9);
    if (generateIdArr.includes(randNumber)) {
        return generateId();
    } else {
        generateIdArr.push(randNumber);
        return randNumber
    }
}


window.addEventListener('click', (event) => {
    let classEvent = event.target.className;
    switch (classEvent) {
        case "empty-list__button":
            addFormDiv.classList.remove('_hidden');
            addTaskDiv.classList.add('_hidden');
            break;
        case "add-form__add-bnt":
            event.preventDefault();
            let newValue = document.forms.newTask.elements.task.value;
            if (newValue !== '') {
                let idTask = generateId();
                todo.addTask(new Task(newValue, idTask, todo.getListTask().length));
                let taskDiv = generateTaskForm(newValue, idTask);
                event.target.form.reset();
                listDiv.insertAdjacentHTML('beforeEnd', taskDiv);
                let eventAddTask = new Event('eventAddTask');
                window.dispatchEvent(eventAddTask);
            } else {
                alert('Задача пустая');
                // Возврат фокуса на input
                document.querySelector(".add-form__input").focus();
            }
            break;
        case "todo__delete-all":
            todo.clear();
            // listDiv.innerHTML = '';
            // Навигации
            while (listDiv.firstChild) {
                listDiv.removeChild(listDiv.lastChild);
            }
            let emptyListTask = new Event('emptyListTask');
            window.dispatchEvent(emptyListTask);
            break;
    }
});

window.addEventListener('emptyListTask', (event) => {
    console.log(event);
    //убираем список задач и кнопку очистить
    visibleList(false);
    listDiv.innerHTML = '';
});

window.addEventListener('addTask', (event) => {
    if (todo.listTask.length === 1) {
        //добавляем список задач и кнопку очистить
        visibleList(true);
    };
});

listDiv.addEventListener(`dragstart`, (event) => {
    event.target.classList.add(`_selected`);
});

listDiv.addEventListener(`dragend`, (event) => {
    let activeElement = event.target;
    activeElement.classList.remove(`_selected`);
});

function getNextElement(cursorPosition, currentElement) {
    let currentElementCoord = currentElement.getBoundingClientRect();
    let currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;
    let nextElement = (cursorPosition < currentElementCenter) ?
        currentElement :
        currentElement.nextElementSibling;
    return nextElement;
};

listDiv.addEventListener(`dragover`, (event) => {
    event.preventDefault();

    let activeElement = listDiv.querySelector(`._selected`);
    let currentElement = event.target.closest('.list-task__item')

    let isMoveable = activeElement !== currentElement &&
        currentElement.classList.contains(`list-task__item`);

    if (!isMoveable) {
        return;
    }

    let nextElement = getNextElement(event.clientY, currentElement);

    if (
        nextElement &&
        activeElement === nextElement.previousElementSibling ||
        activeElement === nextElement
    ) {
        return;
    }
    console.log('active', activeElement)
    console.log('next', nextElement)
    todo.changeListTask(activeElement, nextElement);
    listDiv.insertBefore(activeElement, nextElement);


});

window.addEventListener('input', (event) => {
    let eventClass = event.target.className;
    switch (eventClass) {
        case 'task__checkbox':
            todo.deleteTask(event.target.dataset.id);
            event.target.closest('.task').remove();
            if (todo.getListTask().length === 0) {
                let emptyListTask = new Event('emptyListTask');
                window.dispatchEvent(emptyListTask);
            }
        case 'add-form__input':
            btnAddTask.disabled = (event.target.value === '') ? 'true' : '';
            btnCancel.disabled = (event.target.value === '') ? 'true' : '';
    }
});

let observer = new MutationObserver(mutationRecords => {
    if (mutationRecords[0].target.childNodes.length === 0) {
        let emptyListTask = new Event('emptyListTask');
        window.dispatchEvent(emptyListTask);
    } else {
        let addTask = new Event('addTask'); //создаем событие
        window.dispatchEvent(addTask); //вызываем срабатывание события
    }
});


observer.observe(listDiv, {
    childList: true, // наблюдать за непосредственными детьми
});

startInit();