class ExpenseTracker {
    constructor() {
        this.expenses = this.loadExpenses();
        this.filteredExpenses = [...this.expenses];
        this.initializeEventListeners();
        this.setCurrentDate();
        this.renderExpenses();
        this.updateSummary();
    }

    initializeEventListeners() {
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        document.getElementById('filterCategory').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('filterStartDate').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('filterEndDate').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });
    }

    setCurrentDate() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        document.getElementById('currentDate').textContent = dateStr;
        
        const dateInput = today.toISOString().split('T')[0];
        document.getElementById('date').value = dateInput;
        document.getElementById('date').max = dateInput;
    }

    addExpense() {
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        if (!description || !amount || !category || !date) {
            alert('Please fill in all fields');
            return;
        }

        const expense = {
            id: Date.now(),
            description,
            amount,
            category,
            date,
            timestamp: new Date().toISOString()
        };

        this.expenses.push(expense);
        this.saveExpenses();
        this.applyFilters();
        this.updateSummary();
        
        document.getElementById('expenseForm').reset();
        this.setCurrentDate();
        
        this.showSuccessMessage('Expense added successfully!');
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveExpenses();
            this.applyFilters();
            this.updateSummary();
            this.showSuccessMessage('Expense deleted successfully!');
        }
    }

    applyFilters() {
        const categoryFilter = document.getElementById('filterCategory').value;
        const startDate = document.getElementById('filterStartDate').value;
        const endDate = document.getElementById('filterEndDate').value;

        this.filteredExpenses = this.expenses.filter(expense => {
            let matchesCategory = !categoryFilter || expense.category === categoryFilter;
            let matchesStartDate = !startDate || expense.date >= startDate;
            let matchesEndDate = !endDate || expense.date <= endDate;
            
            return matchesCategory && matchesStartDate && matchesEndDate;
        });

        this.renderExpenses();
    }

    clearFilters() {
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
        this.filteredExpenses = [...this.expenses];
        this.renderExpenses();
    }

    renderExpenses() {
        const tbody = document.getElementById('expensesTableBody');
        const noExpenses = document.getElementById('noExpenses');
        const table = document.getElementById('expensesTable');

        if (this.filteredExpenses.length === 0) {
            table.style.display = 'none';
            noExpenses.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        noExpenses.style.display = 'none';

        const sortedExpenses = [...this.filteredExpenses].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        tbody.innerHTML = sortedExpenses.map(expense => `
            <tr>
                <td>${this.formatDate(expense.date)}</td>
                <td>${this.escapeHtml(expense.description)}</td>
                <td>
                    <span class="category-badge category-${expense.category}">
                        ${expense.category}
                    </span>
                </td>
                <td>$${expense.amount.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger" onclick="expenseTracker.deleteExpense(${expense.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateSummary() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];
        
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStartStr = monthStart.toISOString().split('T')[0];

        const todayTotal = this.expenses
            .filter(expense => expense.date === todayStr)
            .reduce((sum, expense) => sum + expense.amount, 0);

        const weekTotal = this.expenses
            .filter(expense => expense.date >= weekStartStr)
            .reduce((sum, expense) => sum + expense.amount, 0);

        const monthTotal = this.expenses
            .filter(expense => expense.date >= monthStartStr)
            .reduce((sum, expense) => sum + expense.amount, 0);

        document.getElementById('todayTotal').textContent = `$${todayTotal.toFixed(2)}`;
        document.getElementById('weekTotal').textContent = `$${weekTotal.toFixed(2)}`;
        document.getElementById('monthTotal').textContent = `$${monthTotal.toFixed(2)}`;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccessMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00b894;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 184, 148, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }

    saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }

    loadExpenses() {
        const saved = localStorage.getItem('expenses');
        return saved ? JSON.parse(saved) : [];
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

const expenseTracker = new ExpenseTracker();