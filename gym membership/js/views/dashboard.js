window.views = window.views || {};

window.views.dashboard = {
    render(params) {
        return `
            <div class="table-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
                    <h2>Member Dashboard</h2>
                    
                    <div style="flex: 1; min-width: 300px; display: flex; gap: 10px; justify-content: flex-end;">
                        <input type="text" id="searchInput" placeholder="Search by Serial No, Name, or Phone..." 
                            style="max-width: 400px; padding: 10px; border: 1px solid var(--secondary-color); border-radius: var(--border-radius);"
                            oninput="window.views.dashboard.handleSearch(this.value)">
                        <button class="btn-primary" onclick="app.router.navigate('add-member')">+ Add Member</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Serial No.</th>
                            <th>Member Name</th>
                            <th>Phone</th>
                            <th>Type</th>
                            <th>Start Date</th>
                            <th>Duration</th>
                            <th>End Date</th>
                            <th>Total (₹)</th>
                            <th>Paid (₹)</th>
                            <th>Balance (₹)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="member-table-body">
                        <!-- Rows will be populated by JS -->
                    </tbody>
                </table>
            </div>
        `;
    },

    postRender(params) {
        this.allMembers = store.getMembers(); // Cache all members
        this.renderTable(this.allMembers);
    },

    handleSearch(query) {
        query = query.toLowerCase().trim();

        if (!query) {
            this.renderTable(this.allMembers);
            return;
        }

        const filtered = this.allMembers.filter(member => {
            const serial = (member.serialNumber || '').toString();
            const name = (member.name || '').toLowerCase();
            const phone = (member.phone || '').toString();

            return serial.includes(query) || name.includes(query) || phone.includes(query);
        });

        this.renderTable(filtered);
    },

    renderTable(members) {
        const tbody = document.getElementById('member-table-body');

        if (members.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding: 20px;">No members found matching your search.</td></tr>';
            return;
        }

        tbody.innerHTML = members.map(member => {
            const status = store.getMembershipStatus(member.endDate);
            const statusClass = status === 'Active' ? 'status-active' : 'status-expired';

            const total = member.totalAmount || member.planAmount || 0;
            const balance = total - member.amountPaid;
            const planName = member.membershipType || member.planType || 'Unknown';
            const duration = member.durationDays ? `${member.durationDays} Days` : 'N/A';
            const serial = member.serialNumber || '-'; // Should always exist now due to store migration

            return `
                <tr>
                    <td style="font-weight: bold; color: var(--primary-color);">${serial}</td>
                    <td>${member.name}</td>
                    <td>${member.phone}</td>
                    <td>${planName}</td>
                    <td>${member.startDate}</td>
                    <td>${duration}</td>
                    <td>${member.endDate}</td>
                    <td>₹${total}</td>
                    <td>₹${member.amountPaid}</td>
                    <td style="color: ${balance > 0 ? 'var(--danger)' : 'inherit'}">₹${balance}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                    <td>
                        <button class="action-btn btn-secondary" onclick="app.router.navigate('update-member', { id: '${member.id}' })">Update</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
};
