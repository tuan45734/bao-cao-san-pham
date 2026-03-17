
const API = {
    async fetchWithRetry(url, retryCount = 0) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: CONFIG.HEADERS,
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            if (retryCount < CONFIG.MAX_RETRIES) {
                console.log(`Retry ${retryCount + 1}/${CONFIG.MAX_RETRIES}...`);
                await Utils.sleep(CONFIG.RETRY_DELAY);
                return this.fetchWithRetry(url, retryCount + 1);
            }
            throw error;
        }
    },

    buildUrl(pageNumber, fromDate, toDate) {
        const params = new URLSearchParams({
            'trang_thai': 'Đã xuất hàng',
            'tu_ngay': fromDate,
            'den_ngay': toDate,
            'kieu_ngay': ' ',
            'page_size': CONFIG.PAGE_SIZE,
            'page_number': pageNumber
        });
        return `${CONFIG.API_URL}?${params}`;
    },

    async fetchPage(pageNumber, fromDate, toDate) {
        const url = this.buildUrl(pageNumber, fromDate, toDate);
        console.log(`Fetching page ${pageNumber}:`, url);
        return await this.fetchWithRetry(url);
    }
};