
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
      try {
          const res = await fetch("/api/tasks", {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("token")}`
              }
          });

          if (!res.ok) {
              const error = await res.json();
              console.error("Error fetching tasks:", error);
              alert(error.message || "Failed to fetch tasks.");
              return;
          }

          const tasks = await res.json();
          if (!Array.isArray(tasks)) {
              console.error("Expected an array but got:", tasks);
              return;
          }

          todoTable.innerHTML = "";
          inProgressTable.innerHTML = "";
          completeTable.innerHTML = "";

          tasks.forEach((task) => {
              const row = renderTaskRow(task);
              if (task.status === "TO DO") todoTable.appendChild(row);
              else if (task.status === "IN PROGRESS") inProgressTable.appendChild(row);
              else if (task.status === "COMPLETE") completeTable.appendChild(row);
          });

      } catch (error) {
          console.error("Error fetching tasks:", error);
          alert("Failed to fetch tasks. Please try again.");
      }
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

    try {
        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}` // Include token if required for authentication
            },
            body: JSON.stringify({ title }),
        });

        if (!res.ok) {
            const error = await res.json();
            return alert(error.message || "Failed to add task.");
        }

        const newTask = await res.json();
        console.log("Task added:", newTask);
        
        // Clear the input field and refresh the task list
        taskTitleInput.value = "";
        fetchTasks();
    } catch (error) {
        console.error("Error adding task:", error);
        alert("Failed to add task. Please try again.");
    }
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

// 🛡️ حماية الصفحة
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// 🧠 جلب بيانات المستخدم من localStorage
const user = JSON.parse(localStorage.getItem("user"));
const welcomeText = document.getElementById("welcome-text");

if (user && user.email) {
  const username = user.email.split("@")[0]; // ناخذ الاسم قبل @
  welcomeText.textContent = `Welcome back, ${username} 👋`;
}

// 🚪 دالة تسجيل الخروج
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  alert("Logged out successfully!");
  window.location.href = "login.html";
}

// 🔔 تشغيل القائمة المنسدلة للإشعارات
function toggleDropdown() {
  const dropdown = document.getElementById("notificationDropdown");
  dropdown.classList.toggle("show");
}

// 🌗 Toggle Light and Dark Mode
function toggleTheme() {
  const body = document.body;
  body.classList.toggle("dark-mode");
  body.classList.toggle("light-mode");
  
  // Save the current theme preference to localStorage
  const isDarkMode = body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
}

// 📅 Show Notification if Task is Near Due Date
function checkTaskDueDates() {
  const notificationWrapper = document.querySelector(".notification-wrapper");
  const notificationIcon = document.querySelector(".notification-icon");
  const today = new Date();
  let hasUpcomingTasks = false;

  // Check all task tables
  ["todoTable", "inProgressTable", "completeTable"].forEach((tableId) => {
    const table = document.getElementById(tableId);
    if (table) {
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const dueDateCell = row.querySelector("td:nth-child(2)");
        if (dueDateCell) {
          const dueDate = new Date(dueDateCell.textContent.trim());
          const daysLeft = (dueDate - today) / (1000 * 60 * 60 * 24);
          
          // Show notification if the task is due within 3 days
          if (daysLeft >= 0 && daysLeft <= 3) {
            hasUpcomingTasks = true;
          }
        }
      });
    }
  });

  // Show or hide the notification dot
  if (notificationWrapper) {
    if (hasUpcomingTasks) {
      notificationWrapper.classList.add("has-notification");
    } else {
      notificationWrapper.classList.remove("has-notification");
    }
  }
}

// Load the saved theme preference on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.add("light-mode");
  }
  checkTaskDueDates();
});
setInterval(checkTaskDueDates, 60000);

// 📁 Sidebar Toggle for Mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-open');
}
// 📊 Improved Filter Tasks by Priority with Full Persistence
function toggleFilter() {
    const filterButton = document.querySelector(".filter-btn");
    const isCurrentlyFiltered = localStorage.getItem("isFiltered") === "true";
    const newFilterState = !isCurrentlyFiltered;

    // Update localStorage
    localStorage.setItem("isFiltered", newFilterState);

    // Update button active state
    filterButton.classList.toggle("active", newFilterState);

    // Apply sorting or reset based on the new filter state
    applyTaskSorting(newFilterState);
}

// Apply sorting based on the current filter state
function applyTaskSorting(isFiltered) {
    const tables = ["todoTable", "inProgressTable", "completeTable"];
    const priorityOrder = ["high", "medium", "low"];

    tables.forEach((tableId) => {
        const table = document.getElementById(tableId);
        if (table) {
            const tbody = table.querySelector("tbody");
            const rows = Array.from(tbody.querySelectorAll("tr"));

            if (isFiltered) {
                // Sort rows by priority
                rows.sort((a, b) => {
                    const aPriorityCell = a.querySelector("td:nth-child(3) select");
                    const bPriorityCell = b.querySelector("td:nth-child(3) select");

                    if (!aPriorityCell || !bPriorityCell) return 0;

                    const aPriority = aPriorityCell.value.trim().toLowerCase();
                    const bPriority = bPriorityCell.value.trim().toLowerCase();

                    const aIndex = priorityOrder.indexOf(aPriority);
                    const bIndex = priorityOrder.indexOf(bPriority);

                    return aIndex - bIndex;
                });
            } else {
                // Restore original order using data-index
                rows.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
            }

            // Rebuild the table body
            tbody.innerHTML = "";
            rows.forEach((row, index) => {
                // Set the original index if not already set
                if (!row.dataset.index) row.dataset.index = index;
                tbody.appendChild(row);
            });

            // Save the current state to localStorage
            localStorage.setItem(`${tableId}-tasks`, tbody.innerHTML);
        }
    });
}

// Apply the saved filter state on page load
window.addEventListener("DOMContentLoaded", () => {
    const isFiltered = localStorage.getItem("isFiltered") === "true";
    const filterButton = document.querySelector(".filter-btn");

    // Set button state and apply sorting based on saved state
    filterButton.classList.toggle("active", isFiltered);

    // Restore saved tasks and apply sorting
    ["todoTable", "inProgressTable", "completeTable"].forEach((tableId) => {
        const table = document.getElementById(tableId);
        const savedTasks = localStorage.getItem(`${tableId}-tasks`);
        if (savedTasks) {
            const tbody = table.querySelector("tbody");
            tbody.innerHTML = savedTasks;
            applyTaskSorting(isFiltered);
        }
    });
});