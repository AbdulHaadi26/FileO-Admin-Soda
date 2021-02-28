import React from 'react';
import PasswordReset from '../components/passwordReset';

export default ({ match }) => {
    return <div className="container-fluid">
        <div className="row">
            <PasswordReset token={match.params.token} />
        </div>
    </div>
}