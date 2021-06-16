import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { fetchNotification, fetchRequests } from '../../redux/actions/notifActions';
import { getNotifications } from '../../redux/actions/userActions';
import Container from '../container';
const List = lazy(() => import('../../components/notifications/list'));

const ListPage = ({ match, profile, isL, fetchNotification, getNotifications, fetchRequests }) => {
    const { id, num } = match.params;
    const [started, setStarted] = useState(0), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [tabNav, setTN] = useState(Number(num)),
        [limitMult2, setLM2] = useState(0), [limit2, setL2] = useState(12);

    useEffect(() => {
        setTN(Number(num));

        async function fetch() {
            if (Number(num) === 0) {
                await fetchNotification({ limit: 0 });
                getNotifications();
            } else {
                await fetchRequests({ limit: 0 });
            }
            setStarted(1);
        }
        fetch();
    }, [fetchNotification, getNotifications, fetchRequests, setStarted, num]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);

    const onhandleL2 = n => setL2(n);
    const onhandleLM2 = n => setLM2(n);


    return <Container profile={profile} isSuc={!isL && started > 0} num={0}> <List id={id} limit={limit} tabNav={tabNav}
        setTN={setTN} limitMult={limitMult} handleL={onhandleL} handleLM={onhandleLM} auth={profile && profile.user && profile.user.userType === 2}
        limit2={limit2} limitMult2={limitMult2} handleL2={onhandleL2} handleLM2={onhandleLM2} /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Notification.isL
    }
}

export default connect(mapStateToProps, { fetchNotification, fetchRequests, getNotifications })(ListPage);