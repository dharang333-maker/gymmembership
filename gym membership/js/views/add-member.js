window.views = window.views || {};

window.views['add-member'] = {
    render(params) {
        return `
            <div class="form-container" style="max-width: 600px; margin: 0 auto;">
                <h2>Add New Membership</h2>
                <form id="add-member-form">
                    <div class="form-group">
                        <label for="name">Member Name</label>
                        <input type="text" id="name" required placeholder="Arjun Kumar">
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" required placeholder="9876543210">
                    </div>

                    <div class="form-group">
                        <label for="membershipType">Membership Type</label>
                        <select id="membershipType" required>
                            <option value="" disabled selected>Select Type</option>
                            <option value="General Gym">General Gym</option>
                            <option value="Cardio Only">Cardio Only</option>
                            <option value="Personal Training">Personal Training</option>
                            <option value="Crossfit">Crossfit</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="startDate">Start Date</label>
                        <input type="date" id="startDate" required onchange="window.views['add-member'].calculateEndDate()">
                    </div>

                    <div class="form-group">
                        <label for="durationDays">Duration (Days)</label>
                        <input type="number" id="durationDays" required min="1" placeholder="e.g., 30, 90, 365" oninput="window.views['add-member'].calculateEndDate()">
                    </div>

                    <div class="form-group">
                        <label for="endDate">End Date (Auto-calculated)</label>
                        <input type="date" id="endDate" readonly>
                    </div>

                    <div class="form-group">
                        <label for="totalAmount">Total Plan Amount (₹)</label>
                        <input type="number" id="totalAmount" required min="0" placeholder="e.g., 5000" oninput="window.views['add-member'].calculateBalance()">
                    </div>

                     <div class="form-group">
                        <label for="amountPaid">Amount Paid (₹)</label>
                        <input type="number" id="amountPaid" required min="0" placeholder="e.g., 2000" oninput="window.views['add-member'].calculateBalance()">
                    </div>

                    <div class="form-group">
                        <label for="balance">Balance Amount (₹)</label>
                        <input type="number" id="balance" readonly>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 30px;">
                        <button type="submit" class="btn-primary" style="flex: 1;">Create Membership</button>
                        <button type="button" class="btn-secondary" onclick="app.router.navigate('dashboard')">Cancel</button>
                    </div>
                </form>
            </div>
        `;
    },

    postRender(params) {
        document.getElementById('add-member-form').addEventListener('submit', this.handleSubmit.bind(this));
        // Set default start date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').value = today;
    },

    calculateBalance() {
        const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;
        const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;

        const balance = totalAmount - amountPaid;
        document.getElementById('balance').value = balance >= 0 ? balance : 0;
    },

    calculateEndDate() {
        const startDateStr = document.getElementById('startDate').value;
        const durationDays = parseInt(document.getElementById('durationDays').value) || 0;

        if (!startDateStr || durationDays <= 0) return;

        const startDate = new Date(startDateStr);
        const endDate = new Date(startDate);

        // Add days
        endDate.setDate(endDate.getDate() + durationDays);

        document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    },

    handleSubmit(e) {
        e.preventDefault();

        const totalAmount = parseFloat(document.getElementById('totalAmount').value);
        const amountPaid = parseFloat(document.getElementById('amountPaid').value);

        if (amountPaid > totalAmount) {
            alert('Amount Paid cannot exceed Total Amount');
            return;
        }

        const newMember = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            membershipType: document.getElementById('membershipType').value,
            totalAmount: totalAmount,
            amountPaid: amountPaid,
            startDate: document.getElementById('startDate').value,
            durationDays: document.getElementById('durationDays').value,
            endDate: document.getElementById('endDate').value
        };

        store.addMember(newMember);
        alert('Membership created successfully!');
        app.router.navigate('dashboard');
    }
};
