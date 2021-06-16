import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchCombined } from '../../redux/actions/clientCategoryAction';
import Container from '../container';
const List = lazy(() => import('../../components/client_category/list'));

const ListPage = ({ profile, fetchCombined, isL, isLF, match }) => {
    const { id, _id } = match.params, [tabNav, setTN] = useState(0), [string, setS] = useState(''), [started, setStarted] = useState(0), [type, setT] = useState('All'), [isList, setISL] = useState(false);

    useEffect(() => {
        async function fetch() {
            let data = { _id: _id, type: 'All' };
            await fetchCombined(data);
            setStarted(1);
        };

        fetch();
    }, [_id, fetchCombined, setStarted]);

    const onhandleS = s => setS(s);
    const onhandleT = t => setT(t);

    return <Container profile={profile} isSuc={!isL && !isLF && started > 0} num={17}>
        <List id={id} _id={_id} disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled}
            tabNav={tabNav} setTN={setTN} string={string} pId={_id} handleS={onhandleS} type={type} handleT={onhandleT} isList={isList} handleISL={setISL}
        />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Category.isL,
        isLF: state.File.isL
    }
}

export default connect(mapStateToProps, { fetchCombined })(ListPage);