import React, { useEffect, lazy, useState } from 'react';
import { connect } from 'react-redux';
import { getOrganization } from '../../redux/actions/organizationActions';
import Container from '../container';
const Details = lazy(() => import('../../components/organization/details'));

const OrganizationPage = ({ getOrganization, isErr, isSuc, data, profile, isSucS, setting }) => {
    const [tabNav, setTN] = useState(0);

    useEffect(() => { getOrganization(); }, [getOrganization]);

    return <Container profile={profile} isSuc={isSuc && data && data.org} isErr={isErr} eT={'Organization Not Found'} num={3}>
        {data && data.org && <Details Org={data.org} tabNav={tabNav} setTN={setTN}
            setting={isSucS && setting && setting.setting ? setting.setting : ''} />} </Container>
}

const mapStateToProps = state => {
    return {
        profile: state.Profile.data,
        isErr: state.Organization.isErr,
        isSuc: state.Organization.isSuc,
        data: state.Organization.data,
        isSucS: state.setting.isSuc,
        setting: state.setting.data
    }
};

export default connect(mapStateToProps, { getOrganization })(OrganizationPage);