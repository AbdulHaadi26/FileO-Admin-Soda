import { settingsConstants } from '../constants';
const { SSuc,SReq,SErr } = settingsConstants;
const iS = { isL: false, isErr: false, isSuc: false };

export const setReducer = (state = iS, action) => {
    switch (action.type) {
        case SReq: return { ...state, isL: true, isErr: false, isSuc: false };
        case SSuc: return { ...state, isL: false, isErr: false, isSuc: true, data: action.payload };
        case SErr: return { ...state, isL: false, isErr: true, isSuc: false };
        default: return state;
    }
}