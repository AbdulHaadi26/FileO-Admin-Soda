import { rolesConstants, userConstants, catConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from "./profileActions";
const { RClr, RErr, RReq, RSuc, GRISuc, GRSuc } = rolesConstants;
const { CErr, CReq, CSuc, GCSuc } = catConstants;
const { GPErr } = userConstants;

export const registerRole = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        var res = await api.put("/project_roles/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.role && !res.data.error) {
            dispatch(ModalProcess({ title: 'Project Role', text: 'Project role details has been added.' }));
            history.push(`/organization/${data._id}/projects/${data.pId}/role/list`);
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const clearRole = () => async dispatch => dispatch({ type: RClr });

export const fetchRoles = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        var res = await api.get(`/project_roles/fetchRoles`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.roleList && !res.data.error) {
            dispatch({ type: GRSuc, payload: res.data });
            dispatch({ type: RSuc });
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const fetchRolesSearch = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        var res = await api.get(`/project_roles/fetchRolesSearch`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.roleList && !res.data.error) {
            dispatch({ type: GRSuc, payload: res.data });
            dispatch({ type: RSuc });
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const getRole = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        var res = await api.get(`/project_roles/getRole`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
        if (res.data.role && !res.data.error) {
            dispatch({ type: GRISuc, payload: res.data });
            dispatch({ type: RSuc });
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateRole = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        var res = await api.post(`/project_roles/updateRole`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.role && !res.data.error) {
            dispatch({ type: GRISuc, payload: res.data });
            dispatch({ type: RSuc });
            dispatch(ModalProcess({ title: 'Project Role', text: 'Project role details has been updated.' }));
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const updateRoleCat = data => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        var res = await api.post(`/project_roles/updateRolesCat`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.role && !res.data.error) {
            dispatch({ type: GRISuc, payload: res.data });
            dispatch({ type: RSuc });
            dispatch(ModalProcess({ title: 'Project Role', text: 'Project role details has been updated.' }));
        } else dispatch({ type: RErr });
    } catch { dispatch({ type: GPErr }); }
}

export const getCatSelect = (_id, catId) => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/project_category/getCats/${_id}`, { params: { catId }, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data.catList });
            dispatch({ type: CSuc })
        } else dispatch({ type: CErr });
    } catch { dispatch({ type: GPErr }); }
}

export const deleteRole = (_id, id, pId) => async dispatch => {
    try {
        dispatch({ type: RReq });
        Token();
        await api.post(`/project_roles/deleteRole/${_id}`, '', { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        dispatch(ModalProcess({ title: 'Project Role', text: 'Project role has been deleted.' }));
        history.push(`/organization/${id}/projects/${pId}/role/list`);
    } catch { dispatch({ type: GPErr }); }
}