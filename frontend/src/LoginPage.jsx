import { useActionState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

async function loginAction(_, formData) {
    const json = Object.fromEntries(formData);
    const res = await fetch('http://127.0.0.1:8000/login', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(json)
    });
    const data = await res.json()
    if (res.ok) {
        localStorage.setItem('userId', data.user_id)
        localStorage.setItem('username', data.username)
        localStorage.setItem('authToken', data.token)
    }
    return { message: data.message || 'Login failed', success: res.ok }
}

function LoginPage() {

    const [result, formAction, isPending] = useActionState(loginAction, { message: '', success: false }, {
            withPending: true
        });

    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = Boolean(localStorage.getItem('authToken'));
    const previousPage = location.state?.from;
    const backPath = previousPage
        ? `${previousPage.pathname}${previousPage.search || ''}${previousPage.hash || ''}`
        : '/job';

    useEffect(() => {
        if (result.success) navigate('/services')
    }, [navigate, result])

  return (
    <div className="bg-gray-50 text-gray-800">
        {/* <!-- ================= HEADER ================= --> */}
        <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <NavLink to="/" className="text-2xl font-bold text-blue-700">
                    JobPortal
                </NavLink>

                <nav className="flex flex-wrap justify-end gap-3 text-xs font-medium text-gray-700 sm:gap-6 sm:text-sm">
                    <NavLink to="/job" className="hover:text-blue-700">Jobs</NavLink>
                    <NavLink to="/companies" className="hover:text-blue-700">Companies</NavLink>
                    <NavLink to="/services" className="hover:text-blue-700">Services</NavLink>
                    <NavLink to="/register" className="hover:text-blue-700">Register</NavLink>
                </nav>
            </div>
        </header>

        {/* <!-- ================= MAIN ================= --> */}
        <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
            {!isLoggedIn && (
                <button
                    type="button"
                    onClick={() => navigate(backPath)}
                    className="col-span-full w-fit rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    ← Back
                </button>
            )}
            {/* <!-- LEFT INFO --> */}
            <section className="hidden md:block">
                <h1 className="text-3xl font-bold leading-snug">
                    Find your dream job now
                </h1>

                <p className="mt-4 text-gray-600 max-w-md">
                    Register with JobPortal and get matched with the right opportunities.
                    Build your profile and apply to jobs in top companies.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-gray-700">
                    <li>✔ Trusted by thousands of recruiters</li>
                    <li>✔ Personalized job recommendations</li>
                    <li>✔ Easy apply & profile visibility</li>
                </ul>
            </section>
            {/* <!-- LEFT INFO --> */}
            <section className="w-full max-w-md mx-auto rounded-lg border bg-white p-8 md:border-0 md:bg-transparent md:p-0">

                {/* <!-- Logo / Title --> */}
                <NavLink to="/" className="block text-2xl font-bold text-blue-700 text-center">
                    JobPortal
                </NavLink>
                <p className="text-sm text-gray-500 text-center mt-1">
                    Login to your account
                </p>

                {/* <!-- Login Form --> */}
                <form action={formAction} className="mt-6 space-y-4">

                    {/* <!-- Username --> */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input name="username" type="text" placeholder="Enter your email" className="mt-1 w-full rounded border border-gray-300 px-3 py-2
                                focus:border-blue-600 focus:ring-1 focus:ring-blue-200
                                outline-none" />
                    </div>

                    {/* <!-- Password --> */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input name="password" type="password" placeholder="Enter your password" className="mt-1 w-full rounded border border-gray-300 px-3 py-2
                                focus:border-blue-600 focus:ring-1 focus:ring-blue-200
                                outline-none" />
                    </div>

                    {/* <!-- Forgot password --> */}
                    <div className="text-right">
                        <a href="#" className="text-sm text-blue-700 hover:underline">
                            Forgot Password?
                        </a>
                    </div>

                    {/* <!-- Button --> */}
                    <button disabled={isPending} type="submit" className="w-full bg-blue-700 hover:bg-blue-800
                                text-white font-semibold py-2.5 rounded transition">
                        {isPending ? "Logging in..." : "Login Now"}
                    </button>

                    <p role="status" className="text-center text-sm text-gray-600">{result.message}</p>

                    {/* <!-- Register link --> */}
                    <p className="text-sm text-center text-gray-600">
                        New to JobPortal?
                        <NavLink to={"/register"} className="text-blue-700 font-medium hover:underline">
                            Register here
                        </NavLink>
                    </p>
                </form>
            </section>

        </main>

        {/* <!-- ================= FOOTER ================= --> */}
        <footer className="border-t bg-white">
            <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-gray-500 text-center">
                © 2026 JobPortal.com | All rights reserved
            </div>
        </footer>
    </div>
  )
}

export default LoginPage