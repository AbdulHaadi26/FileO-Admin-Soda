import React, { Fragment } from 'react';

export default function (props) {
    const { roles, list } = props;

    function renderOwnRole() {
        return list.length > 0 && list.map(item => {
            return item._id === roles._id && <option key={item._id} data-key={item._id}>{item.name}</option>
        })
    }

    function renderList() {
        return list.length > 0 ? list.map(item => {
            return item._id !== roles._id && <option key={item._id} data-key={item._id}>{item.name}</option>
        }) : <option>No role defined</option>
    }

    return <Fragment>
        {renderOwnRole()}
        {renderList()}
    </Fragment>
}