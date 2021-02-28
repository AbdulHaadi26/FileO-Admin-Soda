import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchCombined } from '../../redux/actions/userCategoryActions';
import Container from '../containerUpt';
const List = lazy(() => import('../../components/user_category/list'));

const ListPage = ({ profile, fetchCombined, isL, match, isLF, isUpt, isM, per, fileList }) => {
    const { id, _id } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [type, setT] = useState('All'), [tabNav, setTN] = useState(0), [isList, setISL] = useState(false);

    useEffect(() => {
        let data = { _id: _id, type: 'All' };
        fetchCombined(data);
        setStarted(1);
    }, [_id, fetchCombined, setStarted]);

    const getList = () => {
        let data = { _id: _id, type: 'All' };
        fetchCombined(data);
    };

    const onhandleS = s => setS(s);
    const onhandleT = s => setT(s);

    return <Container profile={profile} isSuc={!isUpt && !isL && !isLF && started > 0} num={14} isUpt={isUpt} isM={isM} fileList={fileList} percent={per} onSubmit={getList}>
        <List id={id} _id={_id} string={string} tabNav={tabNav} setTN={setTN} handleS={onhandleS} getList={getList} isList={isList} handleISL={setISL} type={type} handleT={onhandleT} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Category.isL,
        isLF: state.File.isL,
        isUpt: state.File.isUpt,
        isM: state.File.isM,
        per: state.File.per,
        fileList: state.File.fileData,
    }
}

export default connect(mapStateToProps, { fetchCombined })(ListPage);