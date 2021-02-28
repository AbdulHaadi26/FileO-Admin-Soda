import React from 'react';
const dF = { display: 'flex', justifyContent: 'flex-end' };

export default ({ ver1, version, compare, onhandleSelect }) => <div style={dF}>
    <select className={`custom-select col-lg-4 col-12 ${compare ? 'mt-lg-4' : 'mt-lg-1'} mt-4`} onChange={e => onhandleSelect(e)} defaultValue={`Version ${ver1}`}>
        {renderOptions(version)}
    </select>
</div>

const renderOptions = versions => versions.map(Item => <option data-id={Item.id} data-key={Item.url} key={Item._id} data-ver={`${Item.version}`} data-img={Item.postedby ? Item.postedby.image : ''} data-type={Item.type}
    data-post={Item.postedby ? Item.postedby.name : ''} data-date={Item.date} data-desc={Item.description}>Version {Item.version}</option>);
