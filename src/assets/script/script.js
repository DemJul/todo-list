//делегирование - 181 стр
//разные способы создания/добавления элементов - appendChild, append, prepend,textContent,createElement
//всегда удаляете выделенные ресурсы (обработчики)
//обработка событий на разных стадиях - 236 стр(фаза перехвата)
//preventDefault(194 стр) stopImmediatePropagation(184 стр) stopPropagation(260 стр)
// в нужных местах применяете target/currentTarget - есть только target
//работа с формой через форму - есть autofocus maxlength, а также использовала document.forms[0].elements.<nameInput>
// кастомное событие через new Event -с 324 стр - 
// создала два события emptyListTask и addTask, используются в MutationObserver
// Drag and Drop c 258 строки


let addTaskDiv = document.querySelector('.empty-list');
let addFormDiv = document.querySelector('.add-form');
let listDiv = document.querySelector('.list-task');
let checkElement = document.getElementsByClassName('.task__checkbox');

let btnAddTask = document.querySelector('.add-form__add-bnt');
let btnCancel = document.querySelector('.add-form__cancel-bnt');

let clearBtn = document.querySelector('.todo__delete-all');


let todo;
let generateIdArr = [];
// id задается один раз
function Task(name, id = undefined) {
    this.name = name;
    this.id = id;
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
        return element ? element.querySelector('.task__checkbox').dataset.id : null;
    }

    this.getIndexTask = (id) => {
        if (id) {
            return this.listTask.findIndex(item => item.id === id);
        }
        // Если последнего элемента нет, тогда берем последний из listTask
        return this.listTask.length;
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
    //скролл всегда будет внизу
    listDiv.scrollTop = listDiv.scrollHeight;
    setInterval(() => {
        let newValue = document.forms.newTask.elements.task.value;

        btnAddTask.disabled = (newValue === '') ? 'true' : '';
        btnCancel.disabled = (newValue === '') ? 'true' : '';

    }, 2000)

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
    // создание div для task
    const taskDiv = document.createElement('div');
    taskDiv.className = "list-task__item task";
    taskDiv.setAttribute("draggable", 'true');
    // создание div
    const taskLabel = document.createElement('div');
    taskLabel.className = "task__name";
    // создание span
    const taskSpan = document.createElement('span');
    taskSpan.className = "task__text";
    taskSpan.textContent = text;
    taskLabel.append(taskSpan)

    // создание input
    const taskInput = document.createElement('input');
    taskInput.className = "task__checkbox";
    taskInput.setAttribute("type", 'checkbox');
    taskInput.setAttribute("data-id", `${idTask}`);
    taskLabel.prepend(taskInput);
    taskDiv.prepend(taskLabel);
    return taskDiv;
}

function renderListTask() {

    let content = document.createDocumentFragment();
    todo.listTask.map(item => {
        content.append(generateTaskForm(item.name, item.id));

    });
    listDiv.prepend(content);
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

// делегирование
window.addEventListener('click', (event) => {

    // Прекращает дальнейшую передачу события
    // и другие события click на window не сработают - не сработает вывод сообщение "Еще одно событие click"
    event.stopImmediatePropagation();
    let classEvent = event.target.className;
    switch (classEvent) {
        case "empty-list__button":
            addFormDiv.classList.remove('_hidden');
            addTaskDiv.classList.add('_hidden');
            break;
        case "add-form__add-bnt":
            // Отменяю действие браузера по умолчанию
            //Теперь даже если есть в input required 
            // Сообщение о пустом поле не появится
            event.preventDefault();
            let newValue = document.forms.newTask.elements.task.value;
            if (newValue !== '') {
                let idTask = generateId();
                todo.addTask(new Task(newValue, idTask));
                let taskDiv = generateTaskForm(newValue, idTask);
                event.target.form.reset();
                listDiv.appendChild(taskDiv);
                let eventAddTask = new Event('eventAddTask');
                window.dispatchEvent(eventAddTask);
                btnAddTask.disabled = 'true';
                btnCancel.disabled = 'true';
            } else {
                alert('Задача пустая');
                // Возврат фокуса на input
                document.querySelector(".add-form__input").focus();
            }
            //скролл всегда будет внизу
            listDiv.scrollTop = listDiv.scrollHeight;
            break;
        case "todo__delete-all":
            todo.clear();
            console.log('task', todo.listTask)
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

window.addEventListener('click', (event) => {
    alert('Еще одно событие click');
});

// Обработка события при перехвате 
window.addEventListener('click', (event) => {
    if (event.target.className === 'todo__delete-all') {
        let answer = confirm('Вы точно хотите очистить список?');
        if (!answer) {
            event.stopImmediatePropagation();
        }
    }
}, true);

window.addEventListener('emptyListTask', (event) => {
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
//Drag and Drop - перемещение задач
listDiv.addEventListener(`dragstart`, (event) => {
    //Дальше всплывать событию не нужно
    //использую stopPropagation, а не stopImmediatePropagation,
    //потому что другого события dragstart на listDiv нет
    event.stopPropagation();
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
//MutationObserver - наблюдатль за кол-во задач в списке
// и взависимости от кол-ва вызывает два кастомных события
// emptyListTask или addTask
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