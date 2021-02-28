import { fileConstants, userConstants, catConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from "./profileActions";
const { FClr, FErr, FReq, FSuc, GFSuc, GFISuc, GURLSuc } = fileConstants;
const { GPErr } = userConstants;
const { CReq, CSuc, CErr, GCSuc } = catConstants

export const getCatSelect = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/client_category/getCats/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data.catList });
            dispatch({ type: CSuc })
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: GPErr }); }
}

export const clearFile = () => async dispatch => dispatch({ type: FClr });

export const fetchFile = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.get("/client_file/getFiles", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.files && !res.data.error) {
            dispatch({ type: GFSuc, payload: res.data });
            dispatch({ type: FSuc });
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: GPErr }); }
};

export const getFile = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.get(`/client_file/getFile`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && !res.data.error) {
            const data = { file: res.data.file, catList: res.data.catList, isF: res.data.isF };
            dispatch({ type: GFISuc, payload: data });
            dispatch({ type: FSuc });
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: GPErr }); }
}

export const getFileShared = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.get(`/client_file/getFileShared`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && !res.data.error) {
            const data = { file: res.data.file, catList: res.data.catList, versions: res.data.versions };
            dispatch({ type: GFISuc, payload: data });
            dispatch({ type: FSuc });
        }
        else dispatch({ type: FErr });
    } catch { dispatch({ type: GPErr }); }
}

export const downloadFile = _id => async dispatch => {
    try {
        Token();
        var res = await api.post(`/client_file/download/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file) window.location.href = res.data.file.url;
    } catch { dispatch({ type: GPErr }); }
}

export const urlFile = _id => async dispatch => {
    try {
        Token();
        var res = await api.post(`/client_file/download/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file) dispatch({ type: GURLSuc, payload: res.data.file.url });
    } catch { dispatch({ type: GPErr }); }
}

export const getFileDetailsM = data => async dispatch => {
    try {
        Token();
        dispatch({ type: GFISuc, payload: '' });
        let res = await api.get(`/client_file/getFileDetails`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && !res.data.error) {
            const data = { file: res.data.file, catList: res.data.catList };
            dispatch({ type: GFISuc, payload: data });
            dispatch({ type: FSuc });
        }
    } catch { dispatch({ type: FErr }); }
}

export const updateFile = data => async dispatch => {
    try {
        Token();
        dispatch({ type: FReq });
        let res = await api.post("/client_file/updateFile", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'Client File', text: 'Client file details has been updated.' }));
        } else dispatch(ModalProcess({ title: 'Client File', text: 'Client file details could not be updated.', isErr: true }));
        dispatch(clearFile())
    } catch { dispatch({ type: FErr }); }
}

export const deleteFile = (_id, org, pId) => async dispatch => {
    try {
        Token();
        dispatch({ type: FReq });
        await api.post(`/client_file/deleteFile/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Client File', text: 'Client file has been deleted.' }));
        dispatch(clearFile());
        org && pId && history.push(`/organization/${org}/user/${pId}/clients/category/list`);
    } catch { dispatch({ type: GPErr }); }
}

export const generateUrl = data => async dispatch => {
    try {
        Token();
        await api.post(`/share/generate/link_upload`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    } catch { dispatch({ type: GPErr }); }
}

export const generateUrlC = data => async dispatch => {
    try {
        Token();
        await api.post(`/share/generate/link_category`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    } catch { dispatch({ type: GPErr }); }
}


export const deleteFiles = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/client_file/deleteFiles", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Client File', text: 'Client files has been deleted.' }));
    } catch { dispatch({ type: GPErr }); }
};

export const cutFiles = (data, org, id) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/client_file/updateFilesCat", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        history.push(`/organization/${org}/user/${id}/clients/files/${data.value}/list`)
    } catch { dispatch({ type: GPErr }); }
};

export const copyFiles = (data, org, id) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/client_file/copyFiles", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        history.push(`/organization/${org}/user/${id}/clients/files/${data.catId}/list`);
    } catch { dispatch({ type: GPErr }); }
};