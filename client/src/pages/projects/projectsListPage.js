import React, { lazy, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchProjectM, fetchProjectA } from '../../redux/actions/projectActions';
import Container from '../container';
const PList = lazy(() => import('../../components/project/list'));
const UserList = lazy(() => import('../../components/project/projectListUser'));

const ListPage = ({ match, profile, isL, fetchProjectM, fetchProjectA }) => {
    const { id } = match.params;
    const [started, setStarted] = useState(0), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [tabNav, setTN] = useState(0),
        [string, setS] = useState(''), [isList, setISL] = useState(false);

    useEffect(() => {
        async function fetch() {
            let data;
            if (profile && profile.user) {
                if (profile.user.userType === 1) {
                    data = { limit: 0, mId: profile.user._id };
                    await fetchProjectM(data);
                } else {
                    data = { limit: 0, uId: profile.user._id };
                    await fetchProjectA(data);
                }
            }
            setStarted(1);
        };

        fetch();
    }, [fetchProjectM, fetchProjectA, profile, setStarted]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);
    const onhandleS = s => setS(s);

    return <Container profile={profile} num={13} isSuc={!isL && started > 0}>
        {profile.user.userType === 1 ?
            <PList tabNav={tabNav} setTN={setTN} orgName={profile.user.orgName} userId={profile.user._id} org={id} limit={limit}
                limitMult={limitMult} string={string} handleS={onhandleS} handleLM={onhandleLM} handleL={onhandleL}
                isList={isList} setISL={setISL} disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled} /> :
            <UserList tabNav={tabNav} setTN={setTN} userId={profile.user._id} org={id} limit={limit} limitMult={limitMult}
                string={string} handleS={onhandleS} handleLM={onhandleLM} handleL={onhandleL} isList={isList} setISL={setISL} />}
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Project.isL
    }
}

export default connect(mapStateToProps, { fetchProjectM, fetchProjectA })(ListPage);