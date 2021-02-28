import { catConstants, fileConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import { ModalProcess } from "./profileActions";
import { updateCatCount } from "./sharedCatActions";
const { FErr, FReq, GFSuc, FSuc } = fileConstants;
const { CClr, CErr, CReq, CSuc, GCSuc, GCISuc, CClrList, CBread, CCountM } = catConstants;

export const registerCat = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        let res = await api.put("/user_category/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch(ModalProcess({ title: 'User Folder', text: 'User folder has been added.' }));
        } else dispatch(ModalProcess({ title: 'User Folder', text: 'User folder with this name already exists.', isErr: true }));
        dispatch(clearCat());
    } catch { dispatch({ type: CErr }); }
};

export const registerCatC = (data) => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        let res = await api.put("/user_category/registerChild", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch(ModalProcess({ title: 'User Folder', text: 'User folder has been added.' }));
        } else dispatch(ModalProcess({ title: 'User Folder', text: 'User folder with this name already exists.', isErr: true }));
        dispatch(clearCat());
    } catch { dispatch({ type: CErr }); }
};

export const clearCat = () => async dispatch => dispatch({ type: CClr });

export const fetchCatsC = data => async dispatch => {
    try {
        dispatch({ type: CClrList });
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/user_category/fetchCatsC`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: CErr }); }
};

export const updateCatCountM = () => async dispatch => {
    try {
        var res = await api.get(`/user_category/updateCatCount`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catCount !== null && !res.data.error) dispatch({ type: CCountM, payload: res.data.catCount });
    } catch { dispatch({ type: CErr }); }
}

export const fetchCatsSearchC = data => async dispatch => {
    try {
        dispatch({ type: CClrList });
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/user_category/fetchCatsSearchC`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: CErr }); }
};

export const fetchCombined = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.get("/user_category/fetchCatsCombined", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: GFSuc, payload: res.data });
            dispatch({ type: FSuc });
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: CErr }); }
};

export const getCats = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/user_category/getCats/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: CErr }); }
}

export const updateCatShared = _id => async dispatch => {
    try {
        Token();
        await api.post(`/user_category/getCatShare/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(updateCatCount())
    } catch { dispatch({ type: CErr }); }
}

export const getCat = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/user_category/getCat/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch({ type: GCISuc, payload: res.data });
            dispatch({ type: CSuc });
            dispatch(updateCatCountM());
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: CErr }); }
}

export const getCatC = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/user_category/getCatC/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch({ type: CBread, payload: res.data.cat });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: CErr }); }
}

export const updateCatName = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.post(`/user_category/updateCatName`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch(ModalProcess({ title: 'User Folder', text: 'User folder details has been updated.' }));
        } else dispatch(ModalProcess({ title: 'User Folder', text: 'User folder with this name already exists.', isErr: true }));
        dispatch(clearCat());
    } catch { dispatch({ type: CErr }); }
}

export const deleteCat = (_id) => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        let res = await api.delete(`/user_category/deleteCat/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) dispatch(ModalProcess({ title: 'User Folder', text: 'User folder has been deleted' }));
        else dispatch(ModalProcess({ title: 'User Folder', text: 'User folder could not be deleted', isErr: true }));
        dispatch(clearCat());
    } catch { dispatch({ type: CErr }); }
};