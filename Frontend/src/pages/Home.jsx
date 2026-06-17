import Header from '../Components/Header/Header'
import Hero from '../Components/Hero/Hero'
import Discover from '../Components/Discover/Discover'
import HowItWork from '../Components/HowItWorks/HowitWork'
import ChatView from '../Components/ChatView/ChatView'
import AboutSafety from '../Components/AboutSafety/AboutSafety'
import Footer from '../Components/Footer/Footer'

import './Home.css'


const HomePage = () => {
    return (
        <div className='app'>
            <Header />
            <Hero />
            <Discover />
            <HowItWork />
            <ChatView />
            <AboutSafety />
            <Footer />
        </div>
    )
}
export default HomePage