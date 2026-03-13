(function () {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user.id || user.role !== "organizer") {
    window.location.href = "../auth.html";
    return;
  }

  function logout() {
    localStorage.removeItem("user");
    window.location.href = "../index.html";
  }

  function goDashboard(section) {
    const target = section
      ? `organizer-dashboard.html#${section}`
      : "organizer-dashboard.html";
    window.location.href = target;
  }

  function formatCurrency(value) {
    return `$${Number(value || 0).toFixed(2)}`;
  }

  function setExpenseMessage(type, text) {
    const el = document.getElementById("expenseMessage");
    if (!el) {
      return;
    }
    el.className = type ? `analytics-message ${type}` : "analytics-message";
    el.textContent = text || "";
  }

  function setExpenseSummary(summary) {
    const totalEl = document.getElementById("summaryTotalExpense");
    const budgetEl = document.getElementById("summaryBudget");
    const remainingEl = document.getElementById("summaryRemaining");
    const countEl = document.getElementById("summaryCount");

    if (totalEl) {
      totalEl.textContent = formatCurrency(summary.total_expenses || 0);
    }
    if (budgetEl) {
      budgetEl.textContent = formatCurrency(summary.budget || 0);
    }
    if (remainingEl) {
      remainingEl.textContent = formatCurrency(summary.remaining_budget || 0);
      remainingEl.style.color =
        Number(summary.remaining_budget || 0) < 0 ? "#DC2626" : "#0F766E";
    }
    if (countEl) {
      countEl.textContent = String(summary.expense_count || 0);
    }
  }

  function renderExpenseList(expenses, eventId) {
    const list = document.getElementById("expenseList");
    if (!list) {
      return;
    }

    if (!Array.isArray(expenses) || expenses.length === 0) {
      list.innerHTML =
        '<div class="empty-state"><div class="empty-state-icon">💸</div><div class="empty-state-text">No expense entries yet</div></div>';
      return;
    }

    list.innerHTML = `
      <div class="expense-table-wrap">
        <table class="expense-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${expenses
              .map(
                (item) => `
              <tr>
                <td>${item.expense_date || "-"}</td>
                <td>${item.title || "-"}</td>
                <td>${item.category || "General"}</td>
                <td>${item.payment_method || "Other"}</td>
                <td>${formatCurrency(item.amount || 0)}</td>
                <td><button type="button" class="action-btn delete" onclick="deleteExpense(${eventId}, ${item.id})">Delete</button></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderExpenseEventOptions(events) {
    const select = document.getElementById("expenseEventId");
    if (!select) {
      return;
    }

    if (!events.length) {
      select.innerHTML = '<option value="">No events available</option>';
      return;
    }

    select.innerHTML = events
      .map(
        (event) =>
          `<option value="${event.id}">${event.title} (#${event.id})</option>`,
      )
      .join("");
  }

  async function loadEventExpenses(eventId) {
    if (!eventId) {
      return;
    }

    try {
      const result = await window.api.getEventExpenses(eventId);
      if (!result.success) {
        setExpenseMessage(
          "error",
          result.message || "Unable to load expenses.",
        );
        setExpenseSummary({
          total_expenses: 0,
          budget: 0,
          remaining_budget: 0,
          expense_count: 0,
        });
        renderExpenseList([], eventId);
        return;
      }

      setExpenseMessage("", "");
      setExpenseSummary(result.summary || {});
      renderExpenseList(result.expenses || [], eventId);
    } catch (error) {
      console.error("Load event expenses failed:", error);
      setExpenseMessage("error", "Failed to load expense tracker data.");
    }
  }

  async function loadOrganizerEventsForExpenses() {
    const list = document.getElementById("expenseList");
    if (list) {
      list.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    }

    try {
      const result = await window.api.getOrganizerEvents(user.id);
      const events = result.success ? result.events : [];

      renderExpenseEventOptions(events);
      if (!events.length) {
        setExpenseSummary({
          total_expenses: 0,
          budget: 0,
          remaining_budget: 0,
          expense_count: 0,
        });
        renderExpenseList([], 0);
        return;
      }

      const select = document.getElementById("expenseEventId");
      if (select && !select.value) {
        select.value = String(events[0].id);
      }

      await loadEventExpenses(
        Number(
          (document.getElementById("expenseEventId") || {}).value ||
            events[0].id,
        ),
      );
    } catch (error) {
      console.error("Load organizer events failed:", error);
      setExpenseMessage(
        "error",
        "Failed to load your events for expense tracking.",
      );
      setExpenseSummary({
        total_expenses: 0,
        budget: 0,
        remaining_budget: 0,
        expense_count: 0,
      });
      renderExpenseList([], 0);
    }
  }

  async function handleExpenseSubmit(event) {
    event.preventDefault();
    setExpenseMessage("", "");

    const eventId = Number(document.getElementById("expenseEventId").value);
    const title = (document.getElementById("expenseTitle").value || "").trim();
    const category = (
      document.getElementById("expenseCategory").value || "General"
    ).trim();
    const amount = Number(document.getElementById("expenseAmount").value);
    const expenseDate = document.getElementById("expenseDate").value;
    const paymentMethod = (
      document.getElementById("expensePaymentMethod").value || "Other"
    ).trim();
    const notes = (document.getElementById("expenseNotes").value || "").trim();

    if (!eventId || !title || !amount || !expenseDate) {
      setExpenseMessage(
        "error",
        "Please select event and provide title, amount and date.",
      );
      return;
    }

    try {
      const result = await window.api.addEventExpense(eventId, {
        organizer_id: user.id,
        title,
        category: category || "General",
        amount,
        expense_date: expenseDate,
        payment_method: paymentMethod || "Other",
        notes,
      });

      if (!result.success) {
        setExpenseMessage("error", result.message || "Failed to add expense.");
        return;
      }

      setExpenseMessage("success", "Expense added successfully.");
      const form = document.getElementById("expenseForm");
      if (form) {
        form.reset();
      }
      document.getElementById("expenseCategory").value = "General";
      document.getElementById("expensePaymentMethod").value = "Other";
      document.getElementById("expenseDate").valueAsDate = new Date();

      await loadEventExpenses(eventId);
    } catch (error) {
      console.error("Add expense failed:", error);
      setExpenseMessage(
        "error",
        "Failed to add expense due to connection error.",
      );
    }
  }

  async function deleteExpense(eventId, expenseId) {
    if (!confirm("Delete this expense entry?")) {
      return;
    }

    try {
      const result = await window.api.deleteEventExpense(
        eventId,
        expenseId,
        user.id,
      );
      if (!result.success) {
        setExpenseMessage(
          "error",
          result.message || "Failed to delete expense.",
        );
        return;
      }

      setExpenseMessage("success", "Expense deleted.");
      await loadEventExpenses(eventId);
    } catch (error) {
      console.error("Delete expense failed:", error);
      setExpenseMessage(
        "error",
        "Failed to delete expense due to connection error.",
      );
    }
  }

  async function generateVendorReport(reportType) {
    try {
      let data = [];
      let filename = "";
      let csvContent = "";

      switch (reportType) {
        case "add":
          const vendorsResult = await window.api.getVendors(user.id);
          data = vendorsResult.success ? vendorsResult.vendors : [];
          filename = "vendor_list_report.csv";
          csvContent = "Vendor ID,Name,Category,Contact,Email,Created Date\n";
          data.forEach((vendor) => {
            csvContent += `${vendor.id},"${vendor.name}","${vendor.category}","${vendor.contact}","${vendor.email}","${new Date().toLocaleDateString()}"\n`;
          });
          break;

        case "search":
          const searchResult = await window.api.getVendors(user.id);
          data = searchResult.success ? searchResult.vendors : [];
          filename = "vendor_search_report.csv";
          csvContent = "Vendor ID,Name,Category,Contact,Email,Search Tags\n";
          data.forEach((vendor) => {
            const searchTags =
              `${vendor.name} ${vendor.category} ${vendor.contact}`.toLowerCase();
            csvContent += `${vendor.id},"${vendor.name}","${vendor.category}","${vendor.contact}","${vendor.email}","${searchTags}"\n`;
          });
          break;

        case "details":
          const detailsResult = await window.api.getVendors(user.id);
          data = detailsResult.success ? detailsResult.vendors : [];
          filename = "vendor_details_report.csv";
          csvContent =
            "Vendor ID,Name,Category,Contact,Email,Phone,Address,Rating,Status\n";
          data.forEach((vendor) => {
            csvContent += `${vendor.id},"${vendor.name}","${vendor.category}","${vendor.contact}","${vendor.email}","N/A","N/A","5.0","Active"\n`;
          });
          break;

        case "assign":
          const eventsResult = await window.api.getOrganizerEvents(user.id);
          const events = eventsResult.success ? eventsResult.events : [];
          filename = "vendor_assignment_report.csv";
          csvContent =
            "Event ID,Event Title,Vendor ID,Vendor Name,Role,Assignment Date,Status\n";

          events.forEach((event) => {
            csvContent += `${event.id},"${event.title}",1,"Sample Vendor","Catering","${new Date().toLocaleDateString()}","Assigned"\n`;
            csvContent += `${event.id},"${event.title}",2,"Tech Vendor","AV Equipment","${new Date().toLocaleDateString()}","Assigned"\n`;
          });
          break;

        case "track":
          const costResult = await window.api.getOrganizerEvents(user.id);
          const costEvents = costResult.success ? costResult.events : [];
          filename = "vendor_cost_tracking_report.csv";
          csvContent =
            "Event ID,Event Title,Vendor ID,Vendor Name,Service,Cost Amount,Currency,Date,Status\n";

          costEvents.forEach((event) => {
            csvContent += `${event.id},"${event.title}",1,"Catering Co","Food Service",2500.00,"USD","${new Date().toLocaleDateString()}","Paid"\n`;
            csvContent += `${event.id},"${event.title}",2,"AV Solutions","Sound System",1200.00,"USD","${new Date().toLocaleDateString()}","Pending"\n`;
          });
          break;
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toggleNotifications();
      alert(
        `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded successfully!`,
      );
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  }

  window.logout = logout;
  window.goDashboard = goDashboard;
  window.deleteExpense = deleteExpense;
  window.toggleNotifications = () => {
    const dropdown = document.getElementById("notificationDropdown");
    dropdown.classList.toggle("active");
  };
  window.markAllRead = () => {
    const unreadItems = document.querySelectorAll(".notification-item.unread");
    unreadItems.forEach((item) => item.classList.remove("unread"));
  };
  window.generateVendorReport = generateVendorReport;

  document.addEventListener("DOMContentLoaded", function () {
    const expenseForm = document.getElementById("expenseForm");
    if (expenseForm) {
      expenseForm.addEventListener("submit", handleExpenseSubmit);
    }

    const expenseEventIdSelect = document.getElementById("expenseEventId");
    if (expenseEventIdSelect) {
      expenseEventIdSelect.addEventListener("change", function () {
        const selectedEventId = Number(expenseEventIdSelect.value);
        loadEventExpenses(selectedEventId);
      });
    }

    const expenseDate = document.getElementById("expenseDate");
    if (expenseDate) {
      expenseDate.valueAsDate = new Date();
    }

    loadOrganizerEventsForExpenses();

    // Mobile hamburger menu
    const orgMenuToggle = document.getElementById("orgMenuToggle");
    const orgOverlay = document.getElementById("orgOverlay");
    const orgSidebar = document.getElementById("orgSidebar");
    if (orgMenuToggle && orgOverlay && orgSidebar) {
      orgMenuToggle.addEventListener("click", function () {
        orgSidebar.classList.toggle("mobile-open");
        orgMenuToggle.classList.toggle("active");
        orgOverlay.classList.toggle("active");
      });
      orgOverlay.addEventListener("click", function () {
        orgSidebar.classList.remove("mobile-open");
        orgMenuToggle.classList.remove("active");
        orgOverlay.classList.remove("active");
      });
    }
  });
})();
