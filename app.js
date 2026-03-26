
const App = {
    productStats: new Map(),
    productKVStats: new Map(),
    productNPPStats: new Map(), // Thêm map lưu theo NPP
    categoryStats: new Map(),
    categoryKVStats: new Map(),
    categoryNPPStats: new Map(), // Thêm map lưu theo NPP
    orderStats: new Map(),
    totalFilteredOrders: 0,
    isFetching: false,
    totalApiRecords: 0,
    currentView: 'overview',
    currentCategory: null,
    currentKV: 'all',
    currentNPP: 'all',

    CONVERSION_RATES: {
        'HH00055': 120, 'HH00056': 120, 'HH00057': 120, 'HH00058': 120, 'HH00059': 120,
        'HH00062': 60, 'HH00063': 120, 'HH00065': 120, 'HH00067': 120, 'HH00069': 120,
        'HH00071': 120, 'HH00072': 60, 'HH00073': 60, 'HH00101': 120, 'HH00019': 200,
        'HH00083': 200, 'HH00015': 120, 'HH00029': 200, 'HH00033': 200, 'HH00099': 40,
        'HH00100': 40, 'HH00105': 100, 'HH00074': 300, 'HH00075': 60, 'HH00077': 300,
        'HH00078': 300, 'HH00079': 300, 'HH00080': 300
    },
NPP_NAME_MAPPING: new Map([
        ['NPP Tân Thúy', 'NPP Tân Thuý']
    ]),
    
    normalizeNPPName(tenNPP) {
        if (!tenNPP) return tenNPP;
        return this.NPP_NAME_MAPPING.get(tenNPP) || tenNPP;
    },
    
    init() {
        console.log('App initialized');
        this.setDefaultDates();
        this.setupEventListeners();
        this.setupKVFilterListeners();
        this.setupNPPFilterListeners(); // Thêm listener cho NPP

        // setTimeout(() => {
        //     this.fetchAllData();
        // }, 100);
    },
    setupNPPFilterListeners() {
        const nppSelect = document.getElementById('nppSelect');
        if (nppSelect) {
            nppSelect.addEventListener('change', (e) => {
                this.filterByNPP(e.target.value);
            });
        }
    },
    setDefaultDates() {
        const fromDate = document.getElementById('fromDate');
        const toDate = document.getElementById('toDate');

        const today = new Date();

        // Format thủ công YYYY-MM-DD
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Ngày đầu tháng hiện tại
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayStr = formatDate(firstDay);

        // Ngày cuối tháng hiện tại
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const lastDayStr = formatDate(lastDay);

        fromDate.value = firstDayStr;
        toDate.value = lastDayStr;

        console.log(`Mặc định: Từ ${firstDayStr} đến ${lastDayStr}`);
    },
    filterByNPP(npp) {
        this.currentNPP = npp;

        // Cập nhật lại giao diện
        this.updateCategoryCards();

        if (this.currentView === 'overview') {
            ChartManager.createOverviewCharts(this.getFilteredCategoryStats());
        } else if (this.currentView === 'detail' && this.currentCategory) {
            const products = this.getFilteredProductStats(this.currentCategory);
            ChartManager.createDetailCharts(this.currentCategory, products);

            const kvText = this.currentKV === 'all' ? 'Tất cả KV' : this.currentKV;
            const nppText = this.currentNPP === 'all' ? '' : ` - ${this.currentNPP}`;
            document.getElementById('detailRevenueChartTitle').textContent = `Sản phẩm - ${this.currentCategory} (Doanh thu - ${kvText}${nppText})`;
            document.getElementById('detailQuantityChartTitle').textContent = `Sản phẩm - ${this.currentCategory} (Số lượng - ${kvText}${nppText})`;
        }
    },
    setupEventListeners() {
        document.getElementById('cardBimQuay').addEventListener('click', () => this.showCategoryDetail('Bim Quẩy'));
        document.getElementById('cardCaCom').addEventListener('click', () => this.showCategoryDetail('Cá cơm'));
        document.getElementById('cardChanGa').addEventListener('click', () => this.showCategoryDetail('Chân gà'));
        document.getElementById('cardHangUot').addEventListener('click', () => this.showCategoryDetail('Hàng Ướt'));

        document.getElementById('backBtn').addEventListener('click', () => this.showOverviewChart());
    },

    setupKVFilterListeners() {
        document.querySelectorAll('.kv-filter-buttons .kv-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const kv = e.target.dataset.kv;
                this.filterByKV(kv);
            });
        });
    },
    updateNPPDropdown(kv) {
        const nppSelect = document.getElementById('nppSelect');
        if (!nppSelect) return;

        // Xóa các option cũ (giữ lại option "Tất cả")
        while (nppSelect.options.length > 1) {
            nppSelect.remove(1);
        }

        if (kv === 'all') {
            // Nếu chọn "Tất cả KV", hiển thị tất cả NPP
            const allNPP = Array.from(NPP_KV_MAP.keys()).sort();
            allNPP.forEach(npp => {
                const option = document.createElement('option');
                option.value = npp;
                option.textContent = npp;
                nppSelect.appendChild(option);
            });
        } else {
            // Chỉ hiển thị NPP thuộc KV đã chọn
            const nppList = getNPPByKV(kv);
            nppList.sort().forEach(npp => {
                const option = document.createElement('option');
                option.value = npp;
                option.textContent = npp;
                nppSelect.appendChild(option);
            });
        }
    },
    filterByKV(kv) {
        this.currentKV = kv;
        this.currentNPP = 'all'; // Reset NPP về "Tất cả"

        // Cập nhật NPP dropdown dựa trên KV mới
        this.updateNPPDropdown(kv);

        // Reset select value
        const nppSelect = document.getElementById('nppSelect');
        if (nppSelect) {
            nppSelect.value = 'all';
        }

        // Cập nhật active state cho các nút KV
        document.querySelectorAll('.kv-filter-buttons .kv-btn').forEach(btn => {
            if (btn.dataset.kv === kv) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // LUÔN CẬP NHẬT category cards bất kể view hiện tại
        this.updateCategoryCards();

        // Cập nhật lại giao diện dựa trên view hiện tại
        if (this.currentView === 'overview') {
            ChartManager.createOverviewCharts(this.getFilteredCategoryStats());
        } else if (this.currentView === 'detail' && this.currentCategory) {
            // Cập nhật lại chi tiết sản phẩm với bộ lọc mới
            const products = this.getFilteredProductStats(this.currentCategory);
            ChartManager.createDetailCharts(this.currentCategory, products);

            // Cập nhật tiêu đề biểu đồ
            const kvText = this.currentKV === 'all' ? 'Tất cả KV' : this.currentKV;
            const nppText = this.currentNPP === 'all' ? '' : ` - ${this.currentNPP}`;
            document.getElementById('detailRevenueChartTitle').textContent = `Sản phẩm - ${this.currentCategory} (Doanh thu - ${kvText}${nppText})`;
            document.getElementById('detailQuantityChartTitle').textContent = `Sản phẩm - ${this.currentCategory} (Số lượng - ${kvText}${nppText})`;
        }
    },

     getKVFromBill(bill) {
        let tenNPP = bill.ma_nhom || bill.ten_nhom;
        if (tenNPP) {
            tenNPP = this.normalizeNPPName(tenNPP);
        }
        return getKVFromNPP(tenNPP);
    },
    getNPPFromBill(bill) {
        let npp = bill.ma_nhom || bill.ten_nhom || 'Không xác định';
        // Chuẩn hóa tên NPP
        return this.normalizeNPPName(npp);
    },
    getFilteredCategoryStats() {
        const filteredStats = new Map();

        if (this.currentKV === 'all' && this.currentNPP === 'all') {
            return this.categoryStats;
        } else if (this.currentNPP !== 'all') {
            // Lọc theo NPP
            Array.from(this.categoryNPPStats.entries()).forEach(([key, value]) => {
                const [catName, npp] = key.split('_');
                if (npp === this.currentNPP) {
                    if (filteredStats.has(catName)) {
                        const existing = filteredStats.get(catName);
                        existing.revenue += value.revenue;
                        existing.totalGoi += value.totalGoi;
                    } else {
                        filteredStats.set(catName, {
                            name: catName,
                            icon: value.icon,
                            class: value.class,
                            color: value.color,
                            revenue: value.revenue,
                            totalGoi: value.totalGoi
                        });
                    }
                }
            });
        } else {
            // Lọc theo KV
            Array.from(this.categoryKVStats.entries()).forEach(([key, value]) => {
                const [catName, kv] = key.split('_');
                if (kv === this.currentKV) {
                    if (filteredStats.has(catName)) {
                        const existing = filteredStats.get(catName);
                        existing.revenue += value.revenue;
                        existing.totalGoi += value.totalGoi;
                    } else {
                        filteredStats.set(catName, {
                            name: catName,
                            icon: value.icon,
                            class: value.class,
                            color: value.color,
                            revenue: value.revenue,
                            totalGoi: value.totalGoi
                        });
                    }
                }
            });
        }

        return filteredStats;
    },


    getFilteredProductStats(categoryName) {
        const filteredProducts = [];

        if (this.currentNPP !== 'all') {
            // Lọc theo NPP
            Array.from(this.productNPPStats.values()).forEach(product => {
                if (product.category === categoryName && product.npp === this.currentNPP) {
                    filteredProducts.push(product);
                }
            });
        } else if (this.currentKV !== 'all') {
            // Lọc theo KV
            Array.from(this.productKVStats.values()).forEach(product => {
                if (product.category === categoryName && product.kv === this.currentKV) {
                    filteredProducts.push(product);
                }
            });
        } else {
            // Không lọc
            Array.from(this.productStats.values()).forEach(product => {
                if (product.category === categoryName) {
                    filteredProducts.push(product);
                }
            });
        }

        // Gom nhóm sản phẩm (trong trường hợp lọc theo KV hoặc NPP có thể có nhiều NPP cùng sản phẩm)
        const productMap = new Map();
        filteredProducts.forEach(product => {
            const ma_sp = product.ma_sp;
            if (productMap.has(ma_sp)) {
                const existing = productMap.get(ma_sp);
                existing.totalGoi += product.totalGoi;
                existing.revenue += product.revenue;
            } else {
                productMap.set(ma_sp, {
                    ma_sp: product.ma_sp,
                    ten_sp: product.ten_sp,
                    category: product.category,
                    totalGoi: product.totalGoi,
                    revenue: product.revenue
                });
            }
        });

        return Array.from(productMap.values())
            .sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
    },


    getCategory(productCode) {
        if (!productCode) return null;
        const categoryName = CATEGORY_MAP.get(productCode);
        if (!categoryName) return null;
        return {
            name: categoryName,
            ...CATEGORY_STYLES[categoryName]
        };
    },

    getConversionRate(productCode) {
        return this.CONVERSION_RATES[productCode] || 1;
    },

    processPageData(pageData) {
    if (!Array.isArray(pageData)) return;

    // Debug variables for HH00029 - NPP Anh Minh HT only
    let hh00029TotalRevenue = 0;
    let hh00029TotalQuantity = 0;
    let hh00029TotalGoi = 0;
    let hh00029Orders = [];
    let hh00029Details = [];
    let foundNPPAnhMinhHT = false;

    pageData.forEach((bill, billIndex) => {
        if (!bill) return;

        const kv = this.getKVFromBill(bill);
        const npp = this.getNPPFromBill(bill);
        const sanPham = Array.isArray(bill.san_pham) ? bill.san_pham : [];
        let hasValidCategory = false;
        const categoriesInBill = new Set();

        // ========== DEBUG: Check NPP Anh Minh HT ==========
        if (npp === 'NPP Anh Minh HT' || npp === 'Anh Minh HT') {
            foundNPPAnhMinhHT = true;
            console.log(`🏪 [NPP Anh Minh HT] Bill #${billIndex + 1}:`, {
                'Mã đơn': bill.ma_don_hang || bill.so_hd || 'N/A',
                'Ngày': bill.ngay_lap || 'N/A',
                'Số sản phẩm': sanPham.length
            });
        }
        // ========== END CHECK NPP ==========

        sanPham.forEach((sp, spIndex) => {
            if (!sp || !sp.ma_sp) return;

            const category = this.getCategory(sp.ma_sp);
            if (!category) return;

            const revenue = Utils.safeNumber(sp.thanh_tien);
            const quantity = Utils.safeNumber(sp.so_luong);
            const unit = sp.ma_dvt || 'Gói';
            const rate = this.getConversionRate(sp.ma_sp);

            hasValidCategory = true;
            categoriesInBill.add(category.name);

            const goiFromThisOrder = unit === 'Thùng' ? quantity * rate : quantity;

            // ========== DEBUG: ONLY HH00029 of NPP Anh Minh HT ==========
            // Chỉ xử lý khi sp.ma_sp là HH00029 VÀ npp là NPP Anh Minh HT
            if (sp.ma_sp === 'HH00029' && (npp === 'NPP Anh Minh HT' || npp === 'Anh Minh HT')) {
                const billInfo = {
                    billIndex: billIndex + 1,
                    spIndex: spIndex + 1,
                    ma_don_hang: bill.ma_don_hang || bill.so_hd || 'N/A',
                    npp: npp,
                    kv: kv,
                    ten_sp: sp.ten_sp,
                    so_luong: quantity,
                    don_vi: unit,
                    ty_le_quy_doi: rate,
                    so_goi: goiFromThisOrder,
                    thanh_tien: revenue,
                    ngay: bill.ngay_lap || 'N/A',
                    ma_khach: bill.ma_khach || 'N/A',
                    ten_khach: bill.ten_khach || 'N/A'
                };
                
                hh00029Details.push(billInfo);
                hh00029TotalRevenue += revenue;
                hh00029TotalQuantity += quantity;
                hh00029TotalGoi += goiFromThisOrder;
                hh00029Orders.push(bill.ma_don_hang || bill.so_hd || billIndex);
                
                console.log(`🎯 [HH00029 - NPP Anh Minh HT] Bill #${billIndex + 1}, SP #${spIndex + 1}:`, {
                    'Mã đơn': billInfo.ma_don_hang,
                    'NPP': npp,
                    'KV': kv,
                    'Số lượng': `${quantity} ${unit}`,
                    'Quy đổi': `${goiFromThisOrder.toLocaleString('vi-VN')} gói`,
                    'Doanh thu': Utils.formatCurrency(revenue),
                    'Ngày': billInfo.ngay
                });
            }
            // ========== END DEBUG ==========

            // Thống kê theo NPP
            const productNPPKey = `${sp.ma_sp}_${npp}`;
            if (this.productNPPStats.has(productNPPKey)) {
                const stats = this.productNPPStats.get(productNPPKey);
                stats.totalGoi += goiFromThisOrder;
                stats.revenue += revenue;
            } else {
                this.productNPPStats.set(productNPPKey, {
                    ma_sp: sp.ma_sp,
                    ten_sp: sp.ten_sp || 'Không tên',
                    category: category.name,
                    totalGoi: goiFromThisOrder,
                    revenue: revenue,
                    npp: npp
                });
            }

            const categoryNPPKey = `${category.name}_${npp}`;
            if (this.categoryNPPStats.has(categoryNPPKey)) {
                const catStats = this.categoryNPPStats.get(categoryNPPKey);
                catStats.revenue += revenue;
                catStats.totalGoi += goiFromThisOrder;
            } else {
                this.categoryNPPStats.set(categoryNPPKey, {
                    name: category.name,
                    npp: npp,
                    icon: category.icon,
                    class: category.class,
                    color: category.color,
                    revenue: revenue,
                    totalGoi: goiFromThisOrder
                });
            }

            // Thống kê theo KV (giữ nguyên)
            const productKVKey = `${sp.ma_sp}_${kv}`;
            if (this.productKVStats.has(productKVKey)) {
                const stats = this.productKVStats.get(productKVKey);
                stats.totalGoi += goiFromThisOrder;
                stats.revenue += revenue;
            } else {
                this.productKVStats.set(productKVKey, {
                    ma_sp: sp.ma_sp,
                    ten_sp: sp.ten_sp || 'Không tên',
                    category: category.name,
                    totalGoi: goiFromThisOrder,
                    revenue: revenue,
                    kv: kv
                });
            }

            const categoryKVKey = `${category.name}_${kv}`;
            if (this.categoryKVStats.has(categoryKVKey)) {
                const catStats = this.categoryKVStats.get(categoryKVKey);
                catStats.revenue += revenue;
                catStats.totalGoi += goiFromThisOrder;
            } else {
                this.categoryKVStats.set(categoryKVKey, {
                    name: category.name,
                    kv: kv,
                    icon: category.icon,
                    class: category.class,
                    color: category.color,
                    revenue: revenue,
                    totalGoi: goiFromThisOrder
                });
            }

            // Thống kê tổng (giữ nguyên)
            if (this.productStats.has(sp.ma_sp)) {
                const stats = this.productStats.get(sp.ma_sp);
                stats.totalGoi += goiFromThisOrder;
                stats.revenue += revenue;
            } else {
                this.productStats.set(sp.ma_sp, {
                    ma_sp: sp.ma_sp,
                    ten_sp: sp.ten_sp || 'Không tên',
                    category: category.name,
                    totalGoi: goiFromThisOrder,
                    revenue: revenue
                });
            }

            if (this.categoryStats.has(category.name)) {
                const catStats = this.categoryStats.get(category.name);
                catStats.revenue += revenue;
                catStats.totalGoi += goiFromThisOrder;
            } else {
                this.categoryStats.set(category.name, {
                    name: category.name,
                    icon: category.icon,
                    class: category.class,
                    color: category.color,
                    revenue: revenue,
                    totalGoi: goiFromThisOrder
                });
            }
        });

        if (hasValidCategory) {
            this.totalFilteredOrders++;
            categoriesInBill.forEach(catName => {
                const orderKey = `${catName}_${kv}`;
                this.orderStats.set(orderKey, (this.orderStats.get(orderKey) || 0) + 1);
            });
        }
    });

    // ========== DEBUG: HH00029 of NPP Anh Minh HT SUMMARY ==========
    if (!foundNPPAnhMinhHT) {
        console.log('='.repeat(80));
        console.log('⚠️ KHÔNG TÌM THẤY BẤT KỲ ĐƠN HÀNG NÀO CỦA NPP ANH MINH HT');
        console.log('='.repeat(80));
        console.log('Kiểm tra lại:');
        console.log('1. Tên NPP trong API trả về là gì?');
        console.log('2. Có đơn hàng nào của NPP Anh Minh HT trong khoảng thời gian này không?');
        console.log('3. Hàm getNPPFromBill() có trả về đúng tên NPP không?');
        console.log('='.repeat(80));
    } else if (hh00029Details.length === 0) {
        console.log('='.repeat(80));
        console.log('⚠️ CÓ ĐƠN HÀNG CỦA NPP ANH MINH HT NHƯNG KHÔNG CÓ SẢN PHẨM HH00029');
        console.log('='.repeat(80));
        console.log('Kiểm tra:');
        console.log('1. Mã sản phẩm HH00029 có trong các đơn hàng không?');
        console.log('2. API có trả về mã sản phẩm đúng là "HH00029" không?');
        console.log('3. Sản phẩm có thuộc category hợp lệ không?');
        console.log('='.repeat(80));
    } else if (hh00029Details.length > 0) {
        console.log('='.repeat(80));
        console.log('📊 BÁO CÁO CHI TIẾT SẢN PHẨM HH00029 - NPP ANH MINH HT');
        console.log('='.repeat(80));
        console.log(`📦 Tổng số đơn hàng: ${hh00029Orders.length} đơn`);
        console.log(`📦 Tổng số lượng bán: ${hh00029TotalQuantity.toLocaleString('vi-VN')} thùng`);
        console.log(`📦 Tổng số gói quy đổi: ${hh00029TotalGoi.toLocaleString('vi-VN')} gói`);
        console.log(`💰 Tổng doanh thu: ${Utils.formatCurrency(hh00029TotalRevenue)}`);
        console.log('='.repeat(80));
        
        // Thống kê chi tiết theo từng đơn
        console.log('\n📋 CHI TIẾT TỪNG ĐƠN HÀNG (HH00029 - NPP Anh Minh HT):');
        console.table(hh00029Details.map(item => ({
            'STT': item.billIndex,
            'Mã đơn': item.ma_don_hang,
            'Ngày': item.ngay,
            'SL thùng': item.so_luong,
            'Số gói': item.so_goi.toLocaleString('vi-VN'),
            'Doanh thu': Utils.formatCurrency(item.thanh_tien),
            'KV': item.kv,
            'Mã KH': item.ma_khach,
            'Tên KH': item.ten_khach
        })));
        
        // Tính tổng số tiền từng dòng để kiểm tra
        let calculatedTotal = 0;
        hh00029Details.forEach(item => {
            calculatedTotal += item.thanh_tien;
        });
        
        console.log('\n📌 KIỂM TRA TỔNG DOANH THU:');
        console.log(`   Tổng từ chi tiết: ${Utils.formatCurrency(calculatedTotal)}`);
        console.log(`   Tổng đã tính: ${Utils.formatCurrency(hh00029TotalRevenue)}`);
        console.log(`   ✅ Khớp: ${calculatedTotal === hh00029TotalRevenue ? 'CÓ' : 'KHÔNG'}`);
        
        // Thống kê theo KV
        const byKV = {};
        hh00029Details.forEach(item => {
            if (!byKV[item.kv]) {
                byKV[item.kv] = { 
                    count: 0, 
                    revenue: 0, 
                    quantity: 0, 
                    goi: 0,
                    orders: new Set()
                };
            }
            byKV[item.kv].count++;
            byKV[item.kv].revenue += item.thanh_tien;
            byKV[item.kv].quantity += item.so_luong;
            byKV[item.kv].goi += item.so_goi;
            byKV[item.kv].orders.add(item.ma_don_hang);
        });
        
        console.log('\n📌 THỐNG KÊ THEO KV:');
        Object.keys(byKV).sort().forEach(kv => {
            const data = byKV[kv];
            console.log(`   ${kv}: ${data.orders.size} đơn | ${data.quantity} thùng (${data.goi.toLocaleString('vi-VN')} gói) | ${Utils.formatCurrency(data.revenue)}`);
        });
        
        console.log('='.repeat(80));
        console.log('✅ DEBUG HOÀN TẤT - DỮ LIỆU HH00029 CỦA NPP ANH MINH HT ĐÃ ĐƯỢC GHI NHẬN');
        console.log('='.repeat(80));
    }
    // ========== END DEBUG ==========
},

    updatePageInfo(currentPage, totalPages) {
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) {
            pageInfo.style.display = 'none';
        }
    },

    hidePageInfo() {
        document.getElementById('pageInfo').style.display = 'none';
    },

    updateCategoryCards() {
        const categories = ['Bim Quẩy', 'Cá cơm', 'Chân gà', 'Hàng Ướt'];
        const filteredStats = this.getFilteredCategoryStats();

        categories.forEach(catName => {
            const catStats = filteredStats.get(catName) || { revenue: 0, totalGoi: 0 };
            const orders = this.getOrderCountForCategory(catName);

            const revenueId = this.getRevenueId(catName);
            const quantityId = this.getQuantityId(catName);
            const ordersId = this.getOrdersId(catName);

            if (revenueId) {
                document.getElementById(revenueId).textContent = Utils.formatCurrency(Utils.safeNumber(catStats.revenue));
            }
            if (quantityId) {
                document.getElementById(quantityId).textContent = `${Utils.formatNumber(catStats.totalGoi)} gói`;
            }
            if (ordersId) {
                document.getElementById(ordersId).textContent = `${Utils.formatNumber(orders)} đơn hàng`;
            }
        });
    },

    getOrderCountForCategory(categoryName) {
        let total = 0;
        Array.from(this.orderStats.entries()).forEach(([key, value]) => {
            if (key.startsWith(categoryName)) {
                const kv = key.split('_')[1];
                if (this.currentKV === 'all' || kv === this.currentKV) {
                    total += value;
                }
            }
        });
        return total;
    },

    getRevenueId(catName) {
        const map = {
            'Bim Quẩy': 'bimQuayRevenue',
            'Cá cơm': 'caComRevenue',
            'Chân gà': 'chanGaRevenue',
            'Hàng Ướt': 'hangUotRevenue'
        };
        return map[catName];
    },

    getQuantityId(catName) {
        const map = {
            'Bim Quẩy': 'bimQuayQuantity',
            'Cá cơm': 'caComQuantity',
            'Chân gà': 'chanGaQuantity',
            'Hàng Ướt': 'hangUotQuantity'
        };
        return map[catName];
    },

    getOrdersId(catName) {
        const map = {
            'Bim Quẩy': 'bimQuayOrders',
            'Cá cơm': 'caComOrders',
            'Chân gà': 'chanGaOrders',
            'Hàng Ướt': 'hangUotOrders'
        };
        return map[catName];
    },

    async fetchAllData() {
        if (this.isFetching) return;

        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;

        if (!Utils.validateDates(fromDate, toDate)) return;

        this.isFetching = true;
        const searchBtn = document.getElementById('searchBtn');
        const nppSelect = document.getElementById('nppSelect');

        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lấy dữ liệu...';

        // Reset tất cả dữ liệu
        this.productStats.clear();
        this.productKVStats.clear();
        this.productNPPStats.clear();
        this.categoryStats.clear();
        this.categoryKVStats.clear();
        this.categoryNPPStats.clear();
        this.orderStats.clear();
        this.totalFilteredOrders = 0;
        this.totalApiRecords = 0;
        this.currentView = 'overview';
        this.currentCategory = null;
        this.currentKV = 'all';
        this.currentNPP = 'all';

        // Reset và hiển thị page info
        const loadedPagesSpan = document.getElementById('loadedPages');
        const totalPagesSpan = document.getElementById('totalPages');
        const pageInfo = document.getElementById('pageInfo');

        if (loadedPagesSpan) loadedPagesSpan.textContent = '0';
        if (totalPagesSpan) totalPagesSpan.textContent = '?';
        if (pageInfo) pageInfo.style.display = 'flex';

        // Reset NPP dropdown
        if (nppSelect) {
            nppSelect.innerHTML = '<option value="all">Tất cả NPP</option>';
        }

        // Ẩn các container chart
        document.getElementById('overviewRevenueChartContainer').style.display = 'none';
        document.getElementById('overviewQuantityChartContainer').style.display = 'none';
        document.getElementById('detailRevenueChartContainer').style.display = 'none';
        document.getElementById('detailQuantityChartContainer').style.display = 'none';

        // Reset active state cho KV buttons
        document.querySelectorAll('.kv-filter-buttons .kv-btn').forEach(btn => {
            if (btn.dataset.kv === 'all') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        Utils.showLoading();

        try {
            const fromDateStr = Utils.formatDateForAPI(fromDate);
            const toDateStr = Utils.formatDateForAPI(toDate);

            let pageNumber = 1;
            let hasMoreData = true;

            // Lấy trang đầu tiên
            const firstPageData = await API.fetchPage(1, fromDateStr, toDateStr);

            if (firstPageData && firstPageData.status && Array.isArray(firstPageData.data) && firstPageData.data.length > 0) {
                this.processPageData(firstPageData.data);

                // Cập nhật số trang đã load
                if (loadedPagesSpan) loadedPagesSpan.textContent = '1';

                // Kiểm tra xem còn trang tiếp theo không
                if (firstPageData.data.length === CONFIG.PAGE_SIZE) {
                    pageNumber = 2;

                    while (hasMoreData) {
                        try {
                            console.log(`Đang lấy trang ${pageNumber}...`);
                            await Utils.sleep(CONFIG.PAGE_DELAY);

                            const data = await API.fetchPage(pageNumber, fromDateStr, toDateStr);

                            if (data && data.status && Array.isArray(data.data) && data.data.length > 0) {
                                this.processPageData(data.data);

                                // Cập nhật số trang đã load
                                if (loadedPagesSpan) loadedPagesSpan.textContent = pageNumber;

                                // Nếu số lượng bản ghi ít hơn PAGE_SIZE, đã hết dữ liệu
                                if (data.data.length < CONFIG.PAGE_SIZE) {
                                    hasMoreData = false;
                                    console.log('Đã lấy hết dữ liệu!');
                                } else {
                                    pageNumber++;
                                }
                            } else {
                                hasMoreData = false;
                            }

                        } catch (error) {
                            console.error(`Lỗi trang ${pageNumber}:`, error);
                            Utils.showError(`Lỗi khi lấy trang ${pageNumber}: ${error.message}`);
                            hasMoreData = false;
                        }
                    }
                }
            }

            // Sau khi lấy xong dữ liệu, kiểm tra và hiển thị
            if (this.categoryStats.size > 0) {
                // Cập nhật dropdown NPP với tất cả NPP có dữ liệu
                this.updateNPPDropdown('all');

                // Cập nhật category cards
                this.updateCategoryCards();

                // Hiển thị category cards
                document.getElementById('categoryCards').style.display = 'grid';

                // Hiển thị biểu đồ tổng quan
                this.showOverviewChart();

                // Ẩn page info sau khi hoàn tất
                if (pageInfo) {
                    setTimeout(() => {
                        pageInfo.style.display = 'none';
                    }, 500);
                }
            } else {
                Utils.showError('Không có dữ liệu trong khoảng thời gian này');
                if (pageInfo) pageInfo.style.display = 'none';
                document.getElementById('categoryCards').style.display = 'none';
            }

        } catch (error) {
            console.error('Lỗi tổng thể:', error);
            Utils.showError(`Có lỗi xảy ra: ${error.message}`);
            if (pageInfo) pageInfo.style.display = 'none';
        } finally {
            this.isFetching = false;
            Utils.hideLoading();
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Xem báo cáo';
        }
    },

    showOverviewChart() {
        this.currentView = 'overview';
        this.currentCategory = null;

        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });

        document.getElementById('overviewRevenueChartContainer').style.display = 'block';
        document.getElementById('overviewQuantityChartContainer').style.display = 'block';
        document.getElementById('detailRevenueChartContainer').style.display = 'none';
        document.getElementById('detailQuantityChartContainer').style.display = 'none';

        ChartManager.createOverviewCharts(this.getFilteredCategoryStats());
    },

    showCategoryDetail(categoryName) {
        this.currentView = 'detail';
        this.currentCategory = categoryName;

        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.category === categoryName) {
                card.classList.add('active');
            }
        });

        document.getElementById('overviewRevenueChartContainer').style.display = 'none';
        document.getElementById('overviewQuantityChartContainer').style.display = 'none';
        document.getElementById('detailRevenueChartContainer').style.display = 'block';
        document.getElementById('detailQuantityChartContainer').style.display = 'block';

        const kvText = this.currentKV === 'all' ? 'Tất cả KV' : this.currentKV;
        document.getElementById('detailRevenueChartTitle').textContent = `Sản phẩm - ${categoryName} (Doanh thu - ${kvText})`;
        document.getElementById('detailQuantityChartTitle').textContent = `Sản phẩm - ${categoryName} (Số lượng - ${kvText})`;

        const products = this.getFilteredProductStats(categoryName);
        ChartManager.createDetailCharts(categoryName, products);
    },
};

document.addEventListener('DOMContentLoaded', () => {
    window.app = App;
    App.init();
});