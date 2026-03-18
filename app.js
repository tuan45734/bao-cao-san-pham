
const App = {
    productStats: new Map(), 
    productKVStats: new Map(), 
    categoryStats: new Map(), 
    categoryKVStats: new Map(),
    orderStats: new Map(),
    totalFilteredOrders: 0,
    isFetching: false,
    totalApiRecords: 0,
    currentView: 'overview',
    currentCategory: null,
    currentKV: 'all',

    CONVERSION_RATES: {
        'HH00055': 120, 'HH00056': 120, 'HH00057': 120, 'HH00058': 120, 'HH00059': 120,
        'HH00062': 60, 'HH00063': 120, 'HH00065': 120, 'HH00067': 120, 'HH00069': 120,
        'HH00071': 120, 'HH00072': 60, 'HH00073': 60, 'HH00101': 120, 'HH00019': 200,
        'HH00083': 200, 'HH00015': 120, 'HH00029': 200, 'HH00033': 200, 'HH00099': 90,
        'HH00100': 120, 'HH00105': 100, 'HH00074': 300, 'HH00075': 60, 'HH00077': 300,
        'HH00078': 300, 'HH00079': 300, 'HH00080': 300
    },

    init() {
        console.log('App initialized');
        this.setDefaultDates();
        this.setupEventListeners();
        this.setupKVFilterListeners();
    },

setDefaultDates() {
    const today = new Date();
    const fromDate = document.getElementById('fromDate');
    const toDate = document.getElementById('toDate');
    
  
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    fromDate.value = todayStr;
    toDate.value = todayStr;
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
filterByKV(kv) {
    this.currentKV = kv;
    
    // Cập nhật active state cho các nút
    document.querySelectorAll('.kv-filter-buttons .kv-btn').forEach(btn => {
        if (btn.dataset.kv === kv) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Cập nhật lại giao diện dựa trên view hiện tại
    if (this.currentView === 'overview') {
        this.updateCategoryCards();
        ChartManager.createOverviewCharts(this.getFilteredCategoryStats());
    } else if (this.currentView === 'detail' && this.currentCategory) {
        this.showCategoryDetail(this.currentCategory);
    }
},

    getKVFromBill(bill) {
        const tenNPP = bill.ma_nhom || bill.ten_nhom;
        return getKVFromNPP(tenNPP);
    },

    getFilteredCategoryStats() {
        const filteredStats = new Map();
        
        if (this.currentKV === 'all') {
            return this.categoryStats;
        } else {
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
        
        if (this.currentKV === 'all') {
            Array.from(this.productStats.values()).forEach(product => {
                if (product.category === categoryName) {
                    filteredProducts.push(product);
                }
            });
        } else {
            Array.from(this.productKVStats.values()).forEach(product => {
                if (product.category === categoryName && product.kv === this.currentKV) {
                    filteredProducts.push(product);
                }
            });
        }
        
        if (this.currentKV !== 'all') {
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
                        revenue: product.revenue,
                        kv: product.kv
                    });
                }
            });
            
            return Array.from(productMap.values())
                .sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
        }
        
        return filteredProducts.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
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
        
        pageData.forEach(bill => {
            if (!bill) return;
            
            const kv = this.getKVFromBill(bill);
            const sanPham = Array.isArray(bill.san_pham) ? bill.san_pham : [];
            let hasValidCategory = false;
            const categoriesInBill = new Set();
            
            sanPham.forEach(sp => {
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
        
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lấy dữ liệu...';
        
        this.productStats.clear();
        this.productKVStats.clear();
        this.categoryStats.clear();
        this.categoryKVStats.clear();
        this.orderStats.clear();
        this.totalFilteredOrders = 0;
        this.totalApiRecords = 0;
        this.currentView = 'overview';
        this.currentCategory = null;
        this.currentKV = 'all';

        document.getElementById('overviewRevenueChartContainer').style.display = 'none';
document.getElementById('overviewQuantityChartContainer').style.display = 'none';
document.getElementById('detailRevenueChartContainer').style.display = 'none';
document.getElementById('detailQuantityChartContainer').style.display = 'none';
        
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
            
            const firstPageData = await API.fetchPage(1, fromDateStr, toDateStr);
            
            if (firstPageData && firstPageData.status && Array.isArray(firstPageData.data) && firstPageData.data.length > 0) {
                this.processPageData(firstPageData.data);
                
                if (firstPageData.data.length === CONFIG.PAGE_SIZE) {
                    pageNumber = 2;
                    
                    while (hasMoreData) {
                        try {
                            console.log(`Đang lấy trang ${pageNumber}...`);
                            await Utils.sleep(CONFIG.PAGE_DELAY);
                            
                            const data = await API.fetchPage(pageNumber, fromDateStr, toDateStr);
                            
                            if (data && data.status && Array.isArray(data.data) && data.data.length > 0) {
                                this.processPageData(data.data);
                                
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

            if (this.categoryStats.size > 0) {
                this.updateCategoryCards();
                document.getElementById('categoryCards').style.display = 'grid';
                this.showOverviewChart();
            } else {
                Utils.showError('Không có dữ liệu trong khoảng thời gian này');
                this.hidePageInfo();
            }

        } catch (error) {
            console.error('Lỗi tổng thể:', error);
            Utils.showError(`Có lỗi xảy ra: ${error.message}`);
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