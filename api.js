
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

        const data = await response.json();
        
        // Log thông tin để debug
        console.log('API Response:', {
            status: data.status,
            total: data.total,
            dataLength: data.data ? data.data.length : 0
        });
        
        // Tính tổng số trang dựa vào total và PAGE_SIZE
        if (data && data.total) {
            const totalRecords = data.total;
            const totalPages = Math.ceil(totalRecords / CONFIG.PAGE_SIZE);
            
            console.log(`Tổng số records: ${totalRecords}, Tổng số trang: ${totalPages}`);
            
            // Cập nhật tổng số trang lên giao diện
            const totalPagesElement = document.getElementById('totalPages');
            if (totalPagesElement) {
                totalPagesElement.textContent = totalPages;
            }
            
            // Lưu thông tin vào response để sử dụng
            data._meta = {
                totalRecords,
                totalPages
            };
        }
        
        return data;

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