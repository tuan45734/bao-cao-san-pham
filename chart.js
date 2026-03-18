
Chart.register(ChartDataLabels);

const ChartManager = {
    overviewRevenueChart: null,
    overviewQuantityChart: null,
    detailRevenueChart: null,
    detailQuantityChart: null,

    createOverviewCharts(categoryStats) {
        this.createOverviewRevenueChart(categoryStats);
        this.createOverviewQuantityChart(categoryStats);
    },

    createOverviewRevenueChart(categoryStats) {
        const canvas = document.getElementById('overviewRevenueChart');

        if (this.overviewRevenueChart) {
            this.overviewRevenueChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        
        const categories = Array.from(categoryStats.values());
        
        if (categories.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.fillText('Không có dữ liệu ngành hàng', canvas.width/2, canvas.height/2);
            return;
        }

        const sortedCategories = categories.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
        
        const labels = sortedCategories.map(c => c.name);
        const revenues = sortedCategories.map(c => Utils.safeNumber(c.revenue));
        const colors = sortedCategories.map(c => c.color || '#667eea');

        const chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Doanh thu (VNĐ)',
                        data: revenues,
                        backgroundColor: colors,
                        borderColor: colors.map(c => c),
                        borderWidth: 1,
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        right: 150
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Doanh thu theo ngành hàng`,
                        font: { size: 18, weight: 'bold' },
                        color: '#000',
                        padding: { top: 10, bottom: 20 }
                    },
                    tooltip: {
                        enabled: true,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13, weight: 'bold' },
                        callbacks: {
                            label: (context) => {
                                return `Doanh thu: ${Utils.formatCurrency(context.raw)}`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    },
        datalabels: {
    display: true,
    anchor: 'end',
    align: 'right',
    offset: 5,
    formatter: (value, context) => {
        // Tính tổng doanh thu
        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        return `${Utils.formatCurrency(value)} (${percentage}%)`;
    },
    font: {
        weight: 'bold',
        size: 12
    },
    color: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: {
        left: 6,
        right: 6,
        top: 3,
        bottom: 3
    },
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd'
},
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Doanh thu',
                            font: { size: 14, weight: 'bold' },
                            color: '#000'
                        },
                        ticks: {
                            font: { size: 12, weight: 'bold' },
                            color: '#000',
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'tr';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'k';
                                }
                                return value;
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Ngành hàng',
                            font: { size: 14, weight: 'bold' },
                            color: '#000'
                        },
                        ticks: {
                            font: { size: 13, weight: 'bold' },
                            color: '#000'
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const categoryName = labels[index];
                        window.app.showCategoryDetail(categoryName);
                    }
                }
            }
        };

        try {
            this.overviewRevenueChart = new Chart(ctx, chartConfig);
            console.log('Overview revenue chart created');
        } catch (error) {
            console.error('Lỗi tạo overview revenue chart:', error);
        }
    },

    createOverviewQuantityChart(categoryStats) {
        const canvas = document.getElementById('overviewQuantityChart');

        if (this.overviewQuantityChart) {
            this.overviewQuantityChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        
        const categories = Array.from(categoryStats.values());
        
        if (categories.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.fillText('Không có dữ liệu ngành hàng', canvas.width/2, canvas.height/2);
            return;
        }

        const sortedCategories = categories.sort((a, b) => (b.totalGoi || 0) - (a.totalGoi || 0));
        
        const labels = sortedCategories.map(c => c.name);
        const quantities = sortedCategories.map(c => Utils.safeNumber(c.totalGoi));
        const colors = sortedCategories.map(c => c.color || '#667eea');

        const chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Số lượng (gói)',
                        data: quantities,
                        backgroundColor: colors,
                        borderColor: colors.map(c => c),
                        borderWidth: 1,
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        right: 150
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Số lượng theo ngành hàng`,
                        font: { size: 18, weight: 'bold' },
                        color: '#000',
                        padding: { top: 10, bottom: 20 }
                    },
                    tooltip: {
                        enabled: true,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13, weight: 'bold' },
                        callbacks: {
                            label: (context) => {
                                return `Số lượng: ${Utils.formatNumber(context.raw)} gói`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    },
                datalabels: {
    display: true,
    anchor: 'end',
    align: 'right',
    offset: 5,
    formatter: (value, context) => {
        // Tính tổng số lượng
        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        return `${Utils.formatNumber(value)} gói (${percentage}%)`;
    },
    font: {
        weight: 'bold',
        size: 12
    },
    color: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: {
        left: 6,
        right: 6,
        top: 3,
        bottom: 3
    },
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd'
},
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng (gói)',
                            font: { size: 14, weight: 'bold' },
                            color: '#000'
                        },
                        ticks: {
                            font: { size: 12, weight: 'bold' },
                            color: '#000',
                            callback: function(value) {
                                if (value >= 1000) {
                                    return (value / 1000).toFixed(1) + 'k';
                                }
                                return value;
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Ngành hàng',
                            font: { size: 14, weight: 'bold' },
                            color: '#000'
                        },
                        ticks: {
                            font: { size: 13, weight: 'bold' },
                            color: '#000'
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const categoryName = labels[index];
                        window.app.showCategoryDetail(categoryName);
                    }
                }
            }
        };

        try {
            this.overviewQuantityChart = new Chart(ctx, chartConfig);
            console.log('Overview quantity chart created');
        } catch (error) {
            console.error('Lỗi tạo overview quantity chart:', error);
        }
    },

    createDetailCharts(categoryName, products) {
        this.createDetailRevenueChart(categoryName, products);
        this.createDetailQuantityChart(categoryName, products);
    },

    createDetailRevenueChart(categoryName, products) {
        const canvas = document.getElementById('detailRevenueChart');

        if (this.detailRevenueChart) {
            this.detailRevenueChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        
        if (products.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.fillText(`Không có dữ liệu sản phẩm trong ngành ${categoryName}`, canvas.width/2, canvas.height/2);
            return;
        }

        const sortedProducts = products
            .sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
        
        const labels = sortedProducts.map(p => {
            const name = p.ten_sp || 'Không tên';
            return name.length > 40 ? name.substring(0, 40) + '...' : name;
        });
        
        const revenues = sortedProducts.map(p => Utils.safeNumber(p.revenue));
        
        const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(52, 211, 153, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(167, 139, 250, 0.8)',
            'rgba(248, 113, 113, 0.8)',
            'rgba(45, 212, 191, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(232, 121, 249, 0.8)',
            'rgba(96, 165, 250, 0.8)',
            'rgba(74, 222, 128, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(192, 132, 252, 0.8)',
            'rgba(248, 113, 113, 0.8)',
            'rgba(56, 189, 248, 0.8)',
            'rgba(250, 204, 21, 0.8)'
        ];

        const chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Doanh thu (VNĐ)',
                        data: revenues,
                        backgroundColor: colors.slice(0, sortedProducts.length),
                        borderColor: '#ffffff',
                        borderWidth: 1,
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        right: 200
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Chi tiết sản phẩm - ${categoryName} (Doanh thu)`,
                        font: { size: 18, weight: 'bold' },
                        color: '#000',
                        padding: { top: 10, bottom: 20 }
                    },
                    tooltip: {
                        enabled: true,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13, weight: 'bold' },
                        callbacks: {
                            label: (context) => {
                                const product = sortedProducts[context.dataIndex];
                                if (product.kv) {
                                    return [
                                        `Doanh thu: ${Utils.formatCurrency(context.raw)}`,
                                        `Mã SP: ${product.ma_sp}`,
                                        `Số lượng: ${Utils.formatNumber(product.totalGoi)} gói`,
                                        `KV: ${product.kv}`
                                    ];
                                } else {
                                    return [
                                        `Doanh thu: ${Utils.formatCurrency(context.raw)}`,
                                        `Mã SP: ${product.ma_sp}`,
                                        `Số lượng: ${Utils.formatNumber(product.totalGoi)} gói`
                                    ];
                                }
                            }
                        }
                    },
                    legend: {
                        display: false
                    },
                   datalabels: {
    display: true,
    anchor: 'end',
    align: 'right',
    offset: 5,
    formatter: (value, context) => {
        // Tính tổng doanh thu của category
        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        return `${Utils.formatCurrency(value)} (${percentage}%)`;
    },
    font: {
        weight: 'bold',
        size: 11
    },
    color: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: {
        left: 6,
        right: 6,
        top: 3,
        bottom: 3
    },
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd'
},
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Doanh thu',
                            font: { size: 14, weight: 'bold' },
                            color: '#000'
                        },
                        ticks: {
                            font: { size: 12, weight: 'bold' },
                            color: '#000',
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'tr';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'k';
                                }
                                return value;
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Sản phẩm',
                            font: { size: 14, weight: 'bold' },
                            color: '#000'
                        },
                        ticks: {
                            font: { size: 13, weight: 'bold' },
                            color: '#000'
                        }
                    }
                }
            }
        };

        try {
            this.detailRevenueChart = new Chart(ctx, chartConfig);
            console.log('Detail revenue chart created for', categoryName);
        } catch (error) {
            console.error('Lỗi tạo detail revenue chart:', error);
        }
    },

    createDetailQuantityChart(categoryName, products) {
        const canvas = document.getElementById('detailQuantityChart');

        if (this.detailQuantityChart) {
            this.detailQuantityChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        
        if (products.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.fillText(`Không có dữ liệu sản phẩm trong ngành ${categoryName}`, canvas.width/2, canvas.height/2);
            return;
        }

        const sortedProducts = products
            .sort((a, b) => (b.totalGoi || 0) - (a.totalGoi || 0));
        
        const labels = sortedProducts.map(p => {
            const name = p.ten_sp || 'Không tên';
            return name.length > 40 ? name.substring(0, 40) + '...' : name;
        });
        
        const quantities = sortedProducts.map(p => Utils.safeNumber(p.totalGoi));
        
        const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(52, 211, 153, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(167, 139, 250, 0.8)',
            'rgba(248, 113, 113, 0.8)',
            'rgba(45, 212, 191, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(232, 121, 249, 0.8)',
            'rgba(96, 165, 250, 0.8)',
            'rgba(74, 222, 128, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(192, 132, 252, 0.8)',
            'rgba(248, 113, 113, 0.8)',
            'rgba(56, 189, 248, 0.8)',
            'rgba(250, 204, 21, 0.8)'
        ];

        const chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Số lượng (gói)',
                        data: quantities,
                        backgroundColor: colors.slice(0, sortedProducts.length),
                        borderColor: '#ffffff',
                        borderWidth: 1,
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        right: 150
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Chi tiết sản phẩm - ${categoryName} (Số lượng)`,
                        font: { size: 18, weight: 'bold' },
                        color: '#000',
                        padding: { top: 10, bottom: 20 }
                    },
                    tooltip: {
                        enabled: true,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13, weight: 'bold' },
                        callbacks: {
                            label: (context) => {
                                const product = sortedProducts[context.dataIndex];
                                if (product.kv) {
                                    return [
                                        `Số lượng: ${Utils.formatNumber(context.raw)} gói`,
                                        `Mã SP: ${product.ma_sp}`,
                                        `Doanh thu: ${Utils.formatCurrency(product.revenue)}`,
                                        `KV: ${product.kv}`
                                    ];
                                } else {
                                    return [
                                        `Số lượng: ${Utils.formatNumber(context.raw)} gói`,
                                        `Mã SP: ${product.ma_sp}`,
                                        `Doanh thu: ${Utils.formatCurrency(product.revenue)}`
                                    ];
                                }
                            }
                        }
                    },
                    legend: {
                        display: false
                    },
     datalabels: {
    display: true,
    anchor: 'end',
    align: 'right',
    offset: 5,
    formatter: (value, context) => {
        // Tính tổng số lượng của category
        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        return `${Utils.formatNumber(value)} gói (${percentage}%)`;
    },
    font: {
        weight: 'bold',
        size: 11
    },
    color: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: {
        left: 6,
        right: 6,
        top: 3,
        bottom: 3
    },
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd'
},
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng (gói)',
                            font: { size: 14, weight: 'bold' },
                            color: '#000'
                        },
                        ticks: {
                            font: { size: 12, weight: 'bold' },
                            color: '#000',
                            callback: function(value) {
                                if (value >= 1000) {
                                    return (value / 1000).toFixed(1) + 'k';
                                }
                                return value;
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Sản phẩm',
                            font: { size: 14, weight: 'bold' },
                            color: '#000'
                        },
                        ticks: {
                            font: { size: 13, weight: 'bold' },
                            color: '#000'
                        }
                    }
                }
            }
        };

        try {
            this.detailQuantityChart = new Chart(ctx, chartConfig);
            console.log('Detail quantity chart created for', categoryName);
        } catch (error) {
            console.error('Lỗi tạo detail quantity chart:', error);
        }
    },

    destroy() {
        if (this.overviewRevenueChart) {
            this.overviewRevenueChart.destroy();
            this.overviewRevenueChart = null;
        }
        if (this.overviewQuantityChart) {
            this.overviewQuantityChart.destroy();
            this.overviewQuantityChart = null;
        }
        if (this.detailRevenueChart) {
            this.detailRevenueChart.destroy();
            this.detailRevenueChart = null;
        }
        if (this.detailQuantityChart) {
            this.detailQuantityChart.destroy();
            this.detailQuantityChart = null;
        }
    }
};