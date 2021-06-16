
import { employeeConstants, taskConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import { ModalProcess } from "./profileActions";
import { logOut } from "./userActions";
const { EErr, EReq, ESuc, GESuc, GASuc } = employeeConstants;
const { NTErr, NTReq, NTLSuc, NTSuc, NTCountS, NTLDel } = taskConstants;

var empList = { data: [], count: 0 }, assgList = { data: [], count: 0 }, list = { data: [], count: 0 };

export const registerTask = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.post("/share_task/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.users && res.data.userCount !== null && res.data.assignedCount !== null && res.data.assigned && !res.data.error) {
            empList.data = res.data.users;
            empList.count = res.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            assgList.data = res.data.assigned;
            assgList.count = res.data.assignedCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
            dispatch(ModalProcess({ title: 'Share Task', text: 'Task has been shared with the user.' }));
        }
        else dispatch({ type: EErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const transferOwnership = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        let res = await api.post("/task/transfer", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: NTLDel, payload: { _id: data.noteId } });
            dispatch(ModalProcess({ title: 'Task', text: 'The task transfer has been successfully completed.' }));
        }
        else dispatch(ModalProcess({ title: 'Task', text: 'The task transfer could not be completed.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const updateTaskCount = () => async dispatch => {
    try {
        var res = await api.get(`/share_task/updateNoteCount`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.noteCount !== null && !res.data.error) dispatch({ type: NTCountS, payload: res.data.noteCount });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const fetchEmp = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/share_task/getEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/share_task/getEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            dispatch({ type: ESuc });
        } else dispatch({ type: GASuc, payload: empList });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchEmpSearch = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        const p1 = api.get(`/share_task/searchEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/share_task/searchEmployees`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            dispatch({ type: ESuc });
        } else dispatch({ type: GASuc, payload: empList });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchAssigned = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/share_task/getAssignedCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/share_task/getAssigned", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            assgList.data = res2.data.users;
            assgList.count = res1.data.userCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
        } else dispatch({ type: GESuc, payload: assgList });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchAssignedSearch = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/share_task/searchAssignedCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/share_task/searchAssigned`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            assgList.data = res2.data.users;
            assgList.count = res1.data.userCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
        } else dispatch({ type: GESuc, payload: assgList });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchTasks = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        const p1 = api.get(`/share_task/getNoteCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/share_task/getNote", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.notes && res1.data.noteCount !== null && !res1.data.error && !res2.data.error) {
            list.data = res2.data.notes;
            list.count = res1.data.noteCount;
            dispatch({ type: NTLSuc, payload: list });
            dispatch({ type: NTSuc });
        }
        else dispatch({ type: NTErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchTasksSearch = data => async dispatch => {
    try {
        dispatch({ type: NTReq });
        Token();
        const p1 = api.get(`/share_task/searchNoteCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/share_task/searchNote`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.notes && res1.data.noteCount !== null && !res1.data.error && !res2.data.error) {
            list.data = res2.data.notes;
            list.count = res1.data.noteCount;
            dispatch({ type: NTLSuc, payload: list });
            dispatch({ type: NTSuc });
        }
        else dispatch({ type: NTErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const deleteAssigned = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.post("/share_task/delete", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.users && res.data.userCount !== null && res.data.assignedCount !== null && res.data.assigned && !res.data.error) {
            empList.data = res.data.users;
            empList.count = res.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            assgList.data = res.data.assigned;
            assgList.count = res.data.assignedCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
            dispatch(ModalProcess({ title: 'Share Task', text: 'User has been un-assigned from the task.' }));
        }
        else dispatch({ type: EErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const deleteAssignedAll = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.post("/share_task/deleteAll", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.users && res.data.userCount !== null && res.data.assignedCount !== null && res.data.assigned && !res.data.error) {
            empList.data = res.data.users;
            empList.count = res.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            assgList.data = res.data.assigned;
            assgList.count = res.data.assignedCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
            dispatch(ModalProcess({ title: 'Share Task', text: 'All User has been un-assigned from the task.' }));
        }
        else dispatch({ type: EErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}