import { fileConstants, userConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import axios from 'axios';
import Token from './token';
import { ModalProcess } from "./profileActions";
const { FClr, FErr, FSuc, FReq, FUpt, GFSuc, GFISuc } = fileConstants;
const { GPErr } = userConstants;

export const registerFile = (data, file) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.post("/file/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && res.data.url && !res.data.error) dispatch(uploadFile(file, res.data.url, res.data.file));
        else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch(clearFile());
            history.push(`/organization/${data.org}/upload/limit`);
            dispatch(ModalProcess({ title: 'Company File', text: 'Storage limit reached.', isErr: true }));
        } else {
            dispatch(ModalProcess({ title: 'Company File', text: 'Company file with same name aleady exists.', isErr: true }));
            dispatch(clearFile());
        }
    } catch { dispatch({ type: FErr }); }
}

export const uploadFile = (file, url, fileData) => async dispatch => {
    try {
        Token();
        var percentCheck = 1;
        var type = fileData.url.split('.').slice(-1);
        var fData = { name: fileData.name, size: fileData.size, type: type };
        await axios.put(url, file, {
            onUploadProgress: function (progressEvent) {
                percentCheck = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                dispatch({ type: FUpt, payload: percentCheck, payloadExtra: fData });
            }
        });
    } catch { dispatch({ type: FErr }); }
}

export const clearUpload = () => async dispatch => {
    dispatch({ type: FSuc });
};

export const registerFileVer = (data, file) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.post("/file/registerVer", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && res.data.url && !res.data.error) dispatch(uploadFile(file, res.data.url, res.data.file));
        else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch(clearFile());
            history.push(`/organization/${data.org}/upload/limit`);
            dispatch(ModalProcess({ title: 'Company File', text: 'Storage limit reached.', isErr: true }));
        } else {   
            dispatch(ModalProcess({ title: 'Company File', text: 'Company file with same name aleady exists.', isErr: true }));
            dispatch(clearFile());
        }
    } catch { dispatch({ type: FErr }); }
}

export const registerFileNew = (data, file) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.post("/file/registerNew", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && res.data.url && !res.data.error) dispatch(uploadFile(file, res.data.url, res.data.file));
        else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch(clearFile());
            history.push(`/organization/${data.org}/upload/limit`);
            dispatch(ModalProcess({ title: 'Company File', text: 'Storage limit reached.', isErr: true }));
        } else {
            dispatch(ModalProcess({ title: 'Company File', text: 'Company file with same name aleady exists.', isErr: true }));
            dispatch(clearFile());
        }
    } catch { dispatch({ type: FErr }); }
};

export const clearFile = () => async dispatch => dispatch({ type: FClr });

export const fetchFileD = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        const res = await api.get("/file/getAllFiles", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.files && !res.data.error) {
            dispatch({ type: GFISuc, payload: res.data });
            dispatch({ type: FSuc });
        }
        else dispatch({ type: FErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchCombinedCPC = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.get("/file/fetchCombined", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: GFSuc, payload: res.data });
            dispatch({ type: FSuc });
        }
        else dispatch({ type: FErr });
    } catch { dispatch({ type: GPErr }); }
};

export const getFile = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.get(`/file/getFile`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && !res.data.error) {
            const data = { file: res.data.file, catList: res.data.catList, versions: res.data.versions, isF: res.data.isF };
            dispatch({ type: GFISuc, payload: data });
            dispatch({ type: FSuc });
        }
        else dispatch({ type: FErr });
    } catch { dispatch({ type: GPErr }); }
}

export const downloadFile = _id => async dispatch => {
    try {
        Token();
        var res = await api.post(`/file/download/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file) window.location = res.data.file.url;
    } catch { dispatch({ type: GPErr }); }
}

export const getFileDetailsM = data => async dispatch => {
    try {
        Token();
        var res = await api.get(`/file/getFileDetails`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && !res.data.error) {
            const data = { file: res.data.file, catList: res.data.catList, versions: res.data.versions };
            dispatch({ type: GFISuc, payload: data });
            dispatch({ type: FSuc });
        }
    } catch { dispatch({ type: FErr }); }
}

export const getRecentFileDate = () => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.get(`/account/recentFilesDate`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.files && !res.data.error) {
            dispatch({ type: GFISuc, payload: res.data });
            dispatch({ type: FSuc });
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateFile = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        dispatch({ type: GFISuc, payload: '' });
        Token();
        let res = await api.post("/file/updateFile", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'Company File', text: 'Company file details has been updated.' }));
        } else dispatch(ModalProcess({ title: 'Company File', text: 'Company file details could not be updated.', isErr: true }));
        dispatch(clearFile());
    } catch { dispatch({ type: FErr }); }
}

export const deleteFile = (_id, id) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.post(`/file/deleteFile/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) dispatch(ModalProcess({ title: 'Company File', text: 'Company file has been deleted.' }));
        else dispatch(ModalProcess({ title: 'Company File', text: 'Company file could not be deleted.', isErr: true }));
        dispatch(clearFile());
        id && history.push(`/organization/${id}/files/categories`);
    } catch { dispatch({ type: GPErr }); }
}

export const deleteVersion = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        dispatch({ type: GFISuc, payload: '' });
        Token();
        let res = await api.post(`/file/deleteVer`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'Company File', text: 'Company file version has been deleted.' }));
        } else dispatch(ModalProcess({ title: 'Company File', text: 'Company file version could not be deleted.', isErr: true }));
        dispatch(clearFile());
    } catch { dispatch({ type: FErr }); }
}

export const deleteFiles = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/file/deleteFiles", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Company File', text: 'Company files has been deleted.' }));
    } catch { dispatch({ type: GPErr }); }
};

export const cutFiles = (data, org) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/file/updateFilesCat", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        history.push(`/organization/${org}/files/${data.value}/list`);
    } catch { dispatch({ type: GPErr }); }
};

export const copyFiles = (data, org) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/file/copyFiles", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        history.push(`/organization/${org}/files/${data.catId}/list`);
    } catch { dispatch({ type: GPErr }); }
};