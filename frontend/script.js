const API_URL = "http://localhost:8080/api/tasks";
const taskList = document.getElementById("taskList");
const form = document.getElementById("taskForm");

function showMessage(msg, isError = false) {
    let el = document.getElementById("msgBox");
    if (!el) {
        el = document.createElement("div");
        el.id = "msgBox";
        el.style.margin = "10px 0";
        document.querySelector(".container").insertBefore(el, taskList);
    }
    el.textContent = msg;
    el.style.color = isError ? "salmon" : "lightgreen";
}

async function loadTasks() {
    taskList.innerHTML = "";
    showMessage("Carregando tarefas...");
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const tasks = await res.json();
        showMessage(`Foram carregadas ${tasks.length} tarefas`);
        tasks.forEach(task => {
            const li = document.createElement("li");
            li.className = task.completed ? "completed" : "";
            li.innerHTML = `
                <span>${task.title} - ${task.description || ""}</span>
                <div class="actions">
                    <button data-id="${task.id}" class="toggle">✔</button>
                    <button data-id="${task.id}" class="delete">🗑</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    } catch (err) {
        console.error(err);
        showMessage("Erro ao carregar tarefas: " + err.message, true);
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, completed: false })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        form.reset();
        loadTasks();
    } catch (err) {
        console.error(err);
        showMessage("Erro ao criar tarefa: " + err.message, true);
    }
});

taskList.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    if (e.target.classList.contains("toggle")) {
        try {
            const res = await fetch(`${API_URL}/${id}/toggle`, { method: "PATCH" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            loadTasks();
        } catch (err) {
            console.error(err);
            showMessage("Erro ao alternar tarefa: " + err.message, true);
        }
    } else if (e.target.classList.contains("delete")) {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            loadTasks();
        } catch (err) {
            console.error(err);
            showMessage("Erro ao deletar tarefa: " + err.message, true);
        }
    }
});

loadTasks();
