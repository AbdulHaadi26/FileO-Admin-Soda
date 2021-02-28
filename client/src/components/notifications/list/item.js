import React from 'react';
import history from '../../../utils/history';
import User from '../../../assets/static/user.png';

export default ({ list, id }) => {
    let tempL = list && list.length > 0 ? list : [];

    tempL = tempL.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    return <div className="col-12 p-0">{renderList(tempL, id)}</div>
}


const renderList = (list, id) => list.map(Notif => <div className="notI" key={Notif._id} onClick={e => history.push(`/organization/${id}/notification/details/${Notif._id}`)}>
    <img src={Notif.postedBy && Notif.postedBy.image ? Notif.postedBy.image : User} alt="user" className="u-i" />
    <h6 className="u-n mr-auto">{Notif.postedBy ? Notif.postedBy.name : ''}</h6>
    <div className="hz">
        <h6 className="n-t">{Notif.title}</h6>
        {Notif.message && <h6 className="n-p">{Notif.message.length > 50 ? `${Notif.message.slice(0, 50)}.....` : Notif.message}</h6>}
    </div>
    {!Notif.isRead && <div className='bellR' />}
</div>);