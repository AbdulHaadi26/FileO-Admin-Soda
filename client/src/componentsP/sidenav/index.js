import React, { useState, useEffect, useRef } from 'react';
import Link from 'react-router-dom/Link';
import { logOut } from '../../redux/actions/personal/userActions';
import ProfileUser from '../../assets/static/user.png';
import { connect } from 'react-redux';
import Logo from '../../assets/logo.svg';
import './style.css';
import { getAllCounts } from '../../redux/actions/personal/userActions';

const SideNav = ({
    num, User, getAllCounts, countFS, countPr, logOut
}) => {

    const { _id } = User;
    let profile = User;
    const [width, setWidth] = useState(0), [isN, setN] = useState(false), [a, setA] = useState(false);

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    });

    const updateWindowDimensions = () => setWidth(window.innerWidth);

    useEffect(() => {
        getAllCounts();
    }, [getAllCounts]);

    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setA(false);
        }
    };


    const renderNotif = (count) => <div className={count && count > 0 ? 'notifS' : ''}>{count && count > 99 ? '99+' : count > 0 ? count : ''}</div>

    const RenderUserLinks = (id) => <>
        <Link className={`s-l ${num === 18 && 'a'}`} to={`/personal/all/files/page/0`} onClick={e => {
            setN(false);
        }}><div className="fa files" />All Files</Link>
        <Link className={`s-l ${num === 14 && 'a'}`} to={`/personal/myspace/user/${id}/category/list`} onClick={e => {
            setN(false);
        }}><div className="fa astr" />
            <span style={{ position: 'relative' }}>My Space</span>

        </Link>
        <Link className={`s-l ${num === 20 && 'a'}`} to={`/personal/myspace/user/${id}/plan/list`} onClick={e => setN(false)}><div className="fa plans" />My Plans</Link>
        <Link className={`s-l ${num === 17 && 'a'}`} to={`/personal/user/${id}/clients/category/list`} onClick={e => {
            setN(false);
        }}><div className="fa cloud" />
            <span style={{ position: 'relative' }}>External Uploads {renderNotif(countFS)}</span>

        </Link>
        <Link className={`s-l ${num === 11 && 'a'}`} to={`/personal/files/recent/page/0`} onClick={e => {
            setN(false);
        }}><div className="fa clock" />Recent</Link>
    </>

    return width === 0 || width >= 992 ? <div className="col-lg-2 p-0 u-s-w">
        <div className="logo-user">
            <img src={Logo} style={{ borderRadius: '0px' }} alt="File Logo" className="logo" />
            <h3 className="h">File-O</h3>
        </div>
        <div style={{ width: '100%', padding: '0px 15px 36px 15px' }}>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#ecf0f1' }}></div>
        </div>
        <div style={{ width: '100%', padding: '0px 15px 0px 15px', margin: '0px 0px 36px 0px' }}>
            <div className="user-p" style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                    <div className={countPr && countPr > 0 ? 'notifS' : ''} style={{ top: '-4px', right: '-4px' }}>{countPr && countPr > 99 ? '99+' : countPr > 0 ? countPr : ''}</div>
                    <img src={profile && profile.image ? profile.image : ProfileUser} alt='user' />
                </div>
                <h6 className="user-text">{profile.name}</h6>
                <div className="elipsis" onClick={e => setA(!a)}></div>
                <div ref={node} className="dropdown-content-s" style={{ display: `${a ? 'flex' : 'none'}`, maxHeight: '600px', top: '12px', righ: '-200px' }}>
                    <h6 className="user-text" style={{ padding: '16px 12px', fontWeight: '600', marginLeft: 'auto', marginRight: 'auto' }} onClick={e => setA(!a)}>{profile.superAdmin ? 'CAdmin' : profile.userType === 1 ? 'Project Manager' : profile.userType === 2 ? 'Administrator' : 'User'}</h6>
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#ecf0f1' }}></div>
                    <Link className='s-la' to='/user/profile' onClick={e => setA(!a)}>User profile</Link>
                    <Link className='s-la' to={`/personal/notification/list/page/0`} onClick={e => setA(!a)}>Notifications {renderNotif()}</Link>
                     <Link className='s-la' to={`/personal/bill/list/page/0`}
                            onClick={e => setA(!a)}>Billing</Link>
                    <h6 className="s-la" style={{ cursor: 'pointer' }} onClick={e => {
                        setA(!a);
                        window.open(`https://api.whatsapp.com/send?phone=+923108994313`);
                    }}>Technical Support</h6>
                    <Link className="s-la" to={`/personal/user/${profile._id}/favourites`} onClick={e => setA(!a)}>Favourites</Link>
                    <Link className="s-la" to='/login' onClick={e => profile._id && logOut()}>Logout</Link>
                </div>
            </div>
        </div>
        <div style={{ width: '100%', padding: '0px 15px 24px 15px' }}>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#ecf0f1' }}></div>
        </div>
        <div className="us-container">
            <Link className={`s-l ${num === 0 ? 'a' : ''}`} to='/user/dashboard' onClick={e => {
            }}> <div className="fa feed" />Home</Link>
            {RenderUserLinks(_id)}
        </div>
    </div> : <div className={`u-s-w p-0 ${isN ? 'abst' : ''}`}>
        <div className="logo-user">
            <img src={Logo} alt="File Logo" className="logo" />
            <h3 className="h mr-auto">File-O</h3>
            <button className="btn btnBurger" onClick={e => {
                setN(!isN);
            }}> <div className="menu" /></button>
        </div>
        {isN && <div className="animated fadeIn faster">
        <div style={{ width: '100%', padding: '0px 15px 0px 15px', margin: '0px 0px 36px 0px' }}>
            <div className="user-p" style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                    <div className={countPr && countPr > 0 ? 'notifS' : ''} style={{ top: '-4px', right: '-4px' }}>{countPr && countPr > 99 ? '99+' : countPr > 0 ? countPr : ''}</div>
                    <img src={profile && profile.image ? profile.image : ProfileUser} alt='user' />
                </div>
                <h6 className="user-text">{profile.name}</h6>
                <div className="elipsis" onClick={e => setA(!a)}></div>
                <div ref={node} className="dropdown-content-s" style={{ display: `${a ? 'flex' : 'none'}`, maxHeight: '600px', top: '12px', righ: '-200px' }}>
                    <h6 className="user-text" style={{ padding: '16px 12px', fontWeight: '600', marginLeft: 'auto', marginRight: 'auto' }} onClick={e => setA(!a)}>{profile.superAdmin ? 'CAdmin' : profile.userType === 1 ? 'Project Manager' : profile.userType === 2 ? 'Administrator' : 'User'}</h6>
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#ecf0f1' }}></div>
                    <Link className='s-la' to='/user/profile' onClick={e => setA(!a)}>User profile</Link>
                    <Link className='s-la' to={`/personal/notification/list/page/0`} onClick={e => setA(!a)}>Notifications {renderNotif()}</Link>
                    <Link className='s-la' to={`/personal/bill/list/page/0`}
                            onClick={e => setA(!a)}>Billing</Link>
                    <h6 className="s-la" style={{ cursor: 'pointer' }} onClick={e => {
                        setA(!a);
                        window.open(`https://api.whatsapp.com/send?phone=+923108994313`);
                    }}>Technical Support</h6>
                    <Link className="s-la" to={`/personal/user/${profile._id}/favourites`} onClick={e => setA(!a)}>Favourites</Link>
                    <Link className="s-la" to='/login' onClick={e => profile._id && logOut()}>Logout</Link>
                </div>
            </div>
        </div>
            <Link className={`s-l ${num === 0 ? 'a' : ''}`} to='/user/dashboard' onClick={e => {
                setN(false);
            }}> <div className="fa feed" />Home</Link>
            {RenderUserLinks(_id)}
        </div>}
    </div>
}


const mapStateToProps = state => {
    return {
        count: state.Note.count,
        countFS: state.File.countFS
    }
};

export default connect(mapStateToProps, {
    logOut, getAllCounts
})(SideNav);