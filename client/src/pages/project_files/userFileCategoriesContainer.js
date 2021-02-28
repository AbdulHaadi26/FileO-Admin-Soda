import React, { lazy, useEffect } from 'react';
import { connect } from 'react-redux';
import { getProjectDesc } from '../../redux/actions/projectActions';
const List = lazy(() => import('../../components/project_files/userCatList'));

const ListPage = ({ id, getProjectDesc, tabNav, setTN, org, emp, started, onStart, isList, handleISL, string, onhandleS }) => {

    useEffect(() => {
        if (emp) {
            let { userRoles, projId } = emp;
            let cats = [];
            if (userRoles && userRoles.length > 0) {
                userRoles.map(i => cats = cats.concat(i.category))
                cats = Array.from(new Set(cats));
            }

            started === 0 && onStart();
            started === 0 && getProjectDesc(projId);
        }
    }, [emp, onStart, id, getProjectDesc, started]);

    return started > 0 ? <List id={id} org={org} emp={emp} string={string}
        handleS={onhandleS} handleISL={handleISL} isList={isList} tabNav={tabNav} setTN={setTN} /> : <></>

}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data
    }
}

export default connect(mapStateToProps, {  getProjectDesc })(ListPage);