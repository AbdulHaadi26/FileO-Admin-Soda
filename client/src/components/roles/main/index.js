import React, { lazy } from 'react';
import { connect } from 'react-redux';
import { clearRole } from '../../../redux/actions/rolesAction';
import '../style.css';
import AlertC from '../../containers/alertContainer';
import Tabnav from '../../tabnav';
const AddRole = lazy(() => import('../add'));

const Add = ({ id, isErr, selectList, clearRole, tabNav, setTN }) => <div className="col-11 r-w p-0">
    <h4 className="h">Role</h4>
    <Tabnav items={['Add Roles']} i={tabNav} setI={setTN} />
    <AlertC isErr={isErr} eT={'Role with this name already exists.'} onClear={clearRole}>
        <AddRole id={id} list={selectList} />
    </AlertC>
</div>

const mapStateToProps = state => {
    return {
        isErr: state.Role.isErr,
        selectList: state.Category.list
    }
}

export default connect(mapStateToProps, { clearRole })(Add);