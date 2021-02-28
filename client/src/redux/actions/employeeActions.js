import { userConstants, employeeConstants, rolesConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import axios from 'axios';
import { ModalProcess } from "./profileActions";
const { GPErr } = userConstants;
const { EErr, GEISuc, GASuc, EReq, ESuc, EClr, ECount } = employeeConstants;
const { RErr, RReq, GRSuc, RSuc } = rolesConstants;

export const registerUser = (data, file) => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        let res = await api.post("/account/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.user && res.data.url && !res.data.error ? dispatch(uploadImage(res.data.url, file, data._id)) : dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}

export const registerUserN = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        let res = await api.post("/account/registerN", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        res.data.user && dispatch(ModalProcess({ title: 'User', text: 'User has been added.' }));
        history.push(`/organization/${data._id}/employee/search`);
    } catch { dispatch({ type: GPErr }); }
}

export const uploadImage = (url, file, id) => async dispatch => {
    try {
        Token();
        await axios.put(url, file);
        history.push(`/organization/${id}/employee/search`);
        dispatch(ModalProcess({ title: 'User', text: 'User has been added.' }));
    } catch { dispatch({ type: GPErr }); }
}

export const getRolesSelect = _id => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        var res = await api.get(`/roles/getRoles/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.roleList && !res.data.error) {
            dispatch({ type: GRSuc, payload: res.data.roleList });
            dispatch({ type: RSuc });
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const clearUser = () => async dispatch => dispatch({ type: EClr });

const empList = { data: [], count: 0 };

export const fetchEmp = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/employee/getEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/employee/getEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            dispatch({ type: ESuc });
        }
        else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchEmpC = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const res = await api.get(`/employee/getEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.userCount !== null && !res.data.error) dispatch({ type: ECount, payload: res.data.userCount });
        dispatch({ type: ESuc });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchEmpSearch = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/employee/searchEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/employee/searchEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            dispatch({ type: ESuc });
        }
        else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
};

export const getEmployee = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.get(`/employee/getEmployee`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.user && !res.data.error) {
            const data = { user: res.data.user, roleList: res.data.roleList };
            dispatch({ type: GEISuc, payload: data });
            dispatch({ type: ESuc });
        }
        else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}

export const deleteUser = (_id, id) => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        await api.post(`/employee/deleteUser/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'User', text: 'User has been deleted.' }));
        history.push(`/organization/${id}/employee/search`);
    } catch { dispatch({ type: GPErr }); }
}

export const updateEmpProfile = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.post("/employee/updateProfile", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.user && !res.data.error) {
            let dat = { user: res.data.user, roleList: res.data.roleList };
            dispatch({ type: GEISuc, payload: dat });
            dispatch({ type: ESuc });
            data.field !== 'storage' ? dispatch(ModalProcess({ title: 'User', text: 'User details has been updated.' })) : dispatch(ModalProcess({ title: 'User', text: 'User storage has been updated.' }));
        }
        else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateEmpRole = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.post("/employee/updateRoleId", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.user && !res.data.error) {
            const data = { user: res.data.user, roleList: res.data.roleList };
            dispatch({ type: GEISuc, payload: data });
            dispatch({ type: ESuc });
            dispatch(ModalProcess({ title: 'User', text: 'User details has been updated.' }));
        }
        else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}

export const uploadEmpImage = (data, file, _id) => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res1 = await api.post(`/employee/imageUrl/sign`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res1.data.key && res1.data.url && !res1.data.error) {
            await axios.put(res1.data.url, file);
            var userData = { _id: _id, key: res1.data.key };
            var res = await api.post(`/employee/uploadImage`, userData, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
            if (res.data.user && !res.data.error) {
                const data = { user: res.data.user, roleList: res.data.roleList };
                dispatch({ type: GEISuc, payload: data });
                dispatch({ type: ESuc });
                dispatch(ModalProcess({ title: 'User', text: 'User details has been updated.' }));
            } else dispatch({ type: EErr });
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}