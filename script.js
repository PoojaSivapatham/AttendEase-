
/*const employeeForm = document.getElementById("employee-form");
const employeeName = document.getElementById("employee-name");
const employeeId = document.getElementById("employee-id");
const employeeList = document.getElementById("employee-list");

let employees = JSON.parse(
    localStorage.getItem("employees")
) || [];

employeeForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = employeeName.value.trim();
    const id = employeeId.value.trim();

    if (name === "" || id === "") {
        alert("Please enter both name and employee ID.");
        return;
    }

    const duplicate = employees.some(function(employee) {
        return employee.id.toLowerCase() === id.toLowerCase();
    });

    if (duplicate) {
        alert("This employee ID already exists.");
        return;
    }

    employees.push({
        name: name,
        id: id
    });
  localStorage.setItem(
    "employees",
    JSON.stringify(employees)
);

    displayEmployees();
    displayAttendance();
    updateDashboard();
  displayHistory();

    employeeForm.reset();
});


function displayEmployees() {
    employeeList.innerHTML = "";

    if (employees.length === 0) {
        employeeList.textContent = "No employees added yet.";
        return;
    }

    employees.forEach(function(employee) {
        const card = document.createElement("div");
        const name = document.createElement("h3");
        const id = document.createElement("p");
        const removeButton = document.createElement("button");

        name.textContent = employee.name;
        id.textContent = "Employee ID: " + employee.id;

        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", function() {
            employees = employees.filter(function(item) {
                return item.id !== employee.id;
            });

            localStorage.setItem(
                "employees",
                JSON.stringify(employees)
            );

            displayEmployees();
          displayAttendance();
          updateDashboard();
          displayHistory();
        });

        card.appendChild(name);
        card.appendChild(id);
        card.appendChild(removeButton);

        employeeList.appendChild(card);
    });
}

displayEmployees();

*/

const employeeForm = document.getElementById("employee-form");

let employees = JSON.parse(
    localStorage.getItem("employees")
) || [];

console.log("Saved employees:", employees);

// Support employees saved using the old format.
employees = employees.map(function(employee) {
    if (!employee.firstName) {
        const parts = (employee.name || "").trim().split(/\s+/);

        employee.firstName = parts.shift() || "";
        employee.lastName = parts.join(" ");
        employee.mobile = employee.mobile || "";
        employee.email = employee.email || "";
        employee.salary = employee.salary || "";
        employee.joiningDate = employee.joiningDate || "";
    }

    return employee;
});

localStorage.setItem("employees", JSON.stringify(employees));

let selectedEmployeeId = null;

const employeeMenu = document.getElementById("employee-menu");
const employeeBackButton = document.getElementById("employee-back-button");

const employeeViews = [
    "add-employee-view",
    "remove-employee-view",
    "view-employee-view",
    "edit-employee-view",
    "employee-details-view",
    "edit-employee-form-view"
];

function showEmployeeView(viewId) {
    employeeViews.forEach(function(id) {
        document.getElementById(id).hidden = id !== viewId;
    });

    employeeMenu.hidden = viewId !== "";
    employeeBackButton.hidden = viewId === "";

    if (viewId === "remove-employee-view") {
        displayRemoveEmployees();
    }

    if (viewId === "view-employee-view") {
        displayViewEmployees();
    }

    if (viewId === "edit-employee-view") {
        displayEditEmployees();
    }
}

document.querySelectorAll("[data-employee-view]").forEach(function(button) {
    button.addEventListener("click", function() {
        const option = button.dataset.employeeView;

        const views = {
            add: "add-employee-view",
            remove: "remove-employee-view",
            view: "view-employee-view",
            edit: "edit-employee-view"
        };

        showEmployeeView(views[option]);
    });
});

employeeBackButton.addEventListener("click", function() {
    showEmployeeView("");
});

function getEmployeeName(employee) {
    return (
        (employee.firstName || "") + " " +
        (employee.lastName || "")
    ).trim() || employee.name || "";
}

function saveEmployees() {
    localStorage.setItem("employees", JSON.stringify(employees));

    displayAttendance();
    updateDashboard();
    displayHistory();
}

function isDuplicateId(id, currentId) {
    return employees.some(function(employee) {
        return employee.id.toLowerCase() === id.toLowerCase()
            && employee.id !== currentId;
    });
}

function getAddEmployeeData() {
    return {
        firstName: document.getElementById("employee-first-name").value.trim(),
        lastName: document.getElementById("employee-last-name").value.trim(),
        id: document.getElementById("employee-id").value.trim(),
        mobile: document.getElementById("employee-mobile").value.trim(),
        email: document.getElementById("employee-email").value.trim(),
        salary: document.getElementById("employee-salary").value,
        joiningDate: document.getElementById("employee-joining-date").value
    };
}

function validateEmployee(employee, currentId) {
    if (
        !employee.firstName ||
        !employee.lastName ||
        !employee.id ||
        !employee.mobile ||
        !employee.email ||
        !employee.salary ||
        !employee.joiningDate
    ) {
        alert("Please complete every employee field.");
        return false;
    }

    if (!/^[0-9]{10}$/.test(employee.mobile)) {
        alert("Enter a valid 10-digit mobile number.");
        return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
        alert("Enter a valid email address.");
        return false;
    }

    if (!Number.isFinite(Number(employee.salary)) ||
        Number(employee.salary) <= 0) {
        alert("Salary must be greater than zero.");
        return false;
    }

    if (isDuplicateId(employee.id, currentId)) {
        alert("This employee ID already exists.");
        return false;
    }

    return true;
}

employeeForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const employee = getAddEmployeeData();

    if (!validateEmployee(employee, null)) {
        return;
    }

    employees.push(employee);

    saveEmployees();
    employeeForm.reset();
    showEmployeeView("");

    alert("Employee added successfully!");
});

function highlightText(element, text, query) {
    if (!query) {
        element.textContent = text;
        return;
    }

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let start = 0;
    let index;

    while ((index = lowerText.indexOf(lowerQuery, start)) !== -1) {
        element.appendChild(
            document.createTextNode(text.slice(start, index))
        );

        const mark = document.createElement("mark");
        mark.textContent = text.slice(index, index + query.length);
        element.appendChild(mark);

        start = index + query.length;
    }

    element.appendChild(document.createTextNode(text.slice(start)));
}

function employeeMatches(employee, query) {
    const searchText = (
        getEmployeeName(employee) + " " + employee.id
    ).toLowerCase();

    return searchText.includes(query.toLowerCase());
}

function createEmployeeRow(employee, query, actionText, action) {
    const row = document.createElement("div");
    row.className = "employee-row";

    const name = document.createElement("span");
    highlightText(name, getEmployeeName(employee), query);

    const id = document.createElement("span");
    highlightText(id, employee.id, query);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = actionText;
    button.addEventListener("click", action);

    row.append(name, id, button);

    return row;
}

// REMOVE EMPLOYEES

const removeSearch = document.getElementById("remove-employee-search");
const removeList = document.getElementById("employee-remove-list");
const deleteSelectedButton =
    document.getElementById("delete-selected-employees");

function displayRemoveEmployees() {
    removeList.innerHTML = "";

    const query = removeSearch.value.trim();

    const matches = employees.filter(function(employee) {
        return employeeMatches(employee, query);
    });

    if (matches.length === 0) {
        removeList.textContent = "No matching employees found.";
        deleteSelectedButton.hidden = true;
        return;
    }

    const selected = removeList.dataset.selectedIds
        ? JSON.parse(removeList.dataset.selectedIds)
        : [];

    matches.forEach(function(employee) {
        const row = document.createElement("div");
        row.className = "employee-row";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = selected.includes(employee.id);
        checkbox.setAttribute("aria-label", "Select " + getEmployeeName(employee));

        checkbox.addEventListener("change", function() {
            let ids = removeList.dataset.selectedIds
                ? JSON.parse(removeList.dataset.selectedIds)
                : [];

            if (checkbox.checked && !ids.includes(employee.id)) {
                ids.push(employee.id);
            } else {
                ids = ids.filter(function(id) {
                    return id !== employee.id;
                });
            }

            removeList.dataset.selectedIds = JSON.stringify(ids);
            displayRemoveEmployees();
        });

        const name = document.createElement("span");
        highlightText(name, getEmployeeName(employee), query);

        const id = document.createElement("span");
        highlightText(id, employee.id, query);

        row.append(checkbox, name, id);

        if (selected.length === 0) {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = "Delete";

            button.addEventListener("click", function() {
                if (!confirm("Delete " + getEmployeeName(employee) + "?")) {
                    return;
                }

                removeEmployees([employee.id]);
            });

            row.appendChild(button);
        }

        removeList.appendChild(row);
    });

    const hasSelection = selected.some(function(id) {
        return employees.some(function(employee) {
            return employee.id === id;
        });
    });

    deleteSelectedButton.hidden = !hasSelection;
}

removeSearch.addEventListener("input", displayRemoveEmployees);

function removeEmployees(ids) {
    if (!confirm("Are you sure you want to delete " + ids.length + " employee(s)?")) {
        return;
    }

    employees = employees.filter(function(employee) {
        return !ids.includes(employee.id);
    });

    saveEmployees();

    removeList.dataset.selectedIds = "[]";
    displayRemoveEmployees();
}

deleteSelectedButton.addEventListener("click", function() {
    const ids = removeList.dataset.selectedIds
        ? JSON.parse(removeList.dataset.selectedIds)
        : [];

    if (ids.length > 0) {
        removeEmployees(ids);
    }
});

// VIEW EMPLOYEES

const viewSearch = document.getElementById("view-employee-search");
const viewList = document.getElementById("employee-view-list");

function displayViewEmployees() {
    viewList.innerHTML = "";

    const query = viewSearch.value.trim();

    employees.filter(function(employee) {
        return employeeMatches(employee, query);
    }).forEach(function(employee) {
        const row = createEmployeeRow(
            employee,
            query,
            "View Details",
            function() {
                showEmployeeDetails(employee.id);
            }
        );

        viewList.appendChild(row);
    });

    if (!viewList.children.length) {
        viewList.textContent = "No matching employees found.";
    }
}

viewSearch.addEventListener("input", displayViewEmployees);

function showEmployeeDetails(id) {
    const employee = employees.find(function(item) {
        return item.id === id;
    });

    if (!employee) return;

    selectedEmployeeId = id;

    const details = document.getElementById("employee-details");
    details.innerHTML = "";

    const fields = [
        ["First Name", employee.firstName],
        ["Last Name", employee.lastName],
        ["Employee ID", employee.id],
        ["Mobile Number", employee.mobile],
        ["Email", employee.email],
        ["Current Salary", employee.salary],
        ["Date of Joining", employee.joiningDate]
    ];

    fields.forEach(function(field) {
        const row = document.createElement("p");
        const label = document.createElement("strong");

        label.textContent = field[0] + ": ";
        row.append(label, document.createTextNode(field[1] || "Not available"));
        details.appendChild(row);
    });

    showEmployeeView("employee-details-view");
}

// EDIT EMPLOYEE

const editSearch = document.getElementById("edit-employee-search");
const editList = document.getElementById("employee-edit-list");
const editEmployeeForm = document.getElementById("edit-employee-form");

function displayEditEmployees() {
    editList.innerHTML = "";

    const query = editSearch.value.trim();

    employees.filter(function(employee) {
        return employeeMatches(employee, query);
    }).forEach(function(employee) {
        editList.appendChild(
            createEmployeeRow(employee, query, "Edit", function() {
                openEditForm(employee.id);
            })
        );
    });

    if (!editList.children.length) {
        editList.textContent = "No matching employees found.";
    }
}

editSearch.addEventListener("input", displayEditEmployees);

function openEditForm(id) {
    const employee = employees.find(function(item) {
        return item.id === id;
    });

    if (!employee) return;

    selectedEmployeeId = id;

    document.getElementById("edit-first-name").value = employee.firstName || "";
    document.getElementById("edit-last-name").value = employee.lastName || "";
    document.getElementById("edit-employee-id").value = employee.id;
    document.getElementById("edit-mobile").value = employee.mobile || "";
    document.getElementById("edit-email").value = employee.email || "";
    document.getElementById("edit-salary").value = employee.salary || "";
    document.getElementById("edit-joining-date").value = employee.joiningDate || "";

    showEmployeeView("edit-employee-form-view");
}

document.getElementById("edit-current-employee").addEventListener(
    "click",
    function() {
        if (selectedEmployeeId) {
            openEditForm(selectedEmployeeId);
        }
    }
);

editEmployeeForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const oldId = selectedEmployeeId;

    const updatedEmployee = {
        firstName: document.getElementById("edit-first-name").value.trim(),
        lastName: document.getElementById("edit-last-name").value.trim(),
        id: document.getElementById("edit-employee-id").value.trim(),
        mobile: document.getElementById("edit-mobile").value.trim(),
        email: document.getElementById("edit-email").value.trim(),
        salary: document.getElementById("edit-salary").value,
        joiningDate: document.getElementById("edit-joining-date").value
    };

    if (!validateEmployee(updatedEmployee, oldId)) {
        return;
    }

    const employeeIndex = employees.findIndex(function(employee) {
        return employee.id === oldId;
    });

    if (employeeIndex === -1) return;

    // Preserve attendance records if the employee ID changes.
    if (oldId !== updatedEmployee.id) {
        Object.keys(attendanceRecords).forEach(function(date) {
            const records = attendanceRecords[date];

            if (Object.prototype.hasOwnProperty.call(records, oldId)) {
                records[updatedEmployee.id] = records[oldId];
                delete records[oldId];
            }
        });

        localStorage.setItem(
            "attendanceRecords",
            JSON.stringify(attendanceRecords)
        );
    }

    employees[employeeIndex] = updatedEmployee;
    selectedEmployeeId = updatedEmployee.id;

    saveEmployees();

    alert("Employee details updated successfully!");

showEmployeeView("edit-employee-view");

displayEditEmployees();
});

showEmployeeView("");

const attendanceDate = document.getElementById("attendance-date");
const attendanceList = document.getElementById("attendance-list");
const saveAttendanceButton = document.getElementById("save-attendance");
const attendanceMessage = document.getElementById("attendance-message");

const attendanceRecords = JSON.parse(
    localStorage.getItem("attendanceRecords")
) || {};

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

attendanceDate.value = getTodayDate();

function displayAttendance() {
    attendanceList.innerHTML = "";

    if (employees.length === 0) {
        attendanceList.textContent =
            "Add employees first to mark attendance.";
        return;
    }

    const selectedDate = attendanceDate.value;
    const savedRecords = attendanceRecords[selectedDate] || {};

    employees.forEach(function(employee) {
        const row = document.createElement("div");
        const name = document.createElement("h3");
        const select = document.createElement("select");

        row.className = "attendance-row";
        name.textContent = getEmployeeName(employee) + " (" + employee.id + ")";

        const options = ["Present", "Absent", "Leave"];

        options.forEach(function(status) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            select.appendChild(option);
        });

        select.value = savedRecords[employee.id] || "Present";
        select.dataset.employeeId = employee.id;

        row.appendChild(name);
        row.appendChild(select);

        attendanceList.appendChild(row);
    });
}

saveAttendanceButton.addEventListener("click", function() {
    const selectedDate = attendanceDate.value;

    if (!selectedDate) {
        attendanceMessage.textContent = "Please select a date.";
        return;
    }

    if (employees.length === 0) {
        attendanceMessage.textContent = "Add employees first.";
        return;
    }

    const records = {};

    const selects = attendanceList.querySelectorAll("select");

    selects.forEach(function(select) {
        records[select.dataset.employeeId] = select.value;
    });

    attendanceRecords[selectedDate] = records;

    localStorage.setItem(
        "attendanceRecords",
        JSON.stringify(attendanceRecords)
    );
    updateDashboard();
  displayHistory();
    attendanceMessage.textContent =
        "Attendance saved successfully!";
});


attendanceDate.addEventListener("change", function() {
    attendanceMessage.textContent = "";
    displayAttendance();
});

displayAttendance();



function updateDashboard() {
    const totalEmployees = employees.length;
    const today = getTodayDate();
    const todayRecords = attendanceRecords[today] || {};

    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    employees.forEach(function(employee) {
        const status = todayRecords[employee.id];

        if (status === "Present") {
            presentCount++;
        } else if (status === "Absent") {
            absentCount++;
        } else if (status === "Leave") {
            leaveCount++;
        }
    });

    const attendanceRate = totalEmployees > 0
        ? Math.round((presentCount / totalEmployees) * 100)
        : 0;

    document.getElementById("total-employees").textContent =
        totalEmployees;

    document.getElementById("present-count").textContent =
        presentCount;

    document.getElementById("absent-count").textContent =
        absentCount;

    document.getElementById("attendance-rate").textContent =
        attendanceRate + "%";

const chart = document.getElementById("attendance-chart");

chart.style.width = "210px";
chart.style.height = "210px";
chart.style.minWidth = "210px";
chart.style.minHeight = "210px";
chart.style.borderRadius = "50%";
chart.style.margin = "0 auto";
chart.style.webkitMask = "none";
chart.style.mask = "none";

if (totalEmployees === 0) {
    chart.style.background = "#e8edf5";
    chart.setAttribute(
        "aria-label",
        "No employees registered"
    );
} else {
    const presentAngle =
        (presentCount / totalEmployees) * 360;

    const absentAngle =
        presentAngle +
        (absentCount / totalEmployees) * 360;

    const leaveAngle =
        absentAngle +
        (leaveCount / totalEmployees) * 360;

    chart.style.background = `conic-gradient(
        #75ad9b 0deg ${presentAngle}deg,
        #ffffff ${presentAngle}deg ${presentAngle + 2}deg,
        #e5a0a0 ${presentAngle + 2}deg ${absentAngle}deg,
        #ffffff ${absentAngle}deg ${absentAngle + 2}deg,
        #e8c77b ${absentAngle + 2}deg ${leaveAngle}deg,
        #ffffff ${leaveAngle}deg ${leaveAngle + 2}deg,
        #e8edf5 ${leaveAngle + 2}deg 360deg
    )`;

    chart.setAttribute(
        "aria-label",
        "Present: " + presentCount +
        ", Absent: " + absentCount +
        ", Leave: " + leaveCount
    );
}


}

updateDashboard();


updateDashboard();

const historyDate = document.getElementById("history-date");
const historyList = document.getElementById("history-list");

historyDate.value = getTodayDate();

function displayHistory() {
    historyList.innerHTML = "";

    const selectedDate = historyDate.value;

    if (!selectedDate) {
        historyList.textContent = "Please select a date.";
        return;
    }

    const savedRecords = attendanceRecords[selectedDate];

    if (!savedRecords || Object.keys(savedRecords).length === 0) {
        historyList.textContent =
            "No attendance records found for this date.";
        return;
    }

    Object.keys(savedRecords).forEach(function(employeeId) {
        const record = document.createElement("div");
        const name = document.createElement("h3");
        const status = document.createElement("p");

        record.className = "history-record";

        const employee = employees.find(function(item) {
            return item.id === employeeId;
        });

        name.textContent = employee
            ? getEmployeeName(employee) + " (" + employeeId + ")"
            : "Former employee (" + employeeId + ")";

        status.textContent = "Status: " + savedRecords[employeeId];

        record.appendChild(name);
        record.appendChild(status);

        historyList.appendChild(record);
    });
}

historyDate.addEventListener("change", displayHistory);

displayHistory();

const exportButton = document.getElementById("export-csv");
const exportMessage = document.getElementById("export-message");

exportButton.addEventListener("click", function() {
    const selectedDate = historyDate.value;

    if (!selectedDate) {
        exportMessage.textContent = "Please select a date first.";
        return;
    }

    const records = attendanceRecords[selectedDate];

    if (!records || Object.keys(records).length === 0) {
        exportMessage.textContent =
            "No attendance records available for this date.";
        return;
    }

    const rows = [
        ["Date", "Employee ID", "Employee Name", "Attendance Status"]
    ];

    Object.keys(records).forEach(function(employeeId) {
        const employee = employees.find(function(item) {
            return item.id === employeeId;
        });

        const employeeName = employee
    ? getEmployeeName(employee)
    : "Former employee";

        rows.push([
            selectedDate,
            employeeId,
            employeeName,
            records[employeeId]
        ]);
    });

    function escapeCSV(value) {
        return '"' + String(value).replace(/"/g, '""') + '"';
    }

    const csvContent = rows.map(function(row) {
        return row.map(escapeCSV).join(",");
    }).join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "attendance-" + selectedDate + ".csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    exportMessage.textContent = "CSV export requested.";
});

const tabButtons = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const targetId = button.dataset.tab;

        tabButtons.forEach(function(tab) {
            tab.classList.remove("active");
        });

        tabContents.forEach(function(section) {
            section.classList.remove("active");
        });

        button.classList.add("active");

        document.getElementById(targetId).classList.add("active");
    });
});
