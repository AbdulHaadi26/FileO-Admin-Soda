import React from 'react';
import { registerEmp } from '../../../../redux/actions/sharedNotesAction';
import { connect } from 'react-redux';
import Plus from '../../../../assets/plusB.svg';
import User from '../../../../assets/static/user.png';

const List = ({ onFetch, list, count, nId, org, registerEmp }) => {

    const handleAdd = user => {
        let data = { noteId: nId, sWith: user._id, name: user.name, org: org };
        registerEmp(data);
    };

    const renderListF = list => list.map(i => <div className="col-lg-2 col-4 mFWS" key={i._id}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <h6 className="item-hover" style={{ position: 'absolute', top:'12px', right:'8px', width: 'fit-content' }}>
                <div onClick={e => handleAdd(i)} style={{
                    width: '18px', height: '18px', display: 'flex', alignItems: 'center', boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.34)`,
                    justifyContent: 'center', backgroundColor: 'white', borderRadius: '1000px'
                }}>
                    <div style={{ width: '10px', height: '10px', cursor: 'pointer', backgroundImage: `url('${Plus}')` }} />
                </div>
            </h6>
        </div>
        <img src={i.image ? i.image : User} alt="user" style={{ borderRadius: '1000px' }} />
        <h6 style={{ fontSize: '12px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>{i.name}</h6>
    </div>);

    const renderButton = (count, count2, num) => (count > 12 || count2 > 12) && <div className="col-12 bNW">
        <button className="btn btn-nav" onClick={e => onFetch(e, count, count2, num, -1, -12)}> <div className="fa-ch ch-l" /> Previous</button>
        <button className="btn btn-nav" onClick={e => onFetch(e, count, count2, num, 1, 12)} >Next <div className="fa-ch ch-r" /></button>
    </div>

    return <>
        {renderListF(list)}
        {renderButton(count, 0, 2)}
    </>
}

export default connect(null, { registerEmp })(List);