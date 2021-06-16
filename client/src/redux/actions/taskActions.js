import { taskConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import { logOut } from "./userActions";
import { ModalProcess } from "./profileActions";
const { NTErr, NTReq, NTSuc, NTLSuc, NTCount } = taskConstants;

export const updateTaskCountN = () => async dispatch => {
    try {
        let res = await api.get(`/task/updateNoteCount`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.noteCount !== null && !res.data.error) dispatch({ type: NTCount, payload: res.data.noteCount });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true  }));
    }
}

export const fetchTasks = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        let res = await api.get(`/task/fetchNotes`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.noteList && !res.data.error) {
            dispatch({ type: NTLSuc, payload: res.data });
            dispatch({ type: NTSuc });
        } else dispatch({ type: NTErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true  }));
    }
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
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true  }));
    }
}