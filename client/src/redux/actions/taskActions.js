import { taskConstants, userConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
const {  NTErr, NTReq, NTSuc, NTLSuc, NTCount } = taskConstants;
const { GPErr } = userConstants;

export const updateTaskCountN = () => async dispatch => {
    try {
        var res = await api.get(`/task/updateNoteCount`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.noteCount !== null && !res.data.error) dispatch({ type: NTCount, payload: res.data.noteCount });
    } catch { dispatch({ type: GPErr }); }
}

export const fetchTasks = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        var res = await api.get(`/task/fetchNotes`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.noteList && !res.data.error) {
            dispatch({ type: NTLSuc, payload: res.data });
            dispatch({ type: NTSuc });
        } else dispatch({ type: NTErr });
    } catch { dispatch({ type: NTErr }); }
}

export const fetchTasksSearch = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        var res = await api.get(`/task/fetchNotesSearch`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.noteList && !res.data.error) {
            dispatch({ type: NTLSuc, payload: res.data });
            dispatch({ type: NTSuc });
        } else dispatch({ type: NTErr });
    } catch { dispatch({ type: GPErr }); }
}