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
        <div className="div-t">
            <div className="col-lg-3 col-12 mEW p-0">
                <div className="col-lg-11 col-12 eIW">
                    <img src={!Emp.image ? User : `${Emp.image}`} alt="compnay" />
                    <h6 className="e-n">{Emp.name}</h6>
                    <h6 className="e-r">{Emp.roles && Emp.roles.name}</h6>
                </div>
            </div>
            <span className="exchange" />
            <div className="col-lg-3 col-12 mEW p-0">
                <div className="col-lg-11 col-12 eIW">
                    <img src={!sEmp.image ? User : `${sEmp.image}`} alt="compnay" />
                    <h6 className="e-n">{sEmp.name ? sEmp.name : 'Name'}</h6>
                    <h6 className="e-r">{sEmp.roles ? sEmp.roles.name : 'Role'}</h6>
                </div>
            </div>
        </div>
        <div className="div-t">
            <button className={`btn ${sEmp ? 'btn-success' : 'btn-secondary'}`} type="button" onClick={e => handleTransfer(e)}>Transfer storage</button>
        </div>
    </>
}

export default connect(null, { transferData })(EmpT);