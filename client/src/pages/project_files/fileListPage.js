import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getProjectDesc } from '../../redux/actions/projectActions';
import { clearUpload, fetchCombinedP } from '../../redux/actions/project_filesActions';
import { getCatSelect } from '../../redux/actions/project_rolesAction';
import Container from '../containerUpt';
const List = lazy(() => import('../../components/project_files/list'));

const ListPage = ({ profile, fetchCombinedP, isL, isLP, getCatSelect, getProjectDesc, isLS, isSucS, match, clearUpload, per, isUpt }) => {
    const { id, catId, pId } = match.params;
    const [string, setS] = useState(''), [isList, setISL] = useState(false), [type, setT] = useState('All'), [tabNav, setTN] = useState(0);

    useEffect(() => {
        if (profile && profile.user) {
            let data = { pId: pId, cat: catId, type: 'All', auth: profile.user.userType === 1 };
            fetchCombinedP(data);
            getCatSelect(pId, catId);
            getProjectDesc(pId);
        }
    }, [fetchCombinedP, pId, catId, profile, getProjectDesc, getCatSelect]);

    const onhandleS = s => setS(s);
    const onhandleT = t => setT(t);

    const getList = () => {
        const data = { pId: pId, cat: catId, type: 'All', auth: profile.user.userType === 1 };
        fetchCombinedP(data);
        getCatSelect(pId, catId);
        clearUpload();
    };

    return <Container profile={profile} num={13} isSuc={!isL && !isLS && !isLP && isSucS && !isUpt} isUpt={isUpt} percent={per} onSubmit={getList} >
        <List getList={getList} id={id} pId={pId} catId={catId} auth={profile && profile.user && profile.user.userType === 1} isList={isList} handleISL={setISL}
            string={string} type={type} tabNav={tabNav} setTN={setTN} handleS={onhandleS} handleT={onhandleT} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isSucS: state.Category.isSuc,
        isLS: state.Category.isL,
        isLP: state.Project.isL,
        isUpt: state.File.isUpt,
        per: state.File.per,
    }
}

export default connect(mapStateToProps, { fetchCombinedP, getProjectDesc, getCatSelect, clearUpload })(ListPage);