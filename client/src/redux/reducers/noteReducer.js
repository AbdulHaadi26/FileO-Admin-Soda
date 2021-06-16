import { noteConstants } from '../constants';
const {
    NTErr, NTSuc, NTClr,
    NTReq, NTLSuc, GNTSuc,
    NTCount, NTCountS, NTMdl,
    NTLDel
} = noteConstants;

export const NoteReducer = (state = { isSuc: false, isErr: false, isL: false, count: 0, countS: 0 }, action) => {
    switch (action.type) {
        case NTSuc: return { ...state, isErr: false, isSuc: true, isL: false }
        case NTReq: return { ...state, isErr: false, isSuc: false, isL: true }
        case NTErr: return { ...state, isErr: true, isSuc: false, isL: false }
        case NTClr: return { ...state, isErr: false, isSuc: false, isL: false, noteS: '' }
        case NTLSuc: return { ...state, isL: false, isErr: false, isSuc: true, list: action.payload }
        case GNTSuc: return { ...state, isL: false, isErr: false, isSuc: true, data: action.payload, rec: action.payloadExtra, count: action.count ? action.count : 0 }
        case NTCount: return { ...state, count: action.payload }
        case NTCountS: return { ...state, countS: action.payload }
        case NTMdl: return { ...state, noteS: action.payload, isL: false };
        case NTLDel:
            let listTemp = state.list;
            if (listTemp && listTemp.noteList && listTemp.count > 0) {
                if (listTemp.noteList.length > 0) {
                    listTemp.noteList = listTemp.noteList.filter(i => i._id !== action.payload._id);
                    listTemp.count = listTemp.noteList.length;
                }
            } 
            return {
                ...state, list: listTemp, isL: false
            };
        default: return state;
    }
};
