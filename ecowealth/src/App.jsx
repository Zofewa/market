import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import PrivateRoute from "./components/PrivateRoute";

const Dashboard = lazy(() => import('./pages/dashboard'))
const Home = lazy(() => import('./Home'))
const ItemDetails = lazy(() => import('./pages/itemDetails'))
const MarketPlace = lazy(() => import('./pages/marketplace'))
const Chat = lazy(() => import('./pages/chat'))
const Listing = lazy(() => import('./pages/mylisting'))
const RouteOptimization = lazy(() => import('./pages/routes'))
const SignIn = lazy(() => import('./pages/signin'))
const SignUp = lazy(() => import('./pages/signup'))
const MyProfile = lazy(() => import('./pages/myprofile'))
const NewListing = lazy(() => import('./pages/newlisting'))
const About = lazy(() => import('./pages/about'))
const Contact = lazy(() => import('./pages/contact'))
const Skills = lazy(() => import('./pages/skills'))

function App() {

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element ={<About />} />
          <Route path="/contact" element ={<Contact />} />
          <Route path="/itemDetails/:id" element={<ItemDetails />} />
          <Route path="/marketplace" element={
            <PrivateRoute><MarketPlace /></PrivateRoute>} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute><Chat /></PrivateRoute>
          } />
          <Route path="/mylisting" element={
            <PrivateRoute><Listing /></PrivateRoute>
          } />
          <Route path="/newlisting" element={
            <PrivateRoute><NewListing /></PrivateRoute>
          } />
          <Route path="/routes" element={
            <PrivateRoute><RouteOptimization /></PrivateRoute>
          } />
          <Route path="/myprofile" element={
            <PrivateRoute><MyProfile /></PrivateRoute>
          } />
          <Route path="*" element=
          {<div className='not-found'>
            <div>
              <p className="number">404</p>
              <p>File Not Found ☹</p>
            </div>
            </div>} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
