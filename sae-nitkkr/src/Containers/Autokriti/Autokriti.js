import React from 'react'

import NavBar from '../../Components/NavBar/NavBar'
import FirstDisplayDiv from '../../Components/FirstDisplayDIV/FirstDisplayDIV'
import AboutUs from '../../Components/AboutUs/AboutUs'
import CheckOurEvents from '../../Containers/Autokriti/CheckOurEvents/CheckOurEvents'
// import Saga from '../../Components/Saga/AcceleronsSaga'
import BrandAmbassador from './BrandAmbassador/BrandAmbassador'
import Testimonials from './Testimonials/Testimonials'
import Gallery from '../../Components/Gallery/Gallery'
import FooterWhite from "../../Components/Footer/Footer(white)/FooterWhite";


function Autokriti(){
    return(
        <>
            <NavBar/>
            <FirstDisplayDiv page="Autokriti"/>
            <AboutUs/>
            <CheckOurEvents/>
            {/* <Saga/> */}
            <Testimonials/>
            <BrandAmbassador/>
            <Gallery/>
            <FooterWhite/>
        </>
    )
}

export default Autokriti