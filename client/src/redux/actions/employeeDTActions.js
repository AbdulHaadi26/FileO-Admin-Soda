import { employeeConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from "./profileActions";
import { logOut } from "./userActions";
const { EErr, GEISuc, EReq, ESuc, GASuc } = employeeConstants;
const empList = {
    data: [], count: 0
};

export const fetchEmp = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/employeeDT/getEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/employeeDT/getEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
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
        Token();
        const p1 = api.get(`/employeeDT/searchEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/employeeDT/searchEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
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

export const getEmployee = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.get(`/employeeDT/getEmployee`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.user && !res.data.error) {
            const data = { user: res.data.user };
            dispatch({ type: GEISuc, payload: data });
            dispatch({ type: ESuc });
        } else dispatch({ type: EErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const transferData = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        await api.post(`/employeeDT/transfer`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'My Space', text: 'Employee storage space has been transfered.' }));
        history.push(`/organization/${data.org}/data/transfer/list`);
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}