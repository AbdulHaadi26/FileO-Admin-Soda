import { fileConstants, userConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import axios from 'axios';
import { ModalProcess } from "./profileActions";
const { FClr, FErr, FReq, FUpt, FSuc, GFSuc, GFISuc } = fileConstants;
const { GPErr } = userConstants;

export const registerFile = (data, file) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.post("/project_file/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && res.data.url && !res.data.error) dispatch(uploadFile(file, res.data.url, res.data.file));
        else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch(clearFile());
            history.push(`/organization/${data.org}/projects/${data.pId}/upload/limit`);
            dispatch(ModalProcess({ title: 'Project File', text: 'Storage limit reached.', isErr: true }));
        } else {
            dispatch(ModalProcess({ title: 'Project File', text: 'Project file could not be uploaded.', isErr: true }));
            dispatch(clearFile());
        }
    } catch { dispatch({ type: FErr }); }
}

export const registerFileVer = (data, file) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.post("/project_file/registerVer", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && res.data.url && !res.data.error) dispatch(uploadFile(file, res.data.url, res.data.file));
        else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch(clearFile());
            history.push(`/organization/${data.org}/upload/limit`);
            dispatch(ModalProcess({ title: 'Project File', text: 'Storage limit reached.', isErr: true }));
        } else {
            dispatch(ModalProcess({ title: 'Project File', text: 'Project file could not be uploaded.', isErr: true }));
            dispatch(clearFile());
        }
    } catch { dispatch({ type: FErr }); }
}

export const registerFileNew = (data, file) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.post("/project_file/registerNew", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && res.data.url && !res.data.error) dispatch(uploadFile(file, res.data.url, res.data.file));
        else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch(clearFile());
            history.push(`/organization/${data.org}/upload/limit`);
            dispatch(ModalProcess({ title: 'Project File', text: 'Storage limit reached.', isErr: true }));
        } else {
            dispatch(ModalProcess({ title: 'Project File', text: 'Project file could not be uploaded.', isErr: true }));
            dispatch(clearFile());
        }
    } catch { dispatch({ type: FErr }); }
}

export const uploadFile = (file, url, fileData) => async dispatch => {
    try {
        Token();
        var type = fileData.url.split('.').slice(-1);
        var fData = { name: fileData.name, size: fileData.size, type: type };
        var percentCheck = 1;
        await axios.put(url, file, {
            onUploadProgress: function (progressEvent) {
                percentCheck = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                dispatch({ type: FUpt, payload: percentCheck, payloadExtra: fData });
            }
        });
    } catch { dispatch({ type: FErr }); }
}

export const clearUpload = () => async dispatch => {
    dispatch(clearFile());
}

export const clearFile = () => async dispatch => dispatch({ type: FClr });

export const fetchCombinedP = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.get("/project_file/getCombined", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: GFSuc, payload: res.data });
            dispatch({ type: FSuc });
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchCombinedPC = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.get("/project_file/getCombined", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: GFSuc, payload: res.data });
            dispatch({ type: FSuc });
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: GPErr }); }
};
export const getFile = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.get(`/project_file/getFile`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && !res.data.error) {
            const data = { file: res.data.file, catList: res.data.catList, versions: res.data.versions, isF: res.data.isF };
            dispatch({ type: GFISuc, payload: data });
            dispatch({ type: FSuc });
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: GPErr }); }
}

export const downloadFile = _id => async dispatch => {
    try {
        Token();
        var res = await api.post(`/project_file/download/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file) window.location = res.data.file.url;
    } catch { dispatch({ type: FErr }); }
}

export const getFileDetailsM = data => async dispatch => {
    try {
        Token();
        dispatch({ type: GFISuc, payload: '' });
        let res = await api.get(`/project_file/getFileDetails`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && !res.data.error) {
            const data = { file: res.data.file, catList: res.data.catList, versions: res.data.versions };
            dispatch({ type: GFISuc, payload: data });
            dispatch({ type: FSuc });
        }
    } catch { dispatch({ type: FErr }); }
}

export const updateFile = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        dispatch({ type: GFISuc, payload: '' });
        let res = await api.post("/project_file/updateFile", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'Project File', text: 'Project file details has been updated.' }));
        } else dispatch(ModalProcess({ title: 'Project File', text: 'Project file details could not be updated.', isErr: true }));       
        dispatch(clearFile());
    } catch { dispatch({ type: FErr }); }
}

export const deleteFile = (_id, org, pId) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.post(`/project_file/deleteFile/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) dispatch(ModalProcess({ title: 'Project File', text: 'Project file has been deleted.' }));
        else dispatch(ModalProcess({ title: 'Project File', text: 'Project file could not be deleted.', isErr: true }));
        dispatch(clearFile());
        org && pId && history.push(`/organization/${org}/projects/${pId}/categories/list`);
    } catch { dispatch({ type: FErr }); }
}

export const deleteVersion = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        dispatch({ type: GFISuc, payload: '' });
        Token();
        let res = await api.post(`/project_file/deleteVer`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'Project File', text: 'Project file version has been deleted.' }));
        } else dispatch(ModalProcess({ title: 'Project File', text: 'Project file version could not be deleted.', isErr: true }));
        dispatch(clearFile());
    } catch { dispatch({ type: FErr }); }
}

export const deleteFiles = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/project_file/deleteFiles", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Project File', text: 'Project files has been deleted.' }));
    } catch { dispatch({ type: GPErr }); }
};

export const cutFiles = (data, org, pId) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/project_file/updateFilesCat", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        history.push(`/organization/${org}/projects/${pId}/files/${data.value}/list`)
    } catch { dispatch({ type: GPErr }); }
};

export const copyFiles = (data, org, id) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/project_file/copyFiles", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        history.push(`/organization/${org}/projects/${id}/files/${data.catId}/list`)
    } catch { dispatch({ type: GPErr }); }
};