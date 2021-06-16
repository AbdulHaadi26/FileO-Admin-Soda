import React, { lazy } from 'react';
import { connect } from 'react-redux';
import '../style.css';
import { clearNote } from '../../../redux/actions/noteActions';
import AlertC from '../../containers/alertContainer';
import Tabnav from '../../tabnav';
import BAdd from '../../../assets/tabnav/B-notes.svg';
import GAdd from '../../../assets/tabnav/G-notes.svg';

let icons = [
    { G: GAdd, B: BAdd }
];

const AddNote = lazy(() => import('../add'));

const Note = ({ isErr, org, _id, clearNote, tabNav, setTN }) => <div className="col-11 nt-w p-0">
    <h4 className="h">Note</h4>
    <Tabnav items={['Add Note']} i={tabNav} setI={setTN} icons={icons} />
    <AlertC isErr={isErr} eT={'Note with this title already exists.'} onClear={() => clearNote()}>
        <AddNote org={org} _id={_id} />
    </AlertC>
</div>

const mapStateToProps = state => {
    return { isErr: state.Note.isErr }
}

export default connect(mapStateToProps, { clearNote })(Note);