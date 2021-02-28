import React from 'react';
import { connect } from 'react-redux';
import { ModalNTHide } from '../../redux/actions/profileActions';
import User from '../../assets/static/user.png';
import './style.css';

const Toast = ({ data, isSH, ModalNTHide }) => data && data.length > 0 ? <div className="toast-n showing" style={{ display: `${isSH ? 'block' : 'none'}` }}>
    <div className="toast-header">
        <strong className="mr-auto">Notifications</strong>
        <button type="button" className="close" style={{ color: 'white', marginBottom: '4px' }} onClick={e => ModalNTHide()}>
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
    <div className="toast-body p-0">
        {data && data.length > 0 && data.length <= 3 && data.map((Notif, k) => {
            return <div key={k} style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="notif" style={{ padding: '6px 12px 8px 12px' }}>
                    <img src={Notif.postedBy && Notif.postedBy.image ? Notif.postedBy.image : User} alt="user" />
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: '12px' }}>
                        <h6 className="n-t">{Notif.title}</h6>
                        <h6 className="n-p">{Notif.message.length > 35 ? `${Notif.message.slice(0, 35)}.....` : Notif.message}</h6>
                    </div>
                </div>
                {k + 1 !== data.length && <div style={{ width: '100%', height: '1.2px', backgroundColor: '#dfe6e9' }}></div>}
            </div>
        })}
       {data && data.length > 3 && <h6 className="n-p" style={{ color: 'black', fontSize:'12px', fontWeight:'400', marginLeft:'12px', marginTop:'18px' }}>You have {data.length} unread notifications in your inbox.</h6>}
    </div>
</div> : <></>

const mapStateToProps = state => {
    return {
        isSH: state.Modal.isNSH,
        data: state.Modal.ndata
    }
};

export default connect(mapStateToProps, { ModalNTHide })(Toast);
