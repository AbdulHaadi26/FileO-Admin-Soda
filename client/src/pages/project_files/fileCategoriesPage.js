import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getProjectDesc } from '../../redux/actions/projectActions';
import { fetchCombinedP } from '../../redux/actions/project_categoryActions';
import { clearUpload } from '../../redux/actions/project_filesActions';
import Container from '../containerUpt';
const List = lazy(() => import('../../components/project_files/adminCatList'));

const ListPage = ({ profile, match, fetchCombinedP, getProjectDesc, isL, isLS, isLP, isUpt, per, clearUpload }) => {
    const { id, _id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [tabNav, setTN] = useState(0), [isList, setISL] = useState(false);

    useEffect(() => {
        let data = { _id: _id };
        fetchCombinedP(data);
        getProjectDesc(_id);
        setStarted(1);
    }, [_id, fetchCombinedP, id, getProjectDesc, setStarted]);

    const onhandleS = s => setS(s);

    const getList = () => {
        let data = { _id: _id };
        fetchCombinedP(data);
        clearUpload();
    }

    return <Container profile={profile} num={13} isSuc={!isL && !isLS && !isLP && started > 0} isUpt={isUpt} percent={per} onSubmit={getList}>
        <List pId={_id} org={id} string={string}
            tabNav={tabNav} setTN={setTN} handleS={onhandleS} getList={getList}
            isList={isList} handleISL={setISL} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isLS: state.Category.isL,
        isUpt: state.File.isUpt,
        per: state.File.per,
        isLP: state.Project.isL
    }
}

export default connect(mapStateToProps, { fetchCombinedP, getProjectDesc, clearUpload })(ListPage);