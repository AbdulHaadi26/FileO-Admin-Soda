import { fileConstants } from '../constants';
const { FClr, FErr, FReq, FSuc, FUpt, GURLSuc, GFSuc, GFISuc, FCountS, CTCountS, ErrReplace, ErrRClr, FDelAtt, FUptAtt, FAddAtt, AddToF, DelToF, ReplaceFileVer } = fileConstants;
const iS = {
    isSuc: false, isErr: false, isL: false,
    isUpt: false, countS: 0, countFS: 0
};

export const FileReducer = (state = iS, action) => {
    let listTemp = state.list;
    let data = state.data;

    switch (action.type) {
        case FUpt: return {
            ...state,
            isErr: false,
            isSuc: false,
            isL: true,
            isUpt: true,
            per: action.payload,
            fileData: action.payloadExtra,
            isM: action.isM
        };
        case FSuc: return { ...state, isErr: false, isSuc: true, isL: false, isUpt: false };
        case FReq: return { ...state, isErr: false, isSuc: false, isL: true, isUpt: false };
        case FErr: return { ...state, isErr: true, isSuc: false, isL: false, isUpt: false };
        case FClr: return { ...state, isErr: false, isSuc: false, isL: false, isUpt: false, isM: false };
        case GFISuc: return { ...state, data: action.payload };
        case GURLSuc: return { ...state, url: action.payload };
        case GFSuc: return { ...state, list: action.payload };
        case FCountS: return { ...state, countS: action.payload };
        case CTCountS: return { ...state, countFS: action.payload };
        case ErrReplace: return { ...state, combinedFile: action.payload, isL: false };
        case ErrRClr: return { ...state, combinedFile: null };

        case AddToF:
            data.isF = true;
            return { ...state, data: data };

        case DelToF:
            data.isF = false;
            return { ...state, data: data };

        case FDelAtt:
            if (listTemp && listTemp.files && listTemp.files.length > 0) {
                if (!action.payload.arr) {
                    listTemp.files = listTemp.files.filter(i => i._id !== action.payload._id);
                } else {
                    listTemp.files = listTemp.files.filter(i => !action.payload.arr.includes(i._id));
                }
            }

            if (listTemp && listTemp.catList && listTemp.catList.length > 0)
                listTemp.catList = listTemp.catList.filter(i => i._id !== action.payload._id);

            if (listTemp && listTemp.cats && listTemp.cats.length > 0)
                listTemp.cats = listTemp.cats.filter(i => i._id !== action.payload._id);
            return {
                ...state, list: listTemp, isL: false
            };

        case FUptAtt:
            if (listTemp && listTemp.files && listTemp.files.length > 0)
                listTemp.files = listTemp.files.map(i => {
                    if (i._id === action.payload._id) i = action.payload;
                    return i;
                });

            if (listTemp && listTemp.catList && listTemp.catList.length > 0)
                listTemp.catList = listTemp.catList.map(i => {
                    if (i._id === action.payload._id) i = action.payload;
                    return i;
                });


            if (listTemp && listTemp.cats && listTemp.cats.length > 0)
                listTemp.cats = listTemp.cats.map(i => {
                    if (i._id === action.payload._id) i = action.payload;
                    return i;
                });
            return {
                ...state, list: listTemp, isL: false
            };

        case ReplaceFileVer:
            if (listTemp && listTemp.files && listTemp.files.length > 0)
                listTemp.files = listTemp.files.map(i => {
                    if (i._id === action.payload.repId) i = action.payload;
                    return i;
                });

            return {
                ...state, list: listTemp, isL: false
            };


        case FAddAtt:
            if (listTemp && listTemp.files && listTemp.files.length > 0 && action.payload.rType === 0)
                listTemp.files = listTemp.files.concat([action.payload]);
            else if (listTemp && action.payload.rType === 0) {
                listTemp.files = [].concat([action.payload]);
            }

            if (listTemp && listTemp.catList && listTemp.catList.length > 0 && action.payload.rType === 1)
                listTemp.catList = listTemp.catList.concat([action.payload]);
            else if (listTemp && action.payload.rType === 1) {
                listTemp.catList = [].concat([action.payload]);
            }

            if (listTemp && listTemp.cats && listTemp.cats.length > 0 && action.payload.rType === 1) {
                listTemp.cats = listTemp.cats.concat([action.payload]);
            } else if (listTemp && action.payload.rType === 1) {
                listTemp.cats = [].concat([action.payload]);
            }

            return {
                ...state, list: listTemp, isL: false, isUpt: false
            };
        default: return state;
    }
}
