const store = {
    KEY: 'new_boss_fitness_data',

    getMembers() {
        const data = localStorage.getItem(this.KEY);
        let members = data ? JSON.parse(data) : [];

        // Auto-migration: Ensure all members have a serial number
        let maxSerial = 0;
        let modified = false;

        // First pass: find max existing serial
        members.forEach(m => {
            if (m.serialNumber && m.serialNumber > maxSerial) {
                maxSerial = m.serialNumber;
            }
        });

        // Second pass: assign if missing
        members = members.map(m => {
            if (!m.serialNumber) {
                maxSerial++;
                m.serialNumber = maxSerial;
                modified = true;
            }
            return m;
        });

        if (modified) {
            this.saveMembers(members);
        }

        return members;
    },

    saveMembers(members) {
        localStorage.setItem(this.KEY, JSON.stringify(members));
    },

    addMember(member) {
        const members = this.getMembers();

        // Calculate next Serial Number
        const maxSerial = members.reduce((max, m) => Math.max(max, m.serialNumber || 0), 0);
        member.serialNumber = maxSerial + 1;

        // Generate a random ID
        member.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        member.createdAt = new Date().toISOString();
        members.push(member);
        this.saveMembers(members);
        return member;
    },

    getMember(id) {
        const members = this.getMembers();
        return members.find(m => m.id === id);
    },

    updateMember(updatedMember) {
        const members = this.getMembers();
        const index = members.findIndex(m => m.id === updatedMember.id);
        if (index !== -1) {
            members[index] = updatedMember;
            this.saveMembers(members);
            return true;
        }
        return false;
    },

    // Helper to calculate status
    getMembershipStatus(endDate) {
        const today = new Date();
        const end = new Date(endDate);
        // Reset time parts for accurate date comparison
        today.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        return end >= today ? 'Active' : 'Expired';
    }
};
