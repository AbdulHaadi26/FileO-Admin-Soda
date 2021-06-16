import React, { useEffect, useState } from 'react';
import './style.css';
import { connect } from 'react-redux';
import { SetNav } from '../../redux/actions/navActions';
import Container from '../../components/containers/containerFile-O';
import ReusableChatIcon from '../reusableChatIcon';
import Plan from './plans';
import Mid from './mid';
import Faqs from './faqs';

const Home = ({ SetNav, match }) => {
    const [width, setWidth] = useState(0), [isN, setN] = useState(false), { num } = match.params;

    useEffect(() => {
        if (num && Number(num) === 1) {
            window.scrollTo(0, window.innerWidth > 992 ? 1450 : 2150);
        }
    }, [num])


    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    });

    const updateWindowDimensions = () => setWidth(window.innerWidth);

    useEffect(() => {
        SetNav(2);
    }, [SetNav]);

    return <div className="container-fluid">
        <div className="row p-0">
            {(width >= 992 || !isN) && <Container setN={setN} width={width}>
                <div className="pr">
                    <Plan />
                    <Mid />
                    <Faqs />
                </div>
            </Container>}
        </div>
        <ReusableChatIcon />
    </div>
}

export default connect(null, { SetNav })(Home)