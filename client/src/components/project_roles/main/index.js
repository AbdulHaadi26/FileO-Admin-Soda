import React, { lazy } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { clearRole } from '../../../redux/actions/project_rolesAction';
import AlertC from '../../containers/alertContainer';
import Tabnav from '../../tabnav';
const AddRole = lazy(() => import('../add'));

const Main = ({ pId, clearRole, id, isErr, selectList, tabNav, setTN, Project }) => <div className="col-11 r-w p-0">
    <h4 className="h">Roles</h4>
    <Tabnav items={['Add Role']} i={tabNav} setI={setTN} />
    <AlertC isErr={isErr} eT={'Role with this name already exists.'} onClear={clearRole()} >
        <AddRole id={id} pId={pId} list={selectList} />
    </AlertC>
</div>

const mapStateToProps = state => {
    return {
        isErr: state.Role.isErr,
        selectList: state.Category.list,
    }
}

export default connect(mapStateToProps, { clearRole })(Main);