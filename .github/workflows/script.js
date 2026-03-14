// script.js
async function loadBillData() {
    try {
        document.getElementById('data-container').innerHTML = '<div class="loading">Đang tải dữ liệu...</div>';
        
        // Đọc metadata
        const metadataResponse = await fetch('./data/metadata.json');
        const metadata = await metadataResponse.json();
        
        // Hiển thị thông tin cập nhật
        const lastUpdated = new Date(metadata.last_updated);
        const percentComplete = ((metadata.total_records_fetched / metadata.total_records_api) * 100).toFixed(2);
        
        document.getElementById('last-updated').innerHTML = `
            <strong>🕒 Lần cập nhật cuối:</strong> ${lastUpdated.toLocaleString('vi-VN')}<br>
            <strong>📊 Tổng số bản ghi:</strong> ${metadata.total_records_fetched.toLocaleString()} / ${metadata.total_records_api.toLocaleString()} (${percentComplete}%)<br>
            <strong>📑 Tổng số trang:</strong> ${metadata.total_pages}<br>
            ${metadata.failed_count > 0 ? `<strong>⚠️ Trang lỗi:</strong> ${metadata.failed_count}` : ''}
        `;
        
        // Đọc dữ liệu bill
        const dataResponse = await fetch('./data/bill_data.json');
        let billData = await dataResponse.json();
        
        // Hiển thị dữ liệu
        if (Array.isArray(billData) && billData.length > 0) {
            displayAsTable(billData);
            
            // Thêm thông tin tổng quan
            const totalDoanhThu = billData.reduce((sum, bill) => sum + (bill.tong_tien_hang || 0), 0);
            document.getElementById('summary').innerHTML = `
                <p><strong>💰 Tổng doanh thu:</strong> ${totalDoanhThu.toLocaleString()} VNĐ</p>
                <p><strong>📦 Số đơn hàng:</strong> ${billData.length}</p>
            `;
        } else {
            document.getElementById('data-container').innerHTML = '<p>Không có dữ liệu</p>';
        }
        
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        document.getElementById('error').innerHTML = '❌ Không thể tải dữ liệu. Vui lòng thử lại sau.';
        document.getElementById('error').style.display = 'block';
        document.getElementById('data-container').innerHTML = '';
    }
}

function displayAsTable(items) {
    if (!items || items.length === 0) return;
    
    // Chỉ hiển thị 100 bản ghi đầu để tránh quá tải
    const displayItems = items.slice(0, 100);
    
    let html = `
        <div class="table-info">
            Hiển thị 100/${items.length} bản ghi (dữ liệu quá lớn, thu gọn để hiển thị)
        </div>
        <div style="overflow-x: auto; max-height: 600px; overflow-y: auto;">
            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã phiếu</th>
                        <th>Khách hàng</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Nhóm</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    displayItems.forEach((item, index) => {
        const ngayDat = new Date(item.ngay_dat).toLocaleDateString('vi-VN');
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.ma_phieu || ''}</td>
                <td>${item.ten_kh || ''}</td>
                <td>${ngayDat}</td>
                <td style="text-align: right;">${(item.tong_tien_hang || 0).toLocaleString()}</td>
                <td>${item.trang_thai || ''}</td>
                <td>${item.ten_nhom || ''}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    
    // Thêm nút tải dữ liệu đầy đủ
    html += `
        <div style="margin-top: 20px; text-align: center;">
            <button onclick="downloadFullData()" class="download-btn">
                📥 Tải xuống dữ liệu đầy đủ (${items.length} bản ghi)
            </button>
        </div>
    `;
    
    document.getElementById('data-container').innerHTML = html;
}

// Hàm tải xuống dữ liệu đầy đủ
function downloadFullData() {
    fetch('./data/bill_data.json')
        .then(res => res.json())
        .then(data => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bill_data_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        });
}