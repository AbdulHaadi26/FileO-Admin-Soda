import { projectConstants, employeeConstants } from "../constants";
import api from '../../utils/api';
import Token from './token';
import { ModalProcess } from "./profileActions";
import { logOut } from "./userActions";
const { PErr, PReq, PSuc, PClr, PLSuc, POISuc, PDelAtt, PAddAtt, PUptAtt } = projectConstants;
const { EErr, EReq, ESuc, GEISuc, GESuc, GASuc } = employeeConstants;

var pList = {
    data: [], count: 0
};

export const clearProject = () => async dispatch => dispatch({ type: PClr });

export const registerProject = data => async dispatch => {
    try {
        dispatch({ type: PReq });
        Token();
        let res = await api.put("/project/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.project && !res.data.error) {
            dispatch(ModalProcess({ title: 'Project', text: 'Project has been added.' }));
            dispatch({ type: PAddAtt, payload: res.data.project });
        } else dispatch(ModalProcess({ title: 'Project', text: 'Project could not be added.', isErr: true }));
        dispatch(clearProject())
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchProjectM = data => async dispatch => {
    try {
        dispatch({ type: PReq });
        Token();
        let res1 = await api.get("/project/getProjectsM", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        let res2 = await api.get(`/project/getProjectCountM`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });

        if (res1.data.projects && res2.data.projCount !== null && !res1.data.error && !res2.data.error) {
            pList.data = res1.data.projects;
            pList.count = res2.data.projCount;
            dispatch({ type: PLSuc, payload: pList });
            dispatch({ type: PSuc });
        }
        else dispatch({ type: PErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchSearchProjectM = data => async dispatch => {
    try {
        dispatch({ type: PReq });
        Token();
        let res1 = await api.get("/project/searchProjectM", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        let res2 = await api.get(`/project/searchProjectCountM`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res1.data.projects && res2.data.projCount !== null && !res1.data.error && !res2.data.error) {
            pList.data = res1.data.projects;
            pList.count = res2.data.projCount;
            dispatch({ type: PLSuc, payload: pList });
            dispatch({ type: PSuc });
        }
        else dispatch({ type: PErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
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
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
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
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const updateProject = data => async dispatch => {
    try {
        dispatch({ type: PReq });
        Token();
        let res = await api.post(`/project/updateProject`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.project && !res.data.error) {
            dispatch(ModalProcess({ title: 'Project', text: 'Project details has been updated.' }));
            dispatch({ type: PUptAtt, payload: res.data.project });
        } else dispatch(ModalProcess({ title: 'Project', text: 'Project details could not be updated.', isErr: true }));
        dispatch(clearProject());
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const delProject = (_id) => async dispatch => {
    try {
        dispatch({ type: PReq });
        Token();
        let res = await api.post(`/project/deleteProject/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Project', text: 'Project has been deleted.' }));
            dispatch({ type: PDelAtt, payload: { _id } });
        }
        else dispatch(ModalProcess({ title: 'Project', text: 'Project could not bes deleted.', isErr: true }));
        dispatch(clearProject());
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

var empList = { data: [], count: 0 };

export const assignEmployee = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        let res = await api.put(`/assigned/register`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Project', text: 'Employee has been assigned to the project.' }));
        } else dispatch(ModalProcess({ title: 'Project', text: 'Employee could not be assigned to the project.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const delEmployee = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        let res = await api.post(`/assigned/deleteAssigned`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error)
            dispatch(ModalProcess({ title: 'Project', text: 'Employee has been removed from the project.' }));
        else dispatch(ModalProcess({ title: 'Project', text: 'Employee could not be removed from the project.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
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
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const fetchEmp = data => async dispatch => {

    try {
        dispatch({ type: EReq });
        Token();
        let res1 = await api.get(`/project/getEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        let res2 = await api.get("/project/getEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });

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

export const fetchEmpSearch = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        let res1 = await api.get(`/project/searchEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        let res2 = await api.get("/project/searchEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });

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

export const fetchEmpA = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        let res1 = await api.get(`/assigned/getEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        let res2 = await api.get("/assigned/getEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GESuc, payload: empList });
            dispatch({ type: ESuc });
        }
        else dispatch({ type: EErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchEmpSearchA = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        let res1 = await api.get(`/assigned/searchEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        let res2 = await api.get("/assigned/searchEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            empList.data = res2.data.users;
            empList.count = res1.data.userCount;
            dispatch({ type: GESuc, payload: empList });
            dispatch({ type: ESuc });
        }
        else dispatch({ type: EErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchProjectA = data => async dispatch => {
    try {
        dispatch({ type: PReq });
        let res1 = await api.get(`/assigned/getProjectCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        let res2 = await api.get("/assigned/getProjects", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });

        if (res2.data.projects && res1.data.projCount !== null && !res1.data.error && !res2.data.error) {
            pList.data = res2.data.projects;
            pList.count = res1.data.projCount;
            dispatch({ type: PLSuc, payload: pList });
            dispatch({ type: PSuc });
        }
        else dispatch({ type: PErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchProjSearchA = data => async dispatch => {
    try {
        dispatch({ type: PReq });
        let res1 = await api.get(`/assigned/searchProjectCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        let res2 = await api.get("/assigned/searchProjects", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res2.data.projects && res1.data.projCount !== null && !res1.data.error && !res2.data.error) {
            pList.data = res2.data.projects;
            pList.count = res1.data.projCount;
            dispatch({ type: PLSuc, payload: pList });
            dispatch({ type: PSuc });
        } else dispatch({ type: PErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};
