import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getCat } from '../../redux/actions/userCategoryActions';
import { fetchCombined, getCatSelectU } from '../../redux/actions/userFilesActions';
import Container from '../containerUpt';
const FileList = lazy(() => import('../../components/user_files/list'));

const ListPage = ({ profile, fetchCombined, getCatSelectU, getCat, isL, isUpt, isLS, isSucS, match, isM, per, fileList }) => {
    const { id, catId, _id } = match.params;
    const [started, setStarted] = useState(0), [tabNav, setTN] = useState(0), [string, setS] = useState(''), [type, setT] = useState('All'), [isList, setISL] = useState(false);

    useEffect(() => {
        let data = { pId: _id, cat: catId, type: 'All' };
        fetchCombined(data);
        getCat(catId);
        getCatSelectU(_id, catId);
        setStarted(1);
    }, [fetchCombined, _id, catId, setStarted, getCat, getCatSelectU]);

    const onhandleS = s => setS(s);
    const onhandleT = t => setT(t);

    const getList = () => {
        let data = { pId: _id, cat: catId, type: 'All' };
        fetchCombined(data);
        getCat(catId);
        getCatSelectU(_id, catId);
        setStarted(1);
    };

    return <Container profile={profile} num={14} isSuc={!isUpt && !isL && started > 0 && !isLS && isSucS} isUpt={isUpt} isM={isM} fileList={fileList} percent={per} onSubmit={getList}>
        <FileList id={id} getList={getList} catId={catId} _id={_id} string={string} type={type} tabNav={tabNav} setTN={setTN} isList={isList} handleS={onhandleS} handleISL={setISL} handleT={onhandleT} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isLS: state.Category.isL,
        isSucS: state.Category.isSuc,
        isUpt: state.File.isUpt,
        isM: state.File.isM,
        per: state.File.per,
        fileList: state.File.fileData,
    }
}

export default connect(mapStateToProps, { getCatSelectU, fetchCombined, getCat })(ListPage);