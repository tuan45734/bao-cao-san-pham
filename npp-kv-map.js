
let NPP_KV_MAP = null;

async function initNPPKvMap() {
    try {
        const response = await fetch('https://openapi.mobiwork.vn/OpenAPI/V1/SaleGroup', {
            headers: {
                'accept': 'application/json',
                'Authorization': 'Basic NjlhZTZlNmM4YTY0NjVmNDFlNTNhZmI0OjFuYzFnc3J1N2p2Ym10eTdncGV5NWk='
            }
        });
        const result = await response.json();
        if (!result.status || !result.data) {
            throw new Error('Invalid API response');
        }

        const provinceToKv = {};
        const nppToProvince = {};

        for (const item of result.data) {
            if (item.loai_nhom === 'sale') {
                nppToProvince[item.ma_nhom] = item.ma_nhom_cha;
            } else if (item.ma_nhom_cha && /^KV\d+$/.test(item.ma_nhom_cha)) {
                provinceToKv[item.ma_nhom] = item.ma_nhom_cha;
            }
        }

        const entries = [];
        for (const [npp, province] of Object.entries(nppToProvince)) {
            if (provinceToKv[province]) {
                entries.push([npp, provinceToKv[province]]);
            }
        }

        NPP_KV_MAP = new Map(entries);
    } catch (error) {
        console.error('Lỗi tải danh sách NPP:', error);
        NPP_KV_MAP = new Map();
    }
}

function getKVFromNPP(tenNPP) {
    if (!tenNPP) return 'Không xác định';
    if (!NPP_KV_MAP) return 'Không xác định';
    return NPP_KV_MAP.get(tenNPP) || 'Không xác định';
}

function getNPPByKV(kv) {
    if (!NPP_KV_MAP) return [];
    const result = [];
    NPP_KV_MAP.forEach((value, key) => {
        if (value === kv) {
            result.push(key);
        }
    });
    return result;
}
