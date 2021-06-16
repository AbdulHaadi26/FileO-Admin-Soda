import React from 'react';
import './style.css';

export default ({ items, i, setI, icons, count }) => {

    const renderItems = () => items.map((item, k) => <div className="tab" key={k} onClick={e => setI(k)}
        style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative' }}>
        <h6 style={{ color: i === k ? '#2c3e50' : 'grey' }}
            className={`item col-12 p-0 ${i === k ? 'active' : ''}`}>
            {item}
        </h6>
        <div style={{ width: '100%', backgroundColor: i === k ? '#2c3e50' : '#dfe6e9', height: '2px', position: 'absolute', bottom: '-2px' }} />
    </div>)

    const renderNotif = (count) => <div className={count && count > 0 ? 'notifT' : ''}>{count && count > 99 ? '99+' : count > 0 ? count : ''}</div>

    const renderItemsIcons = () => items.map((item, k) => <div className="tab" key={k} onClick={e => setI(k)}
        style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
            <img src={i === k ? icons[k].B : icons[k].G} alt="Icon" style={{ width: '20px', height: '20px' }} />
            {renderNotif(count && count[k] ? count[k] : 0)}
        </div>
        <h6 style={{ color: i === k ? 'black' : 'grey', textAlign: 'center', fontSize: '12px' }}
            className={`item col-12 p-0 ${i === k ? 'active' : ''}`}>
            <span>{item}</span>
        </h6>
        <div style={{ width: '100%', backgroundColor: i === k ? '#3498db' : '#bdc3c7', height: '2px', position: 'absolute', bottom: '-2px' }} />
    </div>)


    return <div className="tabNav">
        {items && items.length > 0 && !icons && renderItems()}
        {items && items.length > 0 && icons && renderItemsIcons()}
    </div>
}