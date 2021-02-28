import { projectConstants, userConstants, employeeConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from "./profileActions";
const { PErr, PReq, PSuc, PClr, PLSuc, POISuc } = projectConstants;
const { EErr, EReq, ESuc, GEISuc, GASuc } = employeeConstants;
const { GPErr } = userConstants;

export const clearProject = () => async dispatch => dispatch({ type: PClr });

const pList = { data: [], count: 0 };

export const registerProject = data => async dispatch => {
    try {
        dispatch({ type: PReq });
        Token();
        let res = await api.put("/project/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.project && !res.data.error) {
            dispatch(ModalProcess({ title: 'Project', text: 'Project has been added.' }));
        } else dispatch(ModalProcess({ title: 'Project', text: 'Project could not be added.', isErr: true }));
        dispatch(clearProject())
    } catch { dispatch({ type: GPErr }); }
};

export const fetchProjectM = data => async dispatch => {
    try {
        dispatch({ type: PReq });
        Token();
        const p1 = api.get("/project/getProjectsM", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/project/getProjectCountM`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res1.data.projects && res2.data.projCount !== null && !res1.data.error && !res2.data.error) {
            pList.data = res1.data.projects;
            pList.count = res2.data.projCount;
            dispatch({ type: PLSuc, payload: pList });
            dispatch({ type: PSuc });
        }
        else dispatch({ type: PErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchSearchProjectM = data => async dispatch => {
    try {
        dispatch({ type: PReq });
        Token();
        const p1 = api.get("/project/searchProjectM", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/project/searchProjectCountM`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res1.data.projects && res2.data.projCount !== null && !res1.data.error && !res2.data.error) {
            pList.data = res1.data.projects;
            pList.count = res2.data.projCount;
            dispatch({ type: PLSuc, payload: pList });
            dispatch({ type: PSuc });
        }
        else dispatch({ type: PErr });
    } catch { dispatch({ type: GPErr }); }
};

export const getProject = _id => async dispatch => {
    try {
        dispatch({ type: PReq });
        Token();
        var res = await api.get(`/project/getProject/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.project && !res.data.error) {
            dispatch({ type: POISuc, payload: res.data });
            dispatch({ type: PSuc });
        } else dispatch({ type: PErr });
    } catch { dispatch({ type: GPErr }); }
}

export const getProjectDesc = _id => async dispatch => {
    try {
        dispatch({ type: PReq });
        Token();
        var res = await api.get(`/project/getProjectDesc/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.project && !res.data.error) {
            dispatch({ type: POISuc, payload: res.data });
            dispatch({ type: PSuc });
        } else dispatch({ type: PErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateProject = data => async dispatch => {
    try {
        dispatch({ type: PReq });
        Token();
        let res = await api.post(`/project/updateProject`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'Project', text: 'Project details has been updated.' }));
        } else dispatch(ModalProcess({ title: 'Project', text: 'Project details could not be updated.', isErr: true }));
        dispatch(clearProject());
    } catch { dispatch({ type: PErr }); }
}

export const delProject = (_id) => async dispatch => {
    try {
        dispatch({ type: PReq });
        Token();
        let res = await api.post(`/project/deleteProject/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if(!res.data.error) dispatch(ModalProcess({ title: 'Project', text: 'Project has been deleted.' }));
        else dispatch(ModalProcess({ title: 'Project', text: 'Project could not bes deleted.', isErr: true }));
        dispatch(clearProject());
    } catch { dispatch({ type: GPErr }); }
}


const empList = { data: [], count: 0 };

export const fetchEmp = data => async dispatch => {

    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/project/getEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/project/getEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            dispatch({ type: ESuc });
        }
        else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchEmpSearch = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        const p1 = api.get(`/project/searchEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/project/searchEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            dispatch({ type: ESuc });
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
};

export const editAssignEmployee = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.post(`/assigned/updateAssigned`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.user && !res.data.error) {
            const data = { user: res.data.user, roleList: res.data.roleList };
            dispatch({ type: GEISuc, payload: data });
            dispatch({ type: ESuc });
            dispatch(ModalProcess({ title: 'Project', text: 'Assigned project has been updated.' }));
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}

export const assignEmployee = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        var res = await api.put(`/assigned/register`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.assigned && !res.data.error) {
            history.push(`/organization/${data.org}/projects/${data.pId}/assigned/employee/list`);
            dispatch({ type: GEISuc, payload: [] });
            dispatch({ type: ESuc });
            dispatch(ModalProcess({ title: 'Project', text: 'Employee has been assigned to the project.' }));
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}

export const delEmployee = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        await api.post(`/assigned/deleteAssigned`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        history.push(`/organization/${data.org}/projects/${data.pId}/assigned/employee/list`);
        dispatch({ type: GEISuc, payload: [] });
        dispatch({ type: ESuc });
        dispatch(ModalProcess({ title: 'Project', text: 'Employee has been removed from the project.' }));
    } catch { dispatch({ type: GPErr }); }
}

export const getEmployee = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.get(`/project/getEmployee`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.user && !res.data.error) {
            const data = { user: res.data.user, roleList: res.data.roleList };
            dispatch({ type: GEISuc, payload: data });
            dispatch({ type: ESuc });
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}

export const getUser = pId => async dispatch => {
    try {
        dispatch({ type: EReq });
        var res = await api.get(`/assigned/getUser/${pId}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.user && !res.data.error) {
            const data = { user: res.data.user };
            dispatch({ type: GEISuc, payload: data });
            dispatch({ type: ESuc });
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}

export const getAssignedEmployee = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        var res = await api.get(`/assigned/getEmployee`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.user && !res.data.error) {
            const data = { user: res.data.user, roleList: res.data.roleList };
            dispatch({ type: GEISuc, payload: data });
            dispatch({ type: ESuc });
        } else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
}

export const fetchEmpA = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        const p1 = api.get(`/assigned/getEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/assigned/getEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            dispatch({ type: ESuc });
        }
        else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchEmpSearchA = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/assigned/searchEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/assigned/searchEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GASuc, payload: empList });
            dispatch({ type: ESuc });
        }
        else dispatch({ type: EErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchProjectA = data => async dispatch => {
    try {
        dispatch({ type: PReq });
        const p1 = api.get(`/assigned/getProjectCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/assigned/getProjects", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.projects && res1.data.projCount && !res1.data.error && !res2.data.error) {
            pList.data = res2.data.projects;
            pList.count = res1.data.projCount;
            dispatch({ type: PLSuc, payload: pList });
            dispatch({ type: PSuc });
        }
        else dispatch({ type: PErr });
    } catch { dispatch({ type: GPErr }); }
};

export const fetchProjSearchA = data => async dispatch => {
    try {
        dispatch({ type: PReq });
        const p1 = api.get(`/assigned/searchProjectCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/assigned/searchProjects", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.projects && res1.data.projCount && !res1.data.error && !res2.data.error) {
            pList.data = res2.data.projects;
            pList.count = res1.data.projCount;
            dispatch({ type: PLSuc, payload: pList });
            dispatch({ type: PSuc });
        } else dispatch({ type: PErr });
    } catch { dispatch({ type: GPErr }); }
};