import React, { useEffect, useState } from 'react';
import Refresh from '../../assets/refresh.svg';
const Head = { width: '100%', textAlign: 'center', fontWeight: 700, color: '#0a3d62', fontSize: '16px', marginTop: '12px' };

const Discussion = ({
    profile, id, message, setMessage, addComment, count, catId,
    offset, setOF, updateChat, updated, discussions, isEdt, isFile,
    isP, isPM, disabled, project
}) => {

    const [width, setWidth] = useState(0);

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    });

    const updateWindowDimensions = () => setWidth(window.innerWidth);


    const renderDate = date => {
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

    return width > 0 ? <div className={!project ? `col-lg-4 col-12 shadow` : 'col-lg-8 col-12 shadow'} style={{ backgroundColor: 'white' }}>
        <h6 style={Head}>DISCUSSION</h6>
        <div style={{ width: '100%', padding: '0px 12px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="word-count" style={{ marginBottom: '-4px', fontStyle: 'italic' }}>Last Updated: {updated && renderDate(updated)}</p>
            <h6 className={`order`} onClick={e => updateChat()} style={{ position: 'relative', marginTop: '0px', marginBottom: '0px', marginLeft: '6px' }}>
                <div style={{ width: '14px', height: '14px', backgroundImage: `url('${Refresh}')` }} />
            </h6>
        </div>
        {discussions && discussions.length > 0 ? <div className="msg-box" style={{ width: '100%', display: 'flex', flexDirection: 'column-reverse', maxHeight: '350px', overflowY: 'auto' }}>
            {discussions.map((i, k) => <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}
                className={profile._id === i.userId ? 'msg-m' : 'msg-o'} key={k}>
                <h4>{i.postedby}</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{i.message}</p>
                <h6>{i.date ? renderDate(i.date) : ''}</h6>
            </div>)}
            {count > offset && <button className="btn link-view" style={{
                padding: '6px 16px 6px 16px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', cursor: 'pointer', marginBottom: '6px'
            }} onClick={e => setOF()}>View more</button>}
            <div style={{ height: '2px', width: '100%', padding: '12px' }} />
        </div>
            : <p style={{
                padding: '6px 16px 0px 16px', width: '100%', textAlign: 'center',
                color: 'gray', fontSize: '12px', fontWeight: '600', marginTop: '24px',
                marginBottom: '24px'
            }}>No Comments</p>}
        <div style={{ width: '100%', padding: '0px 16px' }}>
            <textarea type="text" placeholder="Type commment here" className="comment" value={message} disabled={disabled}
                onChange={e => e.target.value.split(' ').length <= 500 && setMessage(e.target.value)} autoFocus={width >= 992}
                onKeyPress={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        message && !disabled && addComment({ _id: id, message, isEdt, isFile, category: catId, isP, isPM, project });
                        setMessage('');
                        e.preventDefault();
                    }
                }}
            />
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '0px 16px' }}>
            <p className="word-count">{message.split(" ").length} / 500</p>
            <button className="btn btn-primary btn-send" type="button" disabled={disabled ? disabled : !message} onClick={e => {
                message && !disabled && addComment({ _id: id, message, isEdt, isFile, category: catId, isP, isPM, project })
                setMessage('');
            }}>Send</button>
        </div>
    </div> : <></>
};

export default Discussion;