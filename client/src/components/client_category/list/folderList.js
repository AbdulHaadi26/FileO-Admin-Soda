import React, { useState } from 'react';
import Link from 'react-router-dom/Link';
import Folder from '../../../assets/folder.svg';
import history from '../../../utils/history';
import More from '../../../assets/more.svg';
import { Droppable } from 'react-beautiful-dnd';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };

export default ({ list, id, uId, isList, ord, setMUpt, setMD, setCID, disabled }) => {
    const [active, setAct] = useState(-1);

    var listT = [];
    listT = listT.concat(list);

    switch (ord) {
        case 1: listT = list.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });; break;
        case 2: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        case 3: listT = listT.sort(function Sort(a, b) {
            var textA = a.name.toLowerCase();
            var textB = b.name.toLowerCase();
            return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
        }); break;
        default: listT = listT.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        }); break;
    }

    return isList ? listT.map((Cat, k) => <Droppable key={Cat._id} droppableId={`drop-Folder-${Cat._id}`}>
        {(provided) => (
            <div className="LI" {...provided.droppableProps} ref={provided.innerRef} key={Cat._id}>
                <img src={Folder} alt="Folder" style={{ width: '36px', height: '36px' }} />
                <Link style={{ textDecoration: 'none', marginLeft: '12px', wordBreak: 'break-all' }}
                    to={`/organization/${id}/user/${uId}/clients/files/${Cat._id}/list`} className="mr-auto">{Cat.name} {Cat.updated && <span style={{ color: 'red', fontSize: '12px' }}>(Updated)</span>}</Link>
                {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                    <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                        <div style={{ width: '18px', height: '18px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                        <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                            <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMUpt(Cat); }}>Edit Folder</h6>
                            <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && setCID(Cat._id); }}>Generate Link</h6>
                            <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMD(Cat._id); }}>Delete Folder</h6>
                        </div>
                    </h6>
                </div>
            </div>
        )}
    </Droppable>) : listT.map((Cat, k) => <Droppable key={Cat._id} direction={'horizontal'} droppableId={`drop-Folder-${Cat._id}`}>
        {(provided) => (
            <div className="col-lg-2 col-4 mFWS" {...provided.droppableProps} ref={provided.innerRef}>
                {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                    <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                        <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                        <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                            <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMUpt(Cat); }}>Edit Folder</h6>
                            <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && setCID(Cat._id); }}>Generate Link</h6>
                            <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMD(Cat._id); }}>Delete Folder</h6>
                        </div>
                    </h6>
                </div>
                <img src={Folder} alt="Folder" style={{ cursor: 'pointer' }} onClick={e => history.push(`/organization/${id}/user/${uId}/clients/files/${Cat._id}/list`)} />
                <Link to={`/organization/${id}/user/${uId}/clients/files/${Cat._id}/list`}
                    className="f-n mr-auto" style={{ textDecoration: 'none', wordBreak: 'break-all' }}>
                    {Cat.name.length > 35 ? `${Cat.name.substr(0, 35)}...` : Cat.name}</Link>
                {Cat.updated && <h6 className="updated">Updated</h6>}
            </div>
        )}
    </Droppable>);

}
