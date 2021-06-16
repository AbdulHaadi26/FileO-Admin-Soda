import React, { useEffect, useState } from 'react';
import './style.css';
import { connect } from 'react-redux';
import { SetNav } from '../../redux/actions/navActions';
import Head from './head';
import Container from '../containerFile-O';
import Mid from './mid';
import End from './end';
import Footer from '../../components/footer';
import ReusableChatIcon from '../reusableChatIcon';

const Home = ({ SetNav }) => {
    const [width, setWidth] = useState(0), [isN, setN] = useState(false);

    useEffect(() => {
        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);
        return () => window.removeEventListener('resize', updateWindowDimensions);
    });

    const updateWindowDimensions = () => setWidth(window.innerWidth);

    useEffect(() => { SetNav(0); }, [SetNav]);

    return <div className="container-fluid">
        <div className="row p-0">
            {(width >= 992 || !isN) && <Container setN={setN} width={width}>
                <div className="home">
                    <Head width={width} />
                    <div className="mid">
                        <Mid />
                        <End />
                    </div>
                </div>
                <Footer />
            </Container>}
        </div>
        <ReusableChatIcon />
    </div>
}

export default connect(null, { SetNav })(Home)