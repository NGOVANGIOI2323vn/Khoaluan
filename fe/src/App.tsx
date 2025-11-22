import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import HotelList from './pages/HotelList'
import HotelDetail from './pages/HotelDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import Booking from './pages/Booking'
import BookingHistory from './pages/BookingHistory'
import About from './pages/About'
import Contact from './pages/Contact'
import Checkout from './pages/Checkout'
import AdminDashboard from './pages/AdminDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import NotFound from './pages/NotFound'
import OAuth2Callback from './pages/OAuth2Callback'
import ProtectedRoute from './components/ProtectedRoute'
import ChatBox from './components/ChatBox'
import './App.css'
import { ToastProvider } from './contexts/ToastContext'

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<HotelList />} />
        <Route path="/hotel/:id" element={<HotelDetail />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
        <Route
          path="/booking-history"
          element={
            <ProtectedRoute requiredRole="USER">
              <BookingHistory />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <ProtectedRoute requiredRole="OWNER">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatBox />
      </Router>
    </ToastProvider>
  )
}

export default App
