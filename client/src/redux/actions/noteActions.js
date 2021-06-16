import { noteConstants, fileConstants, taskConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import axios from 'axios'
import { ModalProcess } from "./profileActions";
import { updateNoteCount } from "./sharedNotesAction";
import { updateTaskCount } from './sharedTasksActions';
import { updateTaskCountN } from "./taskActions";
import { logOut } from "./userActions";
const { NTClr, NTErr, NTReq, NTSuc, NTLSuc, GNTSuc, NTCount, NTMdl, NTLDel } = noteConstants;
const { FUpt, FClr, FErr, FReq, FDelAtt } = fileConstants;

export const registerNote = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        let res = await api.put("/note/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.note && !res.data.error) {
            dispatch(ModalProcess({ title: 'Note', text: 'A note has been added.' }));
            dispatch({ type: NTMdl, payload: res.data.note });
        } else dispatch({ type: NTErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const registerTask = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        let res = await api.put("/task/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.note && !res.data.error) {
            dispatch({ type: NTMdl, payload: res.data.note });
            dispatch(ModalProcess({ title: 'Task', text: 'A task has been added.' }));
        } else dispatch({ type: NTErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const updateTask = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        let res = await api.post(`/task/updateNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.note && !res.data.error) {
            dispatch({ type: GNTSuc, payload: res.data.note, payloadExtra: res.data.rec });
            dispatch(ModalProcess({ title: 'Task', text: 'Task details has been updated.' }));
        } else { dispatch({ type: NTErr }) }
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const updateTaskL = data => async dispatch => {
    try {
        await api.post(`/task/updateNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const updateNoteL = data => async dispatch => {
    try {
        await api.post(`/note/updateNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }

};

export const clearNote = () => async dispatch => dispatch({ type: NTClr });

export const getNote = (_id, val) => async dispatch => {
    try {
        dispatch({ type: NTReq });
        let res = await api.get(`/note/getNote/${_id}`, { params: { isEdt: val }, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.note && !res.data.error) {
            dispatch({ type: GNTSuc, payload: res.data.note, payloadExtra: res.data.rec, count: res.data.count });
            dispatch({ type: NTSuc });
            if (val) {
                res.data.note.isTask ? dispatch(updateTaskCount()) : dispatch(updateNoteCount());
            } else {
                res.data.note.isTask ? dispatch(updateTaskCountN()) : dispatch(updateNoteCountN());
            }
        } else { dispatch({ type: NTErr }) }
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const updateNoteCountN = () => async dispatch => {
    try {
        let res = await api.get(`/note/updateNoteCount`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.noteCount !== null && !res.data.error) dispatch({ type: NTCount, payload: res.data.noteCount });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchNotes = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        let res = await api.get(`/note/fetchNotes`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.noteList && !res.data.error) {
            dispatch({ type: NTLSuc, payload: res.data });
            dispatch({ type: NTSuc });
        } else dispatch({ type: NTErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchNotesSearch = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        var res = await api.get(`/note/fetchNotesSearch`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.noteList && !res.data.error) {
            dispatch({ type: NTLSuc, payload: res.data });
            dispatch({ type: NTSuc });
        } else dispatch({ type: NTErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const updateNote = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        var res = await api.post(`/note/updateNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.note && !res.data.error) {
           
            dispatch({ type: GNTSuc, payload: res.data.note, payloadExtra: res.data.rec });
            dispatch(ModalProcess({ title: 'Note', text: 'Note details has been updated.' }));
        } else { dispatch({ type: NTErr }) }
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};


export const convertNote = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        var res = await api.post(`/note/convertNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.note && !res.data.error) {
            dispatch({ type: GNTSuc, payload: res.data.note, payloadExtra: res.data.rec });
            dispatch(ModalProcess({ title: 'Task', text: 'Note has been converted to task.' }));
        } else { dispatch({ type: NTErr }) }
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const deleteNote = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        let res = await api.post(`/note/deleteNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Note', text: 'Note has been deleted' }));
            dispatch({ type: NTLDel, payload: { _id: data._id } });
        } else {
            dispatch(ModalProcess({ title: 'Note', text: 'Note could not be deleted', isErr: true }));
            dispatch({ type: NTClr });
        };
        data.org && data.uId && history.push(`/organization/${data.org}/myspace/user/${data.uId}/notes/list/page/0`)
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const deleteTask = data => async dispatch => {
    try {
        dispatch({ type: taskConstants.NTReq });
        let res = await api.post(`/task/deleteNote`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Task', text: 'Task has been deleted' }));
            dispatch({ type: taskConstants.NTLDel, payload: { _id: data._id } });
        } else {
            dispatch(ModalProcess({ title: 'Task', text: 'Task could not be deleted', isErr: true }));
            dispatch({ type: NTClr });
        }

        data.org && data.uId && history.push(`/organization/${data.org}/myspace/user/${data.uId}/notes/list/page/1`);
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const deleteAttachment = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        let res = await api.post(`/recording/deleteAttachment`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Attachment', text: 'Attachment has been deleted' }));
            dispatch({ type: FDelAtt, payload: { _id: data._id } });
        } else {
            dispatch(ModalProcess({ title: 'Attachment', text: 'Attachment could not be deleted', isErr: true }));
            dispatch(clearFile());
        }

        dispatch({ type: NTSuc });

        data.uId && data.org && history.push(`/organization/${data.org}/myspace/user/${data.uId}/notes/list/page/2`)
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

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
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const clearFile = () => async dispatch => { dispatch({ type: FClr }); }

export const registerRec = (data, file, isTask) => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.post("/recording/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && res.data.url && !res.data.error) {
            dispatch(uploadFile(file, res.data.url, res.data.file));
            dispatch(ModalProcess({ title: isTask ? 'Task' : 'Note', text: `Recording has been attached with the ${isTask ? 'task' : 'note'}.` }));
        } else if (res.data.error && res.data.error === 'Upload limit exceeded') {
            dispatch({ type: FClr });
            history.push(`/organization/${data.org}/upload/limit`);
        } else dispatch({ type: FErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const downloadFile = _id => async dispatch => {
    try {
        Token();
        var res = await api.post(`/recording/download/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file) window.location = res.data.file.url;
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const downloadFileN = _id => async dispatch => {
    try {
        Token();
        var res = await api.post(`/recording/download/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file) window.location = res.data.file.url;
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const deleteRec = data => async dispatch => {
    try {
        await api.post(`/recording/deleteRec`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: data.isTask ? 'Task' : 'Note', text: `Recording has been deleted from the ${data.isTask ? 'task' : 'note'}.` }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};