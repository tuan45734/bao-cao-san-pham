// MÃ XÁC THỰC YÊU CẦU - Mapping mã -> quyền
const ACCESS_CODE_MAP = {
    'KV1ADZ': 'KV1',
    'KV2ZAC': 'KV2',
    'KV3CCC': 'KV3',
    'KV4YXY': 'KV4',
    'KV5XXZ': 'KV5',
    'KV6XBC': 'KV6',
    '99': 'ADMIN'
};

const App = {
    productStats: new Map(),
    productKVStats: new Map(),
    productNPPStats: new Map(),
    categoryStats: new Map(),
    categoryKVStats: new Map(),
    categoryNPPStats: new Map(),
    orderStats: new Map(),
    totalFilteredOrders: 0,
    isFetching: false,
    totalApiRecords: 0,
    currentView: 'overview',
    currentCategory: null,
    currentKV: 'all',
    currentNPP: 'all',
    isAuthenticated: false,
    userRole: null,
    isKVLocked: false,

    CONVERSION_RATES: {
        'HH00055': 120, 'HH00056': 120, 'HH00057': 120, 'HH00058': 120, 'HH00059': 120,
        'HH00062': 60, 'HH00063': 120, 'HH00065': 120, 'HH00067': 120, 'HH00069': 120,
        'HH00071': 120, 'HH00072': 60, 'HH00073': 60, 'HH00101': 120, 'HH00019': 200,
        'HH00083': 200, 'HH00015': 120, 'HH00029': 200, 'HH00033': 200, 'HH00099': 40,
        'HH00100': 40, 'HH00105': 100, 'HH00074': 300, 'HH00075': 60, 'HH00077': 300,
        'HH00078': 300, 'HH00079': 300, 'HH00080': 300, 'HH00106': 60, 'HH00107': 60,
        'HH00108': 60, 'HH00109': 60, 'HH00110': 60, 'HH00111': 90, 'HH00112': 90
    },
    
    PRICE_PER_CASE: {
        'HH00055': 432000, 'HH00056': 432000, 'HH00057': 432000, 'HH00058': 432000, 'HH00059': 432000,
        'HH00062': 432000, 'HH00063': 432000, 'HH00065': 432000, 'HH00067': 432000, 'HH00069': 432000,
        'HH00071': 432000, 'HH00072': 432000, 'HH00073': 432000, 'HH00101': 432000,
        'HH00019': 766000, 'HH00083': 766000,
        'HH00015': 842000, 'HH00029': 1387000, 'HH00033': 1387000, 'HH00099': 690000,
        'HH00100': 910000, 'HH00105': 840000,
        'HH00074': 432000, 'HH00075': 432000, 'HH00077': 432000, 'HH00078': 432000,
        'HH00079': 432000, 'HH00080': 432000,
        'HH00106': 210000, 'HH00107': 210000, 'HH00108': 210000, 'HH00109': 432000, 'HH00110': 432000,
        'HH00111': 288000, 'HH00112': 288000
    },

    NPP_NAME_MAPPING: new Map([
        ['NPP Tân Thúy', 'NPP Tân Thuý']
    ]),

    getPricePerCase(productCode) {
        return this.PRICE_PER_CASE[productCode] || 0;
    },

    calculateCasesFromRevenue(productCode, revenue) {
        const pricePerCase = this.getPricePerCase(productCode);
        if (pricePerCase === 0) return 0;
        return revenue / pricePerCase;
    },

    normalizeNPPName(tenNPP) {
        if (!tenNPP) return tenNPP;
        return this.NPP_NAME_MAPPING.get(tenNPP) || tenNPP;
    },

    init() {
        console.log('App initialized');
        this.initAuth();
        
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) searchBtn.disabled = true;
        
        this.setDefaultDates();
        this.setupEventListeners();
        this.setupKVFilterListeners();
        this.setupNPPFilterListeners();
    },
    
    initAuth() {
        const authModal = document.getElementById('authModal');
        const accessCode = document.getElementById('accessCode');
        const submitBtn = document.getElementById('submitAuthBtn');
        const authError = document.getElementById('authError');
        const searchBtn = document.getElementById('searchBtn');
        
        if (!authModal) return;
        
        authModal.classList.add('active');
        
        submitBtn.onclick = () => {
            let code = accessCode.value;
            if (!code) {
                authError.textContent = '❌ Vui lòng nhập mã truy cập!';
                return;
            }
            
            const upperCode = code.toUpperCase().trim();
            const role = ACCESS_CODE_MAP[upperCode];
            
            if (role) {
                this.isAuthenticated = true;
                this.userRole = role;
                
                if (role !== 'ADMIN') {
                    this.isKVLocked = true;
                    this.currentKV = role;
                } else {
                    this.isKVLocked = false;
                    this.currentKV = 'all';
                }
                
                authModal.classList.remove('active');
                if (searchBtn) searchBtn.disabled = false;
                authError.textContent = '';
                accessCode.value = '';
                
                this.applyAuthRestrictions();
                this.showAuthSuccessMessage(role);
            } else {
                authError.textContent = '❌ Mã không đúng! Vui lòng thử lại.';
                accessCode.value = '';
                accessCode.focus();
            }
        };
        
        accessCode.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });
    },
    
    showAuthSuccessMessage(role) {
        let message = '';
        if (role === 'ADMIN') {
            message = '✅ Đăng nhập thành công! Bạn có quyền ADMIN - Xem được tất cả dữ liệu.';
        } else {
            message = `✅ Đăng nhập thành công! Bạn đang xem dữ liệu của khu vực ${role}.`;
        }
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 2000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: fadeOut 3s ease forwards;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        if (!document.querySelector('#toastKeyframes')) {
            const style = document.createElement('style');
            style.id = 'toastKeyframes';
            style.textContent = `
                @keyframes fadeOut {
                    0% { opacity: 1; transform: translateX(0); }
                    70% { opacity: 1; transform: translateX(0); }
                    100% { opacity: 0; transform: translateX(20px); display: none; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },
    
    applyAuthRestrictions() {
        const kvButtons = document.querySelectorAll('.kv-filter-buttons .kv-btn');
        
        if (this.isKVLocked) {
            kvButtons.forEach(btn => {
                const kvValue = btn.dataset.kv;
                if (kvValue === this.currentKV) {
                    btn.classList.add('active');
                    btn.disabled = false;
                } else {
                    btn.classList.remove('active');
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                }
            });
            
            this.updateNPPDropdown(this.currentKV);
            
            const nppSelect = document.getElementById('nppSelect');
            if (nppSelect) {
                nppSelect.disabled = false;
            }
            
            console.log(`Đã khóa bộ lọc KV: chỉ xem được ${this.currentKV}`);
        } else {
            kvButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '';
                btn.style.cursor = 'pointer';
            });
            
            this.currentKV = 'all';
            document.querySelector('.kv-btn[data-kv="all"]').classList.add('active');
            this.updateNPPDropdown('all');
            
            const nppSelect = document.getElementById('nppSelect');
            if (nppSelect) {
                nppSelect.disabled = false;
                nppSelect.value = 'all';
            }
            
            console.log('ADMIN: có thể xem tất cả KV');
        }
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

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayStr = formatDate(firstDay);

        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const lastDayStr = formatDate(lastDay);

        fromDate.value = firstDayStr;
        toDate.value = lastDayStr;
    },
    
    filterByNPP(npp) {
        this.currentNPP = npp;
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
        document.getElementById('cardPhu').addEventListener('click', () => this.showCategoryDetail('Phụ'));
        document.getElementById('cardChanGa').addEventListener('click', () => this.showCategoryDetail('Chân gà'));
        document.getElementById('cardHangUot').addEventListener('click', () => this.showCategoryDetail('Hàng Ướt'));

        document.getElementById('backBtn').addEventListener('click', () => this.showOverviewChart());
    },

    setupKVFilterListeners() {
        document.querySelectorAll('.kv-filter-buttons .kv-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.disabled) return;
                const kv = e.target.dataset.kv;
                this.filterByKV(kv);
            });
        });
    },
    
    updateNPPDropdown(kv) {
        const nppSelect = document.getElementById('nppSelect');
        if (!nppSelect) return;

        while (nppSelect.options.length > 1) {
            nppSelect.remove(1);
        }

        if (kv === 'all') {
            const allNPP = Array.from(NPP_KV_MAP.keys()).sort();
            allNPP.forEach(npp => {
                const option = document.createElement('option');
                option.value = npp;
                let displayName = npp;
                if (npp === 'NPP Tiên Lan') {
                    displayName = 'NPP Tiên Lan (Nghỉ)';
                }
                if (npp === 'NPP Anh Đức') {
                    displayName = 'NPP Anh Đức (Nghỉ)';
                }
                option.textContent = displayName;
                nppSelect.appendChild(option);
            });
        } else {
            const nppList = getNPPByKV(kv);
            nppList.sort().forEach(npp => {
                const option = document.createElement('option');
                option.value = npp;
                let displayName = npp;
                if (npp === 'NPP Anh Đức') {
                    displayName = 'NPP Anh Đức (Nghỉ)';
                }
                if (npp === 'NPP Tiên Lan') {
                    displayName = 'NPP Tiên Lan (Nghỉ)';
                }
                option.textContent = displayName;
                nppSelect.appendChild(option);
            });
        }
    },
    
    filterByKV(kv) {
        if (this.isKVLocked && kv !== this.currentKV) {
            console.log(`Bạn chỉ được xem ${this.currentKV}`);
            return;
        }
        
        this.currentKV = kv;
        this.currentNPP = 'all';

        this.updateNPPDropdown(kv);

        const nppSelect = document.getElementById('nppSelect');
        if (nppSelect) {
            nppSelect.value = 'all';
        }

        document.querySelectorAll('.kv-filter-buttons .kv-btn').forEach(btn => {
            if (btn.dataset.kv === kv) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

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

    getKVFromBill(bill) {
        let tenNPP = bill.ma_nhom || bill.ten_nhom;
        if (tenNPP) {
            tenNPP = this.normalizeNPPName(tenNPP);
        }
        return getKVFromNPP(tenNPP);
    },
    
    getNPPFromBill(bill) {
        let npp = bill.ma_nhom || bill.ten_nhom || 'Không xác định';
        return this.normalizeNPPName(npp);
    },
    
    getFilteredCategoryStats() {
        const filteredStats = new Map();

        if (this.currentKV === 'all' && this.currentNPP === 'all') {
            return this.categoryStats;
        } else if (this.currentNPP !== 'all') {
            Array.from(this.categoryNPPStats.entries()).forEach(([key, value]) => {
                const [catName, npp] = key.split('_');
                if (npp === this.currentNPP) {
                    if (filteredStats.has(catName)) {
                        const existing = filteredStats.get(catName);
                        existing.revenue += value.revenue;
                        existing.cases += value.cases;
                        existing.totalGoi += value.totalGoi;
                    } else {
                        filteredStats.set(catName, {
                            name: catName,
                            icon: value.icon,
                            class: value.class,
                            color: value.color,
                            revenue: value.revenue,
                            cases: value.cases,
                            totalGoi: value.totalGoi
                        });
                    }
                }
            });
        } else {
            Array.from(this.categoryKVStats.entries()).forEach(([key, value]) => {
                const [catName, kv] = key.split('_');
                if (kv === this.currentKV) {
                    if (filteredStats.has(catName)) {
                        const existing = filteredStats.get(catName);
                        existing.revenue += value.revenue;
                        existing.cases += value.cases;
                        existing.totalGoi += value.totalGoi;
                    } else {
                        filteredStats.set(catName, {
                            name: catName,
                            icon: value.icon,
                            class: value.class,
                            color: value.color,
                            revenue: value.revenue,
                            cases: value.cases,
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
            Array.from(this.productNPPStats.values()).forEach(product => {
                if (product.category === categoryName && product.npp === this.currentNPP) {
                    filteredProducts.push(product);
                }
            });
        } else if (this.currentKV !== 'all') {
            Array.from(this.productKVStats.values()).forEach(product => {
                if (product.category === categoryName && product.kv === this.currentKV) {
                    filteredProducts.push(product);
                }
            });
        } else {
            Array.from(this.productStats.values()).forEach(product => {
                if (product.category === categoryName) {
                    filteredProducts.push(product);
                }
            });
        }

        const productMap = new Map();
        filteredProducts.forEach(product => {
            const ma_sp = product.ma_sp;
            if (productMap.has(ma_sp)) {
                const existing = productMap.get(ma_sp);
                existing.totalGoi += product.totalGoi;
                existing.revenue += product.revenue;
                existing.cases += product.cases;
            } else {
                productMap.set(ma_sp, {
                    ma_sp: product.ma_sp,
                    ten_sp: product.ten_sp,
                    category: product.category,
                    totalGoi: product.totalGoi,
                    revenue: product.revenue,
                    cases: product.cases,
                    pricePerCase: product.pricePerCase
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

        pageData.forEach((bill, billIndex) => {
            if (!bill) return;

            const kv = this.getKVFromBill(bill);
            const npp = this.getNPPFromBill(bill);
            const sanPham = Array.isArray(bill.san_pham) ? bill.san_pham : [];
            let hasValidCategory = false;
            const categoriesInBill = new Set();

            sanPham.forEach((sp, spIndex) => {
                if (!sp || !sp.ma_sp) return;

                const category = this.getCategory(sp.ma_sp);
                if (!category) return;

                const revenue = Utils.safeNumber(sp.thanh_tien);
                const quantity = Utils.safeNumber(sp.so_luong);
                const unit = sp.ma_dvt || 'Gói';

                const pricePerCase = this.getPricePerCase(sp.ma_sp);
                const casesFromRevenue = pricePerCase > 0 ? revenue / pricePerCase : 0;

                const rate = this.getConversionRate(sp.ma_sp);
                const goiFromThisOrder = unit === 'Thùng' ? quantity * rate : quantity;

                hasValidCategory = true;
                categoriesInBill.add(category.name);

                const productNPPKey = `${sp.ma_sp}_${npp}`;
                if (this.productNPPStats.has(productNPPKey)) {
                    const stats = this.productNPPStats.get(productNPPKey);
                    stats.revenue += revenue;
                    stats.cases += casesFromRevenue;
                    stats.totalGoi += goiFromThisOrder;
                } else {
                    this.productNPPStats.set(productNPPKey, {
                        ma_sp: sp.ma_sp,
                        ten_sp: sp.ten_sp || 'Không tên',
                        category: category.name,
                        revenue: revenue,
                        cases: casesFromRevenue,
                        totalGoi: goiFromThisOrder,
                        npp: npp,
                        pricePerCase: pricePerCase
                    });
                }

                const productKVKey = `${sp.ma_sp}_${kv}`;
                if (this.productKVStats.has(productKVKey)) {
                    const stats = this.productKVStats.get(productKVKey);
                    stats.revenue += revenue;
                    stats.cases += casesFromRevenue;
                    stats.totalGoi += goiFromThisOrder;
                } else {
                    this.productKVStats.set(productKVKey, {
                        ma_sp: sp.ma_sp,
                        ten_sp: sp.ten_sp || 'Không tên',
                        category: category.name,
                        revenue: revenue,
                        cases: casesFromRevenue,
                        totalGoi: goiFromThisOrder,
                        kv: kv,
                        pricePerCase: pricePerCase
                    });
                }

                if (this.productStats.has(sp.ma_sp)) {
                    const stats = this.productStats.get(sp.ma_sp);
                    stats.revenue += revenue;
                    stats.cases += casesFromRevenue;
                    stats.totalGoi += goiFromThisOrder;
                } else {
                    this.productStats.set(sp.ma_sp, {
                        ma_sp: sp.ma_sp,
                        ten_sp: sp.ten_sp || 'Không tên',
                        category: category.name,
                        revenue: revenue,
                        cases: casesFromRevenue,
                        totalGoi: goiFromThisOrder,
                        pricePerCase: pricePerCase
                    });
                }

                if (this.categoryStats.has(category.name)) {
                    const catStats = this.categoryStats.get(category.name);
                    catStats.revenue += revenue;
                    catStats.cases += casesFromRevenue;
                    catStats.totalGoi += goiFromThisOrder;
                } else {
                    this.categoryStats.set(category.name, {
                        name: category.name,
                        icon: category.icon,
                        class: category.class,
                        color: category.color,
                        revenue: revenue,
                        cases: casesFromRevenue,
                        totalGoi: goiFromThisOrder
                    });
                }

                const categoryKVKey = `${category.name}_${kv}`;
                if (this.categoryKVStats.has(categoryKVKey)) {
                    const catStats = this.categoryKVStats.get(categoryKVKey);
                    catStats.revenue += revenue;
                    catStats.cases += casesFromRevenue;
                    catStats.totalGoi += goiFromThisOrder;
                } else {
                    this.categoryKVStats.set(categoryKVKey, {
                        name: category.name,
                        kv: kv,
                        icon: category.icon,
                        class: category.class,
                        color: category.color,
                        revenue: revenue,
                        cases: casesFromRevenue,
                        totalGoi: goiFromThisOrder
                    });
                }

                const categoryNPPKey = `${category.name}_${npp}`;
                if (this.categoryNPPStats.has(categoryNPPKey)) {
                    const catStats = this.categoryNPPStats.get(categoryNPPKey);
                    catStats.revenue += revenue;
                    catStats.cases += casesFromRevenue;
                    catStats.totalGoi += goiFromThisOrder;
                } else {
                    this.categoryNPPStats.set(categoryNPPKey, {
                        name: category.name,
                        npp: npp,
                        icon: category.icon,
                        class: category.class,
                        color: category.color,
                        revenue: revenue,
                        cases: casesFromRevenue,
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
        const categories = ['Bim Quẩy', 'Phụ', 'Chân gà', 'Hàng Ướt'];
        const filteredStats = this.getFilteredCategoryStats();

        categories.forEach(catName => {
            const catStats = filteredStats.get(catName) || { revenue: 0, cases: 0, totalGoi: 0 };
            const orders = this.getOrderCountForCategory(catName);

            const revenueId = this.getRevenueId(catName);
            const quantityId = this.getQuantityId(catName);
            const ordersId = this.getOrdersId(catName);

            if (revenueId) {
                document.getElementById(revenueId).textContent = Utils.formatCurrency(Utils.safeNumber(catStats.revenue));
            }
            if (quantityId) {
                const casesDisplay = Utils.formatNumber(Math.round(catStats.cases));
                const goiDisplay = Utils.formatNumber(Math.round(catStats.totalGoi));
                document.getElementById(quantityId).innerHTML = `${casesDisplay} thùng<br><span style="font-size: 12px; color: #666;">(${goiDisplay} gói)</span>`;
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
            'Phụ': 'phuRevenue',
            'Chân gà': 'chanGaRevenue',
            'Hàng Ướt': 'hangUotRevenue'
        };
        return map[catName];
    },

    getQuantityId(catName) {
        const map = {
            'Bim Quẩy': 'bimQuayQuantity',
            'Phụ': 'phuQuantity',
            'Chân gà': 'chanGaQuantity',
            'Hàng Ướt': 'hangUotQuantity'
        };
        return map[catName];
    },

    getOrdersId(catName) {
        const map = {
            'Bim Quẩy': 'bimQuayOrders',
            'Phụ': 'phuOrders',
            'Chân gà': 'chanGaOrders',
            'Hàng Ướt': 'hangUotOrders'
        };
        return map[catName];
    },

    async fetchAllData() {
        if (!this.isAuthenticated) {
            const authModal = document.getElementById('authModal');
            if (authModal) authModal.classList.add('active');
            Utils.showError('Vui lòng nhập mã truy cập để xem báo cáo');
            return;
        }
        
        if (this.isFetching) return;

        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;

        if (!Utils.validateDates(fromDate, toDate)) return;

        this.isFetching = true;
        const searchBtn = document.getElementById('searchBtn');
        const nppSelect = document.getElementById('nppSelect');

        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lấy dữ liệu...';

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
        
        if (!this.isKVLocked) {
            this.currentKV = 'all';
        }

        const loadedPagesSpan = document.getElementById('loadedPages');
        const totalPagesSpan = document.getElementById('totalPages');
        const pageInfo = document.getElementById('pageInfo');

        if (loadedPagesSpan) loadedPagesSpan.textContent = '0';
        if (totalPagesSpan) totalPagesSpan.textContent = '?';
        if (pageInfo) pageInfo.style.display = 'flex';

        if (nppSelect) {
            nppSelect.innerHTML = '<option value="all">Tất cả NPP</option>';
        }

        document.getElementById('overviewRevenueChartContainer').style.display = 'none';
        document.getElementById('overviewQuantityChartContainer').style.display = 'none';
        document.getElementById('detailRevenueChartContainer').style.display = 'none';
        document.getElementById('detailQuantityChartContainer').style.display = 'none';

        Utils.showLoading();

        try {
            const fromDateStr = Utils.formatDateForAPI(fromDate);
            const toDateStr = Utils.formatDateForAPI(toDate);

            let pageNumber = 1;
            let hasMoreData = true;

            const firstPageData = await API.fetchPage(1, fromDateStr, toDateStr);

            if (firstPageData && firstPageData.status && Array.isArray(firstPageData.data) && firstPageData.data.length > 0) {
                this.processPageData(firstPageData.data);

                if (loadedPagesSpan) loadedPagesSpan.textContent = '1';

                if (firstPageData.data.length === CONFIG.PAGE_SIZE) {
                    pageNumber = 2;

                    while (hasMoreData) {
                        try {
                            console.log(`Đang lấy trang ${pageNumber}...`);
                            await Utils.sleep(CONFIG.PAGE_DELAY);

                            const data = await API.fetchPage(pageNumber, fromDateStr, toDateStr);

                            if (data && data.status && Array.isArray(data.data) && data.data.length > 0) {
                                this.processPageData(data.data);

                                if (loadedPagesSpan) loadedPagesSpan.textContent = pageNumber;

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
                this.updateNPPDropdown(this.currentKV);
                this.updateCategoryCards();
                document.getElementById('categoryCards').style.display = 'grid';
                this.showOverviewChart();

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
        const nppText = this.currentNPP === 'all' ? '' : ` - ${this.currentNPP}`;
        document.getElementById('detailRevenueChartTitle').textContent = `Sản phẩm - ${categoryName} (Doanh thu - ${kvText}${nppText})`;
        document.getElementById('detailQuantityChartTitle').textContent = `Sản phẩm - ${categoryName} (Số lượng - ${kvText}${nppText})`;

        const products = this.getFilteredProductStats(categoryName);
        ChartManager.createDetailCharts(categoryName, products);
    },
};

document.addEventListener('DOMContentLoaded', () => {
    window.app = App;
    App.init();
});
