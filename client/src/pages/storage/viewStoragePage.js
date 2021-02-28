import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getOrganization } from '../../redux/actions/organizationActions';
import Container from '../container';
const ViewStorage = lazy(() => import('../../components/storage/viewStorage'));

const ViewPage = ({ getOrganization, profile, isErr, isSuc, data }) => {
    const [tabNav, setTN] = useState(0);

    useEffect(() => { getOrganization(); }, [getOrganization]);
    const refresh = () => getOrganization();

    return <Container profile={profile} num={7} isSuc={isSuc && data} isErr={isErr} eT={'Organization Storage Not Found'}>
        {data && data.org && <ViewStorage onRefresh={refresh} tabNav={tabNav} setTN={setTN} Org={data.org} />}
    </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.Organization.isErr,
        isSuc: state.Organization.isSuc,
        data: state.Organization.data
    }
}

export default connect(mapStateToProps, { getOrganization })(ViewPage);