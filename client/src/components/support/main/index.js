import React, { lazy } from 'react';
import '../style.css';
import { connect } from 'react-redux';
import { clearTicket } from '../../../redux/actions/ticketActions';
import AlertC from '../../containers/alertContainer';
import Tabnav from '../../tabnav';
const AddTicket = lazy(() => import('../add'));

const Main = ({ isErr, org, clearTicket, tabNav, setTN }) => {

    const clear = () => clearTicket(); 

    return <div className="col-11 sup-w p-0">
        <h4 className="h">Ticket</h4>
        <Tabnav items={['Add Ticket']} i={tabNav} setI={setTN} />
        <AlertC isErr={isErr} eT={'Ticket with this name already exists.'} onClear={clear}>
            <AddTicket org={org} />
        </AlertC>
    </div>
}

const mapStateToProps = state => {
    return {
        isErr: state.Ticket.isErr,
    }
}

export default connect(mapStateToProps, { clearTicket })(Main);