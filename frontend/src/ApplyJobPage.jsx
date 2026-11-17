import { useActionState, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom'
import LoginPrompt from './LoginPrompt'
import ProfilePage from './ProfilePage'



function ApplyJobPage() {

    const [result, formAction, isPending] = useActionState(applyJobAction, null, {
            withPending: true
        });
    const {jobId} = useParams();
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'))
    const username = localStorage.getItem('username') || 'there'
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)

    function handleSubmit(event) {
        if (!authToken) {
            event.preventDefault()
            setShowLoginPrompt(true)
        }
    }

    async function applyJobAction() {
        const token = localStorage.getItem('authToken')
        if (!token) {
            return { message: 'Please log in before applying.', success: false, loginRequired: true }
        }
        const res = await fetch('http://127.0.0.1:8000/apply', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`,
            },
            body: JSON.stringify({
                job: jobId,
            })
        });

        const data = await res.json();
        if (res.status === 401) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('userId')
            localStorage.removeItem('username')
            setAuthToken(null)
            setShowLoginPrompt(true)
            return { message: data.detail || 'Please log in before applying.', success: false }
        }
        if(res.ok){
            return { message: data.message, success: true }
        }
        return { message: data.message || 'Could not submit your application.', success: false }
    }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">

    {/* <!-- ================= HEADER ================= --> */}
    <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold text-blue-700">JobPortal</h1>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
            <NavLink to="/job" className="hover:text-blue-700">Jobs</NavLink>
            <NavLink to="/companies" className="hover:text-blue-700">Companies</NavLink>
            <NavLink to="/services" className="hover:text-blue-700">Services</NavLink>
        </nav>

        <div className="flex items-center gap-4">
            {authToken ? (
                <>
                    <span className="text-sm text-gray-600">Hello, {username}</span>
                    <ProfilePage />
                </>
            ) : (
                <NavLink to="/login" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white text-center hover:bg-blue-800">
                    Back to login
                </NavLink>
            )}
        </div>
        </div>
    </header>

    {/* <!-- ================= MAIN ================= --> */}
    <main className="min-h-[calc(100vh-140px)] px-4">

        {/* <!-- Back Link --> */}
        <div className="max-w-7xl mx-auto pt-6">
        <NavLink
            to={"/job"}
            className="inline-flex items-center gap-2 mb-4
                text-sm font-medium text-blue-600
                hover:text-blue-700 hover:underline"
        >
            ← Back to Jobs
        </NavLink>
        </div>

        {/* <!-- Apply Card --> */}
        <div className="flex items-center justify-center py-10">
        <div className="w-full max-w-md rounded-lg border bg-white p-6">

            <h2 className="text-lg font-semibold text-gray-900">
            Apply for this job
            </h2>
            <p className="mt-1 text-sm text-gray-500">
            Your profile will be shared with the recruiter
            </p>

            <form action={formAction} onSubmit={handleSubmit} className="mt-5 space-y-4">

            <button
                disabled={isPending}
                type="submit"
                className="w-full rounded-lg bg-blue-700 py-2.5
                    font-semibold text-white
                    hover:bg-blue-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {isPending ? "Applying" : "Apply Now"}
            </button>

            {/* <!-- Success Message --> */}
            {/* <!-- Error Message (preview) --> */}
            { result && <p className={`text-center text-sm ${result.success ?  "text-green-600" :  "text-red-600"}`}>
                {result.message}
            </p> }

            </form>
        </div>
        </div>

    </main>

    {/* <!-- ================= FOOTER ================= --> */}
    <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-500">
        © 2026 JobPortal.com | All rights reserved
        </div>
    </footer>
    <LoginPrompt
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message="Please log in before applying. You can keep viewing job details without an account."
    />

    </div>
  )
}

export default ApplyJobPage