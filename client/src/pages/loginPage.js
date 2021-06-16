import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Login from '../components/login';
import { getCurrentUser } from '../redux/actions/userActions';

const LoginPage = ({ getCurrentUser, getOrganization }) => {

    useEffect(() => {
        if (localStorage.getItem('token') !== null) {
            getCurrentUser();
        }
    }, [getCurrentUser]);

    return <div style={{ display: 'flex', alignItems: 'Center', justifyContent: 'Center', minHeight: '100vh', maxWidth: '100vw' }}> <Login /> </div>
};

export default connect(null, { getCurrentUser })(LoginPage);
