import React, { useState, useEffect } from 'react';
import Link from 'react-router-dom/Link';
import { logOut } from '../../redux/actions/userActions';
import { connect } from 'react-redux';
import Logo from '../../assets/logo.svg';
import './style.css';
import { getAllCounts } from '../../redux/actions/profileActions';

const SideNav = ({
    num, User, getAllCounts, count, countC, countF, countN, countFS, countT, Tcount, countM
}) => {
    const { userType, current_employer, _id, clientView } = User;
    const [width, setWidth] = useState(0), [isN, setN] = useState(false);

    let countSum = countC + countF + countN + countT;

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    });

    useEffect(() => {
        getAllCounts()
    }, [getAllCounts]);


    const renderNotif = (count) => <div className={count && count > 0 ? 'notif' : ''}>{count && count > 99 ? '99+' : count > 0 ? count : ''}</div>

    const RenderAdminLinks = (_id, id) => <>
        <Link className={`s-l ${num === 3 && 'a'}`} to={`/organization/detail/${_id}`} onClick={e => setN(false)}><div className="fa org" />Organization</Link>
        <Link className={`s-l ${num === 7 && 'a'}`} to={`/organization/${_id}/storage`} onClick={e => setN(false)}><div className="fa str" />Storage</Link>
        <Link className={`s-l ${num === 4 && 'a'}`} to={`/organization/${_id}/employee/search`} onClick={e => setN(false)}><div className="fa emp" />Users</Link>
        <Link className={`s-l ${num === 5 && 'a'}`} to={`/organization/${_id}/role/list`} onClick={e => setN(false)}><div className="fa role" />Roles</Link>
        <Link className={`s-l ${num === 18 && 'a'}`} to={`/organization/${_id}/all/files/page/0`} onClick={e => {
            setN(false); getAllCounts();
        }}><div className="fa files" />All Files</Link>
        <Link className={`s-l ${num === 9 && 'a'}`} to={`/organization/${_id}/files/categories`} onClick={e => setN(false)}><div className="fa file" />Company Files</Link>
        <Link className={`s-l ${num === 13 && 'a'}`} to={`/organization/${_id}/user/${id}/projects/list`} onClick={e => setN(false)}><div className="fa proj" />Projects</Link>
        <Link className={`s-l ${num === 14 && 'a'}`} to={`/organization/${_id}/myspace/user/${id}/category/list`} onClick={e => {
            setN(false);
            getAllCounts();
            }}><div className="fa astr" />
            <span>My Space</span>
            {renderNotif(countM)}
        </Link>
        <Link className={`s-l ${num === 16 && 'a'}`} to={`/organization/${_id}/myspace/user/${id}/notes/list/page/0`} onClick={e => {
            setN(false); getAllCounts();
        }}><div className="fa sn" />
            <span>Team Up</span>
            {renderNotif(count)}
        </Link>
        <Link className={`s-l ${num === 20 && 'a'}`} to={`/organization/${_id}/myspace/user/${id}/plan/list`} onClick={e => setN(false)}><div className="fa plans" />My Plans</Link>
        <Link className={`s-l ${num === 15 && 'a'}`} to={`/organization/${_id}/user/${id}/shared/files/page/0`} onClick={e => {
            setN(false); getAllCounts();
        }}><div className="fa share" />
            <span>Shared With Me</span>
            {renderNotif(countSum)}
        </Link>
        <Link className={`s-l ${num === 17 && 'a'}`} to={`/organization/${_id}/user/${id}/clients/category/list`} onClick={e => {
            setN(false); getAllCounts();
        }}><div className="fa cloud" />
            <span>Clients Requests</span>
            {renderNotif(countFS)}
        </Link>
        <Link className={`s-l ${num === 10 && 'a'}`} to={`/organization/${_id}/data/transfer/list`} onClick={e => setN(false)}><div className="fa transfer" />Data Transfer</Link>
        <Link className={`s-l ${num === 11 && 'a'}`} to={`/organization/${_id}/files/recent/page/0`} onClick={e => {
            setN(false); getAllCounts();
        }}><div className="fa clock" />Recent</Link>
        <div style={{ width: '100%', height: '80px' }}></div>
    </>

    const RenderUserLinks = (_id, id, cv) => <>
        <Link className={`s-l ${num === 18 && 'a'}`} to={`/organization/${_id}/all/files/page/0`} onClick={e => {
            setN(false); getAllCounts();
        }}><div className="fa files" />All Files</Link>
        <Link className={`s-l ${num === 9 && 'a'}`} to={`/organization/${_id}/files/categories`} onClick={e => setN(false)}><div className="fa file" />Company Files</Link>
        <Link className={`s-l ${num === 13 && 'a'}`} to={`/organization/${_id}/user/${id}/projects/list`} onClick={e => setN(false)}><div className="fa proj" />Projects</Link>
        <Link className={`s-l ${num === 14 && 'a'}`} to={`/organization/${_id}/myspace/user/${id}/category/list`} onClick={e => {
            setN(false);
            getAllCounts();
            }}><div className="fa astr" />
            <span>My Space</span>
            {renderNotif(countM)}
        </Link>
        <Link className={`s-l ${num === 16 && 'a'}`} to={`/organization/${_id}/myspace/user/${id}/notes/list/page/0`} onClick={e => {
            setN(false); getAllCounts();
        }}><div className="fa sn" />
            <span>Team Up</span>
            {renderNotif(count + Tcount)}
        </Link>
        <Link className={`s-l ${num === 20 && 'a'}`} to={`/organization/${_id}/myspace/user/${id}/plan/list`} onClick={e => setN(false)}><div className="fa plans" />My Plans</Link>
        <Link className={`s-l ${num === 15 && 'a'}`} to={`/organization/${_id}/user/${id}/shared/files/page/0`} onClick={e => {
            setN(false); getAllCounts();
        }}><div className="fa share" />
            <span>Shared With Me</span>
            {renderNotif(countSum)}
        </Link>
        {cv && <Link className={`s-l ${num === 17 && 'a'}`} to={`/organization/${_id}/user/${id}/clients/category/list`} onClick={e => {
            setN(false); getAllCounts();
        }}><div className="fa cloud" />
            <span>Clients Requests</span>
            {renderNotif(countFS)}
        </Link>}
        <Link className={`s-l ${num === 11 && 'a'}`} to={`/organization/${_id}/files/recent/page/0`} onClick={e => {
            setN(false); getAllCounts();
        }}><div className="fa clock" />Recent</Link>
    </>

    const updateWindowDimensions = () => setWidth(window.innerWidth);

    return width === 0 || width >= 992 ? <div className="col-lg-2 p-0 u-s-w">
        <div className="logo-user">
            <img src={Logo} alt="File Logo" className="logo" />
            <h3 className="h">File-O</h3>
        </div>
        <Link className={`s-l ${num === 0 ? 'a' : ''}`} to='/user/dashboard' onClick={e => {
            getAllCounts();
        }}> <div className="fa feed" />Home</Link>
        {userType === 2 ? RenderAdminLinks(current_employer._id, _id) : RenderUserLinks(current_employer._id, _id, clientView)}
    </div> : <div className="u-s-w p-0">
            <div className="logo-user">
                <img src={Logo} alt="File Logo" className="logo" />
                <h3 className="h mr-auto">File-O</h3>
                <button className="btn btnBurger" onClick={e => {
                    setN(!isN);
                }}> <div className="menu" /></button>
            </div>
            {isN && <div className="animated fadeIn faster">
                <Link className={`s-l ${num === 0 ? 'a' : ''}`} to='/user/dashboard' onClick={e => {
                    setN(false); getAllCounts();
                }}> <div className="fa feed" />Home</Link>
                {userType === 2 ? RenderAdminLinks(current_employer._id, _id) : RenderUserLinks(current_employer._id, _id, clientView)}
            </div>}
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
        countM: state.Category.countM
    }
};

export default connect(mapStateToProps, {
    logOut, getAllCounts
})(SideNav);