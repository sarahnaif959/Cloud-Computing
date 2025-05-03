
document.addEventListener("DOMContentLoaded", () => {
  const todoTable = document.querySelector("#todoTable tbody");
  const inProgressTable = document.querySelector("#inProgressTable tbody");
  const completeTable = document.querySelector("#completeTable tbody");
  const taskTitleInput = document.getElementById("taskTitle");

  const renderTaskRow = (task) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${task.title}</td>
      <td><input type="date" value="${task.dueDate ? task.dueDate.slice(0, 10) : ""}" onchange="updateTask('${task._id}', 'dueDate', this.value)" /></td>
      <td>
        <select onchange="updateTask('${task._id}', 'priority', this.value)" style="color:${task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'orange' : 'gray'}">
          <option value="Low" ${task.priority === "Low" ? "selected" : ""}>Low</option>
          <option value="Medium" ${task.priority === "Medium" ? "selected" : ""}>Medium</option>
          <option value="High" ${task.priority === "High" ? "selected" : ""}>High</option>
        </select>
      </td>
      <td>
        <select onchange="updateTask('${task._id}', 'status', this.value)">
          <option value="TO DO" ${task.status === "TO DO" ? "selected" : ""}>TO DO</option>
          <option value="IN PROGRESS" ${task.status === "IN PROGRESS" ? "selected" : ""}>IN PROGRESS</option>
        </select>
      </td>
      <td>
        <button onclick="editTask('${task._id}')">Edit</button>
        <button onclick="markDone('${task._id}')">Done</button>
        <button onclick="markDelete('${task._id}')">Delete</button>

      </td>
    `;
    return row;
  };

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    const tasks = await res.json();
    todoTable.innerHTML = "";
    inProgressTable.innerHTML = "";
    completeTable.innerHTML = "";
    tasks.forEach((task) => {
      const row = renderTaskRow(task);
      if (task.status === "TO DO") todoTable.appendChild(row);
      else if (task.status === "IN PROGRESS") inProgressTable.appendChild(row);
      else if (task.status === "COMPLETE") completeTable.appendChild(row);
    });
  };

  window.updateTask = async (id, field, value) => {
    await fetch("/api/tasks/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    fetchTasks();
  };

  window.editTask = (id) => {
    const newTitle = prompt("Enter new title:");
    if (newTitle) updateTask(id, "title", newTitle);
  };

  window.markDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;
  
    await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }
  
  window.markDone = (id) => {
    updateTask(id, "status", "COMPLETE");
  };

  window.addTask = async () => {
    const title = taskTitleInput.value.trim();
    if (!title) return alert("Please enter a task title.");
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    taskTitleInput.value = "";
    fetchTasks();
  };

  fetchTasks();
});



function toggleDropdown() {
    const dropdown = document.getElementById("notificationDropdown");
    dropdown.classList.toggle("show");
  }
  
  window.addEventListener("click", function (e) {
    const dropdown = document.getElementById("notificationDropdown");
    const icon = document.querySelector(".notification-icon");
    if (!dropdown.contains(e.target) && !icon.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
  