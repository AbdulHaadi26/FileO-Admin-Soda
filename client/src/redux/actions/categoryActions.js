import { catConstants, employeeConstants, fileConstants } from "../constants";
import api from '../../utils/api';
import history from '../../utils/history';
import Token from './token';
import { ModalProcess } from './profileActions';
import { logOut } from "./userActions";
const { CClr, CErr, CReq, GCSuc, GCISuc, CSuc, CBread, CAddAtt, CUptAtt, CDelAtt } = catConstants;
const { ESuc, EReq, GASuc, GESuc } = employeeConstants;
const { FAddAtt, FUptAtt, FDelAtt } = fileConstants;

var empList = { data: [], count: 0 }, assgList = { data: [], count: 0 };

export const registerCat = data => async dispatch => {
    try {
        !data.skip && dispatch({ type: CReq });
        Token();
        let res = await api.put("/category/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch(ModalProcess({ title: 'Folder', text: 'Folder has been added.' }));
            dispatch({ type: CAddAtt, payload: res.data.cat });
            res.data.cat.rType = 1;
            dispatch({ type: FAddAtt, payload: res.data.cat });
        }
        else dispatch(ModalProcess({ title: 'Folder', text: 'Folder with same name already exists.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const registerCatC = data => async dispatch => {
    try {
        !data.skip && dispatch({ type: CReq });
        Token();
        var res = await api.put("/category/registerChild", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch(ModalProcess({ title: 'Folder', text: 'Folder has been added.' }));
            dispatch({ type: CAddAtt, payload: res.data.cat });
            res.data.cat.rType = 1;
            dispatch({ type: FAddAtt, payload: res.data.cat });
        }
        else dispatch(ModalProcess({ title: 'Folder', text: 'Folder with same name already exists.', isErr: true }));
    } catch (e) {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const clearCat = () => async dispatch => dispatch({ type: CClr });

export const fetchCombinedCP = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        let res = await api.get(`/category/fetchCombined`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: GCSuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getCats = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/category/getCats/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getCat = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/category/getCat/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch({ type: GCISuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const getCatC = _id => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.get(`/category/getCatC/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch({ type: GCISuc, payload: res.data });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const updateCat = data => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        var res = await api.post(`/category/updateCat`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch({ type: CUptAtt, payload: res.data.cat });
            dispatch({ type: FUptAtt, payload: res.data.cat });
            dispatch(ModalProcess({ title: 'Folder', text: 'Folder details has been updated.' }));
        } else dispatch(ModalProcess({ title: 'Folder', text: 'Folder details could not be updated.', isErr: true }));
        dispatch(clearCat());
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const deleteCat = (_id, id) => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        let res = await api.delete(`/category/deleteCat/${_id}`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Folder', text: 'Folder has been deleted.' }));
            dispatch({ type: CDelAtt, payload: { _id } });
            dispatch({ type: FDelAtt, payload: { _id } });
        }
        else dispatch(ModalProcess({ title: 'Folder', text: 'Folder could not be deleted.', isErr: true }));
        dispatch(clearCat());
        id && history.push(`/organization/${id}/category/list`);
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const registerEmp = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        let res = await api.put(`/category/assign`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'Folder Access', text: 'Folder access has been granted.' }));
        } else dispatch(ModalProcess({ title: 'Folder Access', text: 'Folder access could not be granted.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const removeEmp = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        let res = await api.put(`/category/remove`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Folder Access', text: 'Folder access has been revoked.' }));
        } else dispatch(ModalProcess({ title: 'Folder Access', text: 'Folder access could not be revoked.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const getCatSelect = (_id, catId) => async dispatch => {
    try {
        dispatch({ type: CReq });
        Token();
        let res = await api.get(`/category/getCats/${_id}`, { params: { catId }, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.catList && !res.data.error) {
            dispatch({ type: GCSuc, payload: res.data.catList });
            dispatch({ type: CSuc });
        } else dispatch({ type: CErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const registerEmpAll = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        let res = await api.put(`/category/assignAll`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'Folder Access', text: 'Folder access has been granted for all users.' }));
        } else dispatch(ModalProcess({ title: 'Folder Access', text: 'Folder access could not be granted for all users.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const removeEmpAll = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        let res = await api.put(`/category/removeAll`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'Folder Access', text: 'Folder access has been revoked for all users.' }));
        } else dispatch(ModalProcess({ title: 'Folder Access', text: 'Folder access could not be revoked for all users.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchEmp = data => async dispatch => {
    try {
        dispatch({ type: EReq });
        Token();
        const p1 = api.get(`/category/getEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/category/getEmployees", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
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
        const p1 = api.get(`/category/searchEmployeeCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/category/searchEmployees`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
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
        const p1 = api.get(`/category/getAssignedCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get("/category/getAssigned", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` }, });
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
        const p1 = api.get(`/category/searchAssignedCount`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        const p2 = api.get(`/category/searchAssigned`, { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        var [res1, res2] = [await p1, await p2];
        if (res2.data.users && res1.data.userCount !== null && !res1.data.error && !res2.data.error) {
            assgList.data = res2.data.users;
            assgList.count = res1.data.userCount;
            dispatch({ type: GESuc, payload: assgList });
            dispatch({ type: ESuc });
        } else dispatch({ type: GESuc, payload: assgList });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));;
    }
};

export const moveCat = data => async dispatch => {
    try {
        Token();
        let res = await api.post(`/category/moveCat`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.cat && !res.data.error) {
            dispatch(ModalProcess({ title: 'Folder', text: 'Company folder has been moved.' }));
        } else dispatch(ModalProcess({ title: 'Folder', text: 'Company folder with same name already exists.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const copyCat = data => async dispatch => {
    try {
        Token();
        let res = await api.post(`/category/copyFolder`, data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.success && !res.data.error) {
            dispatch(ModalProcess({ title: 'Folder', text: 'Company folder has been copied.' }));
        } else dispatch(ModalProcess({ title: 'Folder', text: 'Company folder with same name already exists.', isErr: true }));
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const fetchCatModal = data => async dispatch => {
    try {
        dispatch({ type: CBread, payload: '' });
        Token();
        let res = await api.get("/category/fetchCats", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch({ type: CBread, payload: res.data });
        }
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};
