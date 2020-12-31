let addTaskDiv = document.querySelector('.emptyList');
let addFormDiv = document.querySelector('.addForm');
let listDiv = document.querySelector('.listTask');

let clearBtn = document.querySelector('.todo__deleteAll');
let todo;

function Task(name, id = undefined, done = false) {
    this.name = name;
    this.id = id;
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
        this.saveStorageTodo(task);
    }

    this.saveStorageTodo = (task) => {
        localStorage.setItem('listTask', JSON.stringify(listTask));
    }

    this.getListTask = () => {
        return this.listTask;
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

function generateTaskForm(text) {
    let todoLength = todo.listTask.length;
    let block = `<div class="listTask__item task">
        <label class="task__name"
            ><input
            class="task__checkbox"
            type="checkbox"
            name="option${todoLength - 1 }"
            value="${todoLength - 1 }"
            />${text}</label
        >
        <button class="task__delete">Удалить задачу</button>
    </div>`;
    return block;
}

function renderListTask() {
    let content = '';
    todo.listTask.map(item => {
        content += generateTaskForm(item.name);

    });
    listDiv.insertAdjacentHTML('beforeEnd', content);
}


window.addEventListener('click', (event) => {
    let classEvent = event.target.className;
    if (classEvent === "emptyList__button") {
        addFormDiv.classList.remove('_hidden');
        addTaskDiv.classList.add('_hidden');
    } else if (classEvent === "addForm__add-bnt") {
        event.preventDefault();
        let newValue = event.target.form.elements.input.value;
        console.log(todo);
        todo.addTask(new Task(newValue));
        let taskDiv = generateTaskForm(newValue);
        event.target.form.reset();
        listDiv.insertAdjacentHTML('beforeEnd', taskDiv);
        let eventAddTask = new Event('eventAddTask');
        window.dispatchEvent(eventAddTask);
        console.log(listDiv);
    } else if (classEvent === "todo__deleteAll") {
        todo.clear();
        // listDiv.innerHTML = '';
        // Использование навигации
        while (listDiv.firstChild) {
            listDiv.removeChild(listDiv.lastChild);
        }
        let emptyListTask = new Event('emptyListTask');
        window.dispatchEvent(emptyListTask);
    }
    console.log(event.target);
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