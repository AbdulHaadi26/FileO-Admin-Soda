import { noteConstants, userConstants, fileConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import axios from 'axios'
import { ModalProcess } from "./profileActions";
import { updateNoteCount } from "./sharedNotesAction";
import { updateTaskCount } from './sharedTasksActions';
import { updateTaskCountN } from "./taskActions";
const { NTClr, NTErr, NTReq, NTSuc, NTLSuc, GNTSuc, NTCount } = noteConstants;
const { FUpt, FClr, FErr, FReq } = fileConstants;
const { GPErr } = userConstants;

export const registerNote = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        var res = await api.put("/note/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.note && !res.data.error) {
            dispatch(ModalProcess({ title: 'Note', text: 'A note has been added.' }));
            history.push(`/organization/${data.org}/myspace/user/${data._id}/notes/list/page/0`);
        } else dispatch({ type: NTErr });
    } catch { dispatch({ type: GPErr }); }
}

export const registerTask = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        var res = await api.put("/task/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.note && !res.data.error) {
            dispatch({ type: NTClr });
            dispatch(ModalProcess({ title: 'Task', text: 'A task has been added.' }));
            history.push(`/organization/${data.org}/myspace/user/${data._id}/notes/list/page/1`);
        } else dispatch({ type: NTErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateTask = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        var res = await api.post(`/task/updateNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.note && !res.data.error) {
            dispatch({ type: GNTSuc, payload: res.data.note, payloadExtra: res.data.rec });
            dispatch(ModalProcess({ title: 'Task', text: 'Task details has been updated.' }));
        } else { dispatch({ type: NTErr }) }
    } catch { dispatch({ type: GPErr }); }
}

export const updateTaskL = data => async dispatch => {
    try {
        await api.post(`/task/updateNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    } catch { dispatch({ type: NTErr }); }
}

export const updateNoteL = data => async dispatch => {
    try {
        await api.post(`/note/updateNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    } catch { dispatch({ type: NTErr }); }
}

export const clearNote = () => async dispatch => dispatch({ type: NTClr });

export const getNote = (_id, val) => async dispatch => {
    try {
        dispatch({ type: NTReq });
        var res = await api.get(`/note/getNote/${_id}`, { params: { isEdt: val }, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.note && !res.data.error) {
            dispatch({ type: GNTSuc, payload: res.data.note, payloadExtra: res.data.rec, count: res.data.count });
            dispatch({ type: NTSuc });
            if (val) {
                res.data.note.isTask ? dispatch(updateTaskCount()) : dispatch(updateNoteCount());
            } else {
                res.data.note.isTask ? dispatch(updateTaskCountN()) : dispatch(updateNoteCountN());
            }
        } else { dispatch({ type: NTErr }) }
    } catch { dispatch({ type: GPErr }); }
}

export const updateNoteCountN = () => async dispatch => {
    try {
        var res = await api.get(`/note/updateNoteCount`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.noteCount !== null && !res.data.error) dispatch({ type: NTCount, payload: res.data.noteCount });
    } catch { dispatch({ type: GPErr }); }
}

export const fetchNotes = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        var res = await api.get(`/note/fetchNotes`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.noteList && !res.data.error) {
            dispatch({ type: NTLSuc, payload: res.data });
            dispatch({ type: NTSuc });
        } else dispatch({ type: NTErr });
    } catch { dispatch({ type: NTErr }); }
}

export const fetchNotesSearch = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        var res = await api.get(`/note/fetchNotesSearch`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.noteList && !res.data.error) {
            dispatch({ type: NTLSuc, payload: res.data });
            dispatch({ type: NTSuc });
        } else dispatch({ type: NTErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateNote = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        var res = await api.post(`/note/updateNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.note && !res.data.error) {
            dispatch({ type: GNTSuc, payload: res.data.note, payloadExtra: res.data.rec });
            dispatch(ModalProcess({ title: 'Note', text: 'Note details has been updated.' }));
        } else { dispatch({ type: NTErr }) }
    } catch { dispatch({ type: GPErr }); }
}


export const convertNote = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        var res = await api.post(`/note/convertNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.note && !res.data.error) {
            dispatch({ type: GNTSuc, payload: res.data.note, payloadExtra: res.data.rec });
            dispatch(ModalProcess({ title: 'Task', text: 'Note has been converted to task.' }));
        } else { dispatch({ type: NTErr }) }
    } catch { dispatch({ type: GPErr }); }
}


export const deleteNote = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        await api.post(`/note/deleteNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Note', text: 'Note has been deleted' }));
        history.push(`/organization/${data.org}/myspace/user/${data.uId}/notes/list/page/0`)
    } catch { dispatch({ type: GPErr }); }
}

export const deleteTask = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        await api.post(`/task/deleteNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Task', text: 'Task has been deleted' }));
        dispatch({ type: NTClr });
        history.push(`/organization/${data.org}/myspace/user/${data.uId}/notes/list/page/1`);
    } catch { dispatch({ type: GPErr }); }
}

export const deleteAttachment = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        await api.post(`/recording/deleteAttachment`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Attachment', text: 'Attachment has been deleted' }));
        history.push(`/organization/${data.org}/myspace/user/${data.uId}/notes/list/page/2`)
    } catch { dispatch({ type: GPErr }); }
}

export const uploadFile = (file, url, fileData) => async dispatch => {
    try {
        Token();
        var percentCheck = 1;
        await axios.put(url, file, {
            onUploadProgress: function (progressEvent) {
                percentCheck = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                dispatch({ type: FUpt, payload: percentCheck, payloadExtra: fileData });
            }
        });
    } catch { dispatch({ type: GPErr }); }
}

export const clearFile = () => async dispatch => { dispatch({ type: FClr }); }

export const registerRec = (data, file) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.post("/recording/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && res.data.url && !res.data.error) {
            dispatch(uploadFile(file, res.data.url, res.data.file));
            dispatch(ModalProcess({ title: 'Note', text: 'Recording has been attached with the note.' }));
        } else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch({ type: FClr });
            history.push(`/organization/${data.org}/upload/limit`);
        } else dispatch({ type: FErr });
    } catch { dispatch({ type: GPErr }); }
}


export const downloadFile = _id => async dispatch => {
    try {
        Token();
        var res = await api.post(`/recording/download/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file) window.location = res.data.file.url;
    } catch { dispatch({ type: GPErr }); }
}

export const deleteRec = data => async dispatch => {
    try {
        await api.post(`/recording/deleteRec`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Note', text: 'Recording has been deleted from the note.' }));
    } catch { dispatch({ type: GPErr }); }
}