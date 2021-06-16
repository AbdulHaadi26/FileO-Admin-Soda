import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import returnType from '../../types';
import More from '../../../assets/more.svg';
import { downloadFile } from '../../../redux/actions/clientFilesAction';
import { connect } from 'react-redux';
import history from '../../../utils/history';
import { Draggable, Droppable } from 'react-beautiful-dnd';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };

const List = ({ id, uId, list, ord, isList, downloadFile, setMDF, setEF, disabled }) => {
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

    return listT.map((File, k) => isList ? <Droppable key={File._id} droppableId={`drop-File-${File._id}`}>
        {(provided) => (
            <div style={{ width: '100%' }} {...provided.droppableProps} ref={provided.innerRef}>
                <Draggable key={File._id} draggableId={`File-${File._id}`} index={k}>
                    {(provided) => (
                        <div className="LI" style={{ borderRadius: '4px', position: 'relative' }} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <img src={returnType(File.type)} alt="file" style={{ width: '36px', height: '36px' }} />
                            <Link style={{ textDecoration: 'none', marginLeft: '12px', fontSize: '14px', fontWeight: '400' }} className="f-n mr-auto" to={`/organization/${id}/user/${uId}/clients/file/${File._id}`}>{File.name}  {File.updated && <span className="static" style={{ color: 'red' }}>(Updated)</span>}</Link>
                            {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                                    <div style={{ width: '18px', height: '18px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                                    <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEF(File._id); }}>Edit File</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && downloadFile(File._id); }}>Download File</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMDF(File._id); }}>Delete File</h6>
                                    </div>
                                </h6>
                            </div>
                        </div>
                    )}
                </Draggable>
            </div>
        )}
    </Droppable> : <Droppable key={File._id} direction={'horizontal'} droppableId={`drop-File-${File._id}`}>
        {(provided) => (
            <div className="col-lg-2 col-4" {...provided.droppableProps} ref={provided.innerRef}>
                <Draggable key={File._id} draggableId={`File-${File._id}`} index={k}>
                    {(provided) => (
                        <div className="col-12 mFWS" key={File._id} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginLeft: 'auto' }}>
                                <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                                    <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                                    <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEF(File._id); }}>Edit File</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && downloadFile(File._id); }}>Download File</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMDF(File._id); }}>Delete File</h6>
                                    </div>
                                </h6>
                            </div>
                            <img src={returnType(File.type)} style={{ cursor: 'pointer' }}
                                onClick={e => history.push(`/organization/${id}/user/${uId}/clients/file/${File._id}`)} alt="compnay" />
                            <Link style={{ textDecoration: 'none', wordBreak: 'break-all' }} to={`/organization/${id}/user/${uId}/clients/file/${File._id}`} className="f-n">{File.name.length > 35 ? `${File.name.substr(0, 35)}...` : File.name}</Link>
                            {File.updated && <h6 className="updated">Updated</h6>}
                        </div>
                    )}
                </Draggable>
            </div>
        )}
    </Droppable>);
}

export default connect(null, { downloadFile })(List);
