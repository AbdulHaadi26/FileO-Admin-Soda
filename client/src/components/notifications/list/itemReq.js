import React from 'react';
import { connect } from 'react-redux';
import { removeRequest } from '../../../redux/actions/notifActions';
import User from '../../../assets/static/user.png';
import history from '../../../utils/history';

const ListReq = ({ list, id, removeRequest }) => {

    const renderList = (list, id) => list.map(Notif => Notif.userId && <div className="notI" key={Notif._id} style={{ cursor: 'default' }}>
        <img src={Notif.userId && Notif.userId.image ? Notif.userId.image : User} alt="user" className="u-i" />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <h6 className="u-n mr-auto">{Notif.userId ? Notif.userId.name : ''}</h6>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                <button type="button" className="btn btn-confirm" onClick={e => history.push(`/organization/${id}/employee/${Notif.userId._id}`)}>Assign</button>
                <button type="button" className="btn btn-remove" onClick={e => removeRequest({ _id: Notif.userId._id })}>Remove</button>
            </div>
        </div>
    </div>);

    return <div className="col-12 p-0">{renderList(list, id)}</div>
}

export default connect(null, { removeRequest })(ListReq);