import React from 'react';

export default ({roles, list}) => {

    const renderOwnRole = () => list.length > 0 && list.map(item => item._id === roles._id && <option key={item._id} data-key={item._id}>{item.name}</option>);

    const renderList = () => list.length > 0 && list.map(item => item._id !== roles._id && <option key={item._id} data-key={item._id}>{item.name}</option>);

    return <>
        {renderOwnRole()}
        {renderList()}
    </>
}