import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Container from '../container';
import { fetchCombined } from '../../redux/actions/fvrActions';
const List = lazy(() => import('../../components/files/favrList'));

const FilePage = ({ match, profile, isL, fetchCombined }) => {
    const { id, date } = match.params;
    const [started, setStarted] = useState(0), [type, setT] = useState('All'), [s, setS] = useState(''), [tabNav, setTN] = useState(0), [isList, setISL] = useState(false);

    useEffect(() => {
        async function fetch() {
            let data = { type: 'All' };
            await fetchCombined(data);
            setStarted(1);
        }
        fetch();
    }, [fetchCombined, setStarted]);

    const onhandleT = tp => setT(tp);
    const onhandleS = s => setS(s);

    return <Container profile={profile} num={1} isSuc={!isL && started > 0}>
        <List id={id} date={date} type={type} s={s} uId={profile.user._id} tabNav={tabNav}
            setTN={setTN} handleS={onhandleS} handleT={onhandleT} isList={isList} handleISL={setISL}
        />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.File.isL
    }
}

export default connect(mapStateToProps, { fetchCombined })(FilePage);