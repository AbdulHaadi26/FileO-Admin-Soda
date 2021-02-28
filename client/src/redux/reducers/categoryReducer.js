import { catConstants } from '../constants';
const { CErr, CClr, CReq, CSuc, GCSuc, GCISuc, CCountS, CClrList, CBread, CCountM } = catConstants;
const iS = { isSuc: false, isErr: false, isL: false, list: [], data: [], countS: 0, countM: 0 };

export const CatReducer = (state = iS, action) => {
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
        case CBread: return { ...state, crumb: action.payload };
        default: return state;
    }
}

