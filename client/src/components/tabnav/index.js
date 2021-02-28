import React from 'react';
import './style.css';

export default ({ items, i, setI}) => {

    const renderItems = () => items.map((item, k) => <div className="tab" key={k} onClick={e => setI(k)}
        style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative' }}>
        <h6 style={{ color: i === k ? '#2c3e50' : 'grey' }}
            className={`item col-12 p-0 ${i === k ? 'active' : ''}`}>
            {item}
        </h6>
        <div style={{ width: '100%', backgroundColor: i === k ? '#2c3e50' : '#dfe6e9', height: '2px', position: 'absolute', bottom: '-2px' }} />
    </div>)


    return <div className="tabNav">
        {items && items.length > 0 && renderItems()}
    </div>
}