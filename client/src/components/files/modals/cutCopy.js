import React, { useState, useEffect } from 'react';
import DelC from '../../containers/deleteContainer';
const fS = { width: '90%', marginTop: '20px', marginBottom: '20px' };

export default ({ onhandleModalC, onhandleIds, catL, catId, text }) => {
    const [ti, setTI] = useState(''), [cat, setC] = useState(''), [cL, setCL] = useState([]);

    useEffect(() => {
        if (catL && catL.length > 0) {
            var list = catL;
            setC(list.filter(ct => ct._id === catId));
            setTI(catId);
            list = catL;
            setCL(list.filter(ct => ct._id !== catId));
        }
    }, [catId, catL]);

    const onhandleCut = e => {
        e.preventDefault();
        onhandleIds(ti)
    }

    const handleSelect = e => {
        const selectedIndex = e.target.options.selectedIndex;
        if (e.target.options[selectedIndex].getAttribute('data-key')) setTI(e.target.options[selectedIndex].getAttribute('data-key'));
    }

    const renderList = rList => rList.map(item => <option key={item._id} data-key={item._id} data-name={item.name}>{item.name}</option>);

    return <DelC handleModalDel={onhandleModalC} handleDelete={onhandleCut}>
        <h3 style={{ fontWeight: '600', fontSize: '14px', width: '90%' }}>{text}</h3>
        <select style={fS} className="form-control" onChange={e => handleSelect(e)}>
            {cat && cat[0] && <option key={cat[0]._id} data-key={cat[0]._id} data-name={cat[0].name}>{cat[0].name}</option>}
            {renderList(cL)}
        </select>
    </DelC>
}