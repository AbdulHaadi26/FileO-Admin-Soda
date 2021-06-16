import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { fetchNotification, fetchRequests } from '../../redux/actions/personal/notifActions';
import { getNotifications } from '../../redux/actions/personal/userActions';
import Container from '../container';
const List = lazy(() => import('../../componentsP/notifications/list'));

const ListPage = ({ match, profile, isL, fetchNotification, getNotifications, fetchRequests }) => {
    const { id, num } = match.params;
    const [started, setStarted] = useState(0), [limitMult, setLM] = useState(0), [limit, setL] = useState(12), [tabNav, setTN] = useState(Number(num));

    useEffect(() => {
        setTN(Number(num));

        async function fetch() {
            if (Number(num) === 0) {
                await fetchNotification({ limit: 0 });
                getNotifications();
            }
            setStarted(1);
        }
        fetch();
    }, [fetchNotification, getNotifications, fetchRequests, setStarted, num]);

    const onhandleL = n => setL(n);
    const onhandleLM = n => setLM(n);

    return <Container profile={profile} isSuc={!isL && started > 0} num={0}> <List id={id} limit={limit} tabNav={tabNav}
        setTN={setTN} limitMult={limitMult} handleL={onhandleL} handleLM={onhandleLM} auth={profile && profile.user && profile.user.userType === 2}
    /> </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isL: state.Notification.isL
    }
}

export default connect(mapStateToProps, { fetchNotification, fetchRequests, getNotifications })(ListPage);