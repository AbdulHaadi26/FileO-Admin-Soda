import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getDiscussion } from '../../redux/actions/discussionActions';
import { getNote } from '../../redux/actions/noteActions';
import Container from '../container';
const Details = lazy(() => import('../../components/notes/detailsView'));

const NotePage = ({ getNote, profile, isErr, isSuc, note, rec, match, getDiscussion, discussion, count }) => {
    const { id, _id, nId } = match.params, [tabNav, setTN] = useState(0), [offset, setOF] = useState(12), [updated, setUpdated] = useState('');
    useEffect(() => {
        async function fetch() {
            await getNote(nId);
            await getDiscussion({ _id: nId, offset: 0 }, 0);
            setUpdated(new Date(Date.now()).toISOString());
        }
        fetch();
    }, [getNote, nId, getDiscussion]);

    const udpateDiscussion = async () => {
        await getDiscussion({ _id: nId, offset: Math.floor(offset / 12) }, 1);
        setOF(offset + 12);
    };

    const updateChat = async () => {
        await getDiscussion({ _id: nId, offset: 0 }, 2);
        setUpdated(new Date(Date.now()).toISOString())
    };

    return <Container isErr={isErr} isSuc={isSuc && note} eT={'Note Not Found'} num={15}>
        <Details discussion={discussion} Note={note} count={count} offset={offset} setOF={udpateDiscussion} updated={updated} updateChat={updateChat}
            org={id} _id={_id} Rec={rec ? rec : ''} profile={profile && profile.user ? profile.user : ''} tabNav={tabNav} setTN={setTN}
            disabled={profile && profile.user && profile.user.current_employer && profile.user.current_employer.isDisabled}
        />
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.Note.isErr,
        isSuc: state.Note.isSuc,
        note: state.Note.data,
        rec: state.Note.rec,
        discussion: state.Discussion.list,
        count: state.Discussion.count
    }
}

export default connect(mapStateToProps, { getNote, getDiscussion })(NotePage);