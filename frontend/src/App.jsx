import './App.css'
import RegisterPage from './RegisterPage'
import LoginPage from './LoginPage'
import JobListPage from './JobListPage'
import ApplyJobPage from './ApplyJobPage'
import MyApplicationsPage from './MyApplicationsPage'
import CompaniesPage from './CompaniesPage'
import ServicesPage from './ServicesPage'
import UploadJobPage from './UploadJobPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/register' element={<RegisterPage/>} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/job' element={<JobListPage/>} />
        <Route path='/apply/:jobId' element={<ApplyJobPage/>} />
        <Route path='/applications' element={<MyApplicationsPage/>} />
        <Route path='/companies' element={<CompaniesPage/>} />
        <Route path='/services' element={<ServicesPage/>} />
        <Route path='/upload-job' element={<UploadJobPage/>} />
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
