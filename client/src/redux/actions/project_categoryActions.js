import { catConstants, userConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from "./profileActions";
const { CClr, CErr, CReq, CSuc, GCSuc, GCISuc } = catConstants;
const { GPErr } = userConstants;

export const registerCat = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.put("/project_category/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) dispatch(ModalProcess({ title: 'Project Folder', text: 'Project folder details has been added.' }));
        else dispatch(ModalProcess({ title: 'Project Folder', text: 'Project folder with same name already exists.', isErr: true }));
        dispatch(clearCat())
    } catch { dispatch({ type: CErr }); }
}

export const registerCatC = (data) => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        await api.put("/project_category/registerChild", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    } catch { dispatch({ type: CErr }); }
};

export const clearCat = () => async dispatch => dispatch({ type: CClr });

export const fetchCombinedP = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/project_category/fetchCombined`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: GPErr }); }
}

export const fetchCombinedPM = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/project_category/fetchCombinedPM`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: GPErr }); }
}


export const fetchAssignedCatsP = () => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/project_category/fetchAssignedCatsP`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCISuc, payload: res.data.catList });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: GPErr }); }
}

export const getCats = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/project_category/getCats/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: GPErr }); }
}

export const getCat = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/project_category/getCat/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch({ type: GCISuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateCat = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.post(`/project_category/updateCat`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch({ type: GCISuc, payload: res.data });
            dispatch({ type: CSuc });
            dispatch(ModalProcess({ title: 'Project Folder', text: 'Project folder details has been updated.' }));
        } else dispatch(ModalProcess({ title: 'Project Folder', text: 'Project folder details could not be updated.', isErr: true }));
        dispatch(clearCat())
    } catch { dispatch({ type: CErr }); }
}

export const deleteCat = (_id, id, pId) => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        let res = await api.post(`/project_category/deleteCat/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) dispatch(ModalProcess({ title: 'Project Folder', text: 'Project folder has been deleted.' }));
        else dispatch(ModalProcess({ title: 'Project Folder', text: 'Project folder could not be deleted.', isErr: true }));
        dispatch(clearCat());
        id && pId && history.push(`/organization/${id}/projects/${pId}/category/list`);
    } catch { dispatch({ type: GPErr }); }
}