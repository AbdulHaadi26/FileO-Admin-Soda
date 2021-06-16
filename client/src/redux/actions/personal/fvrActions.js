import { fileConstants } from "../../constants";
import api from '../../../utils/apiP';
import Token from '../token';
import { ModalProcess } from "../profileActions";
import { logOut } from "../userActions";
const { FReq, FErr, FSuc, GFSuc } = fileConstants;

export const AddToF = data => async dispatch => {
    try {
        Token();
        let res = await api.post("/favourite/register", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Favorites', text: 'File has been added to favorites.' }));
            dispatch({ type: fileConstants.AddToF });
        } else {
            dispatch(ModalProcess({ title: 'Favorites', text: 'File could not be added to favorites.' }));
        }

    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const DelToF = data => async dispatch => {
    try {
        Token();
        let res = await api.post("/favourite/delete", data, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (!res.data.error) {
            dispatch(ModalProcess({ title: 'Favorites', text: 'File has been removed from favorites.' }));
            dispatch({ type: fileConstants.DelToF });
        } else {
            dispatch(ModalProcess({ title: 'Favorites', text: 'File could not be removed from favorites.' }));
        }
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}

export const fetchCombined = data => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        let res = await api.get("/favourite/getCombined", { params: data, headers: { 'authorization': `${localStorage.getItem('token')}` } });
    
        if (!res.data.error) {
            dispatch({ type: GFSuc, payload: res.data });
            dispatch({ type: FSuc });
        }
        else dispatch({ type: FErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};
