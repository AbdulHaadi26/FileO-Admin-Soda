import React from 'react';
import './style.css';

export default ({ items, i, setI }) => {

    const renderItems = () => {
        return items.map((item, k) => {
            return <div className="col-lg-2 col-4 p-0" key={k} onClick={e => setI(k)}
                style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative' }}>
                <h6 style={{ color: i === k ? 'black' : 'grey', fontWeight: i === k ? '700' : '500', fontSize:'18px' }}
                    className={`item col-12 p-0 ${i === k ? 'active' : ''}`} key={k}>
                    {item}
                </h6>
                <div style={{ width: '100%', backgroundColor: i === k ? 'black' : '#b2bec3', height: '2px', position: 'absolute', bottom: '-2px' }} />
            </div>
        });
    };

    return <div className="tabNav">
        {renderItems()}
    </div>
}