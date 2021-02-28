import { catConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from './profileActions';
const { CClr, CErr, CReq, GCSuc, GCISuc, CSuc } = catConstants;

export const registerCat = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.put("/category/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch(ModalProcess({ title: 'Folder', text: 'Folder has been added.' }));
        }
        else dispatch(ModalProcess({ title: 'Folder', text: 'Folder with same name already exists.', isErr: true }));
    } catch { dispatch({ type: CErr }); }
}

export const registerCatC = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.put("/category/registerChild", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch(ModalProcess({ title: 'Folder', text: 'Folder has been added.' }));
        }
        else dispatch(ModalProcess({ title: 'Folder', text: 'Folder with same name already exists.', isErr: true }));
    } catch { dispatch({ type: CErr }); }
}

export const clearCat = () => async dispatch => dispatch({ type: CClr });

export const fetchCombinedCP = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        let res = await api.get(`/category/fetchCombined`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: GCSuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: CErr }); }
}

export const getCats = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/category/getCats/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: CErr }); }
}

export const getCat = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/category/getCat/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch({ type: GCISuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: CErr }); }
}

export const updateCat = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.post(`/category/updateCat`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        console.log(res.data)
        if (res.data.cat && !res.data.error) {
            dispatch({ type: GCISuc, payload: res.data });
            dispatch({ type: CSuc });
            dispatch(ModalProcess({ title: 'Folder', text: 'Folder details has been updated.' }));
        } else dispatch(ModalProcess({ title: 'Folder', text: 'Folder details could not be updated.', isErr: true }));
        dispatch(clearCat());
    } catch { dispatch({ type: CErr }); }
}

export const deleteCat = (_id, id) => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        let res = await api.delete(`/category/deleteCat/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) dispatch(ModalProcess({ title: 'Folder', text: 'Folder has been deleted.' }));
        else dispatch(ModalProcess({ title: 'Folder', text: 'Folder could not be deleted.', isErr: true }));
        dispatch(clearCat());
        id && history.push(`/organization/${id}/category/list`);
    } catch { dispatch({ type: CErr }); }
}