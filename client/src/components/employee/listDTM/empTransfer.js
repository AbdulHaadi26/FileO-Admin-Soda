import React from 'react';
import { connect } from 'react-redux';
import User from '../../../assets/static/user.png';
import { transferData } from '../../../redux/actions/employeeDTActions';
import './style.css';
const EmpT = ({ Emp, sEmp, transferData, id }) => {

    const handleTransfer = e => {
        e.preventDefault();
        if (Emp && sEmp) {
            var data = { tId: sEmp._id, tbyId: Emp._id, tbyName: Emp.name, org: id };
            transferData(data);
        }
    }

    return <>
        <div className="div-t" style={{ marginTop: '30px' }}>
            <div className="col-lg-2 col-4 mFWS">
                <img src={!Emp.image ? User : `${Emp.image}`} alt="compnay" style={{ width: '50px', height: '50px', borderRadius: '1000px' }} />
                <h6 style={{ wordBreak: 'break-all', fontSize: '14px' }}>{Emp.name}</h6>
                <h6 style={{ wordBreak: 'break-all', fontSize: '12px' }}>{Emp.userType === 2 ? 'Administrator' : Emp.userType === 1 ? 'Project Manager' : 'User'}</h6>
            </div>
            <span className="exchange" />
            <div className="col-lg-2 col-4 mFWS">
                <img src={!sEmp.image ? User : `${sEmp.image}`} alt="compnay" style={{ width: '50px', height: '50px', borderRadius: '1000px' }} />
                <h6 style={{ wordBreak: 'break-all', fontSize: '14px' }}>{sEmp.name}</h6>
                <h6 style={{ wordBreak: 'break-all', fontSize: '12px' }}>{sEmp.userType === 2 ? 'Administrator' : sEmp.userType === 1 ? 'Project Manager' : 'User'}</h6>
            </div>
        </div>
        <div className="div-t">
            <button className={`btn ${sEmp ? 'btn-success' : 'btn-secondary'}`} type="button" onClick={e => handleTransfer(e)}>Transfer storage</button>
        </div>
    </>
}

export default connect(null, { transferData })(EmpT);