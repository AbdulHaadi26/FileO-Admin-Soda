import { fileConstants } from "../../constants";
import api from '../../../utils/apiP';
import Token from '../token';
import { ModalProcess } from "../profileActions";
import { logOut } from "../userActions";
const {  FErr, FSuc, FReq, GFISuc } = fileConstants;


export const fetchFileD = () => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        const res = await api.get("/file/getAllFiles", { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.files && !res.data.error) {
            dispatch({ type: GFISuc, payload: res.data });
            dispatch({ type: FSuc });
        }
        else dispatch({ type: FErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
};

export const getRecentFileDate = () => async dispatch => {
    try {
        dispatch({ type: FReq });
        Token();
        var res = await api.get(`/account/recentFilesDate`, { headers: { 'authorization': `${localStorage.getItem('token')}` } });
        if (res.data.files && !res.data.error) {
            dispatch({ type: GFISuc, payload: res.data });
            dispatch({ type: FSuc });
        } else dispatch({ type: FErr });
    } catch {
        dispatch(logOut());
        dispatch(ModalProcess({ title: 'Session', text: 'Your session has expired. Please login again.', isErr: true }));
    }
}