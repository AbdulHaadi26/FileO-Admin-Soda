import React from 'react';
import './style.css';

export default ({ items, i, setI, count }) => {

    const renderNotif = (count) => <div className={count && count > 0 ? 'notif' : ''}>{count && count > 99 ? '99+' : count > 0 ? count : ''}</div>

    const renderItems = () => {
        return items.map((item, k) => {
            return <div className="col-lg-2 col-4 p-0" key={k} onClick={e => setI(k)}
                style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative' }}>
                <h6 style={{ color: i === k ? '#2c3e50' : 'grey' }}
                    className={`item col-12 p-0 ${i === k ? 'active' : ''}`} key={k}>
                    <span>{item}</span>
                    {renderNotif(count[k])}
                </h6>
                <div style={{ width: '100%', backgroundColor: i === k ? '#2c3e50' : '#dfe6e9', height: '2px', position: 'absolute', bottom: '-2px' }} />
            </div>
        });
    };

    return <div className="tabNav">
        {renderItems()}
    </div>
}