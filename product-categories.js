
const PRODUCT_CATEGORIES = [
    { ma_sp: "HH00055", ten_sp: "Đùi gà rong biển (32gram*120 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00056", ten_sp: "Đùi gà phô mai ngô (32gram*120 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00057", ten_sp: "Đùi gà phô mai (32gram*120 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00058", ten_sp: "Đùi gà bơ sữa (32gram*120 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00059", ten_sp: "Đùi gà tê cay (32gram*120 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00062", ten_sp: "Đùi gà Mix 7 vị (64gram*60 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00063", ten_sp: "Bim bim mái ngói (25gram*120 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00065", ten_sp: "Bim bim mái bờ lô (25gram*120 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00067", ten_sp: "Bim bim mái tôn (25gram*120 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00069", ten_sp: "Bim bim Chịu (25gram*120 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00071", ten_sp: "Bim bim tăm cay (25gram*120 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00072", ten_sp: "Bim bim tăm cay (50gram*60 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00073", ten_sp: "Bim Bim tam thể (50gram*60 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00101", ten_sp: "Bim bim Tăm Cay bà Tuyết vị Tiêu Đen (25gram*120 gói/thùng)", ngành_hàng: "Bim Quẩy" },
    { ma_sp: "HH00019", ten_sp: "Cá cơm tê cay bà Tuyết 18g (18g/gói*200 gói/thùng)", ngành_hàng: "Cá cơm" },
    { ma_sp: "HH00083", ten_sp: "Cá cơm ngon ngọt bà Tuyết 18g (18g/gói *200gói/lốc)", ngành_hàng: "Cá cơm" },
    { ma_sp: "HH00015", ten_sp: "Chân gà tê cay bà Tuyết 40g (40g*120 gói/thùng)", ngành_hàng: "Chân gà" },
    { ma_sp: "HH00029", ten_sp: "Chân gà rút xương bà Tuyết 26g (26g*200 gói/thùng)", ngành_hàng: "Chân gà" },
    { ma_sp: "HH00033", ten_sp: "Chân gà rút xương sả tắc 26g (26g*200 gói/thùng)", ngành_hàng: "Chân gà" },
    { ma_sp: "HH00099", ten_sp: "Chân gà có xương bà Tuyết (40gram*90 gói/thùng) kèm sốt", ngành_hàng: "Chân gà" },
    { ma_sp: "HH00100", ten_sp: "Chân gà rút xương bà Tuyết 26g (26g*120 gói/thùng) kèm sốt", ngành_hàng: "Chân gà" },
    { ma_sp: "HH00105", ten_sp: "Chân gà có xương bà Tuyết X2 60g (60gram*100 gói/thùng)", ngành_hàng: "Chân gà" },
    { ma_sp: "HH00074", ten_sp: "Snack Sashimi (25gram*300 gói/thùng)", ngành_hàng: "Hàng Ướt" },
    { ma_sp: "HH00075", ten_sp: "Snack Gân rồng hấp sả (85gram*60 gói/thùng)", ngành_hàng: "Hàng Ướt" },
    { ma_sp: "HH00077", ten_sp: "Snack Nem nướng phên (25gram*300 gói/thùng)", ngành_hàng: "Hàng Ướt" },
    { ma_sp: "HH00078", ten_sp: "Snack Bìa Catton (25gram*300 gói/thùng)", ngành_hàng: "Hàng Ướt" },
    { ma_sp: "HH00079", ten_sp: "Snack Bò kobe (25gram*300 gói/thùng)", ngành_hàng: "Hàng Ướt" },
    { ma_sp: "HH00080", ten_sp: "Snack Cột Điện (25gram*300 gói/thùng)", ngành_hàng: "Hàng Ướt" }
];

const CATEGORY_MAP = new Map();
PRODUCT_CATEGORIES.forEach(item => {
    CATEGORY_MAP.set(item.ma_sp, item.ngành_hàng);
});

const CATEGORY_STYLES = {
    "Bim Quẩy": { icon: "fa-cookie-bite", class: "bim-quay", color: "#f59e0b" },
    "Cá cơm": { icon: "fa-fish", class: "ca-com", color: "#3b82f6" },
    "Chân gà": { icon: "fa-drumstick-bite", class: "chan-ga", color: "#10b981" },
    "Hàng Ướt": { icon: "fa-droplet", class: "hang-uot", color: "#8b5cf6" }
};

const ALLOWED_CATEGORIES = new Set(["Bim Quẩy", "Cá cơm", "Chân gà", "Hàng Ướt"]);