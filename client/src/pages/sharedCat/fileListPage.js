import React, { lazy, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchCombined } from '../../redux/actions/userFilesActions';
import Container from '../container';
import {  getCat, updateCatShared } from '../../redux/actions/userCategoryActions';
const List = lazy(() => import('../../components/shared/fileList'));

const ListPage = ({ match, profile, isL, isSuc, getCat, fetchCombined, updateCatShared }) => {
    const { id, catId, _id } = match.params;
    const [string, setS] = useState(''), [type, setT] = useState('All'), [tabNav, setTN] = useState(0), [isList, setISL] = useState(false);

    useEffect(() => {
        const data = { pId: _id, cat: catId, type: 'All' };
        fetchCombined(data);
        getCat(catId);
        updateCatShared(catId);
    }, [fetchCombined, updateCatShared, getCat, _id, catId]);

    const onhandleS = s => setS(s);
    const onhandleT = t => setT(t);

    return <Container profile={profile} num={15} isSuc={!isL && isSuc}>
        <List id={id} catId={catId} _id={_id} string={string} type={type} tabNav={tabNav} setTN={setTN} handleS={onhandleS} handleT={onhandleT} isList={isList} handleISL={setISL} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isSuc: state.Category.isSuc
    }
}

export default connect(mapStateToProps, { fetchCombined, updateCatShared, getCat })(ListPage);