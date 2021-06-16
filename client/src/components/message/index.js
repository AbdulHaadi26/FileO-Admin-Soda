import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

export default ({ profile }) => {

    return <div className="message-border">
        {profile.isDisabled ? <h6>
            You wont be able to take certain actions due to non-payment. {profile.userType === 2 && <Link to={`/organization/${profile && profile.current_employer ? profile.current_employer._id : ''}/bill/list/page/0`}>Pay now</Link>}</h6> : <h6>
            Your bill payment is due. {profile.userType === 2 && <Link to={`/organization/${profile && profile.current_employer ? profile.current_employer._id : ''}/bill/list/page/0`}>Pay now</Link>}
        </h6>}
    </div>
}