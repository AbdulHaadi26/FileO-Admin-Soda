import { fileConstants } from '../constants';
const { FClr, FErr, FReq, FSuc, FUpt, GURLSuc, GFSuc, GFISuc, FCountS, CTCountS } = fileConstants;
const iS = { isSuc: false, isErr: false, isL: false, isUpt: false, countS: 0, countFS: 0 };

export const FileReducer = (state = iS, action) => {
    switch (action.type) {
        case FUpt: return { ...state, isErr: false, isSuc: false, isL: true, isUpt: true, per: action.payload, fileData: action.payloadExtra, isM: action.isM }
        case FSuc: return { ...state, isErr: false, isSuc: true, isL: false, isUpt: false }
        case FReq: return { ...state, isErr: false, isSuc: false, isL: true, isUpt: false }
        case FErr: return { ...state, isErr: true, isSuc: false, isL: false, isUpt: false }
        case FClr: return { ...state, isErr: false, isSuc: false, isL: false, isUpt: false, isM: false }
        case GFISuc: return { ...state, data: action.payload }
        case GURLSuc: return { ...state, url: action.payload }
        case GFSuc: return { ...state, list: action.payload };
        case FCountS: return { ...state, countS: action.payload }
        case CTCountS: return { ...state, countFS: action.payload }
        default: return state;
    }
}
