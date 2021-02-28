
import { userConstants, employeeConstants, catConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import { ModalProcess } from "./profileActions";
const { GPErr } = userConstants;
const { EErr, EReq, ESuc, GASuc, GESuc } = employeeConstants;
const { CErr, GCSuc, CReq, CSuc, CCountS } = catConstants;

var empList = { data: [], count: 0 }, assgList = { data: [], count: 0 };

export const registerCat = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.post("/share_cat/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.users && res.data.userCount !== null && res.data.assignedCount !== null && res.data.assigned && !res.data.error) {
            empList.data = res.data.users;
            empList.count = res.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            assgList.data = res.data.assigned;
            assgList.count = res.data.assignedCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
            dispatch(ModalProcess({ title: 'Share Category', text: 'Category has been shared with the user.' }));
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateCatCount = () => async dispatch => {
    try {
        var res = await api.get(`/share_cat/updateCatCount`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catCount !== null && !res.data.error) dispatch({ type: CCountS, payload: res.data.catCount });
    } catch { dispatch({ type: GPErr }); }
}

export const fetchEmp = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/share_cat/getEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/share_cat/getEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        let [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            dispatch({ type: ESuc });
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchEmpSearch = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        const p1 = api.get(`/share_cat/searchEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/share_cat/searchEmployees`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            dispatch({ type: ESuc });
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchAssigned = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/share_cat/getAssignedCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/share_cat/getAssigned", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            assgList.data = res2.data.users;
            assgList.count = res1.data.userCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchAssignedSearch = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/share_cat/searchAssignedCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/share_cat/searchAssigned`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            assgList.data = res2.data.users;
            assgList.count = res1.data.userCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchCats = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        let res = await api.get(`/share_cat/getCat`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cats !== null && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data.cats });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: CErr }); }
};

export const deleteAssigned = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.post("/share_cat/delete", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.users && res.data.userCount !== null && res.data.assignedCount !== null && res.data.assigned && !res.data.error) {
            empList.data = res.data.users;
            empList.count = res.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            assgList.data = res.data.assigned;
            assgList.count = res.data.assignedCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
            dispatch(ModalProcess({ title: 'Share Category', text: 'User has been removed from the category.' }));
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}
export const deleteAssignedAll = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.post("/share_cat/deleteAll", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.users && res.data.userCount !== null && res.data.assignedCount !== null && res.data.assigned && !res.data.error) {
            empList.data = res.data.users;
            empList.count = res.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            assgList.data = res.data.assigned;
            assgList.count = res.data.assignedCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
            dispatch(ModalProcess({ title: 'Share Category', text: 'All User has been removed from the category.' }));
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}