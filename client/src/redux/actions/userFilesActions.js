import { fileConstants, catConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import axios from 'axios';
import { ModalProcess } from "./profileActions";
import { updateFileCount } from "./sharedFilesAction";
const { FClr, FErr, FReq, FUpt, GFSuc, GFISuc, FSuc } = fileConstants;
const { CReq, CSuc, CErr, GCSuc } = catConstants

export const registerFile = (data, file) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.post("/user_file/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && res.data.url && !res.data.error) dispatch(uploadFile(file, res.data.url, res.data.file));
        else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch(clearFile());
            history.push(`/organization/${data.org}/myspace/limit`);
            dispatch(ModalProcess({ title: 'User File', text: 'Storage limit has been reached.', isErr: true }));
        } else {
            dispatch(ModalProcess({ title: 'User File', text: 'User File uploading has failed.', isErr: true }));
            dispatch(clearFile());
        }
    } catch { dispatch({ type: FErr }); }
}

export const fetchAttachment = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.get("/recording/getCombined", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: GFSuc, payload: res.data });
            dispatch({ type: FSuc });
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: FErr }); }
};

export const registerFileMod = (data, file) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.post("/user_file/registerM", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && res.data.url && !res.data.error) {
            dispatch({ type: GFISuc, payload: res.data.file });
            dispatch(uploadFile(file, res.data.url, res.data.file));
        }
        else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch(clearFile());
            history.push(`/organization/${data.org}/myspace/limit`);
            dispatch(ModalProcess({ title: 'User File', text: 'Storage limit has been reached.', isErr: true }));
        } else {
            dispatch(ModalProcess({ title: 'User File', text: 'User File uploading has failed.', isErr: true }));
            dispatch(clearFile());
        }
    } catch { dispatch({ type: FErr }); }
}


export const registerFileVer = (data, file) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.post("/user_file/registerVer", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && res.data.url && !res.data.error) dispatch(uploadFile(file, res.data.url, res.data.file));
        else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch(clearFile());
            history.push(`/organization/${data.org}/myspace/limit`);
            dispatch(ModalProcess({ title: 'User File', text: 'Storage limit has been reached.', isErr: true }));
        } else {
            dispatch(ModalProcess({ title: 'User File', text: 'User File version uploading has failed.', isErr: true }));
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

export const clearUpload = (org, postedby, category) => async dispatch => {
    dispatch(clearFile());
    !category ?
        history.push(`/organization/${org}/myspace/user/${postedby}/category/list`) :
        history.push(`/organization/${org}/myspace/user/${postedby}/files/${category}/list`);
};

export const clearUploadModal = () => async dispatch => {
    dispatch(clearFile());
};

export const getCatSelect = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/user_category/getCats/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data.catList });
            dispatch({ type: CSuc })
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: FErr }); }
}

export const getCatSelectU = (_id, catId) => async dispatch => {
    try {
        Token();
        let res = await api.get(`/user_category/getCats/${_id}`, { params: { catId }, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data.catList });
            dispatch({ type: CSuc })
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: FErr }); }
}

export const clearFile = () => async dispatch => dispatch({ type: FClr });

export const fetchCombined = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.get("/user_file/getCombined", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: GFSuc, payload: res.data });
            dispatch({ type: FSuc });
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: FErr }); }
};

export const getFile = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.get(`/user_file/getFile`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && !res.data.error) {
            const data = { file: res.data.file, catList: res.data.catList, versions: res.data.versions, isF: res.data.isF };
            dispatch({ type: GFISuc, payload: data });
            dispatch({ type: FSuc });
            dispatch(updateFileCount());
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: FErr }); }
}

export const getRec = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.get(`/recording/getFile/${data._id}`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && !res.data.error) {
            const data = { file: res.data.file };
            dispatch({ type: GFISuc, payload: data });
            dispatch({ type: FSuc });
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: FErr }); }
}

export const getFileShared = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.get(`/user_file/getFileShared`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && !res.data.error) {
            const data = { file: res.data.file, catList: res.data.catList, versions: res.data.versions };
            dispatch({ type: GFISuc, payload: data });
            dispatch({ type: FSuc });
            dispatch(updateFileCount());
        }
        else dispatch({ type: FErr });
    } catch { dispatch({ type: FErr }); }
}

export const downloadFile = _id => async dispatch => {
    try {
        Token();
        var res = await api.post(`/user_file/download/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file) window.location = res.data.file.url;
    } catch { dispatch({ type: FErr }); }
}

export const generateUrl = (data) => async dispatch => {
    try {
        Token();
        await api.post(`/share/generate/link/${data.id}`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    } catch { dispatch({ type: FErr }); }
}

export const getFileDetailsM = data => async dispatch => {
    try {
        Token();
        dispatch({ type: GFISuc, payload: '' });
        var res = await api.get(`/user_file/getFileDetails`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && !res.data.error) {
            const data = { file: res.data.file, catList: res.data.catList, versions: res.data.versions };
            dispatch({ type: GFISuc, payload: data });
            dispatch({ type: FSuc });
        }
    } catch { dispatch({ type: FErr }); }
}

export const updateFile = data => async dispatch => {
    try {
        Token();
        dispatch({ type: FReq });
        dispatch({ type: GFISuc, payload: '' });
        var res = await api.post("/user_file/updateFile", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'User File', text: 'User file details has been updated.' }));
        } else dispatch(ModalProcess({ title: 'User File', text: 'User file details could not be updated.', isErr: true }));
        dispatch(clearFile());
    } catch { dispatch({ type: FErr }); }
}

export const deleteFile = (_id, org, pId) => async dispatch => {
    try {
        Token();
        dispatch({ type: FReq });
        await api.post(`/user_file/deleteFile/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'User File', text: 'User file has been deleted.' }));
        dispatch(clearFile());
        org && pId && history.push(`/organization/${org}/myspace/user/${pId}/category/list`);
    } catch { dispatch({ type: FErr }); }
}

export const deleteVersion = data => async dispatch => {
    try {
        Token();
        dispatch({ type: FReq });
        dispatch({ type: GFISuc, payload: '' });
        let res = await api.post(`/user_file/deleteVer`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'User File', text: 'User file version has been deleted.' }));
        } else dispatch(ModalProcess({ title: 'User File', text: 'User file version could not be deleted.', isErr: true }));
        dispatch(clearFile());
    } catch { dispatch({ type: FErr }); }
}

export const registerFileM = (fileList, fL) => async dispatch => {
    try {
        Token();
        var i = 0;
        dispatch({ type: FReq });
        for (const f of fileList) {
            await dispatch(uploadFileM(f, fL[i], fileList, i));
            i = i + 1;
        }
    } catch { dispatch({ type: FErr }); }
}

export const uploadFileM = (f, fL, fLst, i) => async dispatch => {
    let res = await api.post("/user_file/register", f, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    if (res.data.file && res.data.url && !res.data.error) {
        let percentCheck = 1;
        await axios.put(res.data.url, fL, {
            onUploadProgress: function (progressEvent) {
                percentCheck = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                fLst[i].percentCheck = percentCheck;
                dispatch({ type: FUpt, payload: percentCheck, payloadExtra: fLst, isM: true });
            }
        });
    } else {
        fLst[i].err = true;
        dispatch({ type: FUpt, payload: 0, payloadExtra: fLst, isM: true });
    }
};

export const deleteFiles = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/user_file/deleteFiles", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'User File', text: 'User files has been deleted.' }));
    } catch { dispatch({ type: FErr }); }
};

export const cutFiles = (data, org, id) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/user_file/updateFilesCat", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        history.push(`/organization/${org}/myspace/user/${id}/files/${data.value}/list`)
    } catch { dispatch({ type: FErr }); }
};

export const registerFileNew = (data, file) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.post("/user_file/registerNew", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        console.log(res.data);
        if (res.data.file && res.data.url && !res.data.error) dispatch(uploadFile(file, res.data.url, res.data.file));
        else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch(clearFile());
            history.push(`/organization/${data.org}/upload/limit`);
            dispatch(ModalProcess({ title: 'User File', text: 'Storage limit reached.', isErr: true }));
        } else {
            dispatch(ModalProcess({ title: 'User File', text: 'User file with same name aleady exists.', isErr: true }));
            dispatch(clearFile());
        }
    } catch { dispatch({ type: FErr }); }
};

export const copyFiles = (data, org, id) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        await api.post("/user_file/copyFiles", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        history.push(`/organization/${org}/myspace/user/${id}/files/${data.catId}/list`);
    } catch { dispatch({ type: FErr }); }
};