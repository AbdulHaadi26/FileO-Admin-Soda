import React, { lazy } from 'react';
import { connect } from 'react-redux';
import { clearUser } from '../../../redux/actions/employeeActions';
import '../style.css';
import AlertC from '../../containers/alertContainer';
import Tabnav from '../../tabnav';
const AddEmp = lazy(() => import('../add'));

const Main = ({ id, selectList, isSucSet, setting, isErr, clearUser, tabNav, setTN, count, Org }) => <div className="col-11 e-w p-0">
    <h4 className="h">User</h4>
    <Tabnav items={['Add User']} i={tabNav} setI={setTN} />
    <AlertC isErr={isErr} eT={'User with this email already exists.'} onClear={() => clearUser()}>
        <AddEmp id={id} Org={Org && Org.org ? Org.org : ''} count={count} list={selectList} setting={isSucSet && setting && setting.setting ? setting.setting : ''} />
    </AlertC>
</div>

const mapStateToProps = state => {
    return {
        isErr: state.Employee.isErr,
        count: state.Employee.count,
        Org: state.Organization.data,
        selectList: state.Role.list,
        isSucSet: state.setting.isSuc,
        setting: state.setting.data
    }
}

export default connect(mapStateToProps, { clearUser })(Main);