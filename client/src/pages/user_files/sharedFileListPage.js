import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchCombined, getCatSelect } from '../../redux/actions/userFilesActions';
import Container from '../container';
const FileList = lazy(() => import('../../components/user_files/shared_list'));

const ListPage = ({ profile, fetchCombined, getCatSelect, isL, isLS, isSucS, match }) => {
    const { id, catId, _id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [type, setT] = useState('All'), [isList, setISL] = useState(false),
        [tabNav, setTN] = useState(0);

    useEffect(() => {
        let data = { pId: _id, cat: catId, type: 'All' };
        fetchCombined(data);
        getCatSelect(_id);
        setStarted(1);
    }, [fetchCombined, _id, catId, setStarted, getCatSelect]);

    const onhandleS = s => setS(s);
    const onhandleT = t => setT(t);

    const getList = () => {
        let data = { pId: _id, cat: catId, type: 'All' };
        fetchCombined(data);
        setStarted(1);
    }

    return <Container profile={profile} num={14} isSuc={!isL && started > 0 && !isLS && isSucS}>
        <FileList id={id} getList={getList} catId={catId} _id={_id} string={string} type={type} tabNav={tabNav} setTN={setTN}
            handleS={onhandleS} handleT={onhandleT} isList={isList} handleISL={setISL} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isLS: state.Category.isL,
        isSucS: state.Category.isSuc
    }
}

export default connect(mapStateToProps, { fetchCombined, getCatSelect })(ListPage);