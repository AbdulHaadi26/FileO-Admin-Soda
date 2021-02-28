import { notifConstants } from "../constants";
const { CNValue, NErr, GNSuc, NReq, NSuc, NLSuc } = notifConstants;
const iS = { isL: false, isErr: false, isSuc: false };

export const NotifReducer = (state = iS, action) => {
    switch (action.type) {
        case NReq: return { ...state, isL: true, isErr: false, isSuc: false };
        case NErr: return { ...state, isL: false, isErr: true, isSuc: false };
        case NSuc: return {...state, isL: false, isErr: false, isSuc: true};
        case GNSuc: return { ...state, data: action.payload };
        case NLSuc: return { ...state, list: action.payload }
        default: return state;
    }
}

export const countReducer = (state = { count: 0 }, action) => {
    switch (action.type) {
        case CNValue: return { ...state, count: action.payload };
        default: return state;
    }
}