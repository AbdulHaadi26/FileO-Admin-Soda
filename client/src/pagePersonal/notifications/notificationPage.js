import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getNotification } from '../../redux/actions/personal/notifActions';
import Container from '../container';
const Details = lazy(() => import('../../componentsP/notifications/details'));

const NotificationPage = ({ match, getNotification, profile, isErr, isSuc, notification }) => {
    const { _id, id } = match.params, [tabNav, setTN] = useState(0);
    useEffect(() => { getNotification(_id); }, [getNotification, _id])
    return <Container profile={profile} isSuc={isSuc && notification} isErr={isErr} eT={'Notification Not Found'} num={0}>
        <Details Notification={notification} id={_id} org={id} tabNav={tabNav} setTN={setTN} />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.Notification.isErr,
        isSuc: state.Notification.isSuc,
        notification: state.Notification.data
    }
};

export default connect(mapStateToProps, { getNotification })(NotificationPage);