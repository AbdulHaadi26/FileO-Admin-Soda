import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchCombinedCPC } from '../../redux/actions/fileActions';
import Container from '../containerUpt';
import { getCatSelect } from '../../redux/actions/rolesAction';
const List = lazy(() => import('../../components/files/list'));

const ListPage = ({ match, profile, fetchCombinedCPC, isL, isLS, isSucS, getCatSelect, isUpt, per }) => {
    const { id, catId } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [type, setT] = useState('All'), [tabNav, setTN] = useState(0), [isList, setISL] = useState(false);

    useEffect(() => {
        let data = { _id: id, catId: catId, type: 'All', auth: profile.user.userType === 2 };
        fetchCombinedCPC(data);
        getCatSelect(id, catId);
        setStarted(1);
    }, [fetchCombinedCPC, profile, id, catId, setStarted, getCatSelect]);

    const onhandleS = s => setS(s);
    const onhandleT = t => setT(t);

    const getList = () => {
        let data = { _id: id, catId: catId, type: 'All', auth: profile.user.userType === 2 };
        fetchCombinedCPC(data);
        getCatSelect(id, catId);
        setStarted(1);
    }

    return <Container profile={profile} isSuc={!isL && started > 0 && !isLS && isSucS} num={9}  isUpt={isUpt} percent={per} onSubmit={getList}>
        <List getList={getList} id={id} catId={catId} auth={profile.user.userType === 2} uId={profile.user._id} type={type} string={string}
            tabNav={tabNav} setTN={setTN} handleS={onhandleS} handleT={onhandleT} isList={isList} handleISL={setISL} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL,
        isLS: state.Category.isL,
        isSucS: state.Category.isSuc,
        isUpt: state.File.isUpt,
        per: state.File.per
    }
}

export default connect(mapStateToProps, { fetchCombinedCPC, getCatSelect })(ListPage);