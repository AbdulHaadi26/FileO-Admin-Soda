import { catConstants } from '../constants';
const { CErr, CClr, CReq, CSuc, GCSuc, GCISuc, CCountS, CClrList, CBread, CCountM, CAddAtt, CDelAtt, CUptAtt } = catConstants;
const iS = { isSuc: false, isErr: false, isL: false, list: [], data: [], countS: 0, countM: 0 };

export const CatReducer = (state = iS, action) => {
    let listTemp = state.list;
    switch (action.type) {
        case CSuc: return { ...state, isSuc: true, isL: false, isErr: false };
        case CReq: return { ...state, isL: true, isSuc: false, isErr: false };
        case CErr: return { ...state, isErr: true, isSuc: false, isL: false };
        case GCSuc: return { ...state, list: action.payload };
        case GCISuc: return { ...state, data: action.payload }
        case CClr: return { ...state, isSuc: false, isL: false, isErr: false };
        case CCountS: return { ...state, countS: action.payload };
        case CCountM: return { ...state, countM: action.payload };
        case CClrList: return { ...state, list: [] };
        case CBread: return { ...state, dataList: action.payload };
        case CDelAtt:

            if (listTemp && listTemp.catList && listTemp.catList.length > 0)
                listTemp.catList = listTemp.catList.filter(i => i._id !== action.payload._id);
            return {
                ...state, list: listTemp, isL: false
            };

        case CUptAtt:

            if (listTemp && listTemp.catList && listTemp.catList.length > 0)
                listTemp.catList = listTemp.catList.map(i => {
                    if (i._id === action.payload._id) i = action.payload;
                    return i;
                });

            return {
                ...state, list: listTemp, isL: false
            };

        case CAddAtt:

            if (listTemp && listTemp.catList && listTemp.catList.length > 0) {
                listTemp.catList = listTemp.catList.concat([action.payload]);
            } else if (listTemp) {
                listTemp.catList = [].concat([action.payload]);
            }

            return {
                ...state, list: listTemp, isL: false, isUpt: false
            };
        default: return state;
    }
}

