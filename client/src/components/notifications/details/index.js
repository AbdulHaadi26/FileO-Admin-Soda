import React, { lazy, Suspense, Fragment, useState } from 'react';
import Link from 'react-router-dom/Link';
import returnType from '../../types';
import User from '../../../assets/static/user.png';
import Folder from '../../../assets/folder.svg';
import '../style.css';
import Tabnav from '../../tabnav';
import GNotif from '../../../assets/tabnav/G-notifications.svg';
import BNotif from '../../../assets/tabnav/B-notification.svg';
const ModalDelete = lazy(() => import('../modeDel'));

let icons = [
    { G: GNotif, B: BNotif }
];


export default ({ Notification, id, org, tabNav, setTN }) => {
    const [modalDel, setMD] = useState(false);

    const handleModalDel = (e, val) => setMD(val);

    const renderUrl = (t, ut) => {
        if (t === 0 && ut === 1) return `/organization/${org}/file/${Notification.id}`;
        else if ((ut === 1 && ut === 2) && t === 1) return Notification.pId ? `/organization/${org}/projects/${Notification.pId}/file/${Notification.id}` : '';
        else if (ut === 1 && t === 3) return `/organization/${org}/user/${Notification.recievedBy}/view/shared/file/${Notification.id}`;
        else if (t === 4) return `/organization/${org}/myspace/user/${Notification.recievedBy}/notes/view/${Notification.id}`;
        else if (t === 5) return `/organization/${org}/sharedby/${Notification.postedBy._id}/category/${Notification.id}/list`;
        else if (t === 8) return `/organization/${org}/user/${Notification.postedBy._id}/clients/file/${Notification.id}`;
        else if (t === 10 && ut === 2) return `/organization/${org}/projects/${Notification.pId}/files/${Notification.id}/list`;
        else if (t === 10 && ut === 1) return `/organization/${org}/files/${Notification.id}/list`;
        return '';
    };

    const renderDate = date => {
        var serverDate = date;
        var dt = new Date(Date.parse(serverDate));
        var hours = dt.getHours();
        var minutes = dt.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var checkDate = new Date(Date.now());
        checkDate.setDate(checkDate.getDate() - 1);
        var strTime = `${checkDate < dt ? '' : `${date.slice(0, 10)} at `}${hours}:${minutes}  ${ampm}`;
        return strTime;
    };

    return <div className="col-11 not-w p-0">
        <h4 className="h">Notification</h4>
        <Tabnav items={['Details']} i={tabNav} setI={setTN} icons={icons} />
        <div className="col-12 not-f-w">
            <div className="delNot">
                <div className="faD trash" onClick={e => setMD(true)} />
            </div>
            <div className="horz">
                <img src={Notification.postedBy && Notification.postedBy.image ? Notification.postedBy.image : User} alt="user" className="u-i" />
                <h6 className="u-n mr-auto">{Notification.postedBy ? Notification.postedBy.name : ''}</h6>
                <h6 className="u-d">{Notification.date ? renderDate(Notification.date) : ''}</h6>
            </div>
            <h6 className="not-h">{Notification.title}</h6>
            <h6 className="not-p2">{Notification.message}</h6>
            {Notification.mimeType && Notification.type !== 4 && Notification.type !== 5 && Notification.type !== 10 && <img className="file-img" src={returnType(Notification.mimeType)} alt="File Logo" />}
            {(Notification.type === 5 || Notification.type) === 10 && <img className="file-img" src={Folder} alt="Folder Logo" />}
            {Notification.id && renderUrl(Notification.type, Notification.userType) && <Link className="file-link" to={`${renderUrl(Notification.type, Notification.userType)}`}>Click here to view {Notification.type === 5 || Notification.type === 10 ? 'folder' : Notification.type === 4 ? 'note' : 'file'}</Link>}
        </div>
        {modalDel && <Suspense fallback={<Fragment />}> <ModalDelete org={org} id={id} onhandleModalDel={handleModalDel} /> </Suspense>}
    </div>
}
