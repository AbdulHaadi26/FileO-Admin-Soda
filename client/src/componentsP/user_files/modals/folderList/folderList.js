import React from 'react';
import Folder from '../../../../assets/folder.svg';

export default ({ list, setCId, setSId, cId, _id }) => list.map((File, k) => File._id !== _id ? <div className="col-lg-2 col-4 mFWS"
    onDoubleClick={e => setSId(File._id)} onClick={e => setCId(File._id)}
    style={{ cursor: 'pointer', backgroundColor: cId === File._id ? '#dfe6e9' : 'transparent' }}
    key={k}>
    <img src={Folder} alt="Folder" />
    <h6 style={{ fontSize: '12px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', wordBreak: 'break-all' }}>{File.name.length > 35 ? `${File.name.substr(0, 35)}...` : File.name}</h6>
</div> : <></>);
