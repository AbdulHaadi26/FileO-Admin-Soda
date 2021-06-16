import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchCombinedCPC } from '../../redux/actions/fileActions';
import Container from '../containerUpt';
import { getCatC } from '../../redux/actions/categoryActions';
const List = lazy(() => import('../../components/files/list'));

const ListPage = ({ match, profile, fetchCombinedCPC, isL, isLS, isUpt, per, getCatC }) => {
    const { id, catId } = match.params;
    const [started, setStarted] = useState(0), [string, setS] = useState(''), [type, setT] = useState('All'), [tabNav, setTN] = useState(0), [isList, setISL] = useState(false);

    useEffect(() => {
        async function fetch() {
            let data = { _id: id, catId: catId, type: 'All', auth: profile.user.userType === 2 };
            await fetchCombinedCPC(data);
            getCatC(catId);
            setStarted(1);
        }

        fetch();
    }, [fetchCombinedCPC, profile, id, catId, getCatC, setStarted]);

    const onhandleS = s => setS(s);
    const onhandleT = t => setT(t);

    const getList = async () => {
        let data = { _id: id, catId: catId, type: 'All', auth: profile.user.userType === 2 };
        await fetchCombinedCPC(data);
        setStarted(1);
    }

    return <Container profile={profile} isSuc={!isL && started > 0 && !isLS} num={9} isUpt={isUpt} percent={per} onSubmit={getList}>
        <List getList={getList} id={id} catId={catId} auth={profile.user.userType === 2} uId={profile.user._id} type={type} string={string}
            tabNav={tabNav} setTN={setTN} handleS={onhandleS} handleT={onhandleT} isList={isList} handleISL={setISL}
            disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled} /> </Container>
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
};

export default connect(mapStateToProps, { fetchCombinedCPC, getCatC })(ListPage);