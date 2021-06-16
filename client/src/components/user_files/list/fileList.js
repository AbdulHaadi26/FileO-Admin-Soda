import React, { useState, useEffect } from 'react';
import Link from 'react-router-dom/Link';
import returnType from '../../types';
import history from '../../../utils/history';
import More from '../../../assets/more.svg';
import { downloadFile } from '../../../redux/actions/userFilesActions';
import { connect } from 'react-redux';
import { Draggable, Droppable } from 'react-beautiful-dnd';
const bS = { borderBottom: 'solid 1px #dcdde1' };
const pF = { position: 'fixed', zIndex: '9998', minHeight: '100vh', backgroundColor: '#000', top: '0', left: '0', opacity: '0.0', minWidth: '100vw' };

const List = ({ id, uId, list, ord, sv, handleSel, sL, isList, downloadFile, setLink, setDel, setF, setEF, setVerN, setSHMOD, setCopy, setMove, disabled }) => {
    const [listT, setLT] = useState([]), [active, setAct] = useState(-1);

    useEffect(() => {
        let tempL = [];
        tempL = tempL.concat(list);

        switch (ord) {
            case 1: tempL = tempL.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });; break;
            case 2: tempL = tempL.sort(function Sort(a, b) {
                var textA = a.name.toLowerCase();
                var textB = b.name.toLowerCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            }); break;
            case 3: tempL = tempL.sort(function Sort(a, b) {
                var textA = a.name.toLowerCase();
                var textB = b.name.toLowerCase();
                return (textA > textB) ? -1 : (textA > textB) ? 1 : 0;
            }); break;
            default: tempL = tempL.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            }); break;
        }
        setLT(tempL);
    }, [list, ord, sL]);

    return listT.map((File, k) => isList ? <Droppable key={File._id} droppableId={`drop-File-${File._id}`}>
        {(provided) => (
            <div style={{ width: '100%' }} {...provided.droppableProps} ref={provided.innerRef}>
                <Draggable key={File._id} draggableId={`File-${File._id}`} index={k}>
                    {(provided) => (
                        <div className="LI" style={{ borderRadius: '4px', position: 'relative' }} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            {sv && File.isChecked !== undefined && <div className="form-check form-check-inline" style={{ marginTop: 'auto' }} >
                                <input className="form-check-input" type="checkbox" defaultChecked={File.isChecked} value={File.isChecked} onChange={e => handleSel(File)} />
                            </div>}
                            <div className="mr-auto" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <img src={returnType(File.type)} alt="file" style={{ width: '36px', height: '36px' }} />
                                <Link style={{ textDecoration: 'none', marginLeft: '12px', wordBreak: 'break-all' }} to={`/organization/${id}/myspace/user/${uId}/file/${File._id}`}>{File.name} {File.updated && <span className="static" style={{ color: 'red' }}>(Updated)</span>}</Link>
                            </div>
                            {active === k && active >= 0 && <div style={pF} onClick={e => setAct(-1)} />}
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                                    <div style={{ width: '18px', height: '18px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                                    <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && setCopy(File) }}>Copy File</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMove(File) }}>Move File</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEF(File._id) }}>Edit File</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setSHMOD(File._id); }}>Share File</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && setF(File) }}>Upload Version</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && setVerN(File) }}>Upload New</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && downloadFile(File._id); }}>Download File</h6>
                                        <h6 className='s-l' style={bS} onClick={async e => {
                                            setAct(-1);
                                            !disabled && setLink(File._id)
                                        }}>Generate Link</h6>
                                        <h6 className='s-l' style={bS} onClick={async e => {
                                            setAct(-1);
                                            setDel(File._id)
                                        }}>Delete File</h6>
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
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                <h6 className="item-hover" style={{ position: 'relative', width: 'fit-content' }} onClick={e => setAct(active === k ? -1 : k)}>
                                    <div style={{ width: '14px', height: '14px', cursor: 'pointer', backgroundImage: `url('${More}')` }} />
                                    <div className="dropdown-content" style={{ display: `${active === k ? 'flex' : 'none'}`, top: '12px' }}>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && setCopy(File) }}>Copy File</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setMove(File) }}>Move File</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setEF(File._id) }}>Edit File</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); setSHMOD(File._id); }}>Share File</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && setF(File) }}>Upload Version</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && setVerN(File) }}>Upload New</h6>
                                        <h6 className='s-l' style={bS} onClick={e => { setAct(-1); !disabled && downloadFile(File._id); }}>Download File</h6>
                                        <h6 className='s-l' style={bS} onClick={async e => {
                                            setAct(-1);
                                            !disabled && setLink(File._id)
                                        }}>Generate Link</h6>
                                        <h6 className='s-l' style={bS} onClick={async e => {
                                            setAct(-1);
                                            setDel(File._id)
                                        }}>Delete File</h6>
                                    </div>
                                </h6>
                            </div>
                            <img src={returnType(File.type)} alt="compnay" style={{ cursor: 'pointer' }} onClick={e => !sv && history.push(`/organization/${id}/myspace/user/${uId}/file/${File._id}`)} />
                            {!sv && <Link style={{ textDecoration: 'none', wordBreak: 'break-all' }} to={`/organization/${id}/myspace/user/${uId}/file/${File._id}`} className="f-n">{File.name.length > 35 ? `${File.name.substr(0, 35)}...` : File.name}</Link>}
                            {sv && <h6 style={{ textDecoration: 'none', wordBreak: 'break-all', fontSize:'14px' }} className="f-n">{File.name.length > 35 ? `${File.name.substr(0, 35)}...` : File.name}</h6>}
                            {File.updated && <h6 className="updated">Updated</h6>}
                            {sv && File.isChecked !== undefined && <div className="form-check form-check-inline" style={{ marginTop: '12px' }} >
                                <input className="form-check-input" type="checkbox" defaultChecked={File.isChecked} value={File.isChecked} onChange={e => handleSel(File)} />
                            </div>}
                        </div>
                    )}
                </Draggable>
            </div>
        )}
    </Droppable>);
}

export default connect(null, { downloadFile })(List);
