
const NPP_KV_MAP = new Map([
    
    ['NPP Bảo Lâm', 'KV1'],
    ['NPP Công Giang', 'KV1'],
    ['NPP Cường Thịnh', 'KV1'],
    ['NPP Đức Nam Tiến', 'KV1'],
    ['NPP Dũng Cúc', 'KV1'],
    ['NPP Lâm Hạ', 'KV1'],
    ['NPP Long Liên', 'KV1'],
    ['NPP Nguyên Vũ', 'KV1'],
    ['NPP Thảo Nam', 'KV1'],
    ['NPP Tuấn Huê', 'KV1'],
    ['NPP Tuấn Yến', 'KV1'],
    ['NPP Vũ Tấm', 'KV1'],
    
    ['NPP Duy Anh', 'KV2'],
    ['NPP Hoa Việt', 'KV2'],
    ['NPP Hùng Huệ', 'KV2'],
    ['NPP Long Châm', 'KV2'],
    ['NPP Ngọc Kiên', 'KV2'],
    ['NPP Ngọc Thêu', 'KV2'],
    ['NPP Phong Hiền', 'KV2'],
    ['NPP Phúc Thịnh', 'KV2'],
    ['NPP Phương Đông', 'KV2'],
    ['NPP Thành Lụa', 'KV2'],
    ['NPP Tuấn Huyền', 'KV2'],
    
    ['NPP Bảo Cường', 'KV3'],
    ['NPP Hikoji', 'KV3'],
    ['NPP Long Hải', 'KV3'],
    ['NPP Tân Hoa', 'KV3'],
    ['NPP Tây Đô', 'KV3'],
    ['NPP Thắng Lợi', 'KV3'],
    ['NPP Thành Hân', 'KV3'],
    ['NPP Tiến Thịnh', 'KV3'],
    
    ['NPP Ánh Thu', 'KV4'],
    ['NPP Đức Oanh', 'KV4'],
    ['NPP Dương Minh', 'KV4'],
    ['NPP Dũng Béo', 'KV4'],
    ['NPP Hưng Thịnh', 'KV4'],
    ['NPP Ngọc Phúc', 'KV4'],
    ['NPP Nguyễn Đình Hân', 'KV4'],
    ['NPP Tân Thuý', 'KV4'],
    ['NPP Thăng Hương', 'KV4'],
    ['NPP Thảo Thắng', 'KV4'],
    ['NPP Tùng Phương', 'KV4'],
    
    ['NPP Đồng Lợi', 'KV5'],
    ['NPP Anh Đức', 'KV5'],
    ['NPP Hải Hằng', 'KV5'],
    ['NPP Hiền Cường', 'KV5'],
    ['NPP Hoàng Minh', 'KV5'],
    ['NPP Oanh Định', 'KV5'],
    ['NPP Sơn Lâm', 'KV5'],
    ['NPP Thái Hoà', 'KV5'],
    ['NPP Thảo Xuân', 'KV5'],
    ['NPP Tiên Lan', 'KV5'],
    ['NPP Tuấn Vân', 'KV5'],
    ['NPP Vũ Đức Nam', 'KV5'],
    
    ['NPP Anh Minh HT', 'KV6'],
    ['NPP Hà Thanh', 'KV6'],
    ['NPP Hồng Đức', 'KV6'],
    ['NPP Linh Trang', 'KV6'],
    ['NPP Mạnh Hà 1', 'KV6'],
    ['NPP Mạnh Hà 2', 'KV6'],
    ['NPP Minh Châu', 'KV6'],
    ['NPP Minh Lộc', 'KV6'],
    ['NPP Nhung Tùng', 'KV6'],
    ['NPP Phương Hà', 'KV6'],
    ['NPP Tân Bích An', 'KV6'],
    ['NPP Thanh Bình', 'KV6'],
    ['NPP Thành Thanh', 'KV6'],
    ['NPP Thông Thơm', 'KV6'],
    ['NPP Trường Hằng', 'KV6']
]);

function getKVFromNPP(tenNPP) {
    if (!tenNPP) return 'Không xác định';
    return NPP_KV_MAP.get(tenNPP) || 'Không xác định';
}

function getNPPByKV(kv) {
    const result = [];
    NPP_KV_MAP.forEach((value, key) => {
        if (value === kv) {
            result.push(key);
        }
    });
    return result;
}