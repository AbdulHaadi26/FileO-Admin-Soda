import { taskConstants } from '../constants';
const { NTErr, NTSuc, NTClr, NTReq, NTLSuc, GNTSuc, NTCount, NTCountS } = taskConstants;
const iS = { isSuc: false, isErr: false, isL: false, count: 0, countS: 0 };

export const TaskReducer = (state = iS, action) => {
    switch (action.type) {
        case NTSuc: return { ...state, isErr: false, isSuc: true, isL: false }
        case NTReq: return { ...state, isErr: false, isSuc: false, isL: true }
        case NTErr: return { ...state, isErr: true, isSuc: false, isL: false }
        case NTClr: return { ...state, isErr: false, isSuc: false, isL: false }
        case NTLSuc: return { ...state, isL: false, isErr: false, isSuc: true, list: action.payload }
        case GNTSuc: return { ...state, isL: false, isErr: false, isSuc: true, data: action.payload, rec: action.payloadExtra, count: action.count ? action.count : 0 }
        case NTCount: return { ...state, count: action.payload }
        case NTCountS: return { ...state, countS: action.payload }
        default: return state;
    }
};
