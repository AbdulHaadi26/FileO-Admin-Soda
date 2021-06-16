
import { employeeConstants, fileConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import { ModalProcess } from "./profileActions";
import { logOut } from "./userActions";
const { EErr, EReq, ESuc, GASuc, GESuc } = employeeConstants;
const { FErr, FReq, FSuc, GFSuc, GFISuc, FCountS } = fileConstants;

var empList = { data: [], count: 0 }, assgList = { data: [], count: 0 };

export const registerEmp = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.post("/share/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.users && res.data.userCount !== null && res.data.assignedCount !== null && res.data.assigned && !res.data.error) {
            empList.data = res.data.users;
            empList.count = res.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            assgList.data = res.data.assigned;
            assgList.count = res.data.assignedCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
            dispatch(ModalProcess({ title: 'Share File', text: 'User File has been shared with the user.' }));
        }
        else dispatch({ type: EErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const fetchEmp = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/share/getEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/share/getEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            dispatch({ type: ESuc });
        } else dispatch({ type: EErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const updateFileCount = () => async dispatch => {
    try {
        var res = await api.get(`/share/updateFileCount`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.fileCount !== null && !res.data.error) dispatch({ type: FCountS, payload: res.data.fileCount });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const fetchEmpSearch = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        const p1 = api.get(`/share/searchEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/share/searchEmployees`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            dispatch({ type: ESuc });
        }
        else dispatch({ type: EErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchAssigned = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/share/getAssignedCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/share/getAssigned", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            assgList.data = res2.data.users;
            assgList.count = res1.data.userCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
        }
        else dispatch({ type: EErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchAssignedSearch = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/share/searchAssignedCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/share/searchAssigned`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            assgList.data = res2.data.users;
            assgList.count = res1.data.userCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
        }
        else dispatch({ type: EErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchFile = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.get("/share/getFile", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        if (res.data.files && !res.data.error) {
            dispatch({ type: GFSuc, payload: res.data.files });
            dispatch({ type: FSuc });
        }
        else dispatch({ type: FErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const getFile = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.get(`/user_file/getFileView`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.file && !res.data.error) {
            const data = { file: res.data.file, catList: res.data.catList, versions: res.data.versions };
            dispatch({ type: GFISuc, payload: data });
            dispatch({ type: FSuc });
        }
        else dispatch({ type: FErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const deleteAssigned = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.post("/share/delete", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.users && res.data.userCount !== null && res.data.assignedCount !== null && res.data.assigned && !res.data.error) {
            empList.data = res.data.users;
            empList.count = res.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            assgList.data = res.data.assigned;
            assgList.count = res.data.assignedCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
            dispatch(ModalProcess({ title: 'Share File', text: 'User has been un-assigned from the user file.' }));
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
        var res = await api.post("/share/deleteAll", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.users && res.data.userCount !== null && res.data.assignedCount !== null && res.data.assigned && !res.data.error) {
            empList.data = res.data.users;
            empList.count = res.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            assgList.data = res.data.assigned;
            assgList.count = res.data.assignedCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
            dispatch(ModalProcess({ title: 'Share File', text: 'All User has been un-assigned from the user file.' }));
        }
        else dispatch({ type: EErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}