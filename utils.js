
const Utils = {
    formatCurrency(amount) {
        if (typeof amount !== 'number' || !isFinite(amount) || amount === null || amount === undefined) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(0);
        }
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    },
formatCases(cases) {
    if (typeof cases !== 'number' || !isFinite(cases)) {
        return '0';
    }
    // Làm tròn đến 2 số thập phân
    const rounded = Math.round(cases * 100) / 100;
    return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(rounded);
},
    formatNumber(number) {
        if (typeof number !== 'number' || !isFinite(number) || number === null || number === undefined) {
            return new Intl.NumberFormat('vi-VN').format(0);
        }
        return new Intl.NumberFormat('vi-VN').format(number);
    },

    formatDateForAPI(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        errorText.textContent = message;
        errorDiv.style.display = 'flex';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    },

showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        } else {
            console.warn('loadingOverlay element not found');
        }
    },

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        } else {
            console.warn('loadingOverlay element not found');
        }
    },

    validateDates(fromDate, toDate) {
        if (!fromDate || !toDate) {
            this.showError('Vui lòng chọn ngày!');
            return false;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            this.showError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!');
            return false;
        }

        return true;
    },

    safeNumber(value) {
        if (value === null || value === undefined || typeof value !== 'number') {
            return 0;
        }
        if (!isFinite(value) || isNaN(value)) {
            return 0;
        }
        return value;
    },

    safeSum(arr, key) {
        if (!Array.isArray(arr)) return 0;
        return arr.reduce((sum, item) => {
            const value = item && item[key] ? item[key] : 0;
            return sum + this.safeNumber(value);
        }, 0);
    }
};