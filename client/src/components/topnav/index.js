import React, { useEffect, useRef, useState } from 'react';
import './style.css';
import Link from 'react-router-dom/Link';
import { logOut } from '../../redux/actions/userActions';
import { connect } from 'react-redux';
import User from '../../assets/static/user.png';
import Org from '../../assets/static/org.svg';
const bS = { borderBottom: 'solid 1px #dcdde1' };

const Sidenav = ({ profile, count, logOut }) => {
    const [a, setA] = useState(false);
    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setA(false);
        }
    };


    const renderNotif = () => <div className={count && count > 0 ? 'notif' : ''}>{count && count > 99 ? '99+' : count > 0 ? count : ''}</div>

    return <div className="tn-w">
        <img src={profile.current_employer && profile.current_employer.logo ? profile.current_employer.logo : Org} alt='brand' />
        <h6 className="user-org mr-auto">{profile.orgName}</h6>
        <div className="tn-pf-w">
            <div className="tns-w">
                <h6 className="user-text" onClick={e => setA(!a)}>{profile.name}</h6>
                <h6 className="user-role" onClick={e => setA(!a)}>{profile.superAdmin ? 'CAdmin' : profile.userType === 1 ? 'Project Manager' : profile.userType === 2 ? 'Administrator' : 'User'}</h6>
            </div>
            <img src={profile.image ? profile.image : User} alt='user' onClick={e => setA(!a)} />
            {renderNotif()}
        </div>
        <div ref={node} className="dropdown-content" style={{ display: `${a ? 'flex' : 'none'}` }}>
            <Link className='s-l' to='/user/profile' style={bS} onClick={e => setA(!a)}><div className="faT user-c" />User profile</Link>
            <Link className='s-l' to={`/organization/${profile.current_employer ? profile.current_employer._id : ''}/notification/list/page/0`} onClick={e => setA(!a)} style={bS}><div className="faT bell" />Notifications {renderNotif()}</Link>
            {profile.userType === 2 && <Link className="s-l" to={`/organization/${profile.current_employer ? profile.current_employer._id : ''}/support`} onClick={e => setA(!a)} style={bS}><div className="faT phone" /> Support</Link>}
            {profile.userType === 2 && <Link className="s-l" to={`/organization/${profile.current_employer ? profile.current_employer._id : ''}/settings`} onClick={e => setA(!a)} style={bS}><div className="faT cog" /> Settings</Link>}
            <Link className="s-l" to={`/organization/${profile.current_employer ? profile.current_employer._id : ''}/user/${profile._id}/favourites`} onClick={e => setA(!a)} style={bS}><div className="faT heart" /> Favourites</Link>
            <Link className="s-l" to='/login' onClick={e => profile._id && logOut()}><div className="faT sign-out" />Logout</Link>
        </div>
    </div>
}

const mapStateToProps = state => {
    return {
        count: state.NotificationCount.count
    }
}

export default connect(mapStateToProps, { logOut })(Sidenav);