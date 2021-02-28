import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getNotifications } from '../redux/actions/userActions';

const Notification = ({ getNotifications }) => {

    useEffect(() => {
        var IntervalId;
        async function Notification() {
            IntervalId = setInterval(() => {
                getNotifications()
            }, 5 * 60 * 1000);
        }
        Notification();
        return () => { clearInterval(IntervalId); }
    }, [getNotifications]);

    return <></>
}

export default connect(null, { getNotifications })(Notification);