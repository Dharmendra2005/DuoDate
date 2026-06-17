import { BrowserRouter, Routes, Route } from 'react-router'
import Home from './pages/Home'
import SignUp from './pages/SignUp/SignUp'
import ProfileMaker from './Components/ProfileMaker/ProfileMaking'
import CreateDuo from './Components/CreateDuo/CreateDuo'
import SignIn from './pages/SignIN/SignIn'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element = {<SignUp/>} />
        <Route path="/profile-maker" element = {<ProfileMaker/>} />
        <Route path="/create-duo" element = {<CreateDuo/>} />
        <Route path="/signin" element = {<SignIn />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

