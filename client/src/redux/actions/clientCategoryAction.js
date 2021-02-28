import { catConstants, fileConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from "./profileActions";
const { FReq, FSuc, FErr, GFSuc, CTCountS } = fileConstants;
const { CClr, CErr, CSuc, CReq, GCSuc, GCISuc } = catConstants;

export const registerCat = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.post("/client_category/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch(ModalProcess({ title: 'Client Folder', text: 'Client folder has been added.' }));
            history.push(`/organization/${data._id}/user/${data.uId}/clients/category/list`);
        } else  dispatch(ModalProcess({ title: 'Client Folder', text: 'Client folder with same name already exists.', isErr: true }));
        dispatch(clearCat());
    } catch { dispatch({ type: CErr }); }
}

export const clearCat = () => async dispatch => dispatch({ type: CClr });

export const updateClientCount = () => async dispatch => {
    try {
        try {
            var res = await api.get(`/client_file/updated/count`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
            if (res.data.count !== null && !res.data.error) dispatch({ type: CTCountS, payload: res.data.count });
        } catch { dispatch({ type: CErr }); }
    } catch { dispatch({ type: CErr }); }
};

export const fetchCombined = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.get(`/client_category/fetchCombined`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: GFSuc, payload: res.data });
            dispatch({ type: FSuc })
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: FErr }); }
}

export const fetchCombinedC = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.get(`/client_category/fetchCombined`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: GFSuc, payload: res.data });
            dispatch({ type: FSuc })
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: FErr }); }
}


export const getCats = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/client_category/getCats/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data });
            dispatch({ type: CSuc })
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: CErr }); }
}

export const getCat = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/client_category/getCat/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch({ type: GCISuc, payload: res.data });
            dispatch(updateClientCount());
            dispatch({ type: CSuc })
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: CErr }); }
}

export const updateCatC = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.post(`/client_category/updateCat`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch({ type: GCISuc, payload: res.data });
            dispatch({ type: CSuc });
            dispatch(ModalProcess({ title: 'Client Folder', text: 'Client folder details has been updated.' }));
        } else dispatch(ModalProcess({ title: 'Client Folder', text: 'Client folder details could not be updated.', isErr: true }));
        dispatch(clearCat());
    } catch { dispatch({ type: CErr }); }
}

export const deleteCat = (_id, id, uId) => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        let res = await api.post(`/client_category/deleteCat/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) dispatch(ModalProcess({ title: 'Client Folder', text: 'Client folder has been deleted.' }));
        else dispatch(ModalProcess({ title: 'Client Folder', text: 'Client folder could not be deleted.', isErr: true }));
        dispatch(clearCat());
        id && uId && history.push(`/organization/${id}/user/${uId}/clients/category/list`);
    } catch { dispatch({ type: CErr }); }
}