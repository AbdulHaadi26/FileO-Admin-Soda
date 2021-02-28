import React from 'react';
import { deleteAssigned } from '../../../../redux/actions/sharedFilesAction';
import Minus from '../../../../assets/minus.svg';
import { connect } from 'react-redux';
import User from '../../../../assets/static/user.png';
const List = ({ list, count, fId, deleteAssigned, onFetch }) => {

    const handleDelete = user => {
        let data = { sWith: user ? user._id : '', fileId: fId };
        deleteAssigned(data);
    };

    const renderListF = () => list.map(i => i.sharedWith && <div className="col-lg-2 col-4 mFWS" key={i._id}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <h6 className="item-hover" style={{ position: 'absolute', top: '12px', right: '8px', width: 'fit-content' }}>
                <div onClick={e => handleDelete(i.sharedWith ? i.sharedWith : '')} style={{
                    width: '18px', height: '18px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                    justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                }}>
                    <div style={{ width: '10px', height: '10px', cursor: 'pointer', backgroundImage: `url('${Minus}')` }} />
                </div>
            </h6>
        </div>
        <img src={i.sharedWith && i.sharedWith.image ? i.sharedWith.image : User} alt="user" style={{ borderRadius: '1000px' }} />
        <h6 style={{ fontSize: '12px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>{i.sharedWith ? i.sharedWith.name : ''}</h6>
    </div>);

    const renderButton = (count, count2, num) => (count > 12 || count2 > 12) && <div className="col-12 bNW">
        <button className="btn btn-nav" onClick={e => onFetch(e, count, count2, num, -1, -12)}> <div className="fa-ch ch-l" /> Previous</button>
        <button className="btn btn-nav" onClick={e => onFetch(e, count, count2, num, 1, 12)} >Next <div className="fa-ch ch-r" /></button>
    </div>

    return <>
        {renderListF(list)}
        {renderButton(count, 0, 1)}
    </>
}

export default connect(null, { deleteAssigned })(List);