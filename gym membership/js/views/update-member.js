window.views = window.views || {};

window.views['update-member'] = {
    render(params) {
        if (!params || !params.id) {
            return '<div style="color:red; text-align:center;">Error: No member ID provided</div>';
        }

        return `
            <div class="form-container" style="max-width: 600px; margin: 0 auto;">
                <h2>Update Membership</h2>
                <form id="update-member-form">
                    <input type="hidden" id="memberId" value="${params.id}">
                    
                    <div class="form-group">
                        <label for="name">Member Name</label>
                        <input type="text" id="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" required>
                    </div>

                     <div class="form-group">
                        <label for="membershipType">Membership Type</label>
                        <select id="membershipType" required>
                             <option value="" disabled>Select Type</option>
                            <option value="General Gym">General Gym</option>
                            <option value="Cardio Only">Cardio Only</option>
                            <option value="Personal Training">Personal Training</option>
                            <option value="Crossfit">Crossfit</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="startDate">Start Date</label>
                        <input type="date" id="startDate" required onchange="window.views['update-member'].calculateEndDate()">
                    </div>

                    <div class="form-group">
                        <label for="durationDays">Duration (Days)</label>
                        <input type="number" id="durationDays" required min="1" oninput="window.views['update-member'].calculateEndDate()">
                        <small style="color: var(--text-muted);">Changing this updates the End Date.</small>
                    </div>

                    <div class="form-group">
                        <label for="endDate">End Date (Auto-calculated)</label>
                        <input type="date" id="endDate" readonly>
                    </div>

                    <div class="form-group">
                        <label for="totalAmount">Total Plan Amount (₹)</label>
                        <input type="number" id="totalAmount" required min="0" oninput="window.views['update-member'].calculateBalance()">
                    </div>

                     <div class="form-group">
                        <label for="amountPaid">Total Amount Paid (₹)</label>
                        <input type="number" id="amountPaid" required min="0" oninput="window.views['update-member'].calculateBalance()">
                    </div>

                    <div class="form-group">
                        <label for="balance">Balance Amount (₹)</label>
                        <input type="number" id="balance" readonly>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 30px;">
                        <button type="submit" class="btn-primary" style="flex: 1;">Update Membership</button>
                        <button type="button" class="btn-secondary" onclick="app.router.navigate('dashboard')">Cancel</button>
                    </div>
                </form>
            </div>
        `;
    },

    postRender(params) {
        if (!params || !params.id) return;

        const member = store.getMember(params.id);
        if (!member) {
            alert('Member not found!');
            app.router.navigate('dashboard');
            return;
        }

        // Pre-fill form
        document.getElementById('name').value = member.name;
        document.getElementById('phone').value = member.phone;

        // Handle migration from old 'planType' to 'membershipType'
        const type = member.membershipType || member.planType;
        // If the type isn't in our new list, we might want to add it dynamically or just set it if it matches
        const select = document.getElementById('membershipType');
        if (type) {
            // Check if option exists
            let exists = false;
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value === type) exists = true;
            }
            if (!exists) {
                // Add option if it was a legacy plan like "Monthly"
                const opt = document.createElement('option');
                opt.value = type;
                opt.innerHTML = type;
                select.appendChild(opt);
            }
            select.value = type;
        }

        document.getElementById('startDate').value = member.startDate;

        // Handle migration for duration
        if (member.durationDays) {
            document.getElementById('durationDays').value = member.durationDays;
        } else {
            // Estimate based on planType if needed, or just default to 30
            // Or calculate diff between start and end
            const start = new Date(member.startDate);
            const end = new Date(member.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 for inclusive
            document.getElementById('durationDays').value = diffDays;
        }

        document.getElementById('endDate').value = member.endDate;

        // Handle migration for amount
        document.getElementById('totalAmount').value = member.totalAmount || member.planAmount;
        document.getElementById('amountPaid').value = member.amountPaid;

        this.calculateBalance();

        // Attach event listener
        document.getElementById('update-member-form').addEventListener('submit', this.handleSubmit.bind(this));
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

        const updatedMember = {
            id: document.getElementById('memberId').value,
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            membershipType: document.getElementById('membershipType').value,
            totalAmount: totalAmount,
            amountPaid: amountPaid,
            startDate: document.getElementById('startDate').value,
            durationDays: document.getElementById('durationDays').value,
            endDate: document.getElementById('endDate').value
        };

        if (store.updateMember(updatedMember)) {
            alert('Membership updated successfully!');
            app.router.navigate('dashboard');
        } else {
            alert('Error updating member.');
        }
    }
};
