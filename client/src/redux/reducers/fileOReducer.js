import { navConstants, codeConstants, packageConstants } from '../constants';
const { NavSuc, ISuc, JSuc } = navConstants;
const { PkgList } = packageConstants;
const { CodeSuc } = codeConstants;
const iS = {
    nav: 0,
    i: -1,
    j: -1
};

export const NavReducer = (state = iS, action) => {
    switch (action.type) {
        case NavSuc: return {
            ...state,
            nav: action.payload
        };
        case ISuc: return {
            ...state,
            i: action.payload
        };
        case JSuc: return {
            ...state,
            j: action.payload
        };
        default: return state;
    }
};

export const PackageReducer = (state = { packages: [] }, action) => {
    switch (action.type) {
        case PkgList: return {
            ...state,
            packages: action.payload
        };
        default: return state;
    }
};


export const CodeReducer = (state = {}, action) => {
    switch (action.type) {
        case CodeSuc: return {
            ...state, codes: action.payload
        }
        default: return state;
    }
};

