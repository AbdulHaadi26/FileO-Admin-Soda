import { userConstants, modalConstants, billConstants } from "../constants";
const { GPErr, GPReq, GPSuc, GDErr, GDReq, GDSuc, SideNav, CUErr, CUSuc, GPReqS } = userConstants;
const { MShow, MHide, NTMHide, NTMShow } = modalConstants;
const { BErr, BReq, BSuc } = billConstants;
const iS = { isL: false, isErr: false, isAuth: false, isLS: false };
const iSD = { isSuc: false, isErr: false, isL: false };

export const profileReducer = (state = iS, action) => {
    switch (action.type) {
        case CUErr: return { ...state, isAuth: false };
        case CUSuc: return { ...state, isAuth: true };
        case GPReq: return { ...state, isL: true, isErr: false, isLS: false }
        case GPReqS: return { ...state, isLS: true };
        case GPErr: return { ...state, isL: false, isErr: true, isLS: false }
        case GPSuc: return { ...state, isL: false, isErr: false, isLS: false, data: action.payload }
        default: return state;
    }
};

export const billReducer = (state = iSD, action) => {
    switch (action.type) {
        case BReq: return { ...state, isL: true, isErr: false, isSuc: false }
        case BErr: return { ...state, isL: false, isErr: true, isSuc: false }
        case BSuc: return { ...state, isL: false, isErr: false, isSuc: true, list: action.payload }
        default: return state;
    }
};

export const dashboardReducer = (state = iSD, action) => {
    switch (action.type) {
        case GDReq: return { ...state, isL: true, isErr: false, isSuc: false }
        case GDErr: return { ...state, isL: false, isErr: true, isSuc: false }
        case GDSuc: return { ...state, isL: false, isErr: false, isSuc: true, data: action.payload }
        default: return state;
    }
};

export const sidenavReducer = (state = { count: 0 }, action) => {
    switch (action.type) {
        case SideNav: return { ...state, count: action.payload };
        default: return state;
    }
};

export const modalReducer = (state = { isSH: false, isNSH: true }, action) => {
    switch (action.type) {
        case MShow: return { ...state, isSH: true, data: action.payload };
        case MHide: return { ...state, isSH: false };
        case NTMShow: return { ...state, isNSH: true, ndata: action.payload };
        case NTMHide: return { ...state, isNSH: false };
        default: return state;
    }
};