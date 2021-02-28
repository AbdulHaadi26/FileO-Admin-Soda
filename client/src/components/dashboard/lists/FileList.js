import React from 'react';
import Link from 'react-router-dom/Link';
import returnType from '../../types';
import './style.css';
const eS = { textAlign: 'center', width: '100%', marginTop: '12px' };
export default ({ fileList }) => {

    let list = [];
    if (fileList && fileList.length > 0) {
        let tempList = fileList.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        tempList = tempList.slice(0, fileList.length > 5 ? 5 : fileList.length);
        list = tempList;
    }

    const ConvertDate = date => {
        var serverDate = date;
        var dt = new Date(Date.parse(serverDate));
        var hours = dt.getHours();
        var minutes = dt.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var checkDate = new Date(Date.now());
        checkDate.setDate(checkDate.getDate() - 1);
        var strTime = `${checkDate < dt ? '' : `${date.slice(0, 10)} at `}${hours}:${minutes}  ${ampm}`;
        return strTime;
    };

    const renderUrl = Item => {
        switch (Item.location) {
            case 'Project Files': return `/organization/${Item.org}/projects/${Item.pId}/file/${Item._id}`;
            case 'User Files': return `/organization/${Item.org}/myspace/user/${Item.postedby}/file/${Item._id}`
            case 'Client Files': return `/organization/${Item.org}/user/${Item.postedFor}/clients/file/${Item._id}`;
            default: return `/organization/${Item.org}/file/${Item._id}`;
        }
    }

    return list && list.length > 0 ? list.map(Item => <div className="LI" key={Item._id} style={{ padding: '4px 6px', borderRadius: '4px', position: 'relative' }}>
        <div className="col-lg-5 col-12" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <img src={returnType(Item.type)} alt="file" style={{ width: '36px', height: '36px' }} />
            <div className="d-d-w" style={{ marginLeft: '12px' }}>
                <Link className="d-d-i-n" to={renderUrl(Item)}>{Item ? Item.name : ''}</Link>
            </div>
        </div>
        <h6 className="d-d-i-n hide col-4" style={{ fontSize: '12px', color: 'grey', wordBreak: 'break-all' }}>{Item.location}/{Item.category.name}</h6>
        <h6 className="d-d-i-n hide col-3" style={{ fontSize: '12px', color: 'grey', wordBreak: 'break-all' }}>{ConvertDate(Item.date)}</h6>
    </div>) : <h6 className="d-d-i-n" style={eS}>No file found</h6>
}