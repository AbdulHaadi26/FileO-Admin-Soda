import { ticketConstants } from '../constants';
const { TClr, TErr, TReq, TSuc, TLSuc, TGSuc } = ticketConstants;
const iS = { isSuc: false, isErr: false, isL: false };

export const TicketReducer = (state = iS, action) => {
    switch (action.type) {
        case TSuc: return { ...state, isErr: false, isSuc: true, isL: false }
        case TReq: return { ...state, isErr: false, isSuc: false, isL: true }
        case TErr: return { ...state, isErr: true, isSuc: false, isL: false }
        case TClr: return { ...state, isErr: false, isSuc: false, isL: false };
        case TLSuc: return { ...state, isL: false, isErr: false, isSuc: true, list: action.payload }
        case TGSuc: return { ...state, isL: false, isErr: false, isSuc: true, data: action.payload }
        default: return state;
    }
}

