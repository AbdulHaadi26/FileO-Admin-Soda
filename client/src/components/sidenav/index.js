import React, { useState, useEffect, useRef } from 'react';
import Link from 'react-router-dom/Link';
import ProfileUser from '../../assets/static/user.png';
import { logOut } from '../../redux/actions/userActions';
import { connect } from 'react-redux';
import Logo from '../../assets/logo.svg';
import './style.css';
import { getAllCounts } from '../../redux/actions/profileActions';

const SideNav = ({
    num, User, getAllCounts, count, countC, countF, countN, countFS, countT, Tcount, countM, countPr, countP, logOut
}) => {

    let profile = User;

    const { userType, current_employer, _id, clientView } = User;
    const [width, setWidth] = useState(0), [isN, setN] = useState(false), [a, setA] = useState(false);

    let countSum = countC + countF + countN + countT;

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    });

    const updateWindowDimensions = () => setWidth(window.innerWidth);

    useEffect(() => {
        getAllCounts()
    }, [getAllCounts]);


    const renderNotif = (count) => <div className={count && count > 0 ? 'notifS' : ''}>{count && count > 99 ? '99+' : count > 0 ? count : ''}</div>

    const RenderAdminLinks = (_id, id) => <>
        <Link className={`s-l ${num === 3 && 'a'}`} to={`/organization/detail/${_id}`} onClick={e => setN(false)}><div className="fa org" />Organization</Link>
        <Link className={`s-l ${num === 4 && 'a'}`} to={`/organization/${_id}/employee/search`} onClick={e => setN(false)}><div className="fa emp" />Users</Link>
        <Link className={`s-l ${num === 18 && 'a'}`} to={`/organization/${_id}/all/files/page/0`} onClick={e => {
            setN(false);
        }}><div className="fa files" />All Files</Link>
        <Link className={`s-l ${num === 9 && 'a'}`} to={`/organization/${_id}/files/categories`} onClick={e => setN(false)}><div className="fa file" />Admin Files</Link>
        <Link className={`s-l ${num === 13 && 'a'}`} to={`/organization/${_id}/user/${id}/projects/list`} onClick={e => setN(false)}><div className="fa proj" />Projects</Link>
        <Link className={`s-l ${num === 14 && 'a'}`} to={`/organization/${_id}/myspace/user/${id}/category/list`} onClick={e => {
            setN(false);
        }}><div className="fa astr" />
            <span style={{ position: 'relative' }}>My Space {renderNotif(countM)}</span>

        </Link>
        <Link className={`s-l ${num === 16 && 'a'}`} to={`/organization/${_id}/myspace/user/${id}/notes/list/page/0`} onClick={e => {
            setN(false);
        }}><div className="fa sn" />
            <span style={{ position: 'relative' }}>Team Up{renderNotif(count)}</span>

        </Link>
        <Link className={`s-l ${num === 20 && 'a'}`} to={`/organization/${_id}/myspace/user/${id}/plan/list`} onClick={e => setN(false)}><div className="fa plans" />My Plans</Link>
        <Link className={`s-l ${num === 15 && 'a'}`} to={`/organization/${_id}/user/${id}/shared/files/page/0`} onClick={e => {
            setN(false);
        }}><div className="fa share" />
            <span style={{ position: 'relative' }}>Shared{renderNotif(countSum)}</span>

        </Link>
        <Link className={`s-l ${num === 17 && 'a'}`} to={`/organization/${_id}/user/${id}/clients/category/list`} onClick={e => {
            setN(false);
        }}><div className="fa cloud" />
            <span style={{ position: 'relative' }}>Clients Requests{renderNotif(countFS)}</span>

        </Link>
        <Link className={`s-l ${num === 10 && 'a'}`} to={`/organization/${_id}/data/transfer/list`} onClick={e => setN(false)}><div className="fa transfer" />Data Transfer</Link>
        <Link className={`s-l ${num === 11 && 'a'}`} to={`/organization/${_id}/files/recent/page/0`} onClick={e => {
            setN(false);
        }}><div className="fa clock" />Recent</Link>
        <Link className={`s-l ${num === 24 && 'a'}`} to={`/organization/${_id}/poll/list/page/0`} onClick={e => {
            setN(false);
        }}><div className="fa poll" /><span style={{ position: 'relative' }}>Polling{userType < 2 && renderNotif(countP)}</span></Link>
        <div style={{ width: '100%', height: '80px' }}></div>
    </>

    const RenderUserLinks = (_id, id, cv) => <>
        <Link className={`s-l ${num === 18 && 'a'}`} to={`/organization/${_id}/all/files/page/0`} onClick={e => {
            setN(false);
        }}><div className="fa files" />All Files</Link>
        <Link className={`s-l ${num === 9 && 'a'}`} to={`/organization/${_id}/files/categories`} onClick={e => setN(false)}><div className="fa file" />Admin Files</Link>
        <Link className={`s-l ${num === 13 && 'a'}`} to={`/organization/${_id}/user/${id}/projects/list`} onClick={e => setN(false)}><div className="fa proj" />Projects</Link>
        <Link className={`s-l ${num === 14 && 'a'}`} to={`/organization/${_id}/myspace/user/${id}/category/list`} onClick={e => {
            setN(false);
        }}><div className="fa astr" />
            <span style={{ position: 'relative' }}>My Space{renderNotif(countM)}</span>

        </Link>
        <Link className={`s-l ${num === 16 && 'a'}`} to={`/organization/${_id}/myspace/user/${id}/notes/list/page/0`} onClick={e => {
            setN(false);
        }}><div className="fa sn" />
            <span style={{ position: 'relative' }}>Team Up{renderNotif(count + Tcount)}</span>

        </Link>
        <Link className={`s-l ${num === 20 && 'a'}`} to={`/organization/${_id}/myspace/user/${id}/plan/list`} onClick={e => setN(false)}><div className="fa plans" />My Plans</Link>
        <Link className={`s-l ${num === 15 && 'a'}`} to={`/organization/${_id}/user/${id}/shared/files/page/0`} onClick={e => {
            setN(false);
        }}><div className="fa share" />
            <span style={{ position: 'relative' }}>Shared{renderNotif(countSum)}</span>

        </Link>
        {cv && <Link className={`s-l ${num === 17 && 'a'}`} to={`/organization/${_id}/user/${id}/clients/category/list`} onClick={e => {
            setN(false);
        }}><div className="fa cloud" />
            <span style={{ position: 'relative' }}>Clients Requests{renderNotif(countFS)}</span>

        </Link>}
        <Link className={`s-l ${num === 11 && 'a'}`} to={`/organization/${_id}/files/recent/page/0`} onClick={e => {
            setN(false);
        }}><div className="fa clock" />Recent</Link>
        <Link className={`s-l ${num === 24 && 'a'}`} to={`/organization/${_id}/poll/list/page/0`} onClick={e => {
            setN(false);
        }}><div className="fa poll" /><span style={{ position: 'relative' }}>Polling{userType < 2 && renderNotif(countP)}</span></Link>
    </>

    const node = useRef({});

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, true);
    }, []);

    const handleClick = e => {
        if (node && node.current && !node.current.contains(e.target)) {
            setA(false);
        }
    };


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
                    <Link className='s-la' to={`/organization/${profile.current_employer ? profile.current_employer._id : ''}/notification/list/page/0`} onClick={e => setA(!a)}>Notifications {renderNotif()}</Link>
                    {profile.userType === 2 &&
                        <Link className='s-la' to={`/organization/${profile && profile.current_employer._id ? profile.current_employer._id : ''}/bill/list/page/0`}
                            onClick={e => setA(!a)}>Billing</Link>
                    } <h6 className="s-la" style={{ cursor: 'pointer' }} onClick={e => {
                        setA(!a);
                        window.open(`https://api.whatsapp.com/send?phone=+923108994313`);
                    }}>Technical Support</h6>
                    {profile.userType === 2 && <Link className="s-la" to={`/organization/${profile.current_employer ? profile.current_employer._id : ''}/settings`} onClick={e => setA(!a)}>Settings</Link>}
                    <Link className="s-la" to={`/organization/${profile.current_employer ? profile.current_employer._id : ''}/user/${profile._id}/favourites`} onClick={e => setA(!a)}>Favourites</Link>
                    <Link className="s-la" to='/login' onClick={e => profile._id && logOut()}>Logout</Link>
                </div>
            </div>
        </div>
        <div style={{ width: '100%', padding: '0px 15px 24px 15px' }}>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#ecf0f1' }}></div>
        </div>
        <div className="us-container">
            <Link className={`s-l ${num === 0 ? 'a' : ''}`} to='/user/dashboard' onClick={e => {
            }}> <div className="fa feed" />Dashboard</Link>
            {userType === 2 ? RenderAdminLinks(current_employer._id, _id) : RenderUserLinks(current_employer._id, _id, clientView)}
        </div>
    </div> : <div className={`u-s-w p-0 ${isN ? 'abst' : ''}`}>
        <div className="logo-user">
            <img src={Logo} alt="File Logo" style={{ borderRadius: '0px' }} className="logo" />
            <h3 className="h mr-auto">File-O</h3>
            <button className="btn btnBurger" onClick={e => {
                setN(!isN);
            }}> <div className="menu" /></button>
        </div>

        {isN && <>
            <div style={{ width: '100%', padding: '0px 15px 36px 15px' }}>
                <div style={{ width: '100%', height: '1px', backgroundColor: '#ecf0f1' }}></div>
            </div>
            <div style={{ width: '100%', padding: '0px 15px 0px 15px', margin: '0px 0px 36px 0px' }}>
                <div className="user-p" style={{ position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                        <div className={countPr && countPr > 0 ? 'notifS' : ''} style={{ top: '-4px', right: '-4px' }}>{countPr && countPr > 99 ? '99+' : countPr > 0 ? countPr : ''}</div>
                        <img src={profile.image ? profile.image : ProfileUser} alt='user' />
                    </div>
                    <h6 className="user-text">{profile.name}</h6>
                    <div className="elipsis" onClick={e => setA(!a)}></div>
                    <div ref={node} className="dropdown-content-s" style={{ display: `${a ? 'flex' : 'none'}`, maxHeight: '600px', top: '12px', righ: '-200px' }}>
                        <h6 className="user-text" style={{ padding: '16px 12px', fontWeight: '600' }} onClick={e => setA(!a)}>{profile.superAdmin ? 'CAdmin' : profile.userType === 1 ? 'Project Manager' : profile.userType === 2 ? 'Administrator' : 'User'}</h6>
                        <div style={{ width: '100%', height: '1px', backgroundColor: '#ecf0f1' }}></div>
                        <Link className='s-la' to='/user/profile' onClick={e => setA(!a)}>User profile</Link>
                        <Link className='s-la' to={`/organization/${profile.current_employer ? profile.current_employer._id : ''}/notification/list/page/0`} onClick={e => setA(!a)}>Notifications {renderNotif()}</Link>
                        {profile.userType === 2 &&
                            <Link className='s-la' to={`/organization/${profile && profile.current_employer._id ? profile.current_employer._id : ''}/bill/list/page/0`}
                                onClick={e => setA(!a)}>Billing</Link>
                        } <h6 className="s-la" onClick={e => {
                            setA(!a);
                            window.open(`https://api.whatsapp.com/send?phone=+923108994313`);
                        }}>Technical Support</h6>
                        {profile.userType === 2 && <Link className="s-la" to={`/organization/${profile.current_employer ? profile.current_employer._id : ''}/settings`} onClick={e => setA(!a)}>Settings</Link>}
                        <Link className="s-la" to={`/organization/${profile.current_employer ? profile.current_employer._id : ''}/user/${profile._id}/favourites`} onClick={e => setA(!a)}>Favourites</Link>
                        <Link className="s-la" to='/login' onClick={e => profile._id && logOut()}>Logout</Link>
                    </div>
                </div>
            </div>
            <div style={{ width: '100%', padding: '0px 15px 24px 15px' }}>
                <div style={{ width: '100%', height: '1px', backgroundColor: '#ecf0f1' }}></div>
            </div>
            <div className="animated fadeIn faster">
                <Link className={`s-l ${num === 0 ? 'a' : ''}`} to='/user/dashboard' onClick={e => {
                    setN(false);
                }}> <div className="fa feed" />Dashboard</Link>
                {userType === 2 ? RenderAdminLinks(current_employer._id, _id) : RenderUserLinks(current_employer._id, _id, clientView)}
            </div> </>}
    </div>
}


const mapStateToProps = state => {
    return {
        count: state.Note.count,
        countC: state.Category.countS,
        countF: state.File.countS,
        countN: state.Note.countS,
        countT: state.Task.countS,
        Tcount: state.Task.count,
        countFS: state.File.countFS,
        countM: state.Category.countM,
        countP: state.Poll.count,
        Profile: state.Profile.data,
        countPr: state.NotificationCount.count
    }
};

export default connect(mapStateToProps, {
    logOut, getAllCounts
})(SideNav);