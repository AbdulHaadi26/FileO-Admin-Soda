import React, { useEffect, useState } from 'react';
import './style.css';
import { connect } from 'react-redux';
import { SetNav } from '../../redux/actions/navActions';
import Container from '../../components/containers/containerFile-O';
import ReusableChatIcon from '../reusableChatIcon';
import Mid from './mid';

const Home = ({ SetNav }) => {

    const [width, setWidth] = useState(0), [isN, setN] = useState(false);

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    });

    const updateWindowDimensions = () => setWidth(window.innerWidth);

    useEffect(() => {
        SetNav(4);
    }, [SetNav]);

    return <div className="container-fluid">
        <div className="row p-0">
            {(width >= 992 || !isN) && <Container setN={setN} width={width}>
                <div className="faq">
                    <Mid />
                </div>
            </Container>}
        </div>
        <ReusableChatIcon/>
    </div>
}

export default connect(null, { SetNav })(Home)